import { useState } from 'react'

import { Select }    from 'antd'
import { SortOrder } from 'antd/lib/table/interface'
import { useIntl }   from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  showToast,
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

const { Option } = Select

function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<EcDeviceInventory>['columns'] = [
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'apMac',
      sorter: true,
      searchable: true,
      key: 'apMac',
      defaultSortOrder: 'ascend' as SortOrder
    },
    {
      title: $t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'serialNumber',
      sorter: true,
      searchable: true,
      key: 'serialNumber'
    },
    {
      title: $t({ defaultMessage: 'Device Type' }),
      dataIndex: 'deviceType',
      sorter: true,
      filterable: true,
      key: 'deviceType',
      render: function (data, row) {
        return transformDeviceTypeString(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Device Model' }),
      dataIndex: 'model',
      sorter: true,
      filterable: true,
      key: 'model'
    },
    {
      title: $t({ defaultMessage: 'Device Name' }),
      dataIndex: 'name',
      sorter: true,
      key: 'name'
    },
    {
      title: $t({ defaultMessage: 'Customer Name' }),
      dataIndex: 'customerName',
      sorter: true,
      filterable: true,
      key: 'customerName'
    },
    {
      title: $t({ defaultMessage: 'Operational Status' }),
      dataIndex: 'deviceStatus',
      sorter: true,
      key: 'deviceStatus',
      render: function (data, row) {
        return transformDeviceOperStatus(row)
      }
    },
    {
      title: $t({ defaultMessage: "Customer'sVenue" }),
      dataIndex: 'venueName',
      sorter: true,
      filterable: true,
      key: 'venueName'
    },
    {
      title: $t({ defaultMessage: 'Managed as' }),
      dataIndex: 'managedAs',
      sorter: true,
      key: 'managedAs'
    },
    {
      title: $t({ defaultMessage: 'Tenant Id' }),
      dataIndex: 'tenantId',
      sorter: true,
      key: 'tenantId'
    }
  ]

  return columns
}

const transformDeviceTypeString = (row: EcDeviceInventory) => {
  switch (row.deviceType) {
    case EntitlementNetworkDeviceType.WIFI:
      return 'Access Point'
    case EntitlementNetworkDeviceType.SWITCH:
      return 'Switch'
  }
  return ''
}

const transformDeviceOperStatus = (row: EcDeviceInventory) => {
  switch (row.deviceType) {
    case EntitlementNetworkDeviceType.WIFI:
      // const intl = useIntl()
      // const apStatus =
      //   transformApStatus(intl, row.deviceStatus as ApDeviceStatusEnum, APView.AP_LIST)
      // return apStatus.message
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

const onApply = (
  // selectedOptions?: SingleValueType | SingleValueType[] | undefined
) => {
  showToast({
    type: 'success',
    content: 'Cascader Options Selected:'
  })
}

export function DeviceInventory () {
  const { $t } = useIntl()
  const [ search, setSearch ] = useState('')
  const DeviceTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useDeviceInventoryListQuery,
      defaultPayload
    })

    return (
      <Loader states={[tableQuery]}>
        <Table
          columns={useColumns()}
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
        title={$t({ defaultMessage: 'Device Inventory' })}
        extra={[
          <TenantLink to='/dashboard' key='ownAccount'>
            <Button>{$t({ defaultMessage: 'Manage own account' })}</Button>
          </TenantLink>,
          <Button key='download' icon={<DownloadOutlined />}></Button>
        ]}
      />
      <DeviceTable />
    </>
  )
}
