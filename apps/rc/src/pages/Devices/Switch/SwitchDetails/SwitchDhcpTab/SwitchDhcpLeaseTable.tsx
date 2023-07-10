import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import {
  useGetDhcpLeasesQuery
} from '@acx-ui/rc/services'
import {
  defaultSort,
  sortProp,
  SwitchDhcpLease
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

export function SwitchDhcpLeaseTable () {
  const { $t } = useIntl()
  const { switchId, tenantId } = useParams()

  const { data: leaseData, isLoading } = useGetDhcpLeasesQuery({ params: { switchId, tenantId } })

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
