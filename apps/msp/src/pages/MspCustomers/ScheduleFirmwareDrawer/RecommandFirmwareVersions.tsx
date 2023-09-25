import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Subtitle
} from '@acx-ui/components'
import { useGetRecommandFirmwareUpgradeQuery } from '@acx-ui/msp/services'
import { useParams }                           from '@acx-ui/react-router-dom'

interface RecommandFirmwareVersionsProps {
  tenantIds?: string[]
}

export const RecommandFirmwareVersions = (props: RecommandFirmwareVersionsProps) => {
  const { $t } = useIntl()

  const { tenantIds } = props
  const params = useParams()

  const queryResults = useGetRecommandFirmwareUpgradeQuery({ params: params })

  const contentFirmwareVersions =
    <Space size={18} direction='vertical'>
      <Subtitle level={4}>
        {$t({
          defaultMessage: 'Firmware Version: 6.2.0.103.17.10'
        })}
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