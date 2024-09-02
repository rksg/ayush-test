import * as CCrrmChannel24gAuto        from './AIDrivenRRM/CCrrmChannel24gAuto'
import * as CCrrmChannel5gAuto         from './AIDrivenRRM/CCrrmChannel5gAuto'
import * as CCrrmChannel6gAuto         from './AIDrivenRRM/CCrrmChannel6gAuto'
import * as CTxpowerSame               from './AIOperations/CTxpowerSame'
import * as IZoneFirmwareUpgrade       from './AIOperations/IZoneFirmwareUpgrade'
import { createIntentContextProvider } from './IntentContext'

export const IntentAIDetails = createIntentContextProvider('IntentAIDetails', {
  'c-crrm-channel24g-auto': CCrrmChannel24gAuto,
  'c-crrm-channel5g-auto': CCrrmChannel5gAuto,
  'c-crrm-channel6g-auto': CCrrmChannel6gAuto,
  'i-zonefirmware-upgrade': IZoneFirmwareUpgrade,
  'c-txpower-same': CTxpowerSame
})
