import React, { useEffect, useState } from 'react'

import { Form, Switch } from 'antd'
import _                from 'lodash'
import { useIntl }      from 'react-intl'


import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { useNetworkListQuery }                                                              from '@acx-ui/rc/services'
import { useTableQuery, PortalNetwork, captiveNetworkTypes, networkTypes, NetworkTypeEnum } from '@acx-ui/rc/utils'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id',
    'captiveType',
    'venues',
    'activated',
    'nwSubType'
  ]
}

const defaultArray: PortalNetwork[] = []

const getNetworkId = () => {
  //  Identify tenantId in browser URL
  // const parsedUrl = /\/networks\/([0-9a-f]*)/.exec(window.location.pathname)
  // Avoid breaking unit-tests even when browser URL has no tenantId.
  // if (Array.isArray(parsedUrl) && parsedUrl.length >= 1 && parsedUrl[1].length > 0) {
  //   return parsedUrl[1]
  // }
  return 'UNKNOWN-NETWORK-ID'
}

export default function PortalScopeNetworkTable () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useNetworkListQuery,
    apiParams: { networkId: getNetworkId() },
    defaultPayload
  })
  const form = Form.useFormInstance()
  const [tableData, setTableData] = useState(defaultArray)
  const [activateNetworks, setActivateNetworks] = useState(defaultArray)
  const handleNetworkSaveData = (selectedRows: PortalNetwork[]) => {
    const defaultSetup = {
      type: 'portal',
      venues: { count: 0, names: [] }
    }
    const selected = selectedRows.map((row) => ({
      ...defaultSetup,
      venues: row.venues,
      id: row.id,
      name: row.name
    }))
    form?.setFieldsValue({ network: selected })
  }

  const handleActivateNetwork = (isActivate:boolean, row:PortalNetwork | PortalNetwork[]) => {
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
          const index = selectedNetworks.findIndex(i => i.id === item.id)
          if (index !== -1) {
            selectedNetworks.splice(index, 1)
          }
        })
      } else {
        const index = selectedNetworks.findIndex(i => i.id === row.id)
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

  const setTableDataActivate = (dataOfTable:PortalNetwork[], selectedNetworks:PortalNetwork[]) => {
    const data:PortalNetwork[] = []
    dataOfTable.forEach(item => {
      let activated = { isActivated: false }
      if(selectedNetworks.find(i => i.id === item.id)) {
        activated.isActivated = true
      }
      item.activated = activated
      data.push(item)
    })
    setTableData(data)
  }

  const rowActions: TableProps<PortalNetwork>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      onClick: (rows) => {
        handleActivateNetwork(true, rows)
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
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

  const columns: TableProps<PortalNetwork>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'captiveType',
      key: 'captiveType',
      sorter: true,
      render: (value, row) => {
        const type = row.captiveType?
          captiveNetworkTypes[row.captiveType]:networkTypes[row.nwSubType as NetworkTypeEnum]
        return $t(type)
      }
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues',
      key: 'venues',
      render: function (data, row) {
        if (!row.venues) { return 0 }
        return row.venues.count
      }
    },
    {
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: ['activated', 'isActivated'],
      key: 'activated',
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
    <Loader states={[tableQuery,{ isLoading: false }]}>
      <Table
        rowKey='id'
        style={{ width: 800 }}
        rowActions={rowActions}
        rowSelection={{
          type: 'checkbox'
        }}
        columns={columns}
        dataSource={[...tableData]}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
  )
}
