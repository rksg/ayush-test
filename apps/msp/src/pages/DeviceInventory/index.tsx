// import { useState } from 'react'

import { SortOrder }          from 'antd/lib/table/interface'
import { IntlShape, useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  Table,
  TableProps
} from '@acx-ui/components'
import { DownloadOutlined }            from '@acx-ui/icons'
import { useDeviceInventoryListQuery } from '@acx-ui/rc/services'
import {
  APView,
  ApDeviceStatusEnum,
  transformApStatus,
  EcDeviceInventory,
  EntitlementNetworkDeviceType,
  SwitchStatusEnum,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

const transformDeviceTypeString = (row: EcDeviceInventory) => {
  switch (row.deviceType) {
    case EntitlementNetworkDeviceType.WIFI:
      return 'Access Point'
    case EntitlementNetworkDeviceType.SWITCH:
      return 'Switch'
  }
  return ''
}

function TransformDeviceOperStatus (row: EcDeviceInventory, intl: IntlShape) {
  switch (row.deviceType) {
    case EntitlementNetworkDeviceType.WIFI:
      const apStatus =
        transformApStatus(intl, row.deviceStatus as ApDeviceStatusEnum, APView.AP_LIST)
      return apStatus.message
    case EntitlementNetworkDeviceType.SWITCH:
      const switchStatus = transformSwitchStatus(row.deviceStatus as SwitchStatusEnum)
      return switchStatus
  }
  return ''
}

const transformSwitchStatus = (switchStatus: SwitchStatusEnum) => {
  switch (switchStatus) {
    case SwitchStatusEnum.OPERATIONAL:
      return 'Operational'
    case SwitchStatusEnum.DISCONNECTED:
      return 'Requires Attention'
    case SwitchStatusEnum.NEVER_CONTACTED_CLOUD:
      return 'Never contacted cloud'
    case SwitchStatusEnum.INITIALIZING:
      return 'Initializing'
    case SwitchStatusEnum.APPLYING_FIRMWARE:
      return 'Firmware updating'
    case SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED:
      return 'Never contacted Active Switch'
    default:
      return 'Never contacted cloud'
  }
}

export function DeviceInventory () {
  const intl = useIntl()
  // const [ search, setSearch ] = useState('')

  const columns: TableProps<EcDeviceInventory>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'apMac',
      sorter: true,
      searchable: true,
      key: 'apMac',
      defaultSortOrder: 'ascend' as SortOrder
    },
    {
      title: intl.$t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'serialNumber',
      sorter: true,
      searchable: true,
      key: 'serialNumber'
    },
    {
      title: intl.$t({ defaultMessage: 'Device Type' }),
      dataIndex: 'deviceType',
      sorter: true,
      filterable: true,
      key: 'deviceType',
      render: function (data, row) {
        return transformDeviceTypeString(row)
      }
    },
    {
      title: intl.$t({ defaultMessage: 'Device Model' }),
      dataIndex: 'model',
      sorter: true,
      filterable: true,
      key: 'model'
    },
    {
      title: intl.$t({ defaultMessage: 'Device Name' }),
      dataIndex: 'name',
      sorter: true,
      key: 'name'
    },
    {
      title: intl.$t({ defaultMessage: 'Customer Name' }),
      dataIndex: 'customerName',
      sorter: true,
      filterable: true,
      key: 'customerName'
    },
    {
      title: intl.$t({ defaultMessage: 'Operational Status' }),
      dataIndex: 'deviceStatus',
      sorter: true,
      key: 'deviceStatus',
      render: function (data, row) {
        return TransformDeviceOperStatus(row, intl)
      }
    },
    {
      title: intl.$t({ defaultMessage: "Customer'sVenue" }),
      dataIndex: 'venueName',
      sorter: true,
      filterable: true,
      key: 'venueName'
    },
    {
      title: intl.$t({ defaultMessage: 'Managed as' }),
      dataIndex: 'managedAs',
      sorter: true,
      key: 'managedAs'
    },
    {
      title: intl.$t({ defaultMessage: 'Tenant Id' }),
      dataIndex: 'tenantId',
      sorter: true,
      key: 'tenantId'
    }
  ]

  const defaultPayload = {
    searchString: '',
    fields: [
      'deviceType',
      'venueName',
      'serialNumber',
      'switchMac',
      'name',
      'tenantId',
      'apMac',
      'model',
      'customerName',
      'deviceStatus' ]
  }

  const DeviceTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useDeviceInventoryListQuery,
      defaultPayload
    })

    return (
      <Loader states={[tableQuery]}>
        <Table
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='name'
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={intl.$t({ defaultMessage: 'Device Inventory' })}
        extra={[
          <TenantLink to='/dashboard' key='ownAccount'>
            <Button>{intl.$t({ defaultMessage: 'Manage own account' })}</Button>
          </TenantLink>,
          <Button key='download' icon={<DownloadOutlined />}></Button>
        ]}
      />
      <DeviceTable />
    </>
  )
}
