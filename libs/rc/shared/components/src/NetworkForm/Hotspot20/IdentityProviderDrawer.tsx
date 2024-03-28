import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

import IdentityProviderForm from '../../policies/IdentityProvider/IdentityProviderForm/IdentityProviderForm'

interface IdentityProviderDrawerProps {
  visible: boolean,
  handleCancelAndSave: (id?: string) => void
}

const IdentityProviderDrawer = (props: IdentityProviderDrawerProps) => {
  const { $t } = useIntl()
  const { visible, handleCancelAndSave } = props

  const content = <Form layout='vertical'>
    <IdentityProviderForm modalMode={true} modalCallBack={handleCancelAndSave} />
  </Form>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Identity Provider' })}
      visible={visible}
      width={500}
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