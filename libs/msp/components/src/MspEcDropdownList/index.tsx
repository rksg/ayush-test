import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Drawer, LayoutUI, Loader, Table, TableProps } from '@acx-ui/components'
import { CaretDownSolid }                              from '@acx-ui/icons'
import { useUserProfileContext }                       from '@acx-ui/user'
import {
  useMspCustomerListDropdownQuery,
  useVarCustomerListDropdownQuery,
  useSupportCustomerListDropdownQuery,
  useGetTenantDetailQuery
}  from '@acx-ui/rc/services'
import { MspEc, TenantIdFromJwt, useTableQuery, VarCustomer } from '@acx-ui/rc/utils'
import { getBasePath, Link, useParams  }                      from '@acx-ui/react-router-dom'
import { AccountType }                                        from '@acx-ui/utils'

import * as UI from './styledComponents'

enum DelegationType {
  MSP_EC = 'MSP_EC',
  VAR_REC = 'VAR_REC',
  SUPPORT_REC = 'SUPPORT_REC',
  SUPPORT_MSP_EC = 'SUPPORT_MSP_EC',
  MSP_INTEGRATOR = 'MSP_INTEGRATOR',
}

export function MspEcDropdownList () {
  const { $t } = useIntl()

  const [customerName, setCustomerName] = useState('')
  const [searchString, setSearchString] = useState('')
  const [visible, setVisible] = useState(false)
  const [delegationType, setDelegationType] = useState('')

  const params = useParams()
  const { data: tenantDetail } = useGetTenantDetailQuery({ params })

  // user profile for tenant from jwt token
  const { data: userProfile } = useUserProfileContext()

  useEffect(()=>{
    if (tenantDetail && userProfile) {
      UpdateDelegationType(tenantDetail?.tenantType, userProfile?.support)
    }
  }, [tenantDetail, userProfile])


  function UpdateDelegationType (tenantType?: string, support?: boolean) {
    if (support === true) {
      if (tenantType === AccountType.MSP_EC)
        setDelegationType(DelegationType.SUPPORT_MSP_EC)
      else
        setDelegationType(DelegationType.SUPPORT_REC)
    } else {
      if (tenantType === AccountType.MSP_EC)
        setDelegationType(DelegationType.MSP_EC)
      else if ( tenantType === AccountType.MSP_INSTALLER ||
                tenantType === AccountType.MSP_INTEGRATOR)
        setDelegationType(DelegationType.MSP_INTEGRATOR)
      else
        setDelegationType(DelegationType.VAR_REC)
    }
  }

  const mspEcPayload = {
    searchString: '',
    filters: { tenantType: [AccountType.MSP_EC] },
    fields: [
      'id',
      'name',
      'tenantType',
      'status',
      'streetAddress'
    ]
  }

  const integratorPayload = {
    searchString: '',
    filters: { tenantType: [AccountType.MSP_INSTALLER, AccountType.MSP_INTEGRATOR] },
    fields: [
      'id',
      'name',
      'tenantType',
      'status',
      'streetAddress'
    ]
  }

  const varPayload = {
    searchString: '',
    fields: [
      'tenantName',
      'tenantEmail',
      'id'],
    searchTargetFields: ['tenantName', 'tenantEmail'],
    filters: {
      status: ['DELEGATION_STATUS_ACCEPTED'],
      delegationType: ['DELEGATION_TYPE_VAR'],
      isValid: [true]
    }
  }

  const supportPayload = {
    searchString: '',
    fields: [
      'tenantName',
      'tenantEmail',
      'id'],
    searchTargetFields: ['tenantName', 'tenantEmail'],
    filters: {
      status: ['DELEGATION_STATUS_ACCEPTED'],
      delegationType: ['DELEGATION_TYPE_SUPPORT'],
      isValid: [true]
    }
  }

  const supportEcPayload = {
    searchString: '',
    fields: [
      'id',
      'name',
      'tenantType',
      'status',
      'streetAddress'
    ],
    filters: {
      includeExpired: [false]
    }
  }

  const customerColumns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customers' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      defaultSortOrder: 'ascend',
      onCell: () => {
        return {
          onClick: () => {
            setSearchString('')
            setVisible(false)
          }
        }
      },
      render: function (data, row) {
        const to = `${getBasePath()}/t/${row.id}`
        return (
          (row.status === 'Active') ? <Link to={to}>{data}</Link> : data
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: $t({ defaultMessage: 'Tenant Id' }),
      dataIndex: 'id',
      key: 'id',
      show: false
    }
  ]

  const supportColumns: TableProps<VarCustomer>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customers' }),
      dataIndex: 'tenantName',
      key: 'tenantName',
      searchable: true,
      defaultSortOrder: 'ascend',
      onCell: () => {
        return {
          onClick: () => {
            setSearchString('')
            setVisible(false)
          }
        }
      },
      render: function (data, row) {
        const to = `${getBasePath()}/t/${row.tenantId}`
        return (
          <Link to={to}>{data}</Link>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Tenant Id' }),
      dataIndex: 'id',
      key: 'id',
      show: false
    }
  ]

  const tableQueryMspEc = useTableQuery({
    useQuery: useMspCustomerListDropdownQuery,
    apiParams: { tenantId: TenantIdFromJwt() },
    defaultPayload: mspEcPayload,
    option: { skip: delegationType !== DelegationType.MSP_EC }
  })

  const tableQueryIntegrator = useTableQuery({
    useQuery: useMspCustomerListDropdownQuery,
    apiParams: { tenantId: TenantIdFromJwt() },
    defaultPayload: integratorPayload,
    option: { skip: delegationType !== DelegationType.MSP_INTEGRATOR }
  })

  const tableQueryVarRec = useTableQuery({
    useQuery: useVarCustomerListDropdownQuery,
    apiParams: { tenantId: TenantIdFromJwt() },
    defaultPayload: varPayload,
    option: { skip: delegationType !== DelegationType.VAR_REC }
  })

  const tableQuerySupportEc = useTableQuery({
    useQuery: useSupportCustomerListDropdownQuery,
    apiParams: { tenantId: TenantIdFromJwt() },
    defaultPayload: supportEcPayload,
    option: { skip: delegationType !== DelegationType.SUPPORT_MSP_EC }
  })

  const tableQuerySupport = useTableQuery({
    useQuery: useVarCustomerListDropdownQuery,
    apiParams: { tenantId: TenantIdFromJwt() },
    defaultPayload: supportPayload,
    option: { skip: delegationType !== DelegationType.SUPPORT_REC }
  })

  useEffect(()=>{
    if (tenantDetail?.name) {
      setCustomerName(() => tenantDetail?.name)
    }

    if(tableQueryMspEc?.data && delegationType === DelegationType.MSP_EC) {
      tableQueryMspEc.setPayload({ ...tableQueryMspEc.payload, searchString: searchString })
    }
    if(tableQueryMspEc?.data && delegationType === DelegationType.MSP_INTEGRATOR) {
      tableQueryMspEc.setPayload({ ...tableQueryIntegrator.payload, searchString: searchString })
    }
    if(tableQueryVarRec?.data && delegationType === DelegationType.VAR_REC) {
      tableQueryVarRec.setPayload({ ...tableQueryVarRec.payload, searchString: searchString })
    }
    if(tableQuerySupportEc?.data && delegationType === DelegationType.SUPPORT_MSP_EC) {
      tableQuerySupportEc.setPayload({ ...tableQuerySupportEc.payload, searchString: searchString })
    }
    if(tableQuerySupport?.data && delegationType === DelegationType.SUPPORT_REC) {
      tableQuerySupport.setPayload({ ...tableQuerySupport.payload, searchString: searchString })
    }
  }, [tenantDetail?.name, searchString])

  const onClose = () => {
    setSearchString('')
    setVisible(false)
  }

  const ContentMspEc = () => {
    return <Loader states={[tableQueryMspEc]}>

      <Table
        columns={customerColumns}
        dataSource={tableQueryMspEc.data?.data}
        pagination={tableQueryMspEc.pagination}
        onChange={tableQueryMspEc.handleTableChange}
        onFilterChange={tableQueryMspEc.handleFilterChange}
        rowKey='id'
      />
    </Loader>
  }

  const ContentIntergrator = () => {
    return <Loader states={[tableQueryIntegrator]}>

      <Table
        columns={customerColumns}
        dataSource={tableQueryIntegrator.data?.data}
        pagination={tableQueryIntegrator.pagination}
        onChange={tableQueryIntegrator.handleTableChange}
        onFilterChange={tableQueryIntegrator.handleFilterChange}
        rowKey='id'
      />
    </Loader>
  }

  const ContentVar = () => {
    return <Loader states={[tableQueryVarRec]}>

      <Table
        columns={supportColumns}
        dataSource={tableQueryVarRec.data?.data}
        pagination={tableQueryVarRec.pagination}
        onChange={tableQueryVarRec.handleTableChange}
        onFilterChange={tableQueryVarRec.handleFilterChange}
        rowKey='id'
      />
    </Loader>
  }

  const ContentSupport = () => {
    return <Loader states={[tableQuerySupport]}>

      <Table
        columns={supportColumns}
        dataSource={tableQuerySupport.data?.data}
        pagination={tableQuerySupport.pagination}
        onChange={tableQuerySupport.handleTableChange}
        onFilterChange={tableQuerySupport.handleFilterChange}
        rowKey='id'
      />
    </Loader>
  }

  const ContentSupportEc = () => {
    return <Loader states={[tableQuerySupportEc]}>

      <Table
        columns={customerColumns}
        dataSource={tableQuerySupportEc.data?.data}
        pagination={tableQuerySupportEc.pagination}
        onChange={tableQuerySupportEc.handleTableChange}
        onFilterChange={tableQuerySupportEc.handleFilterChange}
        rowKey='id'
      />
    </Loader>
  }

  let contentx = ContentMspEc()
  if (delegationType === DelegationType.SUPPORT_REC) {
    contentx = ContentSupport()
  } else if (delegationType === DelegationType.SUPPORT_MSP_EC) {
    contentx = ContentSupportEc()
  } else if (delegationType === DelegationType.VAR_REC) {
    contentx = ContentVar()
  } else if (delegationType === DelegationType.MSP_INTEGRATOR) {
    contentx = ContentIntergrator()
  }

  return (
    <>
      <UI.CompanyNameDropdown onClick={()=>setVisible(true)}>
        <LayoutUI.CompanyName>{customerName}</LayoutUI.CompanyName>
        <LayoutUI.Icon
          children={<CaretDownSolid />}
        />
      </UI.CompanyNameDropdown>
      <Drawer
        width={420}
        title={$t({ defaultMessage: 'Change Customer' })}
        visible={visible}
        onClose={onClose}
        children={contentx}
      />
    </>
  )
}
