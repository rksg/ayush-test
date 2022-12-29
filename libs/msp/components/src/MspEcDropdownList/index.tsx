import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Drawer, LayoutUI, Loader, SearchBar, Table, TableProps }  from '@acx-ui/components'
import { ArrowExpand }                                             from '@acx-ui/icons'
import { useMspCustomerListDropdownQuery, useGetUserProfileQuery } from '@acx-ui/rc/services'
import { MspEc, TenantIdFromJwt, useTableQuery }                   from '@acx-ui/rc/utils'
import { getBasePath, Link, useParams  }                           from '@acx-ui/react-router-dom'

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

export function MspEcDropdownList () {
  const { $t } = useIntl()

  const [customerName, setCustomerName] = useState('')
  const [searchString, setSearchString] = useState('')
  const [visible, setVisible] = useState(false)

  const params = useParams()
  const { data } = useGetUserProfileQuery({ params })
  // const { data } = useGetUserProfileQuery({ params: { tenantId: TenantIdFromJwt() } })

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
      sorter: true,
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
      key: 'status',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Tenant Id' }),
      dataIndex: 'id',
      key: 'id',
      show: false,
      sorter: true
    }
  ]

  const content =
  <Loader states={[tableQuery]}>
    <SearchBar onChange={setSearchString}/>

    <Table
      columns={customerColumns}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      rowKey='id'
    />
  </Loader>

  return (
    <>
      <label style={{ fontSize: '16px', color: 'var(--acx-primary-white)' }}>{customerName}</label>
      <LayoutUI.Icon style={{ marginLeft: '-10px', marginRight: '10px' }}
        children={<ArrowExpand
          onClick={()=>{
            setVisible(true)
          }}/>}
      />
      {visible && <Drawer
        width={450}
        title={$t({ defaultMessage: 'Select Customer' })}
        visible={visible}
        onClose={onClose}
        children={content}
      />}
    </>
  )
}
