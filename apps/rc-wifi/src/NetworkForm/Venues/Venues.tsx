import React, { useEffect, useState } from 'react'

import { Form, Switch } from 'antd'
import _                from 'lodash'

import {
  Loader,
  StepFormProps,
  StepsForm,
  Table,
  TableProps
} from '@acx-ui/components'
import { useVenueListQuery, Venue }               from '@acx-ui/rc/services'
import { useTableQuery, CreateNetworkFormFields } from '@acx-ui/rc/utils'

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
    props.formRef?.current?.setFieldsValue({ venues: selected })
  }

  const handleActivateVenue = (isActivate:boolean, row:Venue | Venue[]) => {
    let selectedVenues = [...activateVenues]
    if (isActivate) {
      if (Array.isArray(row)) {
        selectedVenues = [...selectedVenues, ...row]
      } else {
        selectedVenues = [...selectedVenues, row]
      }
    } else {
      if (Array.isArray(row)) {
        row.forEach(item => {
          const index = selectedVenues.findIndex(i => i.id == item.id)
          if (index !== -1) {
            selectedVenues.splice(index, 1)
          } 
        })
      } else {
        const index = selectedVenues.findIndex(i => i.id == row.id)
        if (index !== -1) {
          selectedVenues.splice(index, 1)
        } 
      }
    }
    selectedVenues = _.uniq(selectedVenues)
    setActivateVenues(selectedVenues)
    handleVenueSaveData(selectedVenues)
    const data:Venue[] = []
    tableData.forEach(item => {
      let activated = { isActivated: false }
      if(selectedVenues.find(i => i.id == item.id)) {
        activated.isActivated = true
      }
      item.activated = activated
      data.push(item)
    })
    setTableData(data)
  }

  const actions: TableProps<Venue>['actions'] = [
    {
      label: 'Activate',
      onClick: (rows) => {
        handleActivateVenue(true, rows) 
      }
    },
    {
      label: 'Deactivate',
      onClick: (rows) => { 
        handleActivateVenue(false, rows) 
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
      render: function (data, row) {
        return <Switch 
          checked={Boolean(data)} 
          onClick={(checked: boolean, event:Event) => {
            event.stopPropagation()
            handleActivateVenue(checked, row)
          }} 
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
