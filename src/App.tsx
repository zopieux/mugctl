// SPDX-License-Identifier: MIT.

import React from 'react';
import {useDebouncyEffect} from 'use-debouncy';
import {HuePicker, RGBColor} from 'react-color';
import {
    Box,
    Button,
    ChakraProvider,
    Container,
    ContainerProps,
    extendTheme,
    Flex,
    Heading,
    Icon,
    IconButton,
    Img,
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
import {GrConnect} from '@react-icons/all-files/gr/GrConnect';
import {FaThermometerHalf} from '@react-icons/all-files/fa/FaThermometerHalf';
import {GrAlert} from '@react-icons/all-files/gr/GrAlert';
import {AiFillEdit} from '@react-icons/all-files/ai/AiFillEdit';

import Ember, {Battery, ConnState, RawColor} from './Ember';
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
    const fullAlpha = {...color, a: 1} as RGBColor;
    const [c, setC] = React.useState<RGBColor>(fullAlpha);
    useDebouncyEffect(() => onChange({...c, a: 255} as RawColor), 500, [c]);
    return (<HuePicker color={c} onChange={(cr) => setC(cr.rgb)}/>);
}

const TemperatureSlider = ({temperature, onChange}: { temperature: number, onChange: any }) => {
    const [t, setT] = React.useState(temperature);
    return (
        <Parameter label="Target temperature"
                   labelRight={<Text textColor="gray.600" textAlign="right" fontWeight="semibold">{`${t}°C`}</Text>}>
            <Flex direction="row" css={{gap: "1rem"}} justifyContent="center">
                <Text fontWeight="light" textColor="gray.400">50.0</Text>
                <Slider aria-label="slider-ex-4" defaultValue={50.0} min={50.0} max={65.5} step={0.5} flex={1} value={t}
                        onChange={setT} onChangeEnd={() => onChange(t)}>
                    <SliderTrack bg="gray.300"><SliderFilledTrack bg="brand.900"/></SliderTrack>
                    <SliderThumb boxSize={6}><Box color="brand.900" as={FaThermometerHalf}/></SliderThumb>
                </Slider>
                <Text fontWeight="light" textColor="gray.400">65.5</Text>
            </Flex>
        </Parameter>
    );
}

function Connect({onClick, error}: { onClick: any, error: string | null }) {
    const [open, setOpen] = React.useState(error != null);
    return (
        <Flex direction="column" justifyContent="space-evenly" flex={1}>
            <Popover isOpen={open} onClose={() => setOpen(false)} closeOnBlur={false} placement="bottom">
                <PopoverTrigger>
                    <Button variant="outline" onClick={onClick} leftIcon={<GrConnect/>} size="lg">
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
            <Flex direction="row" css={{gap: ".2rem"}} alignItems="center">
                <BatteryIcon battery={battery}/>
                <Text>
                    {(battery.level * 100).toFixed(0)}%
                    <Text as="span" textColor="gray.400"
                          fontSize="sm"> {battery.charging ? 'charging' : 'discharging'}</Text>
                </Text>
            </Flex>
        </Flex>);
}

const MugInfo = ({
                     temperature,
                     name,
                     battery,
                     ledColor,
                     onNameChange,
                     liquidLevel
                 }: { temperature: number, name: string, battery: Battery, ledColor: RawColor, liquidLevel: number, onNameChange: () => void }) => {
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
        <Box position="relative" alignSelf="center">
            <Img src={mugPng} objectFit="contain" maxW="19vh"/>
            <Text as="span" textColor="white" fontSize="sm"
                  position="absolute"
                  textAlign="center"
                  left="0"
                  right="calc(19vh*0.22)"
                  bottom={`calc(34px + ${liquidLevel} * (19vh * 0.57))`}
            >{liquidLevel === 0 ? 'Empty' : `${(liquidLevel * 100).toFixed(0)}% full`}</Text>
            <div ref={ledDiv} style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                bottom: '-6px',
                right: 'calc(19vh * 0.33 + 40px/2)',
                borderRadius: '50%',
                transform: 'scale(.8, .12)',
            }}/>
        </Box>
        <Flex direction="column" flex={1} alignItems="center">
            <Flex direction="row" alignItems="center">
                <Heading fontSize="lg" fontWeight="semibold">{name}</Heading>
                <IconButton variant="ghost" aria-label="Rename" icon={<AiFillEdit/>} onClick={onNameChange} px={4}/>
            </Flex>
            <Text fontSize="5xl">{temperature.toFixed(1)}°C</Text>
            <BatteryIndicator battery={battery}/>
        </Flex>
    </Flex>);
}

function Device() {
    const [mugName, setMugName] = React.useState<string | null>(null);
    const [drinkTemperature, setDrinkTemperature] = React.useState<number | null>(null);
    const [targetTemperature, setTargetTemperature] = React.useState<number | null>(null);
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
            ember.getLiquidLevel();
            ember.getLedColor();
            ember.getLiquidState();
        })();
    }, [ember, connState]);

    const hasFullState = [mugName, drinkTemperature, battery, targetTemperature, liquidLevel, ledColor, liquidState]
        .reduce((full, data: null | any) => full && data !== null, true);

    function promptAndSendName() {
        if (mugName === null) return;
        const newName = prompt('Set mug name', mugName);
        if (newName === null) return;
        ember.setMugName(newName);
    }

    function sendLedColor(rawColor: RawColor) {
        ember.setLedColor(rawColor);
    }

    function sendTargetTemperature(temperature: number) {
        ember.setTargetTemperature(temperature);
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
                         name={mugName!}
                         battery={battery!}
                         ledColor={ledColor!}
                         liquidLevel={liquidLevel!}
                         onNameChange={promptAndSendName}/>
                <TemperatureSlider temperature={targetTemperature!} onChange={sendTargetTemperature}/>
                <Parameter label="LED color">
                    <ColorPicker color={ledColor!} onChange={sendLedColor}/>
                </Parameter>
            </>
        ))
    }</>);
}

function NoBt() {
    return (
        <Flex direction="column" alignItems="center" css={{gap: "1rem"}}>
            <Icon as={GrAlert} w={10} h={10}/>
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
    }
}
const theme = extendTheme({colors});

const Centered = ({children, ...props}: { children: React.ReactNode } & ContainerProps) => (
    <Container maxW="min(96vw, 700px)" {...props}>{children}</Container>);

function App() {
    const hasBt = !!navigator.bluetooth;
    return (
        <ChakraProvider theme={theme}>
            <Flex minH="100%" direction="column">
                <Box bgColor="brand.900" textColor="gray.50" py={4}>
                    <Centered><Heading textAlign="center">mugctl</Heading></Centered>
                </Box>
                <Centered flex={1} display="flex" flexDirection="column" justifyContent="space-around">
                    {hasBt ? <Device/> : <NoBt/>}
                </Centered>
            </Flex>
        </ChakraProvider>
    );
}

export default App;
