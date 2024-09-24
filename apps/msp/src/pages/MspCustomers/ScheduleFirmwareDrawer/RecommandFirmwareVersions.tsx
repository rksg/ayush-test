import { useEffect, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Subtitle
} from '@acx-ui/components'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import {
  useGetFirmwareUpgradeByApModelQuery,
  useGetRecommandFirmwareUpgradeQuery
} from '@acx-ui/msp/services'
import { RecommendFirmwareUpgradeByApModel } from '@acx-ui/msp/utils'
import { useParams }                         from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

const compareVersions = (a?: string, b?: string): number => {
  const v1 = (a || '').split('.')
  const v2 = (b || '').split('.')
  for (let i = 0; i < Math.min(v1.length, v2.length); i++) {
    const res = Number(v1[i]) - Number(v2[i])
    if (res !== 0) {
      return res
    }
  }
  return 0
}

export const RecommandFirmwareVersions = () => {
  const { $t } = useIntl()

  const [firmwareVersionsData, setRecommandFirmware] = useState([] as string[])
  const [firmwareVersionsDataByApModel, setRecommandFirmwareByApModel] =
    useState([] as RecommendFirmwareUpgradeByApModel[])
  const params = useParams()
  const isApFirmwareUpgradeByModelEnabled =
    useIsSplitOn(Features.AP_FIRMWARE_UPGRADE_BY_MODEL_TOGGLE)

  const queryResults = useGetRecommandFirmwareUpgradeQuery({ params: params },
    { skip: isApFirmwareUpgradeByModelEnabled })

  const queryResultsByApModel = useGetFirmwareUpgradeByApModelQuery({ params: params },
    { skip: !isApFirmwareUpgradeByModelEnabled })

  useEffect(() => {
    if (queryResults?.data) {
      const firmwareVersions =
        queryResults.data.defaultApBranchFamilyApFirmwares.map(item => item.defaultApFirmware)

      setRecommandFirmware(firmwareVersions)
    }
    if (queryResultsByApModel?.data) {
      const firmware10AvailableVersions =
        [...queryResultsByApModel?.data].sort((a, b) => compareVersions(b.id, a.id))
      setRecommandFirmwareByApModel(firmware10AvailableVersions)
    }

  }, [queryResults?.data, queryResultsByApModel?.data])

  const contentFirmwareVersions =
    <Space size={18} direction='vertical'>
      {!isApFirmwareUpgradeByModelEnabled && <Subtitle level={4}>
        {
          $t({ defaultMessage: 'Firmware Version: {versions}' },
            { versions: firmwareVersionsData.join(', ') })
        }
      </Subtitle>}

      <h4>{$t({
        defaultMessage:
        `All selected MSP Customers will be upgraded to this firmware version. 
        Tenants that already have this or higher firmware version installed won’t change.`
      })}</h4>
      <h4>{$t({
        defaultMessage:
        `During firmware upgrade all selected network devices will reboot and 
        service may be interrupted for up to 15 minutes.`
      })}</h4>
      <h4>{$t({
        defaultMessage:
        `Are you sure you want to upgrade the firmware version on devices 
        for selected customers?`
      })}</h4>

      {isApFirmwareUpgradeByModelEnabled &&
      <div>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Latest firmware version by AP Models:' })}
        </Subtitle>
        {firmwareVersionsDataByApModel.map(version =>
          <UI.VersionLabel2>
            <label style={{ fontWeight: 'bold' }}>{version.id+':'}</label>
            <label>{[...version.supportedApModels].sort().join(', ')}</label>
          </UI.VersionLabel2>
        )}
      </div>}
    </Space>

  return (
    contentFirmwareVersions
  )
}

export default RecommandFirmwareVersions