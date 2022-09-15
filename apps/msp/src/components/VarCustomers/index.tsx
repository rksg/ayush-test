import { SortOrder } from 'antd/lib/table/interface'
import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader } from '@acx-ui/components'
import {
  DownloadOutlined
} from '@acx-ui/icons'
import { 
  useVarCustomerListQuery 
  // useInviteCustomerListQuery 
} from '@acx-ui/rc/services'
import {
  DateFormatEnum,
  DelegationEntitlementRecord,
  EntitlementNetworkDeviceType,
  EntitlementUtil,
  MspEc, 
  useTableQuery 
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

// function useInvitaionColumns () {
//   const { $t } = useIntl()

//   const columnsPendingInvitaion: TableProps<MspEc>['columns'] = [
//     {
//       title: $t({ defaultMessage: 'Account Name' }),
//       dataIndex: 'tenantName',
//       sorter: true,
//       defaultSortOrder: 'ascend' as SortOrder,
//       render: function (data, row) {
//         return (
//           <TenantLink to={``}>{data}</TenantLink>
//         )
//       }
//     },
//     {
//       title: $t({ defaultMessage: 'Account Email' }),
//       dataIndex: 'tenantEmail',
//       sorter: true
//     }
//   ]
//   return columnsPendingInvitaion
// }

function useCustomerColumns () {
  const { $t } = useIntl()

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customer' }),
      dataIndex: 'tenantName',
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
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Active Alarms' }),
      dataIndex: 'alarmCount',
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
      sorter: true,
      align: 'center',
      render: function () {
        return '0'
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Licenses' }),
      dataIndex: 'wifiLicenses',
      sorter: true,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Licenses Utilization' }),
      dataIndex: 'wifiLicensesUtilization',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return transformApUtilization(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Switch Licenses' }),
      dataIndex: 'switchLicenses',
      sorter: true,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Next License Expiration' }),
      dataIndex: 'expirationDate',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return transformNextExpirationDate(row)
      }
    }
  ]
  return columns
}

const transformApUtilization = (row: MspEc) => {
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

const transformNextExpirationDate = (row: MspEc) => {
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

// const invitationPayload = {
//   searchString: '',
//   fields: ['tenantName', 'tenantEmail'],
//   filters: {
//     status: ['DELEGATION_STATUS_INVITED'],
//     delegationType: ['DELEGATION_TYPE_VAR'],
//     isValid: [true]
//   }
// }

const varCustomerPayload = {
  searchString: '',
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

export function VarCustomers () {
  const { $t } = useIntl()

  // const PendingInvitaion = () => {
  //   const tableQuery = useTableQuery({
  //     useQuery: useInviteCustomerListQuery,
  //     defaultPayload: invitationPayload
  //   })

  //   return (
  //     <Loader states={[tableQuery]}>
  //       <Table
  //         columns={useInvitaionColumns()}
  //         dataSource={tableQuery.data?.data}
  //         pagination={tableQuery.pagination}
  //         onChange={tableQuery.handleTableChange}
  //         rowKey='id'
  //       />
  //     </Loader>
  //   )
  // }

  const VarCustomerTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useVarCustomerListQuery,
      defaultPayload: varCustomerPayload
    })

    return (
      <Loader states={[tableQuery]}>
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

      {/* <PageHeader
        title={$t({ defaultMessage: 'Pending Invitations' })}
      />
      <PendingInvitaion /> */}
      <PageHeader
        title=''
        extra={[
          <Button key='download' icon={<DownloadOutlined />} />
        ]}
      />
      <VarCustomerTable />
    </>
  )
}
