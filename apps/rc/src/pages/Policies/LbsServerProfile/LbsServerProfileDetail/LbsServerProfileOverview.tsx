import { Badge, Space } from 'antd'
import { useIntl }      from 'react-intl'

import { SummaryCard }               from '@acx-ui/components'
import { LbsServerProfileViewModel } from '@acx-ui/rc/utils'

export function LbsServerProfileOverview (props: { data: LbsServerProfileViewModel }) {
  const { $t } = useIntl()
  const { data } = props

  const lbsServerProfileInfo = [
    {
      // Not support VenueSingular for Hospitality Vertical
      title: $t({ defaultMessage: 'LBS Server Venue Name' }),
      content: data.lbsServerVenueName
    },
    {
      title: $t({ defaultMessage: 'Server' }),
      content: <LbsServerConnectionStatus
        isConnected={data.serverConnected ?? false}
        address={data.server} />
    }
  ]

  return (
    <SummaryCard data={lbsServerProfileInfo} colPerRow={6} />
  )
}

const handleConnectionColor = (connected: boolean) => {
  return connected ? 'var(--acx-semantics-green-50)' : 'var(--acx-semantics-red-50)'
}

export const LbsServerConnectionStatus = (
  { isConnected, address }: { isConnected: boolean, address: string }
) => {
  return (
    <Space>
      <Badge color={handleConnectionColor(isConnected)}
        text={address}
      />
    </Space>
  )
}
