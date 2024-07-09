import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import {
  useGetDhcpLeasesQuery
} from '@acx-ui/rc/services'
import {
  defaultSort,
  sortProp,
  SwitchDhcpLease
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

export function SwitchDhcpLeaseTable (props: {
  venueId?: string
}) {
  const { $t } = useIntl()
  const { switchId, tenantId } = useParams()
  const { venueId } = props

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const { data: leaseData, isLoading } = useGetDhcpLeasesQuery({
    params: { switchId, tenantId, venueId },
    ...( isSwitchRbacEnabled ? { payload: {
      troubleshootingType: 'dhcp-server-lease-table'
    } } : {}),
    enableRbac: isSwitchRbacEnabled
  })

  const columns: TableProps<SwitchDhcpLease>['columns'] = [
    {
      key: 'clientId',
      title: $t({ defaultMessage: 'Client ID' }),
      dataIndex: 'clientId',
      sorter: { compare: sortProp('clientId', defaultSort) },
      defaultSortOrder: 'ascend'
    }, {
      key: 'clientIp',
      title: $t({ defaultMessage: 'Client IP' }),
      dataIndex: 'clientIp',
      sorter: { compare: sortProp('clientIp', defaultSort) }
    }, {
      key: 'leaseExpiration',
      title: $t({ defaultMessage: 'Lease Expiration' }),
      dataIndex: 'leaseExpiration',
      sorter: { compare: sortProp('leaseExpiration', defaultSort) }
    }, {
      key: 'leaseType',
      title: $t({ defaultMessage: 'Lease Type' }),
      dataIndex: 'leaseType',
      sorter: { compare: sortProp('leaseType', defaultSort) }
    }
  ]

  return (
    <Loader states={[{ isLoading }]}>
      <Table
        columns={columns}
        dataSource={leaseData}
        rowKey='id'
      />
    </Loader>
  )
}
