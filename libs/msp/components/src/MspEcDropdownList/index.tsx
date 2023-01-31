import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Drawer, LayoutUI, Loader, SearchBar, Table, TableProps } from '@acx-ui/components'
import { ArrowExpand }                                            from '@acx-ui/icons'
import {
  useMspCustomerListDropdownQuery,
  useVarCustomerListDropdownQuery,
  useGetEcProfileQuery
}  from '@acx-ui/rc/services'
import { MspEc, TenantIdFromJwt, useTableQuery, VarCustomer } from '@acx-ui/rc/utils'
import { getBasePath, Link, useParams  }                      from '@acx-ui/react-router-dom'

export function MspEcDropdownList () {
  const { $t } = useIntl()

  const [customerName, setCustomerName] = useState('')
  const [searchString, setSearchString] = useState('')
  const [visible, setVisible] = useState(false)

  const params = useParams()
  const { data } = useGetEcProfileQuery({ params })
  // const { data } = useGetUserProfileQuery({ params: { tenantId: TenantIdFromJwt() } })

  const mspPayload = {
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

  const isMsp = false
  // const combinedPayload = isMsp ? mspPayload : supportPayload
  // const newQuery = isMsp ? useMspCustomerListDropdownQuery : useVarCustomerListDropdownQuery
  // const newColumns = isMsp ? customerColumns : supportColumns

  const tableQuery = useTableQuery({
    useQuery: useMspCustomerListDropdownQuery,
    apiParams: { mspTenantId: TenantIdFromJwt() },
    defaultPayload: mspPayload
  })

  const tableQuery2 = useTableQuery({
    useQuery: useVarCustomerListDropdownQuery,
    apiParams: { mspTenantId: TenantIdFromJwt() },
    defaultPayload: supportPayload
  })

  useEffect(()=>{
    if (data?.name) {
      setCustomerName(data?.name)
    }

    tableQuery.setPayload({ ...tableQuery.payload, searchString: searchString })
    tableQuery2.setPayload({ ...tableQuery2.payload, searchString: searchString })
  }, [data, tableQuery.data, tableQuery2.data, searchString])

  const onClose = () => {
    setSearchString('')
    setVisible(false)
  }


  const content =
  <Loader states={[tableQuery]}>
    <SearchBar onChange={setSearchString}/>

    <Table
      columns={customerColumns}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      rowKey='id'
    />
  </Loader>

  const content2 =
  <Loader states={[tableQuery2]}>
    <SearchBar onChange={setSearchString}/>

    <Table
      columns={supportColumns}
      dataSource={tableQuery2.data?.data}
      pagination={tableQuery2.pagination}
      onChange={tableQuery2.handleTableChange}
      rowKey='id'
    />
  </Loader>

  return (
    <>
      <div onClick={()=>setVisible(true)}>
        <label>{customerName}</label>
        <LayoutUI.Icon style={{ marginLeft: '2px', marginRight: '12px' }}
          children={<ArrowExpand/>}
        />
      </div>
      {visible && isMsp && <Drawer
        width={360}
        title={$t({ defaultMessage: 'Change Customer' })}
        visible={visible}
        onClose={onClose}
        children={content}
      />}
      {visible && !isMsp && <Drawer
        width={360}
        title={$t({ defaultMessage: 'Change Customer' })}
        visible={visible}
        onClose={onClose}
        children={content2}
      />}
    </>
  )
}
