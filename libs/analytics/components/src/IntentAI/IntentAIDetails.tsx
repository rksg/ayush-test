import * as CCrrmChannelAuto           from './AIDrivenRRM/CCrrmChannelAuto'
import * as CBgScan24gEnable           from './AIOperations/CBgScan24gEnable'
import * as CBgScan24gTimer            from './AIOperations/CBgScan24gTimer'
import * as CBgScan5gEnable            from './AIOperations/CBgScan5gEnable'
import * as CBgScan5gTimer             from './AIOperations/CBgScan5gTimer'
import * as CBgScan6gTimer             from './AIOperations/CBgScan6gTimer'
import * as IZoneFirmwareUpgrade       from './AIOperations/IZoneFirmwareUpgrade'
import { createIntentContextProvider } from './IntentContext'

export const IntentAIDetails = createIntentContextProvider('IntentAIDetails', {
  'c-crrm-channel24g-auto': CCrrmChannelAuto,
  'c-crrm-channel5g-auto': CCrrmChannelAuto,
  'c-crrm-channel6g-auto': CCrrmChannelAuto,
  'i-zonefirmware-upgrade': IZoneFirmwareUpgrade,
  'c-bgscan24g-enable': CBgScan24gEnable,
  'c-bgscan5g-enable': CBgScan5gEnable,
  'c-bgscan24g-timer': CBgScan24gTimer,
  'c-bgscan5g-timer': CBgScan5gTimer,
  'c-bgscan6g-timer': CBgScan6gTimer
})
