import React, { useState } from 'react'

import { Switch }            from 'antd'
import { DefaultRecordType } from 'rc-table/lib/interface'

import { Table, TableProps } from '../Table'

import * as UI from './styledComponents'


export type IncidentTableProps = TableProps<DefaultRecordType>


const IncidentTable = (props: IncidentTableProps) => {
  const [checkStrictly, setCheckStrictly] = useState(false)
  const { columns, rowSelection, dataSource, ...rest } = props
  return (
    <>
      <UI.Space
        align='center'
      >
        CheckStrictly: <Switch checked={checkStrictly} onChange={setCheckStrictly} />
      </UI.Space>
      <Table
        {...rest}
        columns={columns}
        rowSelection={{ ...rowSelection, checkStrictly }}
        dataSource={dataSource}
      />
    </>
  )
}

export default IncidentTable
