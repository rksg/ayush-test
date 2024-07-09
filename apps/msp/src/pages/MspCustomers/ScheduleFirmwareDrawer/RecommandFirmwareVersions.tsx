import { useEffect, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Subtitle
} from '@acx-ui/components'
import { useGetRecommandFirmwareUpgradeQuery } from '@acx-ui/msp/services'
import { useParams }                           from '@acx-ui/react-router-dom'

export const RecommandFirmwareVersions = () => {
  const { $t } = useIntl()

  const [firmwareVersionsData, setRecommandFirmware] = useState([] as string[])
  const params = useParams()

  const queryResults = useGetRecommandFirmwareUpgradeQuery({ params: params })

  useEffect(() => {
    if (queryResults?.data) {
      const firmwareVersions =
        queryResults.data.defaultApBranchFamilyApFirmwares.map(item => item.defaultApFirmware)

      setRecommandFirmware(firmwareVersions)
    }
  }, [queryResults?.data])

  const contentFirmwareVersions =
    <Space size={18} direction='vertical'>
      <Subtitle level={4}>
        {
          $t({ defaultMessage: 'Firmware Version: {versions}' },
            { versions: firmwareVersionsData.join(', ') })
        }
      </Subtitle>

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
    </Space>

  return (
    contentFirmwareVersions
  )
}

export default RecommandFirmwareVersions