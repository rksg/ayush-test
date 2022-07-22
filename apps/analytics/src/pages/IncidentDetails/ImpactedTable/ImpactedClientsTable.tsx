import React from 'react'

import { Loader } from '@acx-ui/components'

import { ImpactedTable }           from './ImpactedTable'
import { useImpactedClientsQuery } from './service'

import type { IncidentDetailsProps } from '../types'

const impactedClientsColumns = [
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

export const ImpactedClientsTable: React.FC<IncidentDetailsProps> = (props) => {
  const queryResults = useImpactedClientsQuery({
    id: props.id,
    search: '',
    n: 100
  })
  return <Loader states={[queryResults]}>
    <ImpactedTable columns={impactedClientsColumns} dataSource={queryResults.data}/>
  </Loader>
}
