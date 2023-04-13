import { SNRColorMap, SNRIconMap }                       from './contents'
import { MeshConnectionInfoEntity, SignalStrengthLevel } from './types'

export function getSNRColor (snr: number): string {
  return SNRColorMap[getSignalStrengthLevel(snr)]
}

export function getColorForLine (meshConnectionInfo: MeshConnectionInfoEntity) {
  if (meshConnectionInfo.connectionType === 'Wired') return '#23AB36'

  return getSNRColorForLine(meshConnectionInfo.fromSNR, meshConnectionInfo.toSNR)
}

export function getSNRColorForLine (fromSNR: number, toSNR: number): string {
  const targetSNR = fromSNR > toSNR ? toSNR : fromSNR
  return getSNRColor(targetSNR)
}

export function getSNRIcon (snr: number) {
  return SNRIconMap[getSignalStrengthLevel(snr)]
}

function getSignalStrengthLevel (snr: number): SignalStrengthLevel {
  if (snr > 40) return SignalStrengthLevel.EXCELLENT
  if (snr > 25) return SignalStrengthLevel.GOOD
  if (snr > 15) return SignalStrengthLevel.LOW
  return SignalStrengthLevel.POOR
}
