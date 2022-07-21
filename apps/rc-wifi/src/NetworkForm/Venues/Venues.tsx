import { useEffect, useState, useContext } from 'react'

import { Form, Switch } from 'antd'

import {
  Loader,
  StepsForm,
  Table,
  TableProps
} from '@acx-ui/components'
import { useVenueListQuery, Venue } from '@acx-ui/rc/services'
import { useTableQuery }            from '@acx-ui/rc/utils'

import NetworkFormContext from '../NetworkFormContext'

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

export function Venues (props: { formRef: any }) {
  const { formRef } = props
  const { editMode } = useContext(NetworkFormContext)
  const venues = Form.useWatch('venues')

  const tableQuery = useTableQuery({
    useQuery: useVenueListQuery,
    apiParams: { networkId: getNetworkId() },
    defaultPayload
  })
  
  const [tableData, setTableData] = useState(defaultArray)
  const [activateVenues, setActivateVenues] = useState(defaultArray)

  const handleVenueSaveData = (selectedRows: Venue[]) => {
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

    formRef?.current?.setFieldsValue({ venues: selected })
  }
  useEffect(()=>{
    if(editMode){
      if(tableQuery.data && activateVenues.length === 0){
        const selected: Venue[] = []
        const tableData = tableQuery.data.data.map((item: Venue) => 
        {
          const isActivated = venues && 
            venues.filter((venue: Venue) => venue.venueId === item.id).length > 0
          if(isActivated){
            selected.push(item)
          }
          return {
            ...item,
            // work around of read-only records from RTKQ
            activated: { isActivated }
          }
        })
        setTableData(tableData)
        setActivateVenues(selected)
      }
    }else{
      if(tableQuery.data && tableData.length === 0){
        const tableData = tableQuery.data.data.map((item: Venue) => 
        {
          return {
            ...item,
            // work around of read-only records from RTKQ
            activated: { ...item.activated }
          }
        })
        setTableData(tableData)
      }
    }
  }, [venues, tableQuery.data, editMode])

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
      dataIndex: ['networks', 'count']
    },
    {
      title: 'Wi-Fi APs',
      dataIndex: 'aggregatedApStatus',
      render: function (data, row) {
        if (!row.aggregatedApStatus) { return 0 }
        return Object
          .values(row.aggregatedApStatus)
          .reduce((a, b) => a + b, 0)
      }
    },
    {
      title: 'Activated',
      dataIndex: ['activated', 'isActivated'],
      render: function (status, row) {
        const onToggle = (checked: boolean, event: Event) => {
          event.stopPropagation()
          row.activated.isActivated = checked
          let selectedVenues = [...activateVenues]
          if (checked) {
            selectedVenues = [...selectedVenues, row]
          } else {
            selectedVenues.splice(selectedVenues.indexOf(row), 1)
          }
          setActivateVenues(selectedVenues)
          handleVenueSaveData(selectedVenues)
        }
        return <Switch onChange={onToggle} 
          defaultChecked={row.activated.isActivated}
          checked={row.activated.isActivated}
        />
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
      <p>Select venues to activate this network</p>
      <Form.Item name='venues'>
        <Loader states={[tableQuery]}>
          <Table
            rowKey='id'
            rowSelection={{
              type: 'checkbox',
              defaultSelectedRowKeys: venues?.map((item: Venue) => item.venueId)
            }}
            onRow={(record: Venue) => ({
              onClick: () => { 
                tableQuery.onRowClick(record)
              }
            })}
            columns={columns}
            dataSource={[...tableData]}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
          />
        </Loader>
      </Form.Item>
    </>
  )
}
