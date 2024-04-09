import { useState } from 'react'

import { Space, Tooltip } from 'antd'
import _                  from 'lodash'
import { useIntl }        from 'react-intl'
import { useParams }      from 'react-router-dom'

import { useGetUpgradePreferencesQuery, useUpdateUpgradePreferencesMutation } from '@acx-ui/rc/services'
import { ApModelFirmware, FirmwareVenuePerApModel, UpgradePreferences }       from '@acx-ui/rc/utils'

import { VersionLabelType } from '../../FirmwareUtils'
import * as UI              from '../../styledComponents'

export function useUpdateNowPerApModel () {
  const [ updateNowVisible, setUpdateNowVisible ] = useState(false)
  const handleUpdateModalCancel = () => {
    setUpdateNowVisible(false)
  }

  return {
    updateNowVisible,
    setUpdateNowVisible,
    handleUpdateModalCancel
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
        children={
          <UI.ShowMoreLink>{$t({ defaultMessage: 'See more devices' })}</UI.ShowMoreLink>
        }
        title={
          <Space direction='horizontal' align='start' size={10}>
            {chunkApModels.map((models: string[], index) => {
              return <ul key={index}>{models.map(model => <li key={model}>{model}</li>)}</ul>
            })}
          </Space>
        }
      />
    }
  </Space>
}

function generateDefaultLabelWrapper (apModelsForDisplay: string): JSX.Element {
  return <div>{ apModelsForDisplay }</div>
}
