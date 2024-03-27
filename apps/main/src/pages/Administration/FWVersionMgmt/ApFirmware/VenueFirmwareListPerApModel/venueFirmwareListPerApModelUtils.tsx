import { useState } from 'react'

import { Tooltip }   from 'antd'
import _             from 'lodash'
import { useParams } from 'react-router-dom'

import { useGetUpgradePreferencesQuery, useUpdateUpgradePreferencesMutation } from '@acx-ui/rc/services'
import { ApModelFirmwares, FirmwareVenuePerApModel, UpgradePreferences }      from '@acx-ui/rc/utils'

import { VersionLabelType } from '../../FirmwareUtils'
import * as UI              from '../../styledComponents'

import { VenueIdAndCurrentApFirmwares } from './UpdateNowPerApModel'


export function useUpdateNowPerApModel () {
  const [ updateNowVisible, setUpdateNowVisible ] = useState(false)
  const [ updateNowData, setUpdateNowData ] = useState<VenueIdAndCurrentApFirmwares[]>()
  const handleUpdateModalCancel = () => {
    setUpdateNowVisible(false)
  }

  const convertToUpdateNowData = (selectedRows: FirmwareVenuePerApModel[]) => {
    const result = selectedRows.filter(fw => !fw.isFirmwareUpToDate)
      .map(({ id, currentApFirmwares }) => ({ id, currentApFirmwares }))

    setUpdateNowData(result)
  }

  return {
    updateNowVisible,
    updateNowData,
    convertToUpdateNowData,
    setUpdateNowVisible,
    handleUpdateModalCancel
  }
}

export function useUpgradePerferences () {
  const params = useParams()
  const [preferencesModelVisible, setPreferencesModelVisible] = useState(false)
  const { data: preferencesData } = useGetUpgradePreferencesQuery({ params })
  const [updateUpgradePreferences] = useUpdateUpgradePreferencesMutation()
  const preferenceDays = preferencesData?.days?.map((day) => {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
  })
  const preferences = { ...preferencesData, days: preferenceDays }

  const handlePreferencesModalCancel = () => {
    setPreferencesModelVisible(false)
  }
  const handlePreferencesModalSubmit = async (payload: UpgradePreferences) => {
    try {
      await updateUpgradePreferences({ params, payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return {
    preferencesModelVisible,
    setPreferencesModelVisible,
    preferences,
    handlePreferencesModalCancel,
    handlePreferencesModalSubmit
  }
}

export function renderCurrentFirmwaresColumn (data: FirmwareVenuePerApModel['currentApFirmwares']) {
  const firmwareGroupsMap = groupByFirmware(data)
  const firmwareGroupsText = Object.keys(firmwareGroupsMap).join(', ')
  // eslint-disable-next-line max-len
  const firmwareGroupsTooltipContent = Object.entries(firmwareGroupsMap).map(([ firmware, apModels ]) => {
    return `${firmware}: ${apModels.join(', ')}`
  }).join('\n')

  return (
    <Tooltip title={firmwareGroupsTooltipContent}>
      <UI.WithTooltip>{firmwareGroupsText}</UI.WithTooltip>
    </Tooltip>
  )
}

// eslint-disable-next-line max-len
function groupByFirmware (data: FirmwareVenuePerApModel['currentApFirmwares']): { [firmware in string]: string[] } {
  if (!data) return {}

  return data.reduce((acc, curr) => {
    const { firmware, apModel } = curr
    if (!acc[firmware]) {
      acc[firmware] = []
    }
    acc[firmware].push(apModel)
    return acc
  }, {} as { [firmware in string]: string[] })
}

export type ApFirmwareUpdateGroupType = { apModels: string[], firmwares: VersionLabelType[] }
// eslint-disable-next-line max-len
export function convertApModelFirmwaresToUpdateGroups (data: ApModelFirmwares[]): ApFirmwareUpdateGroupType[] {
  return data.reduce((acc, curr) => {
    curr.supportedApModels.forEach(apModel => {
      if (acc.map(item => item.apModels).flat().includes(apModel)) return

      acc.push({ apModels: [ apModel ], firmwares: [{
        name: curr.name,
        category: curr.category,
        releaseDate: curr.releaseDate,
        onboardDate: curr.onboardDate
      }] })
    })
    return acc
  }, [] as ApFirmwareUpdateGroupType[])
}

export function filterUpdateGroupsByVenues (
  venuesFirmwares: VenueIdAndCurrentApFirmwares[],
  updateGroups: ApFirmwareUpdateGroupType[]
): ApFirmwareUpdateGroupType[] {
  const allVenueApModels = _.uniq(_.compact(
    venuesFirmwares.map(venueFw => venueFw.currentApFirmwares)
  ).flat().map(currentApFw => currentApFw.apModel))


  const result: ApFirmwareUpdateGroupType[] = []
  updateGroups.forEach(updateGroup => {
    const intersectionApModels = _.intersection(updateGroup.apModels, allVenueApModels)
    if (intersectionApModels.length !== 0) {
      result.push({
        ...updateGroup,
        apModels: intersectionApModels
      })
    }
  })

  return result
}
