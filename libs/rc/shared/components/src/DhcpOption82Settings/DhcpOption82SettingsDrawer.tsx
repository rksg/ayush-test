import { useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }                                              from '@acx-ui/components'
import { DhcpOption82Settings, LanPortSoftGreProfileSettings } from '@acx-ui/rc/utils'

import { DhcpOption82SettingsFormField } from './DhcpOption82SettingsFormField'

interface DhcpOption82SettingsDrawerProps {
  visible: boolean
  readOnly: boolean
  setVisible: (visible: boolean) => void
  applyCallbackFn: (dhcpOption82Settings: DhcpOption82Settings) => void
  cancelCallbackFn: () => void
  sourceData?: LanPortSoftGreProfileSettings
}

export const DhcpOption82SettingsDrawer = (props: DhcpOption82SettingsDrawerProps) => {

  const {
    visible,
    readOnly,
    setVisible,
    applyCallbackFn,
    cancelCallbackFn,
    sourceData
  } = props

  const { $t } = useIntl()
  const [form] = Form.useForm()

  const handleAdd = async () => {
    try {
      await form.validateFields()
      const formValues = form.getFieldsValue()
      const { '_customization_tags': _customization, ...rest } = formValues
      applyCallbackFn(rest)
      setVisible(false)
    } catch (error) {
      console.log('Form validation failed:', error) // eslint-disable-line no-console
    }
  }

  const handleClose = () => {
    cancelCallbackFn()
    setVisible(false)
  }

  useEffect(() => {
    if (visible) {
      if (sourceData) {
        form.setFieldsValue(sourceData)
      } else {
        // Avoid the form is not reset
        form.resetFields()
      }
    }
  }, [visible, sourceData])

  return (
    <Drawer
      title={$t({ defaultMessage: 'DHCP Option 82 Sub Options' })}
      visible={visible}
      width={850}
      children={
        <Form form={form}>
          <DhcpOption82SettingsFormField
            readOnly={readOnly}
            labelWidth={'280px'}
            isLanPortSettings={true}
          />
        </Form>
      }
      onClose={handleClose}
      destroyOnClose={true}
      footer={
        <Drawer.FormFooter
          showSaveButton={!readOnly}
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
