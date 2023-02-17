// SPDX-License-Identifier: MIT.

import React from 'react';
import {useDebouncyEffect} from 'use-debouncy';
import {CirclePicker, HuePicker, RGBColor} from 'react-color';
import {
    ContainerProps,
    extendTheme,
    Box,
    Button,
    ChakraProvider,
    Container,
    Flex,
    Heading,
    Icon,
    IconButton,
    Img, Link,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Spinner,
    Text,
} from '@chakra-ui/react';
import {
    IconAlertTriangle,
    IconPlug,
    IconMug,
    IconMugOff,
    IconTemperature,
    IconPencil,
    IconSnowflake,
    IconFlame,
    IconCheck,
    IconZzz, IconQuestionMark
} from '@tabler/icons-react';

import Ember, {Battery, ConnState, LiquidState, RawColor} from './Ember';
import {fromDisplay, temperatureDisplay, temperatureUnit, TempUnit, toDisplay, useLocalStorage} from './Util';
import BatteryIcon from './BatteryIcon';
import mugPng from './mug.png';
import './App.css';

const Parameter = ({
                       label,
                       labelRight,
                       children
                   }: { label: string, labelRight?: React.ReactNode, children: React.ReactNode }) => (
    <Flex p={4} borderRadius={12} borderColor="gray.400" borderWidth={1} direction="column" css={{gap: '.6rem'}}>
        <Flex direction="row" justifyContent="space-between">
            <Text textColor="gray.600" textAlign="left" fontWeight="light">{label}</Text>
            {labelRight !== null && labelRight}
        </Flex>
        {children}
    </Flex>);

const ColorPicker = ({color, onChange}: { color: RawColor, onChange: (color: RawColor) => void }) => {
    // It's important to provide the full 6-char hex, as fucking CirclePicker does no normalization whatsoever.
    const fakeWhite = "#bbbbbb";

    const fullAlpha = {...color, a: 1} as RGBColor;
    const [c, setC] = React.useState<RGBColor>(fullAlpha);
    useDebouncyEffect(() => onChange({...c, a: 255} as RawColor), 500, [c]);

    function setWhite() {
        setC({r: 255, g: 255, b: 255, a: 1});
    }

    const isWhite: boolean = c.r === 255 && c.g === 255 && c.b === 255;

    return (
        <Flex direction="row" alignItems="center" css={{gap: "1rem"}}>
            <HuePicker width="100%" color={c} onChange={(cr) => setC(cr.rgb)} className={isWhite ? "no-value" : ""}/>
            <CirclePicker width="" color={isWhite ? fakeWhite : undefined} colors={[fakeWhite]}
                          onChangeComplete={setWhite}/>
        </Flex>
    );
}

const TemperatureSlider = ({
                               temperature,
                               setTargetTemperature,
                               unit,
                           }: { temperature: number, setTargetTemperature: (t: number) => void, unit: TempUnit }) => {
    const [retainedTargetTemperature, setRetainedTargetTemperature] = useLocalStorage("targetTemp", temperature !== 0 ? temperature : 50.0);
    const [t, setT] = React.useState(temperature);

    React.useEffect(() => {
        setT(temperature)
    }, [temperature]);

    function saveRetainedAndSetZero() {
        setRetainedTargetTemperature(temperature);
        setTargetTemperature(0);
    }

    function restoreRetained() {
        setTargetTemperature(retainedTargetTemperature);
    }

    return (
        <Parameter label="Target temperature"
                   labelRight={temperature !== 0 &&
                   <Text textColor="gray.600" textAlign="right"
                         fontWeight="semibold">{temperatureDisplay(unit, t)}°{temperatureUnit(unit)}</Text>}>
            {temperature !== 0 && <Flex direction="row" css={{gap: "1rem"}} justifyContent="center">
                <Text fontWeight="light" textColor="gray.400">{temperatureDisplay(unit, 50.0)}</Text>
                <Slider aria-label="slider-ex-4"
                        defaultValue={toDisplay(unit, 50.0)}
                        min={toDisplay(unit, 50.0)}
                        max={toDisplay(unit, 65.5)}
                        value={toDisplay(unit, t)}
                        onChange={(t) => setT(fromDisplay(unit, t))}
                        onChangeEnd={() => setTargetTemperature(fromDisplay(unit, t))}
                        step={0.5}
                        flex={1}>
                    <SliderTrack bg="gray.300"><SliderFilledTrack bg="brand.900"/></SliderTrack>
                    <SliderThumb boxSize={6}><Box color="brand.900" as={IconTemperature}/></SliderThumb>
                </Slider>
                <Text fontWeight="light" textColor="gray.400">{temperatureDisplay(unit, 65.5)}</Text>
            </Flex>}
            {temperature !== 0 ?
                <Button leftIcon={<IconMugOff/>} onClick={() => saveRetainedAndSetZero()}>Turn off</Button>
                : <Button leftIcon={<IconMug/>} onClick={() => restoreRetained()}>Turn on</Button>}
        </Parameter>
    );
}

