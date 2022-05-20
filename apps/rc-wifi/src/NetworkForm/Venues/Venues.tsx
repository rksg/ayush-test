import React, { useEffect, useState } from 'react'

import { Form, Switch } from 'antd'

import { StepsForm, Table }  from '@acx-ui/components'
import { useVenueListQuery } from '@acx-ui/rc/services'
import { useParams }         from '@acx-ui/react-router-dom'

import TableButtonBar from './TableButtonBar'

const defaultPagination = {
  current: 1,
  pageSize: 5,
  total: 0
}

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
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: defaultPagination.current,
  pageSize: defaultPagination.pageSize
}

const transferSorter = (order: string) => {
  return order === 'ascend' ? 'ASC' : 'DESC'
}

const defaultArray: any[] = []

const getNetworkId = () => {
  //  Identify tenantId in browser URL
  // const parsedUrl = /\/networks\/([0-9a-f]*)/.exec(window.location.pathname)
  // Avoid breaking unit-tests even when browser URL has no tenantId.
  // if (Array.isArray(parsedUrl) && parsedUrl.length >= 1 && parsedUrl[1].length > 0) {
  //   return parsedUrl[1]
  // }
  return 'UNKNOWN-NETWORK-ID'
}

export function Venues (props: any) {
  const [payload, setPayload] = useState(defaultPayload)
  const [pagination, setPagination] = useState(defaultPagination)
  const [tableData, setTableData] = useState(defaultArray)
  const [selectedRowsData, setSelectedRowsData] = useState(defaultArray)
  const params = useParams()
  const { data, error, isLoading } = useVenueListQuery({
    params: { ...params, networkId: getNetworkId() },
    payload
  })

  const rowSelection = {
    selectedRowKeys: selectedRowsData.map((item) => item.id),
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      setSelectedRowsData(selectedRows)
    }
  }

  const onRowClick = (row: any) => {
    const rowIndex = selectedRowsData.indexOf(row)
    if (rowIndex === -1) {
      setSelectedRowsData([...selectedRowsData, row])
    } else {
      const tmp = [...selectedRowsData]
      tmp.splice(rowIndex, 1)
      setSelectedRowsData(tmp)
    }
  }

  const handleSelectedRows = () => {
    function handleVenueSaveData (selectedRows: any[]) {
      const defaultSetup = {
        apGroups: [],
        scheduler: { type: 'ALWAYS_ON' },
        isAllApGroups: true,
        allApGroupsRadio: 'Both'
      }
      const selected: React.SetStateAction<any[]> = []
      selectedRows.forEach((row) => {
        const tmp = {
          ...defaultSetup,
          venueId: row.id,
          name: row.name
        }
        selected.push(tmp)
      })
      props.formRef.current.setFieldsValue({ venues: selected })
    }

    function handleActivatedButton (rows: any) {
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

    handleVenueSaveData(selectedRowsData)
    handleActivatedButton(selectedRowsData)
  }
  useEffect(handleSelectedRows, [selectedRowsData, props.formRef])

  const columns = [
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
      render: function (data: any) {
        return data ? data.count : 0
      }
    },
    {
      title: 'Wi-Fi APs',
      dataIndex: 'aggregatedApStatus',
      render: function (data: any) {
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
      render: function (data: any) {
        return <Switch checked={data.isActivated} disabled={true} />
      }
    },
    {
      title: 'APs',
      dataIndex: 'aps',
      width: '80px',
      render: function (data: any, row: any) {
        return row.activated.isActivated ? 'All APs' : ''
      }
    },
    {
      title: 'Radios',
      dataIndex: 'radios',
      width: '140px',
      render: function (data: any, row: any) {
        return row.activated.isActivated ? '2.4 GHz / 5 GHz' : ''
      }
    },
    {
      title: 'Scheduling',
      dataIndex: 'scheduling',
      render: function (data: any, row: any) {
        return row.activated.isActivated ? '24/7' : ''
      }
    }
  ]

  const handleResponse = () => {
    if (data) {
      setPagination({
        ...defaultPagination,
        current: data.page,
        total: data.totalCount
      })
      const source = JSON.parse(JSON.stringify(data.data))
      source.forEach((item: any) => {
        // for toogle button
        item.activated = { isActivated: false }
      })
      setTableData(source)
    }
  }

  useEffect(handleResponse, [data])

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const tableProps = {
      sortField: sorter.field || 'name',
      sortOrder: sorter.order ? transferSorter(sorter.order) : 'ASC',
      page: pagination.current,
      pageSize: pagination.pageSize
    }
    const request = { ...defaultPayload, ...tableProps }
    setPayload(request)
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div role='alert'>Error</div>

  return (
    <>
      <StepsForm.Title>Venues</StepsForm.Title>
      <span>Select venues to activate this network</span>
      <TableButtonBar rowsSelected={selectedRowsData.length} />
      <Form.Item name='venues'>
        <Table
          rowKey='id'
          rowSelection={{
            type: 'checkbox',
            ...rowSelection
          }}
          onRow={(record) => ({
            onClick: () => {
              onRowClick(record)
            }
          })}
          columns={columns}
          dataSource={tableData}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Form.Item>
    </>
  )
}
