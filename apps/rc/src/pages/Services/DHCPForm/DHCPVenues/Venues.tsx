import { useEffect, useState, useContext } from 'react'

import { Form, Switch } from 'antd'
import _                from 'lodash'
import { useIntl }      from 'react-intl'


import {
  Loader,
  StepsForm,
  Table,
  TableProps
} from '@acx-ui/components'
import { useNetworkVenueListQuery } from '@acx-ui/rc/services'
import { useTableQuery, Venue }     from '@acx-ui/rc/utils'

import DHCPFormContext from '../DHCPFormContext'

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

export function Venues () {
  const form = Form.useFormInstance()
  const { editMode, saveState } = useContext(DHCPFormContext)


  useEffect(()=>{
    if(saveState){
      form.setFieldsValue({ venues: saveState.venues })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])


  const venues = Form.useWatch('venues')

  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useNetworkVenueListQuery,
    apiParams: { networkId: getNetworkId() },
    defaultPayload
  })

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

    form.setFieldsValue({ venues: selected })
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
          const index = selectedVenues.findIndex(i => i.id === item.id)
          if (index !== -1) {
            selectedVenues.splice(index, 1)
          }
        })
      } else {
        const index = selectedVenues.findIndex(i => i.id === row.id)
        if (index !== -1) {
          selectedVenues.splice(index, 1)
        }
      }
    }
    selectedVenues = _.uniq(selectedVenues)
    setActivateVenues(selectedVenues)
    handleVenueSaveData(selectedVenues)
  }


  const rowActions: TableProps<Venue>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      onClick: (rows) => {
        handleActivateVenue(true, rows)
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      onClick: (rows) => {
        handleActivateVenue(false, rows)
      }
    }
  ]

  useEffect(()=>{
    // if(editMode){
    //   setActivateVenues(selected)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues, tableQuery, editMode])

  const columns: TableProps<Venue>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'name',
      sorter: true
    },
    {
      key: 'city',
      title: $t({ defaultMessage: 'City' }),
      dataIndex: 'city',
      sorter: true
    },
    {
      key: 'country',
      title: $t({ defaultMessage: 'Country' }),
      dataIndex: 'country',
      sorter: true
    },
    {
      key: 'network',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: ['networks', 'count']
    },
    {
      key: 'aggregatedApStatus',
      title: $t({ defaultMessage: 'Wi-Fi APs' }),
      dataIndex: 'aggregatedApStatus',
      render: function (data, row) {
        if (!row.aggregatedApStatus) { return 0 }
        return Object
          .values(row.aggregatedApStatus)
          .reduce((a, b) => a + b, 0)
      }
    },
    {
      key: 'activated',
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: 'id',
      render: function (data, row) {
        return <Switch
          checked={_.find(activateVenues, { id: row.id }) != null}
          onClick={(checked, event) => {
            event.stopPropagation()
            handleActivateVenue(checked, row)
          }}
        />
      }
    },
    {
      key: 'aps',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      width: 80,
      render: function (data, row) {
        return row.activated.isActivated ? 'All APs' : ''
      }
    },
    {
      key: 'radios',
      title: $t({ defaultMessage: 'Radios' }),
      dataIndex: 'radios',
      width: 140,
      render: function (data, row) {
        return row.activated.isActivated ? '2.4 GHz / 5 GHz' : ''
      }
    },
    {
      key: 'scheduling',
      title: $t({ defaultMessage: 'Scheduling' }),
      dataIndex: 'scheduling',
      render: function (data, row) {
        return row.activated.isActivated ? '24/7' : ''
      }
    }
  ]

  return (
    <>
      <StepsForm.Title>{ $t({ defaultMessage: 'Venues' }) }</StepsForm.Title>
      <p>{ $t({ defaultMessage: 'Select venues to activate this DHCP service' }) }</p>
      <Form.Item name='venues'>
        <Loader states={[tableQuery]}>
          <Table
            rowKey='id'
            rowActions={rowActions}
            rowSelection={{
              type: 'checkbox'
            }}
            columns={columns}
            dataSource={tableQuery.data?.data}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
          />
        </Loader>
      </Form.Item>
    </>
  )
}
