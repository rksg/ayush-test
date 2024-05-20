import { useState } from 'react'

import { Space }     from 'antd'
import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Tooltip }                                                                                               from '@acx-ui/components'
import { useGetAllApModelFirmwareListQuery, useGetUpgradePreferencesQuery, useUpdateUpgradePreferencesMutation } from '@acx-ui/rc/services'
import { ApModelFirmware, FirmwareVenuePerApModel, UpgradePreferences }                                          from '@acx-ui/rc/utils'
import { getIntl }                                                                                               from '@acx-ui/utils'

import { VersionLabelType, compareVersions, getVersionLabel } from '../../FirmwareUtils'
import * as UI                                                from '../../styledComponents'

import { UpdateFirmwarePerApModelFirmware } from './UpdateNowDialog'

export function useUpdateNowPerApModel () {
  const [ updateNowVisible, setUpdateNowVisible ] = useState(false)
  const handleUpdateNowCancel = () => {
    setUpdateNowVisible(false)
  }

  return {
    updateNowVisible,
    setUpdateNowVisible,
    handleUpdateNowCancel
  }
}

export function useChangeScheduleVisiblePerApModel () {
  const [ changeScheduleVisible, setChangeScheduleVisible ] = useState(false)
  const handleChangeScheduleCancel = () => {
    setChangeScheduleVisible(false)
  }

  return {
    changeScheduleVisible,
    setChangeScheduleVisible,
    handleChangeScheduleCancel
  }
}

export function useDowngradePerApModel () {
  const [ downgradeVisible, setDowngradeVisible ] = useState(false)
  const { data: apModelFirmwares } = useGetAllApModelFirmwareListQuery({}, {
    refetchOnMountOrArgChange: 300
  })
  const handleDowngradeCancel = () => {
    setDowngradeVisible(false)
  }

  const canDowngrade = (selectedVenues: FirmwareVenuePerApModel[]): boolean => {
    if (selectedVenues.length > 1 || !apModelFirmwares) return false

    // eslint-disable-next-line max-len
    const apModelIndividualDisplayData = convertToApModelIndividualDisplayData(apModelFirmwares, selectedVenues, undefined, false)

    return apModelIndividualDisplayData.length > 0
  }

  return {
    downgradeVisible,
    setDowngradeVisible,
    handleDowngradeCancel,
    canDowngrade
  }
}

export function useUpgradePerferences () {
  const params = useParams()
  const [preferencesModalVisible, setPreferencesModalVisible] = useState(false)
  const { data: preferencesData } = useGetUpgradePreferencesQuery({ params })
  const [updateUpgradePreferences] = useUpdateUpgradePreferencesMutation()
  const preferenceDays = preferencesData?.days?.map((day) => {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
  })
  const preferences = { ...preferencesData, days: preferenceDays }

  const handlePreferencesModalCancel = () => {
    setPreferencesModalVisible(false)
  }
  const handlePreferencesModalSubmit = async (payload: UpgradePreferences) => {
    try {
      await updateUpgradePreferences({ params, payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return {
    preferencesModalVisible,
    setPreferencesModalVisible,
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
export function convertApModelFirmwaresToUpdateGroups (data: ApModelFirmware[]): ApFirmwareUpdateGroupType[] {
  const hasHandledApModels: string[] = []

  return data.reduce((acc, curr) => {
    const diff = _.difference(curr.supportedApModels, hasHandledApModels)

    if (diff.length > 0) {
      acc.push({
        apModels: diff,
        firmwares: [{
          name: curr.name,
          category: curr.category,
          releaseDate: curr.releaseDate,
          onboardDate: curr.onboardDate
        }]
      })
      hasHandledApModels.push(...diff)
    }
    return acc
  }, [] as ApFirmwareUpdateGroupType[])
}

interface ExpandableApModelListProps {
  apModels: string[]
  maxLength?: number
  generateLabelWrapper?: (apModelsForDisplay: string) => JSX.Element
}

export function ExpandableApModelList (props: ExpandableApModelListProps) {
  const { $t } = useIntl()
  const { apModels, maxLength = 3, generateLabelWrapper = generateDefaultLabelWrapper } = props
  const isMoreDevicesTooltipShown = apModels.length > maxLength
  const apModelsForDisplay = isMoreDevicesTooltipShown
    ? apModels.slice(0, maxLength).join(', ') + '...'
    : apModels.join(', ')

  const label = generateLabelWrapper(apModelsForDisplay)
  const chunkApModels = _.chunk([...new Set(apModels)], 10)

  return <Space>
    {label}
    {isMoreDevicesTooltipShown &&
      <Tooltip
        overlayStyle={{ maxWidth: chunkApModels.length > 3 ? '350px' : '250px' }}
        children={$t({ defaultMessage: 'See more devices' })}
        title={
          <Space direction='horizontal' align='start' size={10}>
            {chunkApModels.map((models: string[], index) => {
              return <ul key={index}>{models.map(model => <li key={model}>{model}</li>)}</ul>
            })}
          </Space>
        }
        dottedUnderline={true}
      />
    }
  </Space>
}

function generateDefaultLabelWrapper (apModelsForDisplay: string): JSX.Element {
  return <div>{ apModelsForDisplay }</div>
}

export type ApModelIndividualDisplayDataType = {
  apModel: string
  versionOptions: { key: string, label: string }[]
  defaultVersion: string
  extremeFirmware: string
}

export function convertToApModelIndividualDisplayData (
  apModelFirmwareList: ApModelFirmware[],
  venuesFirmwares: FirmwareVenuePerApModel[],
  initialPayload?: UpdateFirmwarePerApModelFirmware,
  isUpgrade = true
): ApModelIndividualDisplayDataType[] {
  const extremeFirmwareMap = findExtremeFirmwareBasedOnApModel(venuesFirmwares, isUpgrade)

  if (_.isEmpty(extremeFirmwareMap)) return []

  // eslint-disable-next-line max-len
  const result: { [apModel in string]: Pick<ApModelIndividualDisplayDataType, 'versionOptions' | 'extremeFirmware'> } = {}

  apModelFirmwareList.forEach((apModelFirmware: ApModelFirmware) => {
    if (!apModelFirmware.supportedApModels) return

    apModelFirmware.supportedApModels.forEach(apModel => {
      const apModelExtremeFirmware = extremeFirmwareMap[apModel]
      if (!apModelExtremeFirmware) return

      if (!result[apModel]) {
        result[apModel] = {
          versionOptions: [],
          extremeFirmware: apModelExtremeFirmware
        }
      }

      const comparisonResult = compareVersions(apModelExtremeFirmware, apModelFirmware.id)
      if (isUpgrade ? comparisonResult >= 0 : comparisonResult <= 0) return

      result[apModel].versionOptions.push(createFirmwareOption(apModelFirmware))
    })
  })

  return Object.entries(result).map(([ apModel, { versionOptions, extremeFirmware } ]) => ({
    apModel,
    versionOptions,
    extremeFirmware,
    defaultVersion: isUpgrade
      ? getApModelDefaultFirmwareFromOptions(apModel, versionOptions, initialPayload)
      : ''
  }))
}

// eslint-disable-next-line max-len
function createFirmwareOption (apModelFirmware: ApModelFirmware): ApModelIndividualDisplayDataType['versionOptions'][number] {
  const intl = getIntl()

  return {
    key: apModelFirmware.id,
    label: getVersionLabel(intl, apModelFirmware as VersionLabelType)
  }
}

function getApModelDefaultFirmwareFromOptions (
  apModel: string,
  versionOptions: ApModelIndividualDisplayDataType['versionOptions'],
  initialPayload?: UpdateFirmwarePerApModelFirmware
): string {
  if (initialPayload) {
    const targetApModelFirmwares = initialPayload.find(fw => fw.apModel === apModel)
    return targetApModelFirmwares?.firmware ?? ''
  }

  return versionOptions.length === 0 ? '' : versionOptions[0].key
}

export function findExtremeFirmwareBasedOnApModel (
  venuesFirmwares: FirmwareVenuePerApModel[],
  findMax = true
): { [apModel in string]: string } {

  return venuesFirmwares.reduce((acc, curr) => {
    if (!curr.currentApFirmwares) return acc

    curr.currentApFirmwares.forEach(currentApFw => {
      if (!acc[currentApFw.apModel]) {
        acc[currentApFw.apModel] = currentApFw.firmware
      } else {
        const comparisonResult = compareVersions(currentApFw.firmware, acc[currentApFw.apModel])
        if (findMax ? comparisonResult > 0 : comparisonResult < 0) {
          acc[currentApFw.apModel] = currentApFw.firmware
        }
      }
    })

    return acc
  }, {} as { [apModel in string]: string })
}
