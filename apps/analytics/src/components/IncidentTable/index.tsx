import React, { useState } from 'react'

import { Switch }            from 'antd'
import { DefaultRecordType } from 'rc-table/lib/interface'
import AutoSizer             from 'react-virtualized-auto-sizer'

import { useGlobalFilter }                 from '@acx-ui/analytics/utils'
import { Card, Loader, Table, TableProps } from '@acx-ui/components'

import { useIncidentsListQuery } from './services'
import * as UI                   from './styledComponents'


export type IncidentTableProps = TableProps<DefaultRecordType>


const IncidentTableWidget = () => {
  const filters = useGlobalFilter()
  const queryResults = useIncidentsListQuery(filters)
  
  const [checkStrictly, setCheckStrictly] = useState(false)
  return (
    <Loader states={[queryResults]}>
      <Card title='Incident Table'>
        <AutoSizer>
          {({ height, width }) => (
            <UI.Div style={{ width, height }}>
              <UI.Space
                align='center'
              >
              CheckStrictly: <Switch checked={checkStrictly} onChange={setCheckStrictly} />
              </UI.Space>
              <Table dataSource={queryResults.data ? queryResults.data : []} />
            </UI.Div>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default IncidentTableWidget
