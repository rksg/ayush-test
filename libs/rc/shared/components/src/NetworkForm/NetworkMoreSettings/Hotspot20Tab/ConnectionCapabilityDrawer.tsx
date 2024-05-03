import { useEffect, useState } from 'react'

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

type ConnectionCapabilityDrawerProps = {
  visible?: boolean,
  editData?: Hotspot20ConnectionCapability,
  isValidCallBack?: (editMode?: boolean, capability?: Hotspot20ConnectionCapability) => boolean,
  resetCallBack?: () => void,
  modalCallBack?: (editMode?: boolean, capability?: Hotspot20ConnectionCapability) => void
}

const ConnectionCapabilityDrawer = (props: ConnectionCapabilityDrawerProps) => {
  const { $t } = useIntl()
  const { visible, editData, isValidCallBack, resetCallBack, modalCallBack } = props
  const [isValid, setIsValid] = useState<boolean>(true)

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

  const handleFieldsChange = () => {
    const hasErrors = form.getFieldsError().some(item => item.errors.length > 0)
    if (isValidCallBack) {
      setIsValid(
        !hasErrors &&
        isValidCallBack?.(!!editData, form.getFieldsValue() as Hotspot20ConnectionCapability))
    } else {
      setIsValid(!hasErrors)
    }
  }

  const content = <Form
    layout='vertical'
    form={form}
    onFieldsChange={handleFieldsChange}>
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
      required={true}
      children={<InputNumber min={0} max={254}/>}
    />
    <Form.Item
      name='port'
      label={$t({ defaultMessage: 'Port' })}
      required={true}
      children={<InputNumber min={0} max={65535}/>}
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
      destroyOnClose={true}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          showSaveButton={isValid}
          onCancel={handleCancel}
          onSave={async () => {
            try {
              await form.validateFields()
              modalCallBack?.(!!editData, form.getFieldsValue() as Hotspot20ConnectionCapability)
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