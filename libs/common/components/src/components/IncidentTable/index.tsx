import React, { useState } from 'react'

import { Space, Switch, Table } from 'antd'

export interface IncidentTableProps {
  columns: any
  rowSelection: any
  data: any
}


const IncidentTable = (props: IncidentTableProps) => {
  const [checkStrictly, setCheckStrictly] = useState(false)
  const { columns, rowSelection, data } = props
  return (
    <>
      <Space
        align='center'
        style={{
          marginBottom: 16
        }}
      >
        CheckStrictly: <Switch checked={checkStrictly} onChange={setCheckStrictly} />
      </Space>
      <Table
        columns={columns}
        rowSelection={{ ...rowSelection, checkStrictly }}
        dataSource={data}
      />
    </>
  )
}

export default IncidentTable
