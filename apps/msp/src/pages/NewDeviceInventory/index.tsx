import { useContext } from 'react'

import { SortOrder }                         from 'antd/lib/table/interface'
import { defineMessage, IntlShape, useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useCustomerNamesFilterListQuery,
  useDeviceInventoryListQuery,
  useDeviceModelFilterListQuery,
  useExportDeviceInventoryMutation,
  useVenueNamesFilterListQuery
} from '@acx-ui/msp/services'
import {
  EcDeviceInventory
} from '@acx-ui/msp/utils'
import {
  useGetTenantDetailsQuery
} from '@acx-ui/rc/services'
import {
  APView,
  ApDeviceStatusEnum,
  transformApStatus,
  EntitlementNetworkDeviceType,
  SwitchStatusEnum,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams }             from '@acx-ui/react-router-dom'
import { AccountType, exportMessageMapping } from '@acx-ui/utils'

import HspContext from '../../HspContext'

export const deviceTypeMapping = {
  DVCNWTYPE_WIFI: defineMessage({ defaultMessage: 'Access Point' }),
  DVCNWTYPE_SWITCH: defineMessage({ defaultMessage: 'Switch' }),
  APSW: defineMessage({ defaultMessage: 'Device' })
}

const transformDeviceTypeString = (row: EcDeviceInventory, { $t }: IntlShape) => {
  switch (row.deviceType) {
    case EntitlementNetworkDeviceType.WIFI:
      return $t({ defaultMessage: 'Access Point' })
    case EntitlementNetworkDeviceType.SWITCH:
      return $t({ defaultMessage: 'Switch' })
  }
  return ''
}

const transformMacaddressString = (row: EcDeviceInventory) => {
  return row.apMac ? row.apMac : (row.switchMac ? row.switchMac : '')
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
    'deviceStatus' ],
  searchTargetFields: ['apMac', 'switchMac', 'serialNumber'],
  filters: {}
}

export function NewDeviceInventory () {
  const intl = useIntl()
  const { $t } = intl
  const { tenantId } = useParams()

  const {
    state
  } = useContext(HspContext)
  const { isHsp: isHspSupportEnabled } = state

  const [ downloadCsv ] = useExportDeviceInventoryMutation()
  const tenantDetailsData = useGetTenantDetailsQuery({ params: { tenantId } })
  const isIntegrator =
    (tenantDetailsData.data?.tenantType === AccountType.MSP_INSTALLER ||
     tenantDetailsData.data?.tenantType === AccountType.MSP_INTEGRATOR)
  const parentTenantId = tenantDetailsData.data?.mspEc?.parentMspId

  if (isIntegrator) {
    defaultPayload.filters = {
      id: [ tenantId ]
    }
  }

  const settingsId = 'device-inventory-table'
  const tableQuery = useTableQuery({
    useQuery: useDeviceInventoryListQuery,
    apiParams: { tenantId: isIntegrator ? (parentTenantId as string) : (tenantId as string) },
    defaultPayload,
    search: {
      searchTargetFields: defaultPayload.searchTargetFields as string[]
    },
    pagination: { settingsId }
  })

  const filterQueryParams = {
    params: { tenantId: isIntegrator ? (parentTenantId as string) : (tenantId as string) },
    payload: isIntegrator ? { filters: {
      id: [ tenantId ]
    } } : {} }

  const { data: customerNameList } = useCustomerNamesFilterListQuery(filterQueryParams)
  const { data: venueNameList } = useVenueNamesFilterListQuery(filterQueryParams)
  const { data: deviceModelList } = useDeviceModelFilterListQuery(filterQueryParams)

  const ExportInventory = () => {
    const csvPayload = { ...defaultPayload, pageSize: 10000 }
    downloadCsv({
      params: { tenantId: isIntegrator ? (parentTenantId as string) : (tenantId as string) },
      payload: csvPayload })
  }

  const columns: TableProps<EcDeviceInventory>['columns'] = [
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'apMac',
      sorter: true,
      key: 'apMac',
      defaultSortOrder: 'ascend' as SortOrder,
      render: function (_, row) {
        return transformMacaddressString(row)
      }
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
      filterable: Object.entries(deviceTypeMapping)
        .map(([key, value])=>({ key, value: $t(value) })),
      key: 'deviceType',
      render: function (_, row) {
        return transformDeviceTypeString(row, intl)
      }
    },
    {
      title: $t({ defaultMessage: 'Device Model' }),
      dataIndex: 'model',
      sorter: true,
      filterable: (deviceModelList?.data || [])?.map(inv => ({ key: inv, value: inv })),
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
      filterable: (customerNameList?.data || [])?.map(inv => ({ key: inv, value: inv })),
      key: 'customerName'
    },
    {
      title: $t({ defaultMessage: 'Operational Status' }),
      dataIndex: 'deviceStatus',
      sorter: true,
      key: 'deviceStatus',
      render: function (_, row) {
        return transformDeviceOperStatus(row, intl)
      }
    },
    {
      title: $t({ defaultMessage: "Customer's <VenueSingular></VenueSingular>" }),
      dataIndex: 'venueName',
      sorter: true,
      filterable: (venueNameList?.data || [])?.map(inv => ({ key: inv, value: inv })),
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

  const actions = [
    {
      label: $t(exportMessageMapping.EXPORT_TO_CSV),
      onClick: () => ExportInventory(),
      disabled: (tableQuery.data && tableQuery.data?.totalCount === 0)
    }
  ]

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Device Inventory ({count})' },
          { count: tableQuery.data?.totalCount || 0 })}
        extra={!isHspSupportEnabled &&
          <TenantLink to='/dashboard'>
            <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
          </TenantLink>
        }
      />
      <Loader states={[tableQuery]}>
        <Table
          settingsId={settingsId}
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          actions={actions}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='serialNumber'
        />
      </Loader>
    </>
  )
}
