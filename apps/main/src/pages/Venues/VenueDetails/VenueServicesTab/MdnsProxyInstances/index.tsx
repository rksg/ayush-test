import { useIntl } from 'react-intl'

import { Subtitle, Table, TableProps } from '@acx-ui/components'
import {
  AP,
  getServiceDetailsLink,
  ServiceOperation,
  ServiceType
}   from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

export default function MdnsProxyInstances () {
  const { $t } = useIntl()

  const columns: TableProps<AP>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (data, row) => {
        // eslint-disable-next-line max-len
        return <TenantLink to={`/devices/aps/${row.serialNumber}/details/overview`}>{data}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Service' }),
      dataIndex: 'mdnsProxyServiceName',
      key: 'mdnsProxyServiceName',
      sorter: true,
      render: (data) => {
        return <TenantLink
          to={getServiceDetailsLink({
            type: ServiceType.MDNS_PROXY,
            oper: ServiceOperation.DETAIL,
            // TODO: API is not ready to return mDNS Proxy ID
            // serviceId: row.mdnsProxyServiceId
            serviceId: '12345'
          })}>
          {data}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Forwarding rules' }),
      dataIndex: 'forwardingRules',
      key: 'forwardingRules',
      sorter: true,
      render: () => {
        // TODO: API is not ready, this is mocked data for display
        return 0
      }
    }
  ]

  return (
    <>
      <Subtitle level={4}>
        { $t({ defaultMessage: 'APs Running mDNS Proxy service' }) }
      </Subtitle>
      <Table<AP>
        columns={columns}
        dataSource={tableQuery.data?.data}
        rowKey='serialNumber'
      />
    </>
  )
}
