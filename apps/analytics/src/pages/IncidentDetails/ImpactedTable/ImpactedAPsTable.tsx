import React from 'react'

import { Loader } from '@acx-ui/components'

import { ImpactedTable }       from './ImpactedTable'
import { useImpactedAPsQuery } from './service'

import type { IncidentDetailsProps } from '../types'

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

export const ImpactedAPsTable: React.FC<IncidentDetailsProps> = (props) => {
  const queryResults = useImpactedAPsQuery({
    id: props.id,
    search: '',
    n: 100
  })
  return <Loader states={[queryResults]}>
    <ImpactedTable columns={impactedAPsColumns} dataSource={queryResults.data}/>
  </Loader>
}
