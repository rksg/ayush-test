import { useEffect, useRef, useState } from 'react'

import _ from 'lodash'

import { EdgeDhcpPool } from '@acx-ui/rc/utils'

import { PoolDrawer } from './PoolDrawer'
import { PoolTable }  from './PoolTable'

type DhcpPoolTableProps = {
  value?: EdgeDhcpPool[]
  onChange?: (data: EdgeDhcpPool[]) => void
}

export default function DhcpPoolTable ({
  value = [],
  onChange
}: DhcpPoolTableProps) {
  const valueMap = useRef<Record<string, EdgeDhcpPool>>({})
  const [visible, setVisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<EdgeDhcpPool>()

  useEffect(()=> {
    valueMap.current = value ? _.keyBy(value, 'id') : {}
  }, [value])

  const openDrawer = (item?: EdgeDhcpPool) => {
    setCurrentEditData(item)
    setVisible(true)
  }

  const onAddOrEdit = (item: EdgeDhcpPool) => {
    valueMap.current[item.id] = item
    onChange?.(Object.values(valueMap.current))
  }

  const onDelete = (items: EdgeDhcpPool[]) => {
    items.forEach(item => {
      delete valueMap.current[item.id]
    })
    onChange?.(Object.values(valueMap.current))
  }

  return (
    <>
      <PoolTable
        data={value}
        openDrawer={openDrawer}
        onDelete={onDelete}
      />
      <PoolDrawer
        visible={visible}
        setVisible={setVisible}
        onAddOrEdit={onAddOrEdit}
        data={currentEditData}
        allPool={value}
      />
    </>
  )
}
