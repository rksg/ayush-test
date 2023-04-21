import { ApMeshLink, SignalStrengthLevel } from '@acx-ui/rc/utils'

import { snrColorMap, snrIconMap } from './contents'

export function getSNRColor (snr: number): string {
  return snrColorMap[getSignalStrengthLevel(snr)]
}

export function getColorForLine (apMeshLink: ApMeshLink) {
  if (apMeshLink.connectionType === 'Wired') return '#23AB36'

  return getSNRColorForLine(apMeshLink.fromSNR, apMeshLink.toSNR)
}

export function getSNRColorForLine (fromSNR: number, toSNR: number): string {
  const targetSNR = fromSNR > toSNR ? toSNR : fromSNR
  return getSNRColor(targetSNR)
}

export function getSNRIcon (snr: number) {
  return snrIconMap[getSignalStrengthLevel(snr)]
}

function getSignalStrengthLevel (snr: number): SignalStrengthLevel {
  if (snr > 40) return SignalStrengthLevel.EXCELLENT
  if (snr > 25) return SignalStrengthLevel.GOOD
  if (snr > 15) return SignalStrengthLevel.LOW
  return SignalStrengthLevel.POOR
}
