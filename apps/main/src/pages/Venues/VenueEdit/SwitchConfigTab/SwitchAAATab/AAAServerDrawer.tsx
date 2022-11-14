import { useEffect, useState } from 'react'

import { Form, Input, Select }       from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, Drawer, showToast, Tooltip }                  from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                          from '@acx-ui/icons'
import { useAddAAAServerMutation, useUpdateAAAServerMutation } from '@acx-ui/rc/services'
import { AAAServerTypeEnum,
  excludeExclamationRegExp,
  excludeQuoteRegExp,
  excludeSpaceExclamationRegExp,
  excludeSpaceRegExp, LocalUser,
  notAllDigitsRegExp, portRegExp,
  RadiusServer, serverIpAddressRegExp,
  TacacsServer, validateUsername,
  validateUserPassword } from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { serversDisplayText, AAA_Purpose_Type, purposeDisplayText, AAA_Level_Type, levelDisplayText, LOCAL_USER_PASSWORD_TOOLTIP } from './contentsMap'
const { Option } = Select

interface AAAServerDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEditMode: boolean
  serverType: AAAServerTypeEnum
  editData: RadiusServer | TacacsServer | LocalUser
}

export const AAAServerDrawer = (props: AAAServerDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, isEditMode, serverType, editData } = props
  const [resetField, setResetField] = useState(false)
  const params = useParams()
  const [form] = Form.useForm()
  const [ addAAAServer ] = useAddAAAServerMutation()
  const [ updateAAAServer ] = useUpdateAAAServerMutation()
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(()=>{
    if (editData && visible) {
      form.setFieldsValue(editData)
    }
  }, [editData, visible])

  const getTitle = () => {
    const title = isEditMode
      ? $t({ defaultMessage: 'Edit {serverType}' },
        { serverType: $t(serversDisplayText[serverType]) }
      )
      : $t({ defaultMessage: 'Add {serverType}' },
        { serverType: $t(serversDisplayText[serverType]) }
      )

    return title
  }

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const onSumbit = async (data:RadiusServer | TacacsServer | LocalUser) => {
    setLoading(true)
    try {
      if (!isEditMode) {
        const payload = {
          ...data,
          serverType
        }
        await addAAAServer({
          params,
          payload
        }).unwrap()
      } else {
        const payload = {
          ...editData,
          ...data
        }
        await updateAAAServer({
          params,
          payload
        }).unwrap()
      }
    }
    catch {
      showToast({
        type: 'error',
        content: 'An error occurred'
      })
    }
    setLoading(false)
    onClose()
    const clearButton = document?.querySelector('button[data-id="table-clear-btn"]')
    if (clearButton) {
      // @ts-ignore
      clearButton.click()
    }
  }

  const radiusForm = <Form layout='vertical'form={form} onFinish={onSumbit}>
    <Form.Item
      name='name'
      label={$t({ defaultMessage: 'Name' })}
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
      label={$t({ defaultMessage: 'IP Address' })}
      rules={[
        { required: true },
        { validator: (_, value) => serverIpAddressRegExp(value) }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='authPort'
      label={$t({ defaultMessage: 'Authentication port' })}
      rules={[
        { required: true },
        { validator: (_, value) => portRegExp(value) }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='acctPort'
      label={$t({ defaultMessage: 'Accounting port' })}
      rules={[
        { required: true },
        { validator: (_, value) => portRegExp(value) }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='secret'
      label={$t({ defaultMessage: 'Shared secret' })}
      rules={[
        { required: true },
        { max: 64 },
        { validator: (_, value) => excludeSpaceRegExp(value) },
        { validator: (_, value) => notAllDigitsRegExp(value) }
      ]}
      children={<Input.Password />}
    />
  </Form>

  const tacacsForm = <Form layout='vertical'form={form} onFinish={onSumbit}>
    <Form.Item
      name='name'
      label={$t({ defaultMessage: 'Name' })}
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
      label={$t({ defaultMessage: 'IP Address' })}
      rules={[
        { required: true },
        { validator: (_, value) => serverIpAddressRegExp(value) }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='authPort'
      label={$t({ defaultMessage: 'Authentication port' })}
      rules={[
        { required: true },
        { validator: (_, value) => portRegExp(value) }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='secret'
      label={$t({ defaultMessage: 'Shared secret' })}
      rules={[
        { required: true },
        { max: 64 },
        { validator: (_, value) => excludeSpaceRegExp(value) },
        { validator: (_, value) => notAllDigitsRegExp(value) }
      ]}
      children={<Input.Password />}
    />
    <Form.Item
      label='Purpose'
      name='purpose'
      initialValue={AAA_Purpose_Type.DEFAULT}
    >
      <Select>
        {
          Object.entries(AAA_Purpose_Type).map(([label, value]) => (
            <Option key={label} value={value}>{$t(purposeDisplayText[value])}</Option>
          ))
        }
      </Select>
    </Form.Item>
  </Form>

  const localUserForm = <Form layout='vertical' form={form} onFinish={onSumbit}>
    <Form.Item
      name='username'
      label={$t({ defaultMessage: 'Username' })}
      rules={[
        { required: true },
        { min: 2 },
        { max: 48 },
        { validator: (_, value) => excludeQuoteRegExp(value) },
        { validator: (_, value) => validateUsername(value) }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='password'
      label={<>
        { $t({ defaultMessage: 'Password' }) }
        <Tooltip
          title={<FormattedMessage
            {...LOCAL_USER_PASSWORD_TOOLTIP}
            values={{
              br: () => <br />,
              ul: (contents) => <ul>{contents}</ul>,
              li: (contents) => <li>{contents}</li>
            }}
          />}
          placement='bottom'
        >
          <QuestionMarkCircleOutlined />
        </Tooltip>
      </>}
      rules={[
        { required: true },
        { min: 8 },
        { max: 64 },
        { validator: (_, value) => excludeSpaceExclamationRegExp(value) },
        { validator: (_, value) => validateUserPassword(value) }
      ]}
      children={<Input.Password />}
    />
    <Form.Item
      label='Privilege'
      name='level'
      initialValue={AAA_Level_Type.READ_WRITE}
    >
      <Select>
        {
          Object.entries(AAA_Level_Type).map(([label, value]) => (
            <Option key={label} value={value}>{$t(levelDisplayText[value])}</Option>
          ))
        }
      </Select>
    </Form.Item>
  </Form>

  const getServerForm = (type: AAAServerTypeEnum) => {
    const formMap = {
      [AAAServerTypeEnum.RADIUS]: radiusForm,
      [AAAServerTypeEnum.TACACS]: tacacsForm,
      [AAAServerTypeEnum.LOCAL_USER]: localUserForm
    }
    return formMap[type]
  }

  const footer = [
    <Button loading={loading} key='saveBtn' onClick={() => form.submit()} type={'primary'} >
      {$t({ defaultMessage: 'Save' })}
    </Button>,
    <Button disabled={loading} key='cancelBtn' onClick={resetFields}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  ]

  return (
    <Drawer
      title={getTitle()}
      onBackClick={onClose}
      visible={visible}
      onClose={onClose}
      children={getServerForm(serverType)}
      footer={footer}
      destroyOnClose={resetField}
      width={'600px'}
    />
  )
}