function Connect({onClick, error}: { onClick: any, error: string | null }) {
    const [open, setOpen] = React.useState(error != null);
    return (
        <Flex direction="column" justifyContent="space-evenly" flex={1}>
            <Popover isOpen={open} onClose={() => setOpen(false)} closeOnBlur={false} placement="bottom">
                <PopoverTrigger>
                    <Button variant="outline" onClick={onClick} leftIcon={<IconPlug/>} size="lg">
                        <Text>Connect</Text>
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <PopoverHeader fontWeight="semibold">Error</PopoverHeader>
                    <PopoverBody>
                        <Text>{error}</Text>
                    </PopoverBody>
                </PopoverContent>
            </Popover>
            <Text alignSelf="flex-end" textColor="gray.400">
                Don't forget to power-on the mug using its button.
                If the list of devices remains empty, put the mug in pairing mode by holding its button for a few
                seconds.
                The light will flash blue and the mug should appear in the device list.
            </Text>
        </Flex>);
}

function Connecting({children}: { children?: JSX.Element }) {
    return (
        <Flex direction="row" alignSelf="center" alignItems="center" justifyContent="center">
            <Spinner mx={2}/>
            {children}
        </Flex>);
}

function BatteryIndicator({battery}: { battery: Battery }) {
    return (
        <Flex direction="row" alignSelf="center" alignItems="center" justifyContent="space-between">
            <Flex direction="row" css={{gap: ".2rem"}} alignItems="center" title={battery.charging ? 'charging' : 'discharging'}>
                <BatteryIcon battery={battery}/>
                <Text>{(battery.level * 100).toFixed(0)}%</Text>
            </Flex>
        </Flex>);
}

const MugInfo = ({
                     temperature,
                     unit,
                     setTemperatureUnit,
                     name,
                     battery,
                     ledColor,
                     onNameChange,
                     liquidLevel,
                     liquidState,
                 }: { temperature: number, unit: TempUnit, setTemperatureUnit: (u: TempUnit) => void, name: string, battery: Battery, ledColor: RawColor, liquidLevel: number, liquidState: LiquidState, onNameChange: () => void }) => {
    const ledDiv = React.useRef(null);
    React.useEffect(() => {
        if (!ledDiv.current || !ledColor) return;
        const r = ledColor.r, g = ledColor.g, b = ledColor.b;
        (ledDiv.current as HTMLElement).animate([
            {boxShadow: `inset 0 0 90px rgba(${r},${g},${b},1.0), 0 0 4px 4px rgba(${r},${g},${b},0.4)`},
            {boxShadow: `inset 0 0 90px rgba(${r},${g},${b},1.0), 0 0 7px 7px rgba(${r},${g},${b},0.6)`},
        ], {
            duration: 1500,
            easing: 'ease',
            direction: 'alternate',
            iterations: Infinity,
        });
    }, [ledDiv, ledColor]);
    return (<Flex direction="row" w="100%">
        <Box position="relative" alignSelf="center" maxW="19vh">
            <Img src={mugPng} objectFit="contain"/>
            <WaterLevel level={liquidLevel}/>
            <StateIcon state={liquidState}/>
        </Box>
        <Flex direction="column" flex={1} alignItems="center">
            <Flex direction="row" alignItems="center">
                <Heading fontSize="lg" fontWeight="semibold">{name}</Heading>
                <IconButton variant="ghost" aria-label="Rename" icon={<IconPencil/>} onClick={onNameChange} px={4}/>
            </Flex>
            <Text fontSize="5xl">{temperatureDisplay(unit, temperature)}°{temperatureUnit(unit)}</Text>
            <Flex direction="row" alignItems="center" css={{gap: "1rem"}}>
                <BatteryIndicator battery={battery}/>
                <TemperatureUnitSelector unit={unit} setUnit={setTemperatureUnit}/>
            </Flex>
        </Flex>
    </Flex>);
}

function TemperatureUnitSelector({unit, setUnit}: { unit: TempUnit, setUnit: (u: TempUnit) => void }) {
    const show = (wanted: TempUnit) =>
        unit === wanted ?
            <Text fontWeight="semibold" display="inline">°{temperatureUnit(wanted)}</Text>
            : <>°{temperatureUnit(wanted)}</>;
    return (<div onClick={() => setUnit(unit === TempUnit.Celsius ? TempUnit.Fahrenheit : TempUnit.Celsius)}>
        {show(TempUnit.Celsius)} | {show(TempUnit.Fahrenheit)}
    </div>);
}

function StateIcon({state}: { state: LiquidState }) {
    let [icon, color] = {
        [LiquidState.off]: [IconZzz, '#bdbdbd'],
        [LiquidState.empty]: [IconZzz, '#bdbdbd'],
        [LiquidState.filling]: [IconZzz, '#bdbdbd'],
        [LiquidState.cold]: [IconSnowflake, 'white'],
        [LiquidState.cooling]: [IconSnowflake, 'white'],
        [LiquidState.heating]: [IconFlame, '#bda101'],
        [LiquidState.atTemperature]: [IconCheck, '#75bd01'],
        [LiquidState.warm]: [IconFlame, '#bda101'],
    }[state] || [IconQuestionMark, '#bdbdbd'];
    return (<Icon as={icon as () => JSX.Element} color={color as string} className="state-icon" boxSize="1.5rem"/>);
}

function Device() {
    const [mugName, setMugName] = React.useState<string | null>(null);
    const [drinkTemperature, setDrinkTemperature] = React.useState<number | null>(null);
    const [targetTemperature, setTargetTemperature] = React.useState<number | null>(null);
    const [temperatureUnit, setTemperatureUnit] = React.useState<TempUnit | null>(null);
    const [liquidLevel, setLiquidLevel] = React.useState<number | null>(null);
    const [liquidState, setLiquidState] = React.useState<number | null>(null);
    const [battery, setBattery] = React.useState<Battery | null>(null);
    const [ledColor, setLedColor] = React.useState<RawColor | null>(null);

    const [connState, setConnState] = React.useState<ConnState>(ConnState.idle);
    const [ember,] = React.useState<Ember>(new Ember({
        setMugName,
        setConnState,
        setDrinkTemperature,
        setTargetTemperature,
        setTemperatureUnit,
        setLiquidLevel,
        setLiquidState,
        setBattery,
        setLedColor,
    }));

    const [error, setError] = React.useState<string | null>(null);

    async function connect() {
        setError(null);
        try {
            await ember.connect();
        } catch (e) {
            setError(`${e}`);
            setConnState(ConnState.idle);
        }
    }

    // Initial read once connected.
    React.useEffect(() => {
        if (!ember.connected() || connState !== ConnState.ready) return;
        (async () => {
            ember.getMugName();
            ember.getDrinkTemperature();
            ember.getBattery();
            ember.getTargetTemperature();
            ember.getTemperatureUnit();
            ember.getLiquidLevel();
            ember.getLedColor();
            ember.getLiquidState();
        })();
    }, [ember, connState]);

    const hasFullState = [mugName, drinkTemperature, temperatureUnit, battery, targetTemperature, liquidLevel, ledColor, liquidState]
        .reduce((full, data: null | any) => full && data !== null, true);

    function promptAndSendName() {
        if (mugName === null) return;
        const newName = prompt('Set mug name', mugName);
        if (newName === null) return;
        ember.setMugName(newName);
    }

    return (<>{
        (connState === ConnState.idle && (
            <Connect onClick={connect} error={error}/>))
        || ((connState === ConnState.choosing) && (
            <Connecting><Text>Choosing the device…</Text></Connecting>))
        || ((connState === ConnState.connecting) && (
            <Connecting><Text>Connecting…</Text></Connecting>))
        || ((connState === ConnState.ready && !hasFullState) && (
            <Connecting><Text>Reading mug state…</Text></Connecting>))
        || ((connState === ConnState.ready && hasFullState) && (
            <>
                <MugInfo temperature={drinkTemperature!}
                         unit={temperatureUnit!}
                         setTemperatureUnit={u => ember.setTemperatureUnit(u)}
                         name={mugName!}
                         battery={battery!}
                         ledColor={ledColor!}
                         liquidLevel={liquidLevel!}
                         liquidState={liquidState!}
                         onNameChange={promptAndSendName}/>
                <TemperatureSlider temperature={targetTemperature!}
                                   unit={temperatureUnit!}
                                   setTargetTemperature={t => ember.setTargetTemperature(t)}/>
                <Parameter label="LED color">
                    <ColorPicker color={ledColor!} onChange={c => ember.setLedColor(c)}/>
                </Parameter>
            </>
        ))
    }</>);
}

function WaterLevel({level}: { level: number }) {
    return (<>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
             x="0px" y="0px" style={{display: 'none'}}>
            <symbol id="wave">
                <path d="M420,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C514,6.5,518,4.7,528.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H420z"/>
                <path d="M420,20c-21.5-0.4-38.8-2.5-51.1-4.5c-13.4-2.2-26.5-5.2-27.3-5.4C326,6.5,322,4.7,311.5,2.7C304.3,1.4,293.6-0.1,280,0c0,0,0,0,0,0v20H420z"/>
                <path d="M140,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C234,6.5,238,4.7,248.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H140z"/>
                <path d="M140,20c-21.5-0.4-38.8-2.5-51.1-4.5c-13.4-2.2-26.5-5.2-27.3-5.4C46,6.5,42,4.7,31.5,2.7C24.3,1.4,13.6-0.1,0,0c0,0,0,0,0,0l0,20H140z"/>
            </symbol>
        </svg>
        <div className="water-level">
            {level > 0 && <div style={{transform: `translate(0, ${(1-level)*100}%)`}} className="water-level-water">
                <svg viewBox="0 0 560 20" className="water-level-wave water-level-back">
                    <use xlinkHref="#wave"/>
                </svg>
                <svg viewBox="0 0 560 20" className="water-level-wave water-level-front">
                    <use xlinkHref="#wave"/>
                </svg>
            </div>}
        </div>
    </>);
}

function NoBt() {
    return (
        <Flex direction="column" alignItems="center" css={{gap: "1rem"}}>
            <Icon as={IconAlertTriangle} w={10} h={10}/>
            <Heading>Unsupported browser</Heading>
            <Text>Please use a browser with Bluetooth support, such as Chrome for Android.</Text>
        </Flex>
    );
}

const colors = {
    brand: {
        900: 'hsl(14,82%,53%)',
        800: 'hsl(14,82%,57%)',
        700: 'hsl(14,82%,61%)',
        100: 'hsl(15,43%,38%)',
    }
}
const theme = extendTheme({colors});

const Centered = ({children, ...props}: { children: React.ReactNode } & ContainerProps) => (
    <Container maxW="min(96vw, 700px)" {...props}>{children}</Container>);

function App() {
    const hasBt = !!navigator.bluetooth;
    return (
        <ChakraProvider theme={theme}>
            <Flex minH="100%" direction="column" justifyContent="space-between">
                <Box bgColor="brand.900" textColor="gray.50" py={4}>
                    <Centered><Heading textAlign="center">mugctl</Heading></Centered>
                </Box>
                <Centered flex={1} display="flex" flexDirection="column" justifyContent="space-around">
                    {hasBt ? <Device/> : <NoBt/>}
                </Centered>
                <Text fontSize="smaller" alignSelf="center" textColor="gray.400" paddingBlockEnd="12px">
                    <Link href="https://github.com/zopieux/mugctl/issues" color="brand.100" isExternal={true}>report an issue</Link>
                    {" "}&middot; open-source app by <Link href="https://mastodon.social/@zopieux" color="brand.100" isExternal={true}>zopieux</Link>
                </Text>
            </Flex>
        </ChakraProvider>
    );
}

export default App;
