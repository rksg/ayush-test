
import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

import { DhcpOption82SettingsFormField } from './DhcpOption82SettingsFormField'
interface DhcpOption82SettingsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  callbackFn?: () => void
}


export const DhcpOption82SettingsDrawer = (props: DhcpOption82SettingsDrawerProps) => {

  const { visible, setVisible, callbackFn = () => {} } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()


  const handleAdd = async () => {
    try {
      form.resetFields()
      setVisible(false)
      callbackFn()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleClose = () => {
    setVisible(false)
    form.resetFields()
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'DHCP Option 82 Sub Options' })}
      visible={visible}
      width={850}
      children={
        <DhcpOption82SettingsFormField />
      }
      onClose={handleClose}
      destroyOnClose={true}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Add' })
          }}
          onCancel={handleClose}
          onSave={handleAdd}
        />
      }
    />
  )

}