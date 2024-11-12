import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

import { LbsServerProfileForm } from '../../../policies/LbsServerProfile'

interface LbsServerProfileDrawerProps {
  visible: boolean,
  setVisible: (v: boolean) => void,
  handleSave: (id?: string) => void
}

export const LbsServerProfileDrawer = (props: LbsServerProfileDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, handleSave } = props

  const content =
    <LbsServerProfileForm modalMode={true} editMode={false} modalCallBack={handleSave} />

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Location Based Service Server' })}
      visible={visible}
      width={600}
      children={content}
      onClose={handleClose}
      destroyOnClose={true}
    />
  )
}