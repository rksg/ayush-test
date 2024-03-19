import { Form, FormInstance, Input, Select } from 'antd'
import { useIntl }                           from 'react-intl'

import { Hotspot20ConnectionCapabilityStatusEnum, portRegExp } from '@acx-ui/rc/utils'

interface ConnectionCapabilityContentProps {
    drawerForm: FormInstance
}

const ConnectionCapabilityContent = (props: ConnectionCapabilityContentProps) => {
  const { $t } = useIntl()
  const { drawerForm } = props

  const statusOptions = Object.keys(Hotspot20ConnectionCapabilityStatusEnum).map((key => {
    return (
      { value: key,
        label: Hotspot20ConnectionCapabilityStatusEnum[
          key as keyof typeof Hotspot20ConnectionCapabilityStatusEnum] }
    )
  }))

  return <Form layout='vertical' form={drawerForm}>
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
      initialValue={''}
      rules={[
        { required: true },
        { min: 0 },
        { max: 254 }
      ]}
      children={<Input type='number' />}
    />
    <Form.Item
      name='port'
      label={$t({ defaultMessage: 'Port' })}
      initialValue={''}
      rules={[
        { required: true },
        { min: 0 },
        { max: 65535 },
        { validator: (_, value) => portRegExp(value) }
      ]}
      children={<Input type='number'/>}
    />
    <Form.Item
      name='status'
      label={$t({ defaultMessage: 'Status' })}
      rules={[
        { required: true }
      ]}
      children={
        <Select
          onChange={(value) => drawerForm.setFieldValue('status', value)}
          options={statusOptions}
        />
      }
    />
  </Form>
}

export default ConnectionCapabilityContent