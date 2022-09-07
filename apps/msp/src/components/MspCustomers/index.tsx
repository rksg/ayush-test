import { 
  Button, 
  Loader,
  PageHeader,
  showActionModal,
  showToast, 
  Table, 
  TableProps  
} from '@acx-ui/components'
import { useIntl } from 'react-intl'
import { 
  useDeleteMspEcMutation, 
  useMspCustomerListQuery 
} from '@acx-ui/rc/services'
import { 
  MspEc, 
  useTableQuery 
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { Space } from 'antd'
import moment from 'moment-timezone'

function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customers' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink to={`/networks/${row.name}/network-details/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      sorter: true
    },
    // {
    //   title: $t({ defaultMessage: 'Address' }),
    //   dataIndex: 'streetAddress',
    //   sorter: true
    // },
    {
      title: $t({ defaultMessage: 'Active Alarm' }),
      dataIndex: 'alarmCount',
      sorter: true,
      align: 'center',
      render: function (data) {
        return '0'
      }
    },
    {
      title: $t({ defaultMessage: 'Active Incindents' }),
      dataIndex: 'activeIncindents',
      sorter: true,
      align: 'center',
      render: function (data) {
        return '0'
      }
    },
    {
      title: $t({ defaultMessage: 'MSP Admins' }),
      dataIndex: 'mspAdminCount',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return (
          <TenantLink to={`/networks/${row.name}/network-details/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Customer Admins' }),
      dataIndex: 'mspEcAdminCount',
      sorter: true,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Licenses' }),
      dataIndex: 'wifiLicenses',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return transformApEntitlement(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi License Utilization' }),
      dataIndex: 'wifiLicensesUtilization',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return transformApUtilization(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Switch Licenses' }),
      dataIndex: 'switchLicens',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return transformSwitchEntitlement(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Active From' }),
      dataIndex: 'creationDate',
      sorter: true,
      render: function (data, row) {
        return transformCreationDate(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Service Expired On' }),
      dataIndex: 'expirationDate',
      sorter: true,
      render: function (data, row) {
        return transformExpirationDate(row)
      }
    }
  ]
  return columns
}

const transformApEntitlement = (row: any) => {
  return row.wifiLicenses ? row.wifiLicenses : 0;
}

const transformApUtilization = (row: any) => {
  // const entitlements = row.entitlements;
  const entitlement = row.entitlements.filter((en:any) => en.entitlementDeviceType === 'DVCNWTYPE_WIFI');
  if (entitlement.length > 0) {
    const apEntitlement = entitlement[0];
    const quantity = apEntitlement.quantity;
    if (quantity > 0) {
      const value = (Math.round(((parseInt(apEntitlement.consumed, 10) / parseInt(apEntitlement.quantity, 10)) * 10000)) / 100) + '%';
      return value;
    } else {
      return '0%';
    }
  }
  return '0%';
}

const transformSwitchEntitlement = (row: any) => {
  const entitlements = row.entitlements;
  let totalCount = 0;
  const switchEntitlements: any[] = [];
  entitlements.forEach((entitlement:any) => {
    if (entitlement.entitlementDeviceType !== 'DVCNWTYPE_SWITCH') {
      return;
    }
    switchEntitlements.push(entitlement);
  });
  totalCount = switchEntitlements.reduce((total, current) => total + parseInt(current.quantity, 10), 0)
  return totalCount;
}

const transformCreationDate = (row: any) => {
  const creationDate = row.creationDate;
  if (!creationDate || isNaN(creationDate)) {
    return '';
  }
  const Epoch = creationDate - (creationDate % 1000);
  const activeDate = moment(Epoch).format('MMM DD YYYY');
  return activeDate;
}

const transformExpirationDate = (row: any) => {
  let expirationDate = '';
  const entitlements = row.entitlements;
  let targetRecord:any = null;
  entitlements.forEach((entitlement:any) => {
    targetRecord = entitlement;
    const consumed = parseInt(entitlement.quantity, 10);
    const quantity = parseInt(entitlement.quantity, 10);
    if (consumed > 0 || quantity > 0) {
      if (!targetRecord || moment(entitlement.expirationDate).isBefore(targetRecord.expirationDate)) {
        targetRecord = entitlement;
      }
    }
  });
  if (targetRecord) {
    expirationDate = moment(targetRecord.expirationDate).format('MMM DD YYYY');
  }
  return expirationDate;
}

const defaultPayload = {
  searchString: '',
  filters: {tenantType: ["MSP_EC"]},
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

  const MspEcTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useMspCustomerListQuery,
      defaultPayload
    })
    const { tenantId } = useParams()
    const [
      deleteMspEc,
      { isLoading: isDeleteEcUpdating }
    ] = useDeleteMspEcMutation()

    const actions: TableProps<MspEc>['actions'] = [
      {
        label: 'Manage',
        onClick: (selectedRows) =>
         showToast({
          type: 'info',
          content: `Manage ${selectedRows[0].name}`
        })
      },
      {
        label: 'Resend Invitation Email',
        onClick: (selectedRows) => alert()
      },
      {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ name, id }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'EC' }),
            entityValue: name
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
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          actions={actions}
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
            <Space size={8}>
              <TenantLink to='' key='ownAccount'>
                <Button>Manage own account</Button>
              </TenantLink>
              <TenantLink to='/mspcustomers/create' key='addMspEc'>
                <Button type='primary'>Add Customer</Button>
              </TenantLink>
            </Space>
        ]}
      />
      <MspEcTable />
    </>
  )
}
