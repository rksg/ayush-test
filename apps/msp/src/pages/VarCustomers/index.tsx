import { useContext, useEffect, useState } from 'react'

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
  MspRbacUrlsInfo,
  MSPUtils,
  VarCustomer
} from '@acx-ui/msp/utils'
import {
  EntitlementNetworkDeviceType,
  EntitlementUtil,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Link, TenantLink, useParams }                 from '@acx-ui/react-router-dom'
import { RolesEnum }                                   from '@acx-ui/types'
import { hasAllowedOperations, useUserProfileContext } from '@acx-ui/user'
import { getOpsApi, isDelegationMode, noDataDisplay }  from '@acx-ui/utils'

import HspContext from '../../HspContext'

const transformNextExpirationDate = (row: VarCustomer) => {
  let expirationDate = ''
  let toBeRemoved = ''
  const apswEntitlement = row.entitlements?.filter((en:DelegationEntitlementRecord) =>
    en.entitlementDeviceType === EntitlementNetworkDeviceType.APSW)

  if (apswEntitlement) {
    // const entitlements = row.entitlements
    let target: DelegationEntitlementRecord
    apswEntitlement.forEach((entitlement:DelegationEntitlementRecord) => {
      target = entitlement
      const consumed = parseInt(entitlement.consumed, 10)
      const quantity = parseInt(entitlement.quantity, 10)
      if (consumed > 0 || quantity > 0) {
        if (!target || moment(entitlement.expirationDate).isBefore(target.expirationDate)) {
          target = entitlement
        }
      }
      expirationDate = formatter(DateFormatEnum.DateFormat)(target.expirationDate)
      toBeRemoved = target.toBeRemovedQuantity > 0
        ? EntitlementUtil.getNetworkDeviceTypeUnitText(target.entitlementDeviceType,
          target.toBeRemovedQuantity) : ''
    })
  }

  return toBeRemoved === '' ? `${expirationDate}`: `${expirationDate} (${toBeRemoved})`
}

export function VarCustomers () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const isSupportToMspDashboardAllowed =
    useIsSplitOn(Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE) && isDelegationMode()
  const isRbacPhase3ToggleEnabled = useIsSplitOn(Features.RBAC_PHASE3_TOGGLE)
  const mspUtils = MSPUtils()
  const {
    state
  } = useContext(HspContext)
  const { isHsp: isHspSupportEnabled } = state

  const isViewmodleAPIsMigrateEnabled = useIsSplitOn(Features.VIEWMODEL_APIS_MIGRATE_MSP_TOGGLE)

  const { data: userProfile } = useUserProfileContext()
  const adminRoles = [RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]
  // special handle here, only system administratot/prime admin can do VAR delegation ACX-68291
  // backend will fix this later
  const isAdmin = isRbacPhase3ToggleEnabled
    ? hasAllowedOperations([
      getOpsApi(MspRbacUrlsInfo.acceptRejectInvitation)])
    : userProfile?.roles?.some(role => adminRoles.includes(role as RolesEnum))

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
      const settingsId = 'var-invitation-table'
      const tableQuery = useTableQuery({
        useQuery: useInviteCustomerListQuery,
        defaultPayload: invitationPayload,
        pagination: { settingsId },
        enableRbac: isViewmodleAPIsMigrateEnabled
      })
      useEffect(() => {
        setInviteCount(tableQuery.data?.totalCount as number)
      })

      return (
        <Loader states={[tableQuery]}>
          <Table
            settingsId={settingsId}
            columns={columnsPendingInvitation}
            dataSource={tableQuery.data?.data}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
            rowKey='id'
          />
        </Loader>
      )
    }

    return <div style={{ marginBottom: '50px' }}>
      <Subtitle level={3}>
        {$t({ defaultMessage: 'Pending Invitations' })} ({inviteCount})</Subtitle>

      <PendingInvitation />
    </div>

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
        return (!isSupportToMspDashboardAllowed && isAdmin) ? {
          onClick: () => { delegateToMspEcPath(data.tenantId) }
        } : {}
      },
      render: function (_, { tenantName }, __, highlightFn) {
        return (
          (!isSupportToMspDashboardAllowed && isAdmin)
            ? <Link to=''>{highlightFn(tenantName)}</Link> : tenantName
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
    {
      title: $t({ defaultMessage: 'Alarm Count' }),
      dataIndex: 'alarmCount',
      align: 'center',
      key: 'alarmCount',
      show: false,
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Installed Devices' }),
      dataIndex: 'apswLicenseInstalled',
      align: 'center',
      key: 'apswLicenseInstalled',
      sorter: true,
      render: function (data: React.ReactNode, row: VarCustomer) {
        return mspUtils.transformInstalledDevice(row.entitlements)
      }
    },
    {
      title: $t({ defaultMessage: 'Devices Subscriptions' }),
      dataIndex: 'apswLicense',
      align: 'center',
      key: 'apswLicense',
      sorter: true,
      render: function (data: React.ReactNode, row: VarCustomer) {
        return mspUtils.transformDeviceEntitlement(row.entitlements)
      }
    },
    {
      title: $t({ defaultMessage: 'Device Subscriptions Utilization' }),
      dataIndex: 'apswLicensesUtilization',
      align: 'center',
      key: 'apswLicensesUtilization',
      sorter: true,
      render: function (data: React.ReactNode, row: VarCustomer) {
        return mspUtils.transformDeviceUtilization(row.entitlements)
      }
    },
    {
      title: $t({ defaultMessage: 'Next Subscription Expiration' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: true,
      render: function (_, row) {
        return row.entitlements ? transformNextExpirationDate(row) : noDataDisplay
      }
    }
  ]

  const delegationType = userProfile?.support && !isSupportToMspDashboardAllowed
    ? ['DELEGATION_TYPE_SUPPORT'] : ['DELEGATION_TYPE_VAR']
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
    const settingsId = 'var-customers-table'
    const tableQuery = useTableQuery({
      useQuery: useVarCustomerListQuery,
      defaultPayload: varCustomerPayload,
      sorter: {
        sortField: 'tenantName',
        sortOrder: 'ASC'
      },
      search: {
        searchTargetFields: varCustomerPayload.searchTargetFields as string[]
      },
      pagination: { settingsId },
      enableRbac: isViewmodleAPIsMigrateEnabled
    })

    return (
      <Loader states={[tableQuery]}>
        <Table
          settingsId={settingsId}
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
        extra={!isHspSupportEnabled &&
          <TenantLink to='/dashboard' key='add'>
            <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
          </TenantLink>
        }
      />
      <div>
        {!userProfile?.support && isAdmin && <InvitationList />}
        <VarCustomerTable />
      </div>
    </>
  )
}
