import * as CCrrmChannelAuto           from './AIDrivenRRM/CCrrmChannelAuto'
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
import * as IEcoFlex                   from './EcoFlex/IEcoFlex'
import * as CProbeFlex24g              from './EquiFlex/CProbeFlex24g'
import * as CProbeFlex5g               from './EquiFlex/CProbeFlex5g'
import * as CProbeFlex6g               from './EquiFlex/CProbeFlex6g'
import { createIntentContextProvider } from './IntentContext'

const IntentAIForm = createIntentContextProvider('IntentAIForm', {
  'c-aclb-enable': CAclbEnable,
  'c-bandbalancing-enable-below-61': CBandbalancingEnable,
  'c-bandbalancing-enable': CBandbalancingEnable,
  'c-bandbalancing-proactive': CBandbalancingProactive,
  'c-bgscan24g-enable': CBgScan24gEnable,
  'c-bgscan24g-timer': CBgScan24gTimer,
  'c-bgscan5g-enable': CBgScan5gEnable,
  'c-bgscan5g-timer': CBgScan5gTimer,
  'c-bgscan6g-timer': CBgScan6gTimer,
  'c-crrm-channel24g-auto': CCrrmChannelAuto,
  'c-crrm-channel5g-auto': CCrrmChannelAuto,
  'c-crrm-channel6g-auto': CCrrmChannelAuto,
  'c-probeflex-5g': CProbeFlex5g,
  'c-probeflex-24g': CProbeFlex24g,
  'c-probeflex-6g': CProbeFlex6g,
  'c-dfschannels-disable': CDfschannelsDisable,
  'c-dfschannels-enable': CDfschannelsEnable,
  'c-txpower-same': CTxpowerSame,
  'i-zonefirmware-upgrade': IZoneFirmwareUpgrade,
  'i-ecoflex': IEcoFlex
})

export default IntentAIForm
