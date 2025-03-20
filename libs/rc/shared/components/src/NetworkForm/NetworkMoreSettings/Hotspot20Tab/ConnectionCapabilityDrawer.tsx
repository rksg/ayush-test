import { useEffect } from 'react'

import {
  Form,
  Input,
  InputNumber,
  Select
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Drawer }                            from '@acx-ui/components'
import {
  Hotspot20ConnectionCapability,
  Hotspot20ConnectionCapabilityStatusEnum
} from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'

type ConnectionCapabilityDrawerProps = {
  visible?: boolean,
  index?: number,
  editData?: Hotspot20ConnectionCapability,
  isValidCallBack: (index: number, protocolNumber: number, port: number) => boolean,
  resetCallBack?: () => void,
  modalCallBack?: (
    idx?: number, capability?: Hotspot20ConnectionCapability) => void
}

const ConnectionCapabilityDrawer = (props: ConnectionCapabilityDrawerProps) => {
  const { $t } = useIntl()
  const { visible, index, editData, isValidCallBack, resetCallBack, modalCallBack } = props

  const [form] = Form.useForm()

  const statusOptions = Object.keys(Hotspot20ConnectionCapabilityStatusEnum).map((key => {
    return (
      { value: key,
        label: `${_.startCase(_.toLower(Hotspot20ConnectionCapabilityStatusEnum[
          key as keyof typeof Hotspot20ConnectionCapabilityStatusEnum]))}` }
    )
  }))

  useEffect(() => {
    if (form && editData) {
      form.setFieldsValue(editData)
    }
  }, [form, editData])

  const validateCapabilityPort = (protocolNumber: number, port: number, errMsg: string) => {
    return isValidCallBack(index!, protocolNumber, port) ? Promise.resolve() :
      Promise.reject(
        `${$t({ defaultMessage: '{errMsg}' }, { errMsg })}`
      )
  }

  const content = <Form
    layout='vertical'
    form={form}>
    <Form.Item
      name='protocol'
      label={$t({ defaultMessage: 'Protocol' })}
      initialValue={''}
      validateFirst
      rules={[
        { required: true },
        { min: 1 },
        { max: 32 }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='protocolNumber'
      label={$t({ defaultMessage: 'Protocol Number' })}
      children={<InputNumber />}
      rules={[
        { required: true,
          type: 'number',
          min: 0,
          max: 254,
          message: $t({ defaultMessage: 'Please enter a valid protocol number between 0 and 254' })
        },
        { validator: (_, value) =>
          validateCapabilityPort(
            value,
            form.getFieldValue('port'),
            // eslint-disable-next-line max-len
            'The protocol number you have entered, in combination with the specified port number, already exists. Please enter a different protocol number.')
        }
      ]}
    />
    <Form.Item
      name='port'
      label={$t({ defaultMessage: 'Port' })}
      children={<InputNumber />}
      rules={[
        { required: true,
          type: 'number',
          min: 0,
          max: 65535,
          message: $t(validationMessages.portRegExp)
        },
        { validator: (_, value) =>
          validateCapabilityPort(
            form.getFieldValue('protocolNumber'),
            value,
            // eslint-disable-next-line max-len
            'The port number you have entered, with the specified protocol number, already exists. Please enter a different port number.')
        }
      ]}
    />
    <Form.Item
      name='status'
      label={$t({ defaultMessage: 'Status' })}
      rules={[
        { required: true }
      ]}
      children={
        <Select
          onChange={(value) => form.setFieldValue('status', value)}
          options={statusOptions}
        />
      }
    />
  </Form>

  const handleCancel = () => {
    form.resetFields()
    resetCallBack?.()
  }

  return (
    <Drawer
      title={!editData
        ? $t({ defaultMessage: 'Add Protocol' })
        : $t({ defaultMessage: 'Edit Protocol' })
      }
      visible={visible}
      width={430}
      push={false}
      children={content}
      onClose={handleCancel}
      destroyOnClose={true}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          onCancel={handleCancel}
          onSave={async () => {
            try {
              await form.validateFields()
              modalCallBack?.(index, form.getFieldsValue() as Hotspot20ConnectionCapability)
              form.resetFields()
            } catch (error) {
              console.log(error) // eslint-disable-line no-console
            }
          }}
        />
      }
    />
  )
}

export default ConnectionCapabilityDrawer