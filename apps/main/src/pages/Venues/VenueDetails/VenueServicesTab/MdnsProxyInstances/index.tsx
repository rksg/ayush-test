import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { useApListQuery }            from '@acx-ui/rc/services'
import {
  AP,
  getServiceDetailsLink,
  ServiceOperation,
  ServiceType,
  useTableQuery
}   from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export default function MdnsProxyInstances () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const addApPath = useTenantLink('devices/aps/add')

  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      // TODO: API is not ready to return these fields
      // fields: ['name', 'serialNumber', 'mdnsProxyServiceId', 'mdnsProxyServiceName', 'rules'],
      fields: ['name', 'serialNumber'],
      filters: { venueId: [params.venueId] }
    }
  })

  const handleAddAction = () => {
    navigate(addApPath)
  }

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
            // TODO: API is not ready to return this field
            // serviceId: row.mdnsProxyServiceId
            serviceId: '12345'
          })}>
          {data}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Forwarding rules' }),
      dataIndex: 'rules',
      key: 'rules',
      sorter: true,
      render: () => {
        // TODO: API is not ready, this is mocked data for display
        return 0
      }
    },
    {
      title: $t({ defaultMessage: 'Active' }),
      dataIndex: 'mdnsProxyServiceId',
      key: 'mdnsProxyServiceId',
      render: function () {
        // TODO: API is not ready
        return <Switch
          checked={false}
        />
      }
    }
  ]

  return (
    <>
      <UI.TableTitle>
        { $t({ defaultMessage: 'APs Running mDNS Proxy service' }) }
      </UI.TableTitle>
      <Loader states={[tableQuery]}>
        <Table<AP>
          columns={columns}
          dataSource={tableQuery.data?.data}
          actions={[{
            label: $t({ defaultMessage: 'Add AP' }),
            onClick: handleAddAction
          }]}
          rowKey='serialNumber'
        />
      </Loader>
    </>
  )
}
