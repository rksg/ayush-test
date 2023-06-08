import { useEffect } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer, PasswordInput } from '@acx-ui/components'
import {
  excludeExclamationRegExp,
  excludeSpaceRegExp,
  notAllDigitsRegExp,
  RadiusServer
} from '@acx-ui/rc/utils'
// import { useParams } from '@acx-ui/react-router-dom'

interface AddApplicationDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEditMode: boolean
  editData?: RadiusServer
}

export const AddApplicationDrawer = (props: AddApplicationDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, isEditMode, editData } = props
  // const [resetField, setResetField] = useState(false)
  // const params = useParams()
  const [form] = Form.useForm()

  useEffect(()=>{
    if (editData && visible) {
      form.setFieldsValue(editData)
    }
  }, [editData, visible])

  const getTitle = () => {
    const title = isEditMode
      ? $t({ defaultMessage: 'Edit API Token' })
      : $t({ defaultMessage: 'Add API Token' })
    return title
  }

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  // const resetFields = () => {
  //   setResetField(true)
  //   onClose()
  // }

  const onSubmit = async () => {
    // setLoading(true)
    // try {
    //   if (!isEditMode) {
    //     const payload = {
    //       ...data,
    //       serverType
    //     }
    //     await addAAAServer({
    //       params,
    //       payload
    //     }).unwrap()
    //   } else {
    //     const payload = {
    //       ...editData,
    //       ...data
    //     }
    //     await updateAAAServer({
    //       params: {
    //         ...params,
    //         aaaServerId: payload.id
    //       },
    //       payload
    //     }).unwrap()
    //   }
    // }
    // catch (error) {
    //   console.log(error) // eslint-disable-line no-console
    // }
    // setLoading(false)
    // onClose()
    // const clearButton = document?.querySelector('button[data-id="table-clear-btn"]')
    // if (clearButton) {
    //   // @ts-ignore
    //   clearButton.click()
    // }
  }

  const radiusForm = <Form layout='vertical'form={form} onFinish={onSubmit}>
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
      rules={[
        { required: true },
        { min: 2 },
        { max: 64 },
        { validator: (_, value) => excludeExclamationRegExp(value) }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='secret'
      label={$t({ defaultMessage: 'Clirnt secret' })}
      rules={[
        { required: true },
        { max: 64 },
        { validator: (_, value) => excludeSpaceRegExp(value) },
        { validator: (_, value) => notAllDigitsRegExp(value) }
      ]}
      children={<PasswordInput />}
    />
  </Form>

  return (
    <Drawer
      title={getTitle()}
      onBackClick={onClose}
      visible={visible}
      onClose={onClose}
      children={radiusForm}
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
      // destroyOnClose={resetField}
      width={'452'}
    />
  )
}
