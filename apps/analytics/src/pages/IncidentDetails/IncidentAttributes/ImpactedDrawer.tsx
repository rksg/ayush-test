import React, { useState } from 'react'

import { Drawer, Loader, Table, SearchBar } from '@acx-ui/components'

import { IncidentDetailsProps } from '../types'

import { useImpactedAPsQuery, useImpactedClientsQuery } from './service'

export interface impactedDrawer extends IncidentDetailsProps {
  visible: boolean
  onClose: () => void
}

const impactedClientsColumns = [
  {
    title: 'Client MAC',
    dataIndex: 'mac',
    key: 'mac'
  },
  {
    title: 'Manufacturer',
    dataIndex: 'manufacturer',
    key: 'manufacturer'
  },
  {
    title: 'SSID',
    dataIndex: 'ssid',
    key: 'ssid'
  },
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: 'Hostname',
    dataIndex: 'hostname',
    key: 'hostname'
  }
]

export const ImpactedClientsDrawer: React.FC<impactedDrawer> = (props) => {
  const [ search, setSearch ] = useState('')

  const queryResults = useImpactedClientsQuery({
    id: props.id,
    search,
    n: 100
  },{ selectFromResult: (states) => ({
    ...states,
    isLoading: false,
    isFetching: states.isLoading || states.isFetching
  }) })
  return <Drawer
    width={'620px'}
    title={`${queryResults.data?.length || ''} Impacted Client`}
    visible={props.visible}
    onClose={props.onClose}
    children={<Loader states={[queryResults]}>
      <SearchBar onChange={setSearch}/>
      <Table
        columns={impactedClientsColumns}
        dataSource={queryResults.data?.map((row, key)=>({ key, ...row }))}/>
    </Loader>}
  />
}

const impactedAPsColumns = [
  {
    title: 'AP Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'AP MAC',
    dataIndex: 'mac',
    key: 'mac'
  },
  {
    title: 'AP Model',
    dataIndex: 'model',
    key: 'model'
  },
  {
    title: 'AP Version',
    dataIndex: 'version',
    key: 'version'
  }
]

export const ImpactedAPsDrawer: React.FC<impactedDrawer> = (props) => {
  const [ search, setSearch ] = useState('')
  const queryResults = useImpactedAPsQuery({
    id: props.id,
    search,
    n: 100
  },{ selectFromResult: (states) => ({
    ...states,
    isLoading: false,
    isFetching: states.isLoading || states.isFetching
  }) })
  return <Drawer
    width={'620px'}
    title={`${queryResults.data?.length} Impacted AP`}
    visible={props.visible}
    onClose={props.onClose}
    children={<Loader states={[queryResults]}>
      <SearchBar onChange={setSearch}/>
      <Table
        columns={impactedAPsColumns}
        dataSource={queryResults.data?.map((row, key)=>({ key, ...row }))}/>
    </Loader>}
  />
}
