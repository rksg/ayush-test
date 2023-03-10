import { useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  Button,
  DisabledButton,
  Loader,
  PageHeader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  DownloadOutlined
} from '@acx-ui/icons'
import {
  ResendInviteModal
} from '@acx-ui/msp/components'
import {
  useDeactivateMspEcMutation,
  useDeleteMspEcMutation,
  useReactivateMspEcMutation,
  useMspCustomerListQuery,
  useSupportMspCustomerListQuery
} from '@acx-ui/rc/services'
import {
  DateFormatEnum,
  DelegationEntitlementRecord,
  EntitlementNetworkDeviceType,
  MspEc,
  useTableQuery
} from '@acx-ui/rc/utils'
import { getBasePath, Link, MspTenantLink, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, useUserProfileContext }                                    from '@acx-ui/user'

const getStatus = (row: MspEc) => {
  const isTrial = row.accountType === 'TRIAL'
  const value = row.status === 'Active' ? (isTrial ? 'Trial' : row.status) : 'Inactive'
  return value
}

const transformApEntitlement = (row: MspEc) => {
  return row.wifiLicenses ? row.wifiLicenses : 0
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

const transformSwitchEntitlement = (row: MspEc) => {
  return row.switchLicenses ? row.switchLicenses : 0
}

const transformCreationDate = (row: MspEc) => {
  const creationDate = row.creationDate
  if (!creationDate || isNaN(creationDate)) {
    return ''
  }
  const Epoch = creationDate - (creationDate % 1000)
  const activeDate = moment(Epoch).format(DateFormatEnum.UserDateFormat)
  return activeDate
}

const transformExpirationDate = (row: MspEc) => {
  let expirationDate = '--'
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
  })
  return expirationDate
}

