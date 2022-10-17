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

const transformDeviceTypeString = (row: EcDeviceInventory, { $t }: IntlShape) => {
  switch (row.deviceType) {
    case EntitlementNetworkDeviceType.WIFI:
      return $t({ defaultMessage: 'Access Point' })
    case EntitlementNetworkDeviceType.SWITCH:
      return $t({ defaultMessage: 'Switch' })
  }
  return ''
}

function transformDeviceOperStatus (row: EcDeviceInventory, intl: IntlShape) {
  switch (row.deviceType) {
    case EntitlementNetworkDeviceType.WIFI:
      const apStatus =
        transformApStatus(intl, row.deviceStatus as ApDeviceStatusEnum, APView.AP_LIST)
      return apStatus.message
    case EntitlementNetworkDeviceType.SWITCH:
      const switchStatus = transformSwitchStatus(intl, row.deviceStatus as SwitchStatusEnum)
      return switchStatus
  }
  return ''
}

const transformSwitchStatus = ({ $t }: IntlShape, switchStatus: SwitchStatusEnum) => {
  switch (switchStatus) {
    case SwitchStatusEnum.OPERATIONAL:
      return $t({ defaultMessage: 'Operational' })
    case SwitchStatusEnum.DISCONNECTED:
      return $t({ defaultMessage: 'Requires Attention' })
    case SwitchStatusEnum.NEVER_CONTACTED_CLOUD:
      return $t({ defaultMessage: 'Never contacted cloud' })
    case SwitchStatusEnum.INITIALIZING:
      return $t({ defaultMessage: 'Initializing' })
    case SwitchStatusEnum.APPLYING_FIRMWARE:
      return $t({ defaultMessage: 'Firmware updating' })
    case SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED:
      return $t({ defaultMessage: 'Never contacted Active Switch' })
    default:
      return $t({ defaultMessage: 'Never contacted cloud' })
  }
}

export function DeviceInventory () {
  const intl = useIntl()
  const { $t } = intl

  const columns: TableProps<EcDeviceInventory>['columns'] = [
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'apMac',
      sorter: true,
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
        return transformDeviceTypeString(row, intl)
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
        return transformDeviceOperStatus(row, intl)
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
