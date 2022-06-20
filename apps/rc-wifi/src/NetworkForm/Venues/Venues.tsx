import React, { useEffect, useState } from 'react'

import { Form, Switch } from 'antd'

import {
  Loader,
  StepFormProps,
  StepsForm,
  Table,
  TableProps
} from '@acx-ui/components'
import { useVenueListQuery, Venue }               from '@acx-ui/rc/services'
import { useTableQuery, CreateNetworkFormFields } from '@acx-ui/rc/utils'

import TableButtonBar from './TableButtonBar'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id',
    'description',
    'city',
    'country',
    'networks',
    'aggregatedApStatus',
    'radios',
    'aps',
    'activated',
    'vlan',
    'scheduling',
    'switches',
    'switchClients',
    'latitude',
    'longitude',
    'mesh',
    'status'
  ]
}

const defaultArray: Venue[] = []

const getNetworkId = () => {
  //  Identify tenantId in browser URL
  // const parsedUrl = /\/networks\/([0-9a-f]*)/.exec(window.location.pathname)
  // Avoid breaking unit-tests even when browser URL has no tenantId.
  // if (Array.isArray(parsedUrl) && parsedUrl.length >= 1 && parsedUrl[1].length > 0) {
  //   return parsedUrl[1]
  // }
  return 'UNKNOWN-NETWORK-ID'
}

export function Venues (props: StepFormProps<CreateNetworkFormFields>) {
  const tableQuery = useTableQuery({
    useQuery: useVenueListQuery,
    apiParams: { networkId: getNetworkId() },
    defaultPayload
  })
  const [tableData, setTableData] = useState(defaultArray)

  const handleSelectedRows = () => {
    function handleVenueSaveData (selectedRows: Venue[]) {
      const defaultSetup = {
        apGroups: [],
        scheduler: { type: 'ALWAYS_ON' },
        isAllApGroups: true,
        allApGroupsRadio: 'Both'
      }
      const selected = selectedRows.map((row) => ({
        ...defaultSetup,
        venueId: row.id,
        name: row.name
      }))
      props.formRef?.current?.setFieldsValue({ venues: selected })
    }

    function handleActivatedButton (rows: Venue[]) {
      setTableData((prevData) => {
        const tmp = [...prevData]
        tmp.forEach((item) => {
          if (rows.indexOf(item) !== -1) {
            item.activated.isActivated = true
          } else {
            item.activated.isActivated = false
          }
        })
        return tmp
      })
    }

    handleVenueSaveData(tableQuery.selectedRowsData)
    handleActivatedButton(tableQuery.selectedRowsData)
  }
  useEffect(handleSelectedRows, [tableQuery.selectedRowsData, props.formRef])
  useEffect(()=>{
    if (tableQuery.data) {
      const data = tableQuery.data.data.map(item => ({
        ...item,
        // work around of read-only records from RTKQ
        activated: { ...item.activated }
      }))
      setTableData(data)
    }
  }, [tableQuery.data])

  const columns: TableProps<Venue>['columns'] = [
    {
      title: 'Venue',
      dataIndex: 'name',
      sorter: true
    },
    {
      title: 'City',
      dataIndex: 'city',
      sorter: true
    },
    {
      title: 'Country',
      dataIndex: 'country',
      sorter: true
    },
    {
      title: 'Networks',
      dataIndex: 'networks',
      render: function (data) {
        return data ? data.count : 0
      }
    },
    {
      title: 'Wi-Fi APs',
      dataIndex: 'aggregatedApStatus',
      render: function (data) {
        if (data) {
          let sum = 0
          Object.keys(data).forEach((key) => {
            sum = sum + data[key]
          })
          return sum
        }
        return 0
      }
    },
    {
      title: 'Activated',
      dataIndex: 'activated',
      render: function (data) {
        return <Switch checked={data.isActivated} disabled={true} />
      }
    },
    {
      title: 'APs',
      dataIndex: 'aps',
      width: '80px',
      render: function (data, row) {
        return row.activated.isActivated ? 'All APs' : ''
      }
    },
    {
      title: 'Radios',
      dataIndex: 'radios',
      width: '140px',
      render: function (data, row) {
        return row.activated.isActivated ? '2.4 GHz / 5 GHz' : ''
      }
    },
    {
      title: 'Scheduling',
      dataIndex: 'scheduling',
      render: function (data, row) {
        return row.activated.isActivated ? '24/7' : ''
      }
    }
  ]

  return (
    <>
      <StepsForm.Title>Venues</StepsForm.Title>
      <span>Select venues to activate this network</span>
      <TableButtonBar
        rowsSelected={tableQuery.selectedRowsData.length}
      />
      <Form.Item name='venues'>
        <Loader states={[tableQuery]}>
          <Table
            rowKey='id'
            rowSelection={{
              type: 'checkbox',
              ...tableQuery.rowSelection
            }}
            onRow={(record) => ({
              onClick: () => { tableQuery.onRowClick(record) }
            })}
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
