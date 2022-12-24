import { useEffect, useState } from 'react'

import { Select } from 'antd'

import { useMspCustomerListDropdownQuery }       from '@acx-ui/rc/services'
import { MspEc, TenantIdFromJwt, useTableQuery } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }            from '@acx-ui/react-router-dom'

const defaultArray: MspEc[] = []

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
  const navigate = useNavigate()
  const basePath = useTenantLink('/dashboard/')

  const [tableData, setTableData] = useState(defaultArray)
  const [customer, setCustomer] = useState('')
  const [searchString, setSearchString] = useState('')

  const tableQuery = useTableQuery({
    useQuery: useMspCustomerListDropdownQuery,
    apiParams: { mspTenantId: TenantIdFromJwt() },
    defaultPayload
  })

  useEffect(()=>{
    if (tableQuery.data?.data) {
      setTableData(tableQuery.data.data)
    }
    tableQuery.setPayload({ ...tableQuery.payload, searchString: searchString })
  }, [tableQuery.data, searchString])

  const onChange = (value: string) => {
    // const tenantId = value
    setCustomer(value)
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}`
    })
  }
  const onSearch = (value: string) => {
    // const tenantId = value
    if (value.length >= 2) {
      setSearchString( value )
    }
  }

  return (
    <Select style={{ width: '250px' }}
      showSearch
      // placeholder='Select a customer'
      optionFilterProp='children'
      value={customer}
      onChange={onChange}
      onSearch={onSearch}
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={tableData.map(( item ) => {
        return { value: item.name , label: item.name }
      })}
    ></Select>
  )
}
