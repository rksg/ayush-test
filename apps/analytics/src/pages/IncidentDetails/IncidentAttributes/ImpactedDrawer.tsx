import React, { useState } from 'react'

import { Drawer, Loader, Table, SearchBar } from '@acx-ui/components'

import { IncidentDetailsProps } from '../types'

import {
  ImpactedAP,
  ImpactedClient,
  useImpactedAPsQuery,
  useImpactedClientsQuery
} from './service'

export interface impactedDrawer extends IncidentDetailsProps {
  visible: boolean
  onClose: () => void
}

function sort<T, K extends keyof T> (column: K) {
  return function (a: T, b: T) {
    return a[column] > b[column]? 1: -1
  }
}

const impactedClientsColumns = [
  {
    title: 'Client MAC',
    dataIndex: 'mac',
    key: 'mac',
    sorter: sort<ImpactedClient, 'mac'>('mac')
  },
  {
    title: 'Manufacturer',
    dataIndex: 'manufacturer',
    key: 'manufacturer',
    sorter: sort<ImpactedClient, 'manufacturer'>('manufacturer')
  },
  {
    title: 'SSID',
    dataIndex: 'ssid',
    key: 'ssid',
    sorter: sort<ImpactedClient, 'ssid'>('ssid')
  },
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username',
    sorter: sort<ImpactedClient, 'username'>('username')
  },
  {
    title: 'Hostname',
    dataIndex: 'hostname',
    key: 'hostname',
    sorter: sort<ImpactedClient, 'hostname'>('hostname')
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
    key: 'name',
    sorter: sort<ImpactedAP, 'name'>('name')
  },
  {
    title: 'AP MAC',
    dataIndex: 'mac',
    key: 'mac',
    sorter: sort<ImpactedAP, 'mac'>('mac')
  },
  {
    title: 'AP Model',
    dataIndex: 'model',
    key: 'model',
    sorter: sort<ImpactedAP, 'model'>('model')
  },
  {
    title: 'AP Version',
    dataIndex: 'version',
    key: 'version',
    sorter: sort<ImpactedAP, 'version'>('version')
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
