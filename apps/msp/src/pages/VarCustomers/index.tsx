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
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  useInviteCustomerListQuery,
  useVarCustomerListQuery,
  useAcceptRejectInvitationMutation,
  useDelegateToMspEcPath
} from '@acx-ui/msp/services'
import {
  DelegationEntitlementRecord,
  VarCustomer
} from '@acx-ui/msp/utils'
import {
  EntitlementNetworkDeviceType,
  EntitlementUtil,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Link, TenantLink, useParams }     from '@acx-ui/react-router-dom'
import { RolesEnum }                       from '@acx-ui/types'
import { hasRoles, useUserProfileContext } from '@acx-ui/user'

const transformApUtilization = (row: VarCustomer, deviceType: EntitlementNetworkDeviceType ) => {
  if (row.entitlements) {
    const entitlement = row.entitlements.filter((en:DelegationEntitlementRecord) =>
      en.entitlementDeviceType === deviceType)
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
  const isDeviceAgnosticEnabled = useIsSplitOn(Features.DEVICE_AGNOSTIC)

  const { data: userProfile } = useUserProfileContext()
  const [ handleInvitation
  ] = useAcceptRejectInvitationMutation()
  const { delegateToMspEcPath } = useDelegateToMspEcPath()

  const InvitationList = () => {
    const [inviteCount, setInviteCount] = useState(0)

    const onAcceptInvite = (row: VarCustomer) => {
      return <>
        <Button onClick={() => handleAccept(row)}
          type='primary'
        >{$t({ defaultMessage: 'Accept' })}</Button>
        <Button onClick={() => handleReject(row)}
          style={{ marginLeft: 10 }}>{$t({ defaultMessage: 'Reject' })}</Button>
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
        defaultSortOrder: 'ascend' as SortOrder
      },
      {
        title: $t({ defaultMessage: 'Account Email' }),
        dataIndex: 'tenantEmail',
        key: 'tenantEmail',
        sorter: true
      },
      {
        title: $t({ defaultMessage: 'Accept Invitation' }),
        dataIndex: 'acceptInvite',
        key: 'acceptInvite',
        width: 220,
        render: function (_, row) {
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
            settingsId='var-invitation-table'
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
      onCell: (data) => {
        return {
          onClick: () => { delegateToMspEcPath(data.tenantId) }
        }
      },
      render: function (_, { tenantName }, __, highlightFn) {
        return (
          <Link to=''>{highlightFn(tenantName)}</Link>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Account Email' }),
      dataIndex: 'tenantEmail',
      key: 'tenantEmail',
      searchable: true,
      sorter: true
    },
    ...(isDeviceAgnosticEnabled ? [
      {
        title: $t({ defaultMessage: 'Installed Devices' }),
        dataIndex: 'apswLicense',
        key: 'apswLicense',
        sorter: true,
        render: function (data: React.ReactNode, row: VarCustomer) {
          return row.apswLicenses || 0
        }
      },
      {
        title: $t({ defaultMessage: 'Device Subscriptions Utilization' }),
        dataIndex: 'apswLicensesUtilization',
        key: 'apswLicensesUtilization',
        sorter: true,
        render: function (data: React.ReactNode, row: VarCustomer) {
          return transformApUtilization(row, EntitlementNetworkDeviceType.APSW)
        }
      }
    ] : [

      {
        title: $t({ defaultMessage: 'Wi-Fi Licenses' }),
        dataIndex: 'apEntitlement.quantity',
        // align: 'center',
        key: 'apEntitlement.quantity',
        sorter: true,
        render: function (data: React.ReactNode, row: VarCustomer) {
          return row.wifiLicenses ? row.wifiLicenses : 0
        }
      },
      {
        title: $t({ defaultMessage: 'Wi-Fi Licenses Utilization' }),
        dataIndex: 'wifiLicensesUtilization',
        // align: 'center',
        key: 'wifiLicensesUtilization',
        sorter: true,
        render: function (data: React.ReactNode, row: VarCustomer) {
          return transformApUtilization(row, EntitlementNetworkDeviceType.WIFI)
        }
      },
      {
        title: $t({ defaultMessage: 'Switch Licenses' }),
        dataIndex: 'switchEntitlement',
        // align: 'center',
        key: 'switchEntitlement',
        sorter: true,
        render: function (data: React.ReactNode, row: VarCustomer) {
          return row.switchLicenses ? row.switchLicenses : 0
        }
      }]),
    {
      title: $t({ defaultMessage: 'Next Subscription Expiration' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: true,
      render: function (_, row) {
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
      sorter: {
        sortField: 'tenantName',
        sortOrder: 'ASC'
      },
      search: {
        searchTargetFields: varCustomerPayload.searchTargetFields as string[]
      }
    })

    return (
      <Loader states={[tableQuery]}>
        <Table
          settingsId='var-customers-table'
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

  const title = userProfile?.support || userProfile?.dogfood
    ? $t({ defaultMessage: 'RUCKUS Customers' }) : $t({ defaultMessage: 'VAR Customers' })
  return (
    <>
      <PageHeader
        title={title}
        breadcrumb={[{ text: $t({ defaultMessage: 'My Customers' }) }]}
        extra={
          <TenantLink to='/dashboard' key='add'>
            <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
          </TenantLink>
        }
      />

      {!userProfile?.support && isAdmin && <InvitationList />}
      <VarCustomerTable />
    </>
  )
}
