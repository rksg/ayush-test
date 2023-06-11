import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Button, Drawer, PasswordInput } from '@acx-ui/components'
import {
  excludeExclamationRegExp,
  excludeSpaceRegExp,
  notAllDigitsRegExp,
  generateHexKey
} from '@acx-ui/rc/utils'

interface AddApplicationDrawerProps {
  visible: boolean
  isEditMode: boolean
  setVisible: (visible: boolean) => void
}

export const AddApplicationDrawer = (props: AddApplicationDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, isEditMode } = props
  const [form] = Form.useForm()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const onSubmit = async () => {
  }

  const formContent = <Form layout='vertical'form={form} onFinish={onSubmit}>
    <Form.Item
      name='name'
      label={$t({ defaultMessage: 'Application Name' })}
      rules={[
        { required: true },
        { min: 2 },
        { max: 64 },
        { validator: (_, value) => excludeExclamationRegExp(value) }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='ip'
      label={$t({ defaultMessage: 'Client ID' })}
      initialValue={generateHexKey(32)}
      // rules={[
      //   { required: true },
      //   { validator: (_, value) => excludeExclamationRegExp(value) }
      // ]}
      children={<Input disabled={true} />}
    />
    <Form.Item
      name='secret'
      label={$t({ defaultMessage: 'Clirnt secret' })}
      // initialValue={secret}
      rules={[
        { required: true },
        // { max: 64 },
        { validator: (_, value) => excludeSpaceRegExp(value) },
        { validator: (_, value) => notAllDigitsRegExp(value) }
      ]}
      children={<PasswordInput />}
    />
    <Button
      // style={{ marginLeft: '300px', marginTop: '17px' }}
      type='link'
      onClick={() => {
        const sec = generateHexKey(30)
        form.setFieldValue('secret', sec)
      }}>
      {$t({ defaultMessage: 'Generate Secret' })}
    </Button>

  </Form>

  return (
    <Drawer
      title={isEditMode
        ? $t({ defaultMessage: 'Edit API Token' })
        : $t({ defaultMessage: 'Add API Token' })}
      width={'452'}
      visible={visible}
      onClose={onClose}
      children={formContent}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: isEditMode
              ? $t({ defaultMessage: 'Save' })
              : $t({ defaultMessage: 'Add' })
          }}
          onCancel={onClose}
          onSave={async () => {
            try {
              await form.validateFields()
              form.submit()
              onClose()
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
    />
  )
}
