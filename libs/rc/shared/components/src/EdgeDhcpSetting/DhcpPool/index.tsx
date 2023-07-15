import { EdgeDhcpPool } from '@acx-ui/rc/utils'

import { useTableControl } from '..'

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

  const {
    openDrawer,
    onDelete,
    visible,
    setVisible,
    onAddOrEdit,
    currentEditData
  } = useTableControl<EdgeDhcpPool>({ value, onChange })

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
