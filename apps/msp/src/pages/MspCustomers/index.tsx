import { useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  showActionModal,
  showToast,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  DownloadOutlined
} from '@acx-ui/icons'
import {
  useDeleteMspEcMutation,
  useMspCustomerListQuery
} from '@acx-ui/rc/services'
import {
  DateFormatEnum,
  DelegationEntitlementRecord,
  EntitlementNetworkDeviceType,
  MspEc,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { ResendInviteModal } from '../../components/ResendInviteModal'

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
  const entitlements = row.entitlements
  let totalCount = 0
  const switchEntitlements: DelegationEntitlementRecord[] = []
  entitlements.forEach((entitlement:DelegationEntitlementRecord) => {
    if (entitlement.entitlementDeviceType !== EntitlementNetworkDeviceType.SWITCH) {
      return
    }
    switchEntitlements.push(entitlement)
  })
  totalCount = switchEntitlements.reduce((total, current) =>
    total + parseInt(current.quantity, 10), 0)
  return totalCount
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

const defaultPayload = {
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

export function MspCustomers () {
  const { $t } = useIntl()

  const [modalVisible, setModalVisible] = useState(false)
  const [tenantId, setTenantId] = useState('')

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customers' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data) {
        return (
          <TenantLink to={''}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      sorter: true
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
      align: 'center',
      render: function () {
        return '0'
      }
    },
    {
      title: $t({ defaultMessage: 'Active Incindents' }),
      dataIndex: 'activeIncindents',
      key: 'activeIncindents',
      sorter: true,
      align: 'center',
      render: function () {
        return 0
      }
    },
    {
      title: $t({ defaultMessage: 'MSP Admins' }),
      dataIndex: 'mspAdminCount',
      key: 'mspAdminCount',
      sorter: true,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Customer Admins' }),
      dataIndex: 'mspEcAdminCount',
      key: 'mspEcAdminCount',
      sorter: true,
      show: false,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Licenses' }),
      dataIndex: 'wifiLicenses',
      key: 'wifiLicenses',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return transformApEntitlement(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi License Utilization' }),
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
      dataIndex: 'switchLicens',
      key: 'switchLicens',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return transformSwitchEntitlement(row)
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
      title: $t({ defaultMessage: 'Service Expired On' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: true,
      render: function (data, row) {
        return transformExpirationDate(row)
      }
    }
  ]

  const MspEcTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useMspCustomerListQuery,
      defaultPayload
    })
    const [
      deleteMspEc,
      { isLoading: isDeleteEcUpdating }
    ] = useDeleteMspEcMutation()

    const rowActions: TableProps<MspEc>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Manage' }),
        onClick: (selectedRows) =>
          showToast({
            type: 'info',
            content: `Manage ${selectedRows[0].name}`
          })
      },
      {
        label: $t({ defaultMessage: 'Resend Invitation Email' }),
        onClick: (selectedRows) => {
          setTenantId(selectedRows[0].id)
          setModalVisible(true)
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
          rowKey='id'
          rowActions={rowActions}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'MSP Customers' })}
        extra={[
          <TenantLink to='/dashboard' key='ownAccount'>
            <Button>{$t({ defaultMessage: 'Manage own account' })}</Button>
          </TenantLink>,
          <TenantLink to='/dashboard/mspcustomers/create' tenantType='v' key='addMspEc'>
            <Button type='primary'>{$t({ defaultMessage: 'Add Customer' })}</Button>
          </TenantLink>,
          <Button key='download' icon={<DownloadOutlined />} />
        ]}
      />
      <MspEcTable />
      <ResendInviteModal
        visible={modalVisible}
        setVisible={setModalVisible}
        tenantId={tenantId}
      />
    </>
  )
}