export function MspCustomers () {
  const { $t } = useIntl()
  const edgeEnabled = useIsSplitOn(Features.EDGES)

  const [modalVisible, setModalVisible] = useState(false)
  const [ecTenantId, setTenantId] = useState('')

  const { data: userProfile } = useUserProfileContext()

  const mspPayload = {
    searchString: '',
    filters: { tenantType: ['MSP_EC'] },
    fields: [
      'check-all',
      'id',
      'name',
      'tenantType',
      'status',
      'alarmCount',
      'mspAdminCount',
      'mspEcAdminCount',
      'creationDate',
      'expirationDate',
      'wifiLicense',
      'switchLicens',
      'streetAddress'
    ]
  }

  const supportPayload = {
    searchString: '',
    fields: [
      'check-all',
      'id',
      'mspName',
      'name',
      'tenantType',
      'status',
      'alarmCount',
      'mspAdminCount',
      'mspEcAdminCount',
      'creationDate',
      'expirationDate',
      'wifiLicense',
      'switchLicens',
      'streetAddress'
    ],
    searchTargetFields: ['name'],
    filters: {
      includeExpired: [false]
    }
  }

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customers' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row, _, highlightFn) {
        const to = `${getBasePath()}/t/${row.id}`
        return (
          (row.status === 'Active') ? <Link to={to}>{highlightFn(data as string)}</Link> : data
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: function (data, row) {
        return getStatus(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'streetAddress',
      key: 'streetAddress',
      sorter: true,
      show: false
    },
    {
      title: $t({ defaultMessage: 'Active Alarm' }),
      dataIndex: 'alarmCount',
      key: 'alarmCount',
      sorter: true,
      render: function () {
        return '0'
      }
    },
    {
      title: $t({ defaultMessage: 'Active Incidents' }),
      dataIndex: 'activeIncidents',
      key: 'activeIncindents',
      sorter: true,
      render: function () {
        return 0
      }
    },
    {
      title: $t({ defaultMessage: 'MSP Admins' }),
      dataIndex: 'mspAdminCount',
      key: 'mspAdminCount',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Customer Admins' }),
      dataIndex: 'mspEcAdminCount',
      key: 'mspEcAdminCount',
      sorter: true,
      show: false
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Licenses' }),
      dataIndex: 'wifiLicenses',
      key: 'wifiLicenses',
      sorter: true,
      render: function (data, row) {
        return transformApEntitlement(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi License Utilization' }),
      dataIndex: 'wifiLicensesUtilization',
      key: 'wifiLicensesUtilization',
      sorter: true,
      render: function (data, row) {
        return transformApUtilization(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Switch Licenses' }),
      dataIndex: 'switchLicens',
      key: 'switchLicens',
      sorter: true,
      render: function (data, row) {
        return transformSwitchEntitlement(row)
      }
    },
    {
      title: $t({ defaultMessage: 'SmartEdge Licenses' }),
      dataIndex: 'edgeLicenses',
      key: 'edgeLicenses',
      sorter: true,
      show: edgeEnabled,
      render: function (data, row) {
        return row?.edgeLicenses ? row?.edgeLicenses : 0
      }
    },
    {
      title: $t({ defaultMessage: 'Active From' }),
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: true,
      render: function (data, row) {
        return transformCreationDate(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Service Expires On' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: true,
      render: function (data, row) {
        return transformExpirationDate(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Tenant Id' }),
      dataIndex: 'id',
      key: 'id',
      show: false,
      sorter: true
    }
  ]

  const MspEcTable = () => {
    const navigate = useNavigate()
    const basePath = useTenantLink('/dashboard/mspcustomers/edit', 'v')
    const tableQuery = useTableQuery({
      useQuery: useMspCustomerListQuery,
      defaultPayload: mspPayload
    })
    const [
      deleteMspEc,
      { isLoading: isDeleteEcUpdating }
    ] = useDeleteMspEcMutation()

    const [
      deactivateMspEc
    ] = useDeactivateMspEcMutation()

    const [
      reactivateMspEc
    ] = useReactivateMspEcMutation()

    const rowActions: TableProps<MspEc>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Edit' }),
        onClick: (selectedRows) => {
          setTenantId(selectedRows[0].id)
          const status = selectedRows[0].accountType === 'TRIAL' ? 'Trial' : 'Paid'
          navigate({
            ...basePath,
            pathname: `${basePath.pathname}/${status}/${selectedRows[0].id}`
          })
        }
      },
      {
        label: $t({ defaultMessage: 'Resend Invitation Email' }),
        onClick: (selectedRows) => {
          setTenantId(selectedRows[0].id)
          setModalVisible(true)
        }
      },
      {
        label: $t({ defaultMessage: 'Deactivate' }),
        visible: (selectedRows) => {
          if(selectedRows[0] &&
            (selectedRows[0].status === 'Active' && selectedRows[0].accountType !== 'TRIAL' )) {
            return true
          }
          return false
        },
        onClick: ([{ name, id }], clearSelection) => {
          const title = $t(
            { defaultMessage: 'Deactivate Customer "{formattedName}"?' },
            { formattedName: name }
          )

          showActionModal({
            type: 'confirm',
            title: title,
            content: $t({
              defaultMessage: `
                Deactivate "{formattedName}" will suspend all its services,
                are you sure you want to proceed?
              `
            }, { formattedName: name }),
            okText: $t({ defaultMessage: 'Deactivate' }),
            onOk: () => deactivateMspEc({ params: { mspEcTenantId: id } })
              .then(clearSelection)
          })
        }
      },
      {
        label: $t({ defaultMessage: 'Reactivate' }),
        visible: (selectedRows) => {
          if(selectedRows[0] &&
            (selectedRows[0].status === 'Active' || selectedRows[0].accountType === 'TRIAL')) {
            return false
          }
          return true
        },
        onClick: ([{ name, id }], clearSelection) => {
          const title = $t(
            { defaultMessage: 'Reactivate Customer "{formattedName}"?' },
            { formattedName: name }
          )

          showActionModal({
            type: 'confirm',
            title: title,
            content: $t(
              { defaultMessage: 'Reactivate this customer "{formattedName}"?' },
              { formattedName: name }
            ),
            okText: $t({ defaultMessage: 'Reactivate' }),
            onOk: () => reactivateMspEc({ params: { mspEcTenantId: id } })
              .then(clearSelection)
          })
        }
      },
      {
        label: $t({ defaultMessage: 'Delete' }),
        onClick: ([{ name, id }], clearSelection) => {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'EC' }),
              entityValue: name,
              confirmationText: $t({ defaultMessage: 'Delete' })
            },
            onOk: () => deleteMspEc({ params: { mspEcTenantId: id } })
              .then(clearSelection)
          })
        }
      }]

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteEcUpdating }]}>
        <Table
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    )
  }

  const SupportEcTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useSupportMspCustomerListQuery,
      defaultPayload: supportPayload
    })

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false }]}>
        <Table
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='id'
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'MSP Customers' })}
        extra={filterByAccess([
          <TenantLink to='/dashboard'>
            <Button>{$t({ defaultMessage: 'Manage own account' })}</Button>
          </TenantLink>,
          <MspTenantLink to='/dashboard/mspcustomers/create'>
            <Button
              hidden={userProfile?.support}
              type='primary'>{$t({ defaultMessage: 'Add Customer' })}</Button>
          </MspTenantLink>,
          <DisabledButton icon={<DownloadOutlined />} />
        ])}
      />
      {userProfile?.support && <SupportEcTable />}
      {!userProfile?.support && <MspEcTable />}
      <ResendInviteModal
        visible={modalVisible}
        setVisible={setModalVisible}
        tenantId={ecTenantId}
      />
    </>
  )
}
