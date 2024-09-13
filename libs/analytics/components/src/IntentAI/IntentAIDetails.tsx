import * as CCrrmChannel24gAuto        from './AIDrivenRRM/CCrrmChannel24gAuto'
import * as CCrrmChannel5gAuto         from './AIDrivenRRM/CCrrmChannel5gAuto'
import * as CCrrmChannel6gAuto         from './AIDrivenRRM/CCrrmChannel6gAuto'
import * as CAclbEnable                from './AIOperations/CAclbEnable'
import * as CBandbalancingEnable       from './AIOperations/CBandbalancingEnable'
import * as CBandbalancingProactive    from './AIOperations/CBandbalancingProactive'
import * as CBgScan24gEnable           from './AIOperations/CBgScan24gEnable'
import * as CBgScan24gTimer            from './AIOperations/CBgScan24gTimer'
import * as CBgScan5gEnable            from './AIOperations/CBgScan5gEnable'
import * as CBgScan5gTimer             from './AIOperations/CBgScan5gTimer'
import * as CBgScan6gTimer             from './AIOperations/CBgScan6gTimer'
import * as CDfschannelsDisable        from './AIOperations/CDfschannelsDisable'
import * as CDfschannelsEnable         from './AIOperations/CDfschannelsEnable'
import * as CTxpowerSame               from './AIOperations/CTxpowerSame'
import * as IZoneFirmwareUpgrade       from './AIOperations/IZoneFirmwareUpgrade'
import * as CProbeFlex24g              from './EquiFlex/CProbeFlex24g'
import * as CProbeFlex5g               from './EquiFlex/CProbeFlex5g'
import * as CProbeFlex6g               from './EquiFlex/CProbeFlex6g'
import { createIntentContextProvider } from './IntentContext'

export const IntentAIDetails = createIntentContextProvider('IntentAIDetails', {
  'c-aclb-enable': CAclbEnable,
  'c-bandbalancing-enable-below-61': CBandbalancingEnable,
  'c-bandbalancing-enable': CBandbalancingEnable,
  'c-bandbalancing-proactive': CBandbalancingProactive,
  'c-bgscan24g-enable': CBgScan24gEnable,
  'c-bgscan24g-timer': CBgScan24gTimer,
  'c-bgscan5g-enable': CBgScan5gEnable,
  'c-bgscan5g-timer': CBgScan5gTimer,
  'c-bgscan6g-timer': CBgScan6gTimer,
  'c-crrm-channel24g-auto': CCrrmChannel24gAuto,
  'c-crrm-channel5g-auto': CCrrmChannel5gAuto,
  'c-crrm-channel6g-auto': CCrrmChannel6gAuto,
  'c-dfschannels-disable': CDfschannelsDisable,
  'c-dfschannels-enable': CDfschannelsEnable,
  'c-txpower-same': CTxpowerSame,
  'i-zonefirmware-upgrade': IZoneFirmwareUpgrade,
  'c-probeflex-24g': CProbeFlex24g,
  'c-probeflex-5g': CProbeFlex5g,
  'c-probeflex-6g': CProbeFlex6g
})
