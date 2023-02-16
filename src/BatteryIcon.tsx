import {
    IconBattery4,
    IconBattery3,
    IconBattery2,
    IconBattery1,
    IconBattery,
    IconBatteryCharging
} from '@tabler/icons-react';
import {Icon} from '@chakra-ui/react';

import {Battery} from './Ember';

export default function BatteryIcon({
                                        battery: {level, charging},
                                        ...props
                                    }: { battery: Battery } & Record<string, any>) {
    let icon = charging ? IconBatteryCharging
        : level <= .2 ? IconBattery
            : level <= .5 ? IconBattery1
                : level <= .6 ? IconBattery2
                    : level <= .8 ? IconBattery3
                        : IconBattery4;
    return (<Icon as={icon} {...(level < .2 ? {color: 'orange.600'} : {})} {...props}/>);
}
