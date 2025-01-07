import { APLanPortSettings, LanPort, VenueLanPortSettings } from '../../types'

export function getImageFitPercentage (containerCoordsX: number,
  containerCoordsY: number, imageCoordsX: number, imageCoordsY: number) {
  let differencePercentage = 0

  if (containerCoordsX !== imageCoordsX || containerCoordsY !== imageCoordsY) {
    if (containerCoordsX > imageCoordsX) {
      differencePercentage = (imageCoordsX / containerCoordsX) * 100
    }
    if (imageCoordsX > containerCoordsX) {
      const temp_differencePercentage = (containerCoordsX / imageCoordsX) * 100
      differencePercentage = (temp_differencePercentage < differencePercentage)
        ? temp_differencePercentage : differencePercentage
    }
    if (containerCoordsY > imageCoordsY) {
      const temp_differencePercentage = (imageCoordsY / containerCoordsY) * 100
      differencePercentage = (temp_differencePercentage < differencePercentage)
        ? temp_differencePercentage : differencePercentage
    }
    if (imageCoordsY > containerCoordsY) {
      const temp_differencePercentage = (containerCoordsY / imageCoordsY) * 100
      differencePercentage = (temp_differencePercentage < differencePercentage)
        ? temp_differencePercentage : differencePercentage
    }
  }
  return differencePercentage
}


export const mergeLanPortSettings = (
  lanPorts: LanPort[],
  lanPortSettings: (VenueLanPortSettings | APLanPortSettings) []
): LanPort[] => {
  lanPorts.forEach((lanPort, index) => {
    const venueLanSetting = lanPortSettings?.[index]
    if(venueLanSetting) {
      lanPort.enabled = venueLanSetting.enabled
      lanPort.softGreEnabled = venueLanSetting.softGreEnabled
      lanPort.clientIsolationEnabled = venueLanSetting.clientIsolationEnabled
      if (venueLanSetting.clientIsolationEnabled) {
        lanPort.clientIsolationSettings = venueLanSetting.clientIsolationSettings
      }
    }
  })

  return lanPorts
}