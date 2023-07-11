import { useState } from 'react'

import { GridRow, GridCol }                      from '@acx-ui/components'
import type { ConfigChange as ConfigChangeType } from '@acx-ui/components'

import { Chart } from './Chart'
import { Table } from './Table'


export function ConfigChange () {
  const [selectedRow, setSelectedRow] = useState<ConfigChangeType | null>(null)

  const handleClick = (params: ConfigChangeType) => {
    setSelectedRow(params)
  }

  return <GridRow>
    <GridCol col={{ span: 24 }} style={{ height: '170px' }}>
      <Chart selectedRow={selectedRow} onClick={handleClick}/>
    </GridCol>
    <GridCol col={{ span: 8 }} style={{ minHeight: '180px' }}><div>kpi</div></GridCol>
    <GridCol col={{ span: 16 }} style={{ minHeight: '180px' }}>
      <Table selectedRow={selectedRow} onRowClick={handleClick}/>
    </GridCol>
  </GridRow>
}
