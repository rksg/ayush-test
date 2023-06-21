import { Divider, Form, Input } from 'antd'
import { useIntl }              from 'react-intl'

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

  const handleClickCopy = (copyString: string) => {
    navigator.clipboard.writeText(copyString)
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
      name='clientId'
      label={$t({ defaultMessage: 'Client ID' })}
      // initialValue={generateHexKey(32)}
      children={<>
        <label>{generateHexKey(32)}</label>
        <Button
          style={{ marginLeft: '20px' }}
          type='link'
          onClick={() => {
            handleClickCopy(form.getFieldValue('clientId'))
          }}>
          {$t({ defaultMessage: 'Copy' })}
        </Button></>
      }
    />
    <Form.Item
      name='secret'
      label={$t({ defaultMessage: 'Client secret' })}
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
      type='link'
      onClick={() => {
        const sec = generateHexKey(30)
        form.setFieldValue('secret', sec)
      }}>
      {$t({ defaultMessage: 'Generate Secret' })}
    </Button>
    <Divider type='vertical'/>
    <Button
      type='link'
      onClick={() => {
        handleClickCopy(form.getFieldValue('secret'))
      }}>
      {$t({ defaultMessage: 'Copy' })}
    </Button>

  </Form>

  return (
    <Drawer
      title={isEditMode
        ? $t({ defaultMessage: 'Edit API Token' })
        : $t({ defaultMessage: 'Add API Token' })}
      width={452}
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
