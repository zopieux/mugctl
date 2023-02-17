// SPDX-License-Identifier: MIT.

import {useState} from "react";

export enum TempUnit { Celsius = "CELSIUS", Fahrenheit = "FAHRENHEIT"}

function celsiusToFahrenheit(c: number): number {
    return c * 9 / 5 + 32;
}

function fahrenheitToCelsius(f: number): number {
    return (f - 32) * 5 / 9;
}

export function temperatureUnit(unit: TempUnit): string {
    return unit === TempUnit.Celsius ? 'C' : 'F';
}

export function toDisplay(unit: TempUnit, c: number): number {
    return unit === TempUnit.Celsius ? c : celsiusToFahrenheit(c)
}

export function fromDisplay(unit: TempUnit, disp: number): number {
    return unit === TempUnit.Celsius ? disp : fahrenheitToCelsius(disp)
}

export function temperatureDisplay(unit: TempUnit, celsius: number) {
    const display = toDisplay(unit, celsius);
    const fixed = display.toFixed(1);
    if (fixed.endsWith('.0') || fixed.endsWith('.9')) return display.toFixed(0);
    return fixed;
}

export function clamp(e: number, min: number, max: number) {
    return e < min ? min : e > max ? max : e;
}

// From https://usehooks.com/useLocalStorage/.
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.debug(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.debug(error);
        }
    };

    return [storedValue, setValue] as const;
}