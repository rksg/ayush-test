import { useEffect, useState } from 'react'

import { SortOrder } from 'antd/lib/table/interface'
import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  showActionModal,
  Subtitle,
  Table,
  TableProps
} from '@acx-ui/components'
import { DateFormatEnum, formatter }  from '@acx-ui/formatter'
import {
  useInviteCustomerListQuery,
  useVarCustomerListQuery,
  useAcceptRejectInvitationMutation
} from '@acx-ui/rc/services'
import {
  DelegationEntitlementRecord,
  EntitlementNetworkDeviceType,
  EntitlementUtil,
  VarCustomer,
  useTableQuery
} from '@acx-ui/rc/utils'
import { getBasePath, Link, TenantLink, useParams } from '@acx-ui/react-router-dom'
import { RolesEnum }                                from '@acx-ui/types'
import { hasRoles, useUserProfileContext }          from '@acx-ui/user'

const transformApUtilization = (row: VarCustomer) => {
  if (row.entitlements) {
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
  }
  return '0%'
}

const transformNextExpirationDate = (row: VarCustomer) => {
  let expirationDate = '--'
  let toBeRemoved = ''
  if (row.entitlements) {
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
      expirationDate = formatter(DateFormatEnum.DateFormat)(target.expirationDate)
      toBeRemoved = EntitlementUtil.getNetworkDeviceTypeUnitText(target.entitlementDeviceType,
        parseInt(target.toBeRemovedQuantity, 10))
    })
  }

  return `${expirationDate} (${toBeRemoved})`
}

export function VarCustomers () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const { data: userProfile } = useUserProfileContext()
  const [ handleInvitation
  ] = useAcceptRejectInvitationMutation()

  const InvitationList = () => {
    const [inviteCount, setInviteCount] = useState(0)

    const onAcceptInvite = (row: VarCustomer) => {
      return <>
        <Button onClick={() => handleReject(row)}>{$t({ defaultMessage: 'Reject' })}</Button>
        <Button onClick={() => handleAccept(row)}
          type='secondary'
          style={{ marginLeft: 10 }}>{$t({ defaultMessage: 'Accept' })}</Button>
      </>
    }

    const handleReject = (row: VarCustomer) => {
      showActionModal({
        type: 'confirm',
        title: $t({ defaultMessage: 'Reject Request?' }),
        content: $t({ defaultMessage: 'Are you sure you want to reject this delegation request?' }),
        okText: $t({ defaultMessage: 'Yes' }),
        cancelText: $t({ defaultMessage: 'No' }),
        onOk: () => {
          const payload = {
            accept: false,
            fromTenantId: row.tenantId
          }
          handleInvitation({ payload, params: { tenantId, delegationId: row.id } })
            .then(() => {
            })
        }
      })
    }

    const handleAccept = (row: VarCustomer) => {
      const payload = {
        accept: true,
        fromTenantId: row.tenantId
      }
      handleInvitation({ payload, params: { tenantId, delegationId: row.id } })
        .then(() => {
        })
    }

    const columnsPendingInvitation: TableProps<VarCustomer>['columns'] = [
      {
        title: $t({ defaultMessage: 'Account Name' }),
        dataIndex: 'tenantName',
        key: 'tenantName',
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
        dataIndex: 'acceptInvite',
        key: 'acceptInvite',
        width: 220,
        render: function (data, row) {
          return onAcceptInvite(row)
        }
      }
    ]

    const invitationPayload = {
      searchString: '',
      fields: ['tenantName', 'tenantEmail'],
      filters: {
        status: ['DELEGATION_STATUS_INVITED'],
        delegationType: ['DELEGATION_TYPE_VAR'],
        isValid: [true]
      }
    }

    const PendingInvitation = () => {
      const tableQuery = useTableQuery({
        useQuery: useInviteCustomerListQuery,
        defaultPayload: invitationPayload
      })
      useEffect(() => {
        setInviteCount(tableQuery.data?.totalCount as number)
      })

      return (
        <Loader states={[tableQuery]}>
          <Table
            columns={columnsPendingInvitation}
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
        <Subtitle level={3}>
          {$t({ defaultMessage: 'Pending Invitations' })} ({inviteCount})</Subtitle>

        <PendingInvitation />
      </>
    )
  }

  const customerColumns: TableProps<VarCustomer>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customer' }),
      dataIndex: 'tenantName',
      key: 'tenantName',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend' as SortOrder,
      render: function (data, row, _, highlightFn) {
        const to = `${getBasePath()}/t/${row.tenantId}`
        return (
          <Link to={to}>{highlightFn(data as string)}</Link>
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
        return 0
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Licenses' }),
      dataIndex: 'wifiLicenses',
      key: 'wifiLicenses',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Licenses Utilization' }),
      dataIndex: 'wifiLicensesUtilization',
      key: 'wifiLicensesUtilization',
      sorter: true,
      render: function (data, row) {
        return transformApUtilization(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Switch Licenses' }),
      dataIndex: 'switchLicenses',
      key: 'switchLicenses',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Next License Expiration' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: true,
      render: function (data, row) {
        return transformNextExpirationDate(row)
      }
    }
  ]

  const delegationType =
    userProfile?.support ? ['DELEGATION_TYPE_SUPPORT'] : ['DELEGATION_TYPE_VAR']
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
      delegationType: delegationType,
      isValid: [true]
    }
  }

  const VarCustomerTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useVarCustomerListQuery,
      defaultPayload: varCustomerPayload,
      search: {
        searchTargetFields: varCustomerPayload.searchTargetFields as string[]
      }
    })

    return (
      <Loader states={[tableQuery]}>
        <Table
          columns={customerColumns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='id'
        />
      </Loader>
    )
  }

  const title = userProfile?.support
    ? $t({ defaultMessage: 'RUCKUS Customers' }) : $t({ defaultMessage: 'VAR Customers' })
  return (
    <>
      <PageHeader
        title={title}
        extra={
          <TenantLink to='/dashboard' key='add'>
            <Button>{$t({ defaultMessage: 'Manage own account' })}</Button>
          </TenantLink>
        }
      />

      {!userProfile?.support && isAdmin && <InvitationList />}
      <VarCustomerTable />
    </>
  )
}
