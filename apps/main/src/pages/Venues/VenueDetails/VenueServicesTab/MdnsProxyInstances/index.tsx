import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps }          from '@acx-ui/components'
import { useApListQuery, useDeleteMdnsProxyInstancesMutation } from '@acx-ui/rc/services'
import {
  AP,
  getServiceDetailsLink,
  ServiceOperation,
  ServiceType,
  useTableQuery
}   from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export default function MdnsProxyInstances () {
  const { $t } = useIntl()
  const params = useParams()
  const [ deleteInstances ] = useDeleteMdnsProxyInstancesMutation()

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
  }

  const rowActions: TableProps<AP>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Change' }),
      onClick: () => {}
    },
    {
      label: $t({ defaultMessage: 'Remove' }),
      onClick: (rows: AP[], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Instances' }),
            numOfEntities: rows.length,
            entityValue: rows[0].name
          },
          onOk: () => {
            deleteInstances({
              // params: { ...params, serviceId: rows[0].multicasDnsProxyServiceProfileId },
              params,
              payload: rows.map(r => r.serialNumber)
            }).then(clearSelection)
          }
        })
      }
    }
  ]

  const columns: TableProps<AP>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'apName',
      key: 'apName',
      sorter: true,
      render: (data, row) => {
        // eslint-disable-next-line max-len
        return <TenantLink to={`/devices/wifi/${row.serialNumber}/details/overview`}>{data}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Service' }),
      dataIndex: 'serviceName',
      key: 'serviceName',
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
      dataIndex: 'numberOfRules',
      key: 'numberOfRules',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Active' }),
      dataIndex: 'multicasDnsProxyServiceProfileId',
      key: 'multicasDnsProxyServiceProfileId',
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
            label: $t({ defaultMessage: 'Add Instance' }),
            onClick: handleAddAction
          }]}
          rowKey='serialNumber'
          rowActions={rowActions}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    </>
  )
}
