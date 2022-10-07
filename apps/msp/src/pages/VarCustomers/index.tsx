import { useState } from 'react'

// import { Divider }   from 'antd'
import { SortOrder } from 'antd/lib/table/interface'
import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'

import {
  Button,
  cssStr,
  deviceStatusColors,
  Loader,
  PageHeader,
  StackedBarChart,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  DownloadOutlined
} from '@acx-ui/icons'
import {
  useVarCustomerListQuery
} from '@acx-ui/rc/services'
import {
  DateFormatEnum,
  DelegationEntitlementRecord,
  EntitlementNetworkDeviceType,
  EntitlementUtil,
  VarCustomer,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

// import { InvitationList } from './invitationList'

function useCustomerColumns () {
  const { $t } = useIntl()

  const columns: TableProps<VarCustomer>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customer' }),
      dataIndex: 'tenantName',
      key: 'tenantName',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend' as SortOrder,
      render: function (data) {
        return (
          <TenantLink to={''}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Account Email' }),
      dataIndex: 'tenantEmail',
      key: 'tenantEmail',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Active Alarms' }),
      dataIndex: 'alarmCount',
      key: 'alarmCount',
      sorter: true,
      align: 'center',
      render: function (data) {
        return (
          <TenantLink to={''}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Active Incidents' }),
      dataIndex: 'activeIncindents',
      key: 'activeIncindents',
      sorter: true,
      render: function () {
        return <StackedBarChart
          style={{ height: 10, width: 100 }}
          data={[{
            category: 'emptyStatus',
            series: [{
              name: '',
              value: 1
            }]
          }]}
          showTooltip={false}
          showLabels={false}
          showTotal={false}
          barColors={[cssStr(deviceStatusColors.empty)]}
        />
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Licenses' }),
      dataIndex: 'wifiLicenses',
      key: 'wifiLicenses',
      sorter: true,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Licenses Utilization' }),
      dataIndex: 'wifiLicensesUtilization',
      key: 'wifiLicensesUtilization',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return transformApUtilization(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Switch Licenses' }),
      dataIndex: 'switchLicenses',
      key: 'switchLicenses',
      sorter: true,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Next License Expiration' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return transformNextExpirationDate(row)
      }
    }
  ]
  return columns
}

const transformApUtilization = (row: VarCustomer) => {
  const entitlement = row.entitlements.filter((en:DelegationEntitlementRecord) =>
    en.entitlementDeviceType === EntitlementNetworkDeviceType.WIFI)
  if (entitlement.length > 0) {
    const apEntitlement = entitlement[0]
    const quantity = parseInt(apEntitlement.quantity, 10)
    const consumed = parseInt(apEntitlement.consumed, 10)
    if (quantity > 0) {
      const value =
      (Math.round(((consumed / quantity) * 10000)) / 100) + '%'
      return value
    } else {
      return '0%'
    }
  }
  return '0%'
}

const transformNextExpirationDate = (row: VarCustomer) => {
  let expirationDate = '--'
  let toBeRemoved = ''
  const entitlements = row.entitlements
  let target: DelegationEntitlementRecord
  entitlements.forEach((entitlement:DelegationEntitlementRecord) => {
    target = entitlement
    const consumed = parseInt(entitlement.quantity, 10)
    const quantity = parseInt(entitlement.quantity, 10)
    if (consumed > 0 || quantity > 0) {
      if (!target || moment(entitlement.expirationDate).isBefore(target.expirationDate)) {
        target = entitlement
      }
    }
    expirationDate = moment(target.expirationDate).format(DateFormatEnum.UserDateFormat)
    toBeRemoved = EntitlementUtil.getNetworkDeviceTypeUnitText(target.entitlementDeviceType,
      parseInt(target.toBeRemovedQuantity, 10))
  })

  return `${expirationDate} (${toBeRemoved})`
}

export function VarCustomers () {
  const { $t } = useIntl()
  const [ search, setSearch ] = useState('')

  const varCustomerPayload = {
    searchString: search,
    fields: [
      'tenantName',
      'tenantEmail',
      'alarmCount',
      'priorityIncidents',
      'apEntitlement.quantity',
      'apEntitlement',
      'switchEntitlement',
      'nextExpirationLicense',
      'id'],
    searchTargetFields: ['tenantName', 'tenantEmail'],
    filters: {
      status: ['DELEGATION_STATUS_ACCEPTED'],
      delegationType: ['DELEGATION_TYPE_VAR'],
      isValid: [true]
    }
  }

  const VarCustomerTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useVarCustomerListQuery,
      defaultPayload: varCustomerPayload
    })

    return (
      <Loader states={[tableQuery]}>
        <div style={{ display: 'flex', direction: 'ltr', width: '400px', float: 'left' }}>
          <Button style={{ position: 'absolute', right: 0 }}
            key='download'
            icon={<DownloadOutlined />} />
        </div><hr/>
        <Table
          columns={useCustomerColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'VAR Customers' })}
        extra={[
          <TenantLink to='/dashboard' key='add'>
            <Button>{$t({ defaultMessage: 'Manage own account' })}</Button>
          </TenantLink>
        ]}
      />

      {/* <InvitationList />
      <Divider/> */}

      <VarCustomerTable />
    </>
  )
}
