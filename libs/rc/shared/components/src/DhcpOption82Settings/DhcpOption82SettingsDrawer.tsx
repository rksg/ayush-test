import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

import { DhcpOption82SettingsFormField } from './DhcpOption82SettingsFormField'
interface DhcpOption82SettingsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  applyCallbackFn: () => void
  cancelCallbackFn: () => void
  index: number
  onGUIChanged?: (fieldName: string) => void
  readonly: boolean
}


export const DhcpOption82SettingsDrawer = (props: DhcpOption82SettingsDrawerProps) => {

  const {
    visible,
    setVisible,
    applyCallbackFn,
    cancelCallbackFn,
    index,
    onGUIChanged,
    readonly
  } = props

  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const handleAdd = async () => {
    try {
      setVisible(false)
      onGUIChanged && onGUIChanged('AddDHCPOption82')
      applyCallbackFn()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleClose = () => {
    cancelCallbackFn()
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'DHCP Option 82 Sub Options' })}
      visible={visible}
      width={850}
      children={
        <DhcpOption82SettingsFormField
          readonly={readonly}
          labelWidth={'280px'}
          context={'lanport'}
          onGUIChanged={onGUIChanged}
          index={index}
        />
      }
      onClose={handleClose}
      destroyOnClose={true}
      footer={
        <Drawer.FormFooter
          showSaveButton={!readonly}
          buttonLabel={{
            save: $t({ defaultMessage: 'Apply' })
          }}
          onCancel={handleClose}
          onSave={handleAdd}
        />
      }
    />
  )

}
