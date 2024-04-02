import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

import { IdentityProviderForm } from '../../../policies/IdentityProvider'


interface IdentityProviderDrawerProps {
  visible: boolean,
  handleCancelAndSave: (id?: string) => void
}

const IdentityProviderDrawer = (props: IdentityProviderDrawerProps) => {
  const { $t } = useIntl()
  const { visible, handleCancelAndSave } = props

  const content = <IdentityProviderForm modalMode={true} modalCallBack={handleCancelAndSave} />

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Identity Provider' })}
      visible={visible}
      width={1202}
      children={content}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          onCancel={handleCancelAndSave}
          onSave={async () => handleCancelAndSave()}
        />
      }
    />
  )
}

export default IdentityProviderDrawer