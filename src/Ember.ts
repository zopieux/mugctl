// SPDX-License-Identifier: MIT.

import async from "async"

import { clamp, TempUnit } from "./Util"

export type RawColor = { r: number, g: number, b: number, a: number };
export type Battery = { level: number, charging: boolean };
export type Setters = {
    setMugName: (s: string) => void,
    setConnState: (cs: ConnState) => void,
    setDrinkTemperature: (t: number) => void,
    setTargetTemperature: (t: number) => void,
    setTemperatureUnit: (u: TempUnit) => void,
    setBattery: (b: (Battery | null | ((b: Battery | null) => Battery | null))) => void,
    setLiquidLevel: (l: number) => void,
    setLiquidState: (s: LiquidState) => void,
    setLedColor: (c: RawColor) => void,
}

const btName = "Ember Ceramic Mug"

enum Uuid {
    descriptorService = "0000180a-0000-1000-8000-00805f9b34fb",
    emberService = "fc543622-236c-4c94-8fa9-944a3e5353fa",
    mugNameChar = "fc540001-236c-4c94-8fa9-944a3e5353fa",
    drinkTempChar = "fc540002-236c-4c94-8fa9-944a3e5353fa",
    targetTempChar = "fc540003-236c-4c94-8fa9-944a3e5353fa",
    tempUnitChar = "fc540004-236c-4c94-8fa9-944a3e5353fa",
    liquidLevelChar = "fc540005-236c-4c94-8fa9-944a3e5353fa",
    batteryChar = "fc540007-236c-4c94-8fa9-944a3e5353fa",
    liquidStateChar = "fc540008-236c-4c94-8fa9-944a3e5353fa",
    ledColorChar = "fc540014-236c-4c94-8fa9-944a3e5353fa",
    pushEventChar = "fc540012-236c-4c94-8fa9-944a3e5353fa",
    statisticsChar = "fc540013-236c-4c94-8fa9-944a3e5353fa",
    bondChar = "fc54000e-236c-4c94-8fa9-944a3e5353fa",
}

const temperatureScale = 100
const fullLiquidLevel = 30

const toStr = (d: DataView) => (new TextDecoder()).decode(d.buffer)
const toTemperature = (d: DataView) => d.getUint16(0, true) / temperatureScale
const toBattery = (d: DataView): Battery => ({ level: d.getUint8(0) / 100, charging: d.getUint8(1) === 1 })
const toColor = (d: DataView): RawColor => ({ r: d.getUint8(0), g: d.getUint8(1), b: d.getUint8(2), a: d.getUint8(3) })
const toLevel = (d: DataView): number => clamp(d.getUint8(0) / fullLiquidLevel, 0, 1)
const toLiquidState = (d: DataView): LiquidState => d.getUint8(0)
const toTemperatureUnit = (d: DataView): TempUnit => d.getUint8(0) === 1 ? TempUnit.Fahrenheit : TempUnit.Celsius

enum Event {
    battery = 1, chargerConnected = 2, chargerDisconnected = 3, targetTemperature = 4, drinkTemperature = 5, liquidLevel = 7, liquidState = 8,
}

export enum LiquidState {
    off = 0, empty = 1, filling = 2, cold = 3, cooling = 4, heating = 5, atTemperature = 6, warm = 7,
}

export enum ConnState {
    idle, choosing, connecting, ready,
}

export default class Ember {
    private readonly _queue
    private readonly _setters: Setters
    private _device: BluetoothDevice | null
    private _chars: { [k in Uuid]?: BluetoothRemoteGATTCharacteristic }

    constructor(setters: Setters) {
        this._setters = setters
        this._device = null
        this._chars = {}
        this._queue = async.queue(Ember._worker, 1)
    }

    connected(): boolean {
        return Object.keys(this._chars).length !== 0
    }

    async maybeReconnect() {
        const devices = await navigator.bluetooth.getDevices()
        if (devices.length) {
            this._device = devices[0]
            this._initialize()
            return true
        }
        return false
    }

    private async _initialize() {
        console.info("Initializing")
        this._setters.setConnState(ConnState.connecting)
        this._device!.addEventListener("gattserverdisconnected", (e) => {
            console.debug("GATT server disconnected")
            this._chars = {}
            this._setters.setConnState(ConnState.idle)
        })
        const server = await this._device!.gatt?.connect()
        if (!server) throw new Error("Cannot connect")
        const ember = await server?.getPrimaryService(Uuid.emberService)
        if (!ember) throw new Error("Cannot get primary service")
        for (const uuid of [
            Uuid.mugNameChar,
            Uuid.drinkTempChar,
            Uuid.targetTempChar,
            Uuid.tempUnitChar,
            Uuid.liquidLevelChar,
            Uuid.batteryChar,
            Uuid.liquidStateChar,
            Uuid.ledColorChar,
            Uuid.bondChar]) {
            const char = await ember!.getCharacteristic(uuid)
            if (!char) throw new Error(`Cannot get characteristic ${uuid}`)
            this._chars[uuid] = char
        }
        for (const uuid of [Uuid.pushEventChar, Uuid.statisticsChar]) {
            const char = await ember!.getCharacteristic(uuid)
            if (!char) throw new Error(`Cannot get characteristic ${uuid}`)
            await char.startNotifications()
            char.addEventListener("characteristicvaluechanged", (e) => Ember._charChanged(this, e))
            this._chars[uuid] = char
        }
        this._setters.setConnState(ConnState.ready)
    }

    async connect() {
        console.info("Discovering")
        this._setters.setConnState(ConnState.choosing)
        this._device = await navigator.bluetooth.requestDevice({
            filters: [{
                name: btName,
                services: [Uuid.descriptorService],
            }],
            optionalServices: [Uuid.emberService],
        })
        if (!this._device) throw new Error("Device selection cancelled")
        this._initialize()
    }

    bond() {
        this._queue.push({ that: this, cmd: "bond" })
    }

    getMugName() {
        this._queue.push({ that: this, cmd: "getMugName" })
    }

    setMugName(name: string) {
        this._queue.push({ that: this, cmd: "setMugName", args: [name] })
    }

    getDrinkTemperature() {
        this._queue.push({ that: this, cmd: "getDrinkTemperature" })
    }

    getTargetTemperature() {
        this._queue.push({ that: this, cmd: "getTargetTemperature" })
    }

    setTargetTemperature(temperature: number) {
        this._queue.push({ that: this, cmd: "setTargetTemperature", args: [temperature] })
    }

    getBattery() {
        this._queue.push({ that: this, cmd: "getBattery" })
    }

    getLiquidLevel() {
        this._queue.push({ that: this, cmd: "getLiquidLevel" })
    }

    getLiquidState() {
        this._queue.push({ that: this, cmd: "getLiquidState" })
    }

    getLedColor() {
        this._queue.push({ that: this, cmd: "getLedColor" })
    }

    setLedColor(color: RawColor) {
        this._queue.push({ that: this, cmd: "setLedColor", args: [color] })
    }

    getTemperatureUnit() {
        this._queue.push({ that: this, cmd: "getTemperatureUnit" })
    }

    setTemperatureUnit(unit: TempUnit) {
        this._queue.push({ that: this, cmd: "setTemperatureUnit", args: [unit] })
    }

    private async _bond() {
        console.log("Bonding")
        const reply = await this._chars[Uuid.bondChar]!.readValue()
        console.debug("Bond reply", Buffer.from(reply.buffer, reply.byteOffset, reply.byteLength).toString("hex"))
    }

    private async _setMugName(name: string) {
        const encoded = (new TextEncoder()).encode(name)
        await this._chars[Uuid.mugNameChar]!.writeValueWithoutResponse(encoded)
        this.getMugName()
    }

    private async _setTargetTemperature(temperature: number) {
        if (temperature !== 0 && temperature < 50.0) temperature = 50.0
        if (temperature > 65.5) temperature = 65.5
        const d = new DataView(new ArrayBuffer(2))
        d.setUint16(0, temperature * temperatureScale, true)
        await this._chars[Uuid.targetTempChar]!.writeValueWithoutResponse(d)
        this.getTargetTemperature()
    }

    private async _setLedColor(color: RawColor) {
        const d = new DataView(new ArrayBuffer(4))
        d.setUint8(0, color.r)
        d.setUint8(1, color.g)
        d.setUint8(2, color.b)
        d.setUint8(3, color.a)
        await this._chars[Uuid.ledColorChar]!.writeValueWithoutResponse(d)
        this.getLedColor()
    }

    private async _setTemperatureUnit(unit: TempUnit) {
        const d = new DataView(new ArrayBuffer(1))
        d.setUint8(0, unit === TempUnit.Fahrenheit ? 1 : 0)
        await this._chars[Uuid.tempUnitChar]!.writeValueWithoutResponse(d)
        this.getTemperatureUnit()
    }

    private static async _worker({ that, cmd, args }: { cmd: string, args?: any, that: Ember }) {
        if (!that.connected()) {
            console.error("not connected")
            return
        }
        switch (cmd) {
            case "getMugName":
                that._setters.setMugName(toStr(await that._chars[Uuid.mugNameChar]!.readValue()))
                break
            case "setMugName":
                const [name] = args
                await that._setMugName(name)
                break
            case "getDrinkTemperature":
                that._setters.setDrinkTemperature(toTemperature(await that._chars[Uuid.drinkTempChar]!.readValue()))
                break
            case "getTargetTemperature":
                that._setters.setTargetTemperature(toTemperature(await that._chars[Uuid.targetTempChar]!.readValue()))
                break
            case "setTargetTemperature":
                const [temperature] = args
                await that._setTargetTemperature(temperature)
                break
            case "getLiquidLevel":
                that._setters.setLiquidLevel(toLevel(await that._chars[Uuid.liquidLevelChar]!.readValue()))
                break
            case "getBattery":
                that._setters.setBattery(toBattery(await that._chars[Uuid.batteryChar]!.readValue()))
                break
            case "getLiquidState":
                that._setters.setLiquidState(toLiquidState(await that._chars[Uuid.liquidStateChar]!.readValue()))
                break
            case "getLedColor":
                that._setters.setLedColor(toColor(await that._chars[Uuid.ledColorChar]!.readValue()))
                break
            case "setLedColor":
                const [color] = args
                await that._setLedColor(color)
                break
            case "getTemperatureUnit":
                that._setters.setTemperatureUnit(toTemperatureUnit(await that._chars[Uuid.tempUnitChar]!.readValue()))
                break
            case "setTemperatureUnit":
                const [unit] = args
                await that._setTemperatureUnit(unit)
                break
            case "bond":
                await that._bond()
                break
        }
    }

    private static async _charChanged(that: Ember, event: any) {
        const char: BluetoothRemoteGATTCharacteristic = event.target, value = char.value!
        switch (char.uuid) {
            case Uuid.pushEventChar:
                const what = value.getUint8(0)
                console.debug(`Characteristic ${Event[what]} changed`)
                switch (what) {
                    case Event.battery:
                        await that.getBattery()
                        break
                    case Event.chargerConnected:
                        that._setters.setBattery((b) => ({ ...b!, charging: true }))
                        break
                    case Event.chargerDisconnected:
                        that._setters.setBattery((b) => ({ ...b!, charging: false }))
                        break
                    case Event.targetTemperature:
                        await that.getTargetTemperature()
                        break
                    case Event.drinkTemperature:
                        await that.getDrinkTemperature()
                        break
                    case Event.liquidLevel:
                        await that.getLiquidLevel()
                        break
                    case Event.liquidState:
                        await that.getLiquidState()
                        break
                }
                break
            case Uuid.statisticsChar:
                console.debug("Got statistics:", value.byteLength, value.buffer)
                break
        }
    }
};
