import { useState } from 'react'

import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  useGetMdnsProxyApsQuery,
  useDeleteMdnsProxyApsMutation
} from '@acx-ui/rc/services'
import {
  getServiceDetailsLink,
  MdnsProxyAp,
  ServiceOperation,
  ServiceType,
  useTableQuery
}   from '@acx-ui/rc/utils'
import { TenantLink, useParams }     from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import AddMdnsProxyInstanceDrawer from './AddMdnsProxyInstanceDrawer'
import ChangeMdnsProxyDrawer      from './ChangeMdnsProxyDrawer'
import * as UI                    from './styledComponents'

export default function MdnsProxyInstances () {
  const { $t } = useIntl()
  const params = useParams()
  const [ deleteInstances ] = useDeleteMdnsProxyApsMutation()
  const [ changeServiceDrawerVisible, setChangeServiceDrawerVisible ] = useState(false)
  const [ addInstanceDrawerVisible, setAddInstanceDrawerVisible ] = useState(false)
  const [ selectedApIds, setSelectedApIds ] = useState<string[]>([])
  const [ selectedServiceId, setSelectedServiceId ] = useState<string>()

  const tableQuery = useTableQuery({
    useQuery: useGetMdnsProxyApsQuery,
    defaultPayload: {}
  })

  const handleAddAction = () => {
    setAddInstanceDrawerVisible(true)
  }

  const rowActions: TableProps<MdnsProxyAp>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Change' }),
      onClick: (rows: MdnsProxyAp[]) => {
        setSelectedApIds(rows.map(r => r.serialNumber))
        setSelectedServiceId(rows[0].serviceId)
        setChangeServiceDrawerVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Remove' }),
      onClick: (rows: MdnsProxyAp[], clearSelection) => {
        doDelete(rows, clearSelection)
      }
    }
  ]

  const columns: TableProps<MdnsProxyAp>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'apName',
      key: 'apName',
      sorter: true,
      fixed: 'left',
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
      render: (data, row) => {
        return <TenantLink
          to={getServiceDetailsLink({
            type: ServiceType.MDNS_PROXY,
            oper: ServiceOperation.DETAIL,
            serviceId: row.serviceId
          })}>
          {data}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Forwarding rules' }),
      dataIndex: 'rules',
      key: 'rules',
      sorter: false,
      render: (data, row) => {
        return row.rules ? row.rules.length : 0
      }
    },
    {
      title: $t({ defaultMessage: 'Active' }),
      dataIndex: 'multicasDnsProxyServiceProfileId',
      key: 'multicasDnsProxyServiceProfileId',
      render: function (data, row) {
        return <Switch
          checked={true}
          onChange={checked => {
            if (checked) return

            doDelete([row])
          }}
        />
      }
    }
  ]

  const doDelete = (rows: MdnsProxyAp[], callback = () => {}) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Instance' }),
        numOfEntities: rows.length,
        entityValue: rows[0].apName
      },
      onOk: () => {
        deleteInstances({
          params: { ...params, serviceId: rows[0].serviceId },
          payload: rows.map(r => r.serialNumber)
        }).then(callback)
      }
    })
  }

  return (
    <>
      <UI.TableTitle>
        { $t({ defaultMessage: 'APs Running mDNS Proxy service' }) }
      </UI.TableTitle>
      <Loader states={[tableQuery]}>
        <Table<MdnsProxyAp>
          settingsId='venue-mdns-proxy-table'
          columns={columns}
          dataSource={tableQuery.data?.data}
          actions={filterByAccess([{
            label: $t({ defaultMessage: 'Add Instance' }),
            onClick: handleAddAction
          }])}
          onChange={tableQuery.handleTableChange}
          rowKey='serialNumber'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'radio' }}
        />
      </Loader>
      <AddMdnsProxyInstanceDrawer
        visible={addInstanceDrawerVisible}
        setVisible={setAddInstanceDrawerVisible}
        venueId={params.venueId}
      />
      <ChangeMdnsProxyDrawer
        visible={changeServiceDrawerVisible}
        setVisible={setChangeServiceDrawerVisible}
        apSerialNumberList={selectedApIds}
        initialServiceId={selectedServiceId}
      />
    </>
  )
}
