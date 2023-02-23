import { useEffect, useRef, useState } from 'react'

import _ from 'lodash'

import {
  EdgeDhcpHost
} from '@acx-ui/rc/utils'

import { HostDrawer } from './HostDrawer'
import { HostTable }  from './HostTable'

type DhcpHostProps = {
  value?: EdgeDhcpHost[]
  onChange?: (data: EdgeDhcpHost[]) => void
}

export default function DhcpHost ({
  value = [],
  onChange
}: DhcpHostProps) {
  const valueMap = useRef<Record<string, EdgeDhcpHost>>({})
  const [visible, setVisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<EdgeDhcpHost>()

  useEffect(()=> {
    valueMap.current = value ? _.keyBy(value, 'id') : {}
  }, [value])

  const openDrawer = (item?: EdgeDhcpHost) => {
    setCurrentEditData(item)
    setVisible(true)
  }

  const onAddOrEdit = (item: EdgeDhcpHost) => {
    valueMap.current[item.id] = item
    onChange?.(Object.values(valueMap.current))
  }

  const onDelete = (items: EdgeDhcpHost[]) => {
    items.forEach(item => {
      delete valueMap.current[item.id]
    })
    onChange?.(Object.values(valueMap.current))
  }

  return (
    <>
      <HostTable
        data={value}
        openDrawer={openDrawer}
        onDelete={onDelete}
      />
      <HostDrawer
        visible={visible}
        setVisible={setVisible}
        onAddOrEdit={onAddOrEdit}
        data={currentEditData}
        allHost={value}
      />
    </>
  )
}
