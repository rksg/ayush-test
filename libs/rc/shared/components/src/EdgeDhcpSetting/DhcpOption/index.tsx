import { EdgeDhcpOption } from '@acx-ui/rc/utils'

import { useTableControl } from '..'

import { OptionDrawer } from './OptionDrawer'
import { OptionTable }  from './OptionTable'

type DhcpOptionProps = {
  value?: EdgeDhcpOption[]
  onChange?: (data: EdgeDhcpOption[]) => void
}

export default function DhcpOption ({
  value = [],
  onChange
}: DhcpOptionProps) {

  const {
    openDrawer,
    onDelete,
    visible,
    setVisible,
    onAddOrEdit,
    currentEditData
  } = useTableControl<EdgeDhcpOption>({ value, onChange })

  return (
    <>
      <OptionTable
        data={value}
        openDrawer={openDrawer}
        onDelete={onDelete}
      />
      <OptionDrawer
        visible={visible}
        setVisible={setVisible}
        onAddOrEdit={onAddOrEdit}
        data={currentEditData}
        allOptions={value}
      />
    </>
  )
}