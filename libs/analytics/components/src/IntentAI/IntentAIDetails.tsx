import * as CCrrmChannel24gAuto        from './AIDrivenRRM/CCrrmChannel24gAuto'
import * as CCrrmChannel5gAuto         from './AIDrivenRRM/CCrrmChannel5gAuto'
import * as CCrrmChannel6gAuto         from './AIDrivenRRM/CCrrmChannel6gAuto'
import * as IZoneFirmwareUpgrade       from './AIOperations/IZoneFirmwareUpgrade'
import * as CProbeFlex24g              from './AirFlexAI/CProbeFlex24g'
import * as CProbeFlex5g               from './AirFlexAI/CProbeFlex5g'
import * as CProbeFlex6g               from './AirFlexAI/CProbeFlex6g'
import { createIntentContextProvider } from './IntentContext'

export const IntentAIDetails = createIntentContextProvider('IntentAIDetails', {
  'c-crrm-channel24g-auto': CCrrmChannel24gAuto,
  'c-crrm-channel5g-auto': CCrrmChannel5gAuto,
  'c-crrm-channel6g-auto': CCrrmChannel6gAuto,
  'i-zonefirmware-upgrade': IZoneFirmwareUpgrade,
  'c-probeflex-24g': CProbeFlex24g,
  'c-probeflex-5g': CProbeFlex5g,
  'c-probeflex-6g': CProbeFlex6g
})
