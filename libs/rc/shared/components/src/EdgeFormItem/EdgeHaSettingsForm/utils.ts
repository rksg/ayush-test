import moment from 'moment'

import { ClusterHaFallbackScheduleTypeEnum, ClusterNetworkSettings } from '@acx-ui/rc/utils'

import { EdgeHaSettingsFormType, EdgeHaSettingsType } from '.'

export const transformEdgeHaSettingsToFormType =
(apiData: EdgeHaSettingsType): EdgeHaSettingsFormType => {
  return {
    fallbackSettings: {
      enable: apiData.fallbackSettings.enable,
      schedule: {
        type: apiData.fallbackSettings.schedule.type,
        intervalHours: apiData.fallbackSettings.schedule.intervalHours,
        time: apiData.fallbackSettings.schedule.time ?
          moment(apiData.fallbackSettings.schedule.time, 'HH:mm:ss') : undefined,
        weekday: apiData.fallbackSettings.schedule.weekday
      }
    },
    loadDistribution: apiData.loadDistribution
  }
}

export const transformEdgeHaSettingsFormToApiPayload =
(data: EdgeHaSettingsFormType): ClusterNetworkSettings => {

  const fallbackSettingsFormData = data.fallbackSettings
  const fallbackSettings = data.fallbackSettings && {
    ...fallbackSettingsFormData,
    schedule: {}
  } as Exclude<ClusterNetworkSettings['highAvailabilitySettings'], undefined>['fallbackSettings']
  if(fallbackSettingsFormData) {
    const { type, time, weekday, intervalHours } = fallbackSettingsFormData.schedule
    switch(type) {
      case ClusterHaFallbackScheduleTypeEnum.DAILY:
        fallbackSettings.schedule = {
          type,
          time: moment(time).format('HH:mm')
        }
        break
      case ClusterHaFallbackScheduleTypeEnum.WEEKLY:
        fallbackSettings.schedule = {
          type,
          weekday,
          time: moment(time).format('HH:mm')
        }
        break
      case ClusterHaFallbackScheduleTypeEnum.INTERVAL:
        fallbackSettings.schedule = {
          type,
          intervalHours
        }
        break
    }
  }

  const payload = {
    ...(fallbackSettings ? {
      highAvailabilitySettings: {
        fallbackSettings,
        loadDistribution: data.loadDistribution
      }
    } : {})
  }

  return payload as unknown as ClusterNetworkSettings
}
