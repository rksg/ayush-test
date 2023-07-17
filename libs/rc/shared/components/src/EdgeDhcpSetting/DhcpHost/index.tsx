import {
  EdgeDhcpHost
} from '@acx-ui/rc/utils'

import { useTableControl } from '..'

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

  const {
    openDrawer,
    onDelete,
    visible,
    setVisible,
    onAddOrEdit,
    currentEditData
  } = useTableControl<EdgeDhcpHost>({ value, onChange })

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
