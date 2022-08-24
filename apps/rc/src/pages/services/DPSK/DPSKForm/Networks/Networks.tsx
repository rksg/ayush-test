import React, { useEffect, useState } from 'react'

import { Form, Switch } from 'antd'
import _                from 'lodash'
import { useIntl }      from 'react-intl'


import {
  Loader,
  StepFormProps,
  StepsForm,
  Table,
  TableProps
} from '@acx-ui/components'
import { useNetworkListQuery, Network }        from '@acx-ui/rc/services'
import { useTableQuery, CreateDPSKFormFields } from '@acx-ui/rc/utils'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id',
    'type',
    'venues',
    'activated'
  ]
}

const defaultArray: Network[] = []

const getNetworkId = () => {
  //  Identify tenantId in browser URL
  // const parsedUrl = /\/networks\/([0-9a-f]*)/.exec(window.location.pathname)
  // Avoid breaking unit-tests even when browser URL has no tenantId.
  // if (Array.isArray(parsedUrl) && parsedUrl.length >= 1 && parsedUrl[1].length > 0) {
  //   return parsedUrl[1]
  // }
  return 'UNKNOWN-NETWORK-ID'
}

export function Networks (props: StepFormProps<CreateDPSKFormFields>) {
  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useNetworkListQuery,
    apiParams: { networkId: getNetworkId() },
    defaultPayload
  })
  const [tableData, setTableData] = useState(defaultArray)
  const [activateNetworks, setActivateNetworks] = useState(defaultArray)
  const handleNetworkSaveData = (selectedRows: Network[]) => {
    const defaultSetup = {
      type: 'dpsk',
      venues: { count: 0, names: [] }
    }
    const selected = selectedRows.map((row) => ({
      ...defaultSetup,
      networkId: row.id,
      name: row.name
    }))
    props.formRef?.current?.setFieldsValue({ network: selected })
  }

  const handleActivateNetwork = (isActivate:boolean, row:Network | Network[]) => {
    let selectedNetworks = [...activateNetworks]
    if (isActivate) {
      if (Array.isArray(row)) {
        selectedNetworks = [...selectedNetworks, ...row]
      } else {
        selectedNetworks = [...selectedNetworks, row]
      }
    } else {
      if (Array.isArray(row)) {
        row.forEach(item => {
          const index = selectedNetworks.findIndex(i => i.id == item.id)
          if (index !== -1) {
            selectedNetworks.splice(index, 1)
          }
        })
      } else {
        const index = selectedNetworks.findIndex(i => i.id == row.id)
        if (index !== -1) {
          selectedNetworks.splice(index, 1)
        }
      }
    }
    selectedNetworks = _.uniq(selectedNetworks)
    setActivateNetworks(selectedNetworks)
    handleNetworkSaveData(selectedNetworks)
    setTableDataActivate(tableData ,selectedNetworks)
  }

  const setTableDataActivate = (dataOfTable:Network[], selectedVenues:Network[]) => {
    const data:Network[] = []
    dataOfTable.forEach(item => {
      let activated = { isActivated: false }
      if(selectedVenues.find(i => i.id == item.id)) {
        activated.isActivated = true
      }
      item.activated = activated
      data.push(item)
    })
    setTableData(data)
  }

  const actions: TableProps<Network>['actions'] = [
    {
      label: 'Activate',
      onClick: (rows) => {
        handleActivateNetwork(true, rows)
      }
    },
    {
      label: 'Deactivate',
      onClick: (rows) => {
        handleActivateNetwork(false, rows)
      }
    }
  ]

  useEffect(()=>{
    if (tableQuery.data) {
      const data = tableQuery.data.data.map(item => ({
        ...item,
        // work around of read-only records from RTKQ
        activated: { ...item.activated }
      }))
      if (tableData.length && activateNetworks.length) {
        setTableDataActivate(data, activateNetworks)
      } else {
        setTableData(data)
      }
    }
  }, [tableQuery.data])

  const columns: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      sorter: true,
      render: () => {return 'DPSK'}
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues',
      render: function (data, row) {
        if (!row.venues) { return 0 }
        return row.venues.count
      }
    },
    {
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: ['activated', 'isActivated'],
      render: function (data, row) {
        return <Switch
          checked={Boolean(data)}
          onClick={(checked, event) => {
            event.stopPropagation()
            handleActivateNetwork(checked, row)
          }}
        />
      }
    }
  ]

  return (
    <>
      <StepsForm.Title>{ $t({ defaultMessage: 'Scope' }) }</StepsForm.Title>
      <p>{ $t({ defaultMessage:
        'Select the wireless networks where the DPSK Service will be applied' }) }</p>
      <Form.Item name='network'>
        <Loader states={[tableQuery]}>
          <Table
            rowKey='id'
            actions={actions}
            rowSelection={{
              type: 'checkbox'
            }}
            columns={columns}
            dataSource={tableData}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
          />
        </Loader>
      </Form.Item>
    </>
  )
}
