import {MdBattery20} from '@react-icons/all-files/md/MdBattery20';
import {MdBattery50} from '@react-icons/all-files/md/MdBattery50';
import {MdBattery60} from '@react-icons/all-files/md/MdBattery60';
import {MdBattery80} from '@react-icons/all-files/md/MdBattery80';
import {MdBattery90} from '@react-icons/all-files/md/MdBattery90';
import {MdBatteryFull} from '@react-icons/all-files/md/MdBatteryFull';
import {MdBatteryCharging20} from '@react-icons/all-files/md/MdBatteryCharging20';
import {MdBatteryCharging50} from '@react-icons/all-files/md/MdBatteryCharging50';
import {MdBatteryCharging60} from '@react-icons/all-files/md/MdBatteryCharging60';
import {MdBatteryCharging80} from '@react-icons/all-files/md/MdBatteryCharging80';
import {MdBatteryCharging90} from '@react-icons/all-files/md/MdBatteryCharging90';
import {MdBatteryChargingFull} from '@react-icons/all-files/md/MdBatteryChargingFull';
import {Icon} from '@chakra-ui/react';

import {Battery} from './Ember';

export default function BatteryIcon({battery: {level, charging}, ...props}: { battery: Battery } & Record<string, any>) {
    const icons = {
        0: [MdBattery20, MdBattery50, MdBattery60, MdBattery80, MdBattery90, MdBatteryFull],
        1: [MdBatteryCharging20, MdBatteryCharging50, MdBatteryCharging60, MdBatteryCharging80, MdBatteryCharging90, MdBatteryChargingFull],
    };
    const i: number = level <= .2 ? 0 : level <= .5 ? 1 : level <= .6 ? 2 : level <= .8 ? 3 : level <= .9 ? 4 : 5;
    const icon = icons[charging ? 1 : 0][i];
    return (<Icon as={icon} {...(level < .2 ? {color: 'orange.600'} : {})} {...props}/>);
}
