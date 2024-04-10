import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

import { IdentityProviderForm } from '../../../policies/IdentityProvider'


interface IdentityProviderDrawerProps {
  visible: boolean,
  setVisible: (v: boolean) => void
  handleSave: (id?: string) => void
}

const IdentityProviderDrawer = (props: IdentityProviderDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, handleSave } = props

  const content = <IdentityProviderForm modalMode={true} modalCallBack={handleSave} />

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Identity Provider' })}
      visible={visible}
      width={1202}
      push={false}
      children={content}
      onClose={handleClose}
      destroyOnClose={true}
    />
  )
}

export default IdentityProviderDrawer