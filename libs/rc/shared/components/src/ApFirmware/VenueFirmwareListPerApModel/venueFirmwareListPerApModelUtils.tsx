import { useState } from 'react'

import { Space }              from 'antd'
import _                      from 'lodash'
import { IntlShape, useIntl } from 'react-intl'
import { useParams }          from 'react-router-dom'

import { Tooltip }                      from '@acx-ui/components'
import {
  useGetAllApModelFirmwareListQuery,
  useGetUpgradePreferencesQuery,
  useUpdateUpgradePreferencesMutation
} from '@acx-ui/rc/services'
import { ApModelFirmware, FirmwareLabel, FirmwareVenuePerApModel, UpgradePreferences } from '@acx-ui/rc/utils'
import { getIntl }                                                                     from '@acx-ui/utils'

import { compareVersions, getVersionLabel, isAlphaOrBetaFilter, isLegacyAlphaOrBetaFilter, VersionLabelType } from '../FirmwareUtils'

import * as UI                              from './styledComponents'
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

export function useUpdateEarlyAccessNowPerApModel () {
  const [ updateEarlyAccessNowVisible, setUpdateEarlyAccessNowVisible ] = useState(false)
  const handleUpdateEarlyAccessNowCancel = () => {
    setUpdateEarlyAccessNowVisible(false)
  }

  return {
    updateEarlyAccessNowVisible,
    setUpdateEarlyAccessNowVisible,
    handleUpdateEarlyAccessNowCancel
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

    return apModelIndividualDisplayData.some(data => data.versionOptions.length > 0)
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

// eslint-disable-next-line max-len
export function renderCurrentFirmwaresColumn (data: FirmwareVenuePerApModel['currentApFirmwares'], intl: IntlShape) {
  const firmwareGroupsMap = groupByFirmware(data)
  const firmwareGroupsText = Object
    .keys(firmwareGroupsMap)
    .sort((a, b) => -compareVersions(a, b))
    .join(', ')
  const firmwareGroupsTooltipContent = Object
    .entries(firmwareGroupsMap)
    .sort((a, b) => -compareVersions(a[0], b[0]))
    .map(([ firmware, firmwareInfo ]) => {
      let label = ''
      // eslint-disable-next-line max-len
      const isEarlyAccess = isAlphaOrBetaFilter(firmwareInfo.labels as FirmwareLabel[])
      if (isEarlyAccess) {
        label = ` ${intl.$t({ defaultMessage: '(Early Access)' })}`
      } else {
        if (isLegacyAlphaOrBetaFilter(firmwareInfo.labels as FirmwareLabel[])) {
          label = ` ${intl.$t({ defaultMessage: '(Legacy Early Access)' })}`
        }
      }
      return `${firmware}${label}: ${firmwareInfo.apModel.join(', ')}`
    })
    .join('\n')

  return (
    <Tooltip placement='topLeft' dottedUnderline={true} title={firmwareGroupsTooltipContent}>
      <UI.WithTooltip>{firmwareGroupsText}</UI.WithTooltip>
    </Tooltip>
  )
}

// eslint-disable-next-line max-len
function groupByFirmware (data: FirmwareVenuePerApModel['currentApFirmwares']): { [firmware in string]: { apModel: string[], labels: string[] } } {
  if (!data) return {}

  return data.reduce((acc, curr) => {
    const { firmware, apModel, labels } = curr
    if (!acc[firmware]) {
      acc[firmware] = {
        apModel: [],
        labels: []
      }
    }
    acc[firmware] = {
      apModel: [...acc[firmware].apModel, apModel],
      labels: labels || []
    }
    return acc
  }, {} as { [firmware in string]: { apModel: string[], labels: FirmwareLabel[] } })
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
          onboardDate: curr.onboardDate,
          labels: curr.labels
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
  versionOptions: { key: string, label: string, releaseDate: string }[]
  defaultVersion: string
  extremeFirmware: string
  earlyAccess?: boolean
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
          extremeFirmware: apModelExtremeFirmware.extremeFirmware
        }
      }

      // eslint-disable-next-line max-len
      const comparisonResult = compareVersions(apModelFirmware.id, apModelExtremeFirmware.extremeFirmware)

      const shouldAddOption = isUpgrade
        ? comparisonResult > 0 || (!apModelExtremeFirmware.isAllTheSame && comparisonResult === 0)
        : comparisonResult < 0

      if (shouldAddOption) {
        result[apModel].versionOptions.push(createFirmwareOption(apModelFirmware))
      }
    })
  })

  // eslint-disable-next-line max-len
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
    label: getVersionLabel(intl, apModelFirmware as VersionLabelType),
    releaseDate: apModelFirmware.releaseDate
  }
}

function getApModelDefaultFirmwareFromOptions (
  apModel: string,
  versionOptions: ApModelIndividualDisplayDataType['versionOptions'],
  initialPayload?: UpdateFirmwarePerApModelFirmware
): string {
  if (versionOptions.length === 0) return ''

  const targetApModelFirmwares = initialPayload?.find(fw => fw.apModel === apModel)
  return targetApModelFirmwares?.firmware ?? versionOptions[0].key
}

type ExtremeFirmwareBasedOnApModel = {
  [apModel in string]: {
    extremeFirmware: string,
    isAllTheSame: boolean
  }
}

export function findExtremeFirmwareBasedOnApModel (
  venuesFirmwares: FirmwareVenuePerApModel[],
  findMax = true
): ExtremeFirmwareBasedOnApModel {

  return venuesFirmwares.reduce((acc, curr) => {
    if (!curr.currentApFirmwares) return acc

    curr.currentApFirmwares.forEach(currentApFw => {
      if (!acc[currentApFw.apModel]) {
        acc[currentApFw.apModel] = {
          extremeFirmware: currentApFw.firmware,
          isAllTheSame: true
        }
      } else {
        // eslint-disable-next-line max-len
        const comparisonResult = compareVersions(currentApFw.firmware, acc[currentApFw.apModel].extremeFirmware)

        if (comparisonResult !== 0) acc[currentApFw.apModel].isAllTheSame = false

        if (findMax ? comparisonResult > 0 : comparisonResult < 0) {
          acc[currentApFw.apModel].extremeFirmware = currentApFw.firmware
        }
      }
    })

    return acc
  }, {} as ExtremeFirmwareBasedOnApModel)
}
