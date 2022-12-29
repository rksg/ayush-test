import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Drawer, LayoutUI, Loader, SearchBar, Table, TableProps }  from '@acx-ui/components'
import { ArrowExpand }                                             from '@acx-ui/icons'
import { useMspCustomerListDropdownQuery, useGetUserProfileQuery } from '@acx-ui/rc/services'
import { MspEc, TenantIdFromJwt, useTableQuery }                   from '@acx-ui/rc/utils'
import { getBasePath, Link, useParams  }                           from '@acx-ui/react-router-dom'

export function MspEcDropdownList () {
  const { $t } = useIntl()

  const [customerName, setCustomerName] = useState('')
  const [searchString, setSearchString] = useState('')
  const [visible, setVisible] = useState(false)

  const params = useParams()
  const { data } = useGetUserProfileQuery({ params })
  // const { data } = useGetUserProfileQuery({ params: { tenantId: TenantIdFromJwt() } })

  const defaultPayload = {
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
  const tableQuery = useTableQuery({
    useQuery: useMspCustomerListDropdownQuery,
    apiParams: { mspTenantId: TenantIdFromJwt() },
    defaultPayload
  })

  useEffect(()=>{
    if (data?.companyName) {
      setCustomerName(data?.companyName)
    }

    tableQuery.setPayload({ ...tableQuery.payload, searchString: searchString })
  }, [tableQuery.data, searchString])

  const onClose = () => {
    setSearchString('')
    setVisible(false)
  }

  const customerColumns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customers' }),
      dataIndex: 'name',
      key: 'name',
      defaultSortOrder: 'ascend',
      onCell: (row) => {
        return {
          onClick: () => {
            setSearchString('')
            setCustomerName(row.name)
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

  return (
    <>
      <div onClick={()=>setVisible(true)}>
        <label>{customerName}</label>
        <LayoutUI.Icon style={{ marginLeft: '2px', marginRight: '12px' }}
          children={<ArrowExpand/>}
        />
      </div>
      {visible && <Drawer
        width={360}
        title={$t({ defaultMessage: 'Change Customer' })}
        visible={visible}
        onClose={onClose}
        children={content}
      />}
    </>
  )
}
