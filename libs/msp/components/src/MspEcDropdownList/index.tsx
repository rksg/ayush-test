import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Drawer, LayoutUI, Loader, SearchBar, Table, TableProps } from '@acx-ui/components'
import { CaretDownSolid }                                         from '@acx-ui/icons'
import { useUserProfileContext }                                  from '@acx-ui/rc/components'
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

export function MspEcDropdownList () {
  const { $t } = useIntl()

  const [customerName, setCustomerName] = useState('')
  const [searchString, setSearchString] = useState('')
  const [visible, setVisible] = useState(false)

  const params = useParams()
  const { data: tenantDetail } = useGetTenantDetailQuery({ params })

  // user profile for tenant from jwt token
  const { data: userProfile } = useUserProfileContext()

  let isMspEc = false
  let isSupportEc = false
  let isSupport = false
  let isVar = false
  if (userProfile?.support === true) {
    if (tenantDetail?.tenantType === AccountType.MSP_EC)
      isSupportEc = true
    else
      isSupport = true
  } else {
    if (tenantDetail?.tenantType === AccountType.MSP_EC)
      isMspEc = true
    else
      isVar = true
  }

  const mspEcPayload = {
    searchString: '',
    filters: { tenantType: ['MSP_EC'] },
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
          <Link to={to}>{data}</Link>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      show: isMspEc,
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
    option: { skip: !isMspEc }
  })

  const tableQueryVarRec = useTableQuery({
    useQuery: useVarCustomerListDropdownQuery,
    apiParams: { tenantId: TenantIdFromJwt() },
    defaultPayload: varPayload,
    option: { skip: !isVar }
  })

  const tableQuerySupportEc = useTableQuery({
    useQuery: useSupportCustomerListDropdownQuery,
    apiParams: { tenantId: TenantIdFromJwt() },
    defaultPayload: supportEcPayload,
    option: { skip: !isSupportEc }
  })

  const tableQuerySupport = useTableQuery({
    useQuery: useVarCustomerListDropdownQuery,
    apiParams: { tenantId: TenantIdFromJwt() },
    defaultPayload: supportPayload,
    option: { skip: !isSupport }
  })

  useEffect(()=>{
    if (tenantDetail?.name) {
      setCustomerName(() => tenantDetail?.name)
    }

    if(tableQueryMspEc?.data && isMspEc) {
      tableQueryMspEc.setPayload({ ...tableQueryMspEc.payload, searchString: searchString })
    }
    if(tableQueryVarRec?.data && isVar) {
      tableQueryVarRec.setPayload({ ...tableQueryVarRec.payload, searchString: searchString })
    }
    if(tableQuerySupportEc?.data && isSupportEc) {
      tableQuerySupportEc.setPayload({ ...tableQuerySupportEc.payload, searchString: searchString })
    }
    if(tableQuerySupport?.data && isSupport) {
      tableQuerySupport.setPayload({ ...tableQuerySupport.payload, searchString: searchString })
    }
  }, [tenantDetail?.name, searchString])

  const onClose = () => {
    setSearchString('')
    setVisible(false)
  }

  const ContentMspEc = () => {
    return <Loader states={[tableQueryMspEc]}>
      <SearchBar onChange={setSearchString}/>

      <Table
        columns={customerColumns}
        dataSource={tableQueryMspEc.data?.data}
        pagination={tableQueryMspEc.pagination}
        onChange={tableQueryMspEc.handleTableChange}
        rowKey='id'
      />
    </Loader>
  }

  const ContentVar = () => {
    return <Loader states={[tableQueryVarRec]}>
      <SearchBar onChange={setSearchString}/>

      <Table
        columns={supportColumns}
        dataSource={tableQueryVarRec.data?.data}
        pagination={tableQueryVarRec.pagination}
        onChange={tableQueryVarRec.handleTableChange}
        rowKey='id'
      />
    </Loader>
  }

  const ContentSupport = () => {
    return <Loader states={[tableQuerySupport]}>
      <SearchBar onChange={setSearchString}/>

      <Table
        columns={supportColumns}
        dataSource={tableQuerySupport.data?.data}
        pagination={tableQuerySupport.pagination}
        onChange={tableQuerySupport.handleTableChange}
        rowKey='id'
      />
    </Loader>
  }

  const ContentSupportEc = () => {
    return <Loader states={[tableQuerySupportEc]}>
      <SearchBar onChange={setSearchString}/>

      <Table
        columns={customerColumns}
        dataSource={tableQuerySupportEc.data?.data}
        pagination={tableQuerySupportEc.pagination}
        onChange={tableQuerySupportEc.handleTableChange}
        rowKey='id'
      />
    </Loader>
  }

  let contentx = ContentMspEc()
  if (isSupport) {
    contentx = ContentSupport()
  } else if (isSupportEc) {
    contentx = ContentSupportEc()
  } else if (isVar) {
    contentx = ContentVar()
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
        width={360}
        title={$t({ defaultMessage: 'Change Customer' })}
        visible={visible}
        onClose={onClose}
        children={contentx}
      />
    </>
  )
}
