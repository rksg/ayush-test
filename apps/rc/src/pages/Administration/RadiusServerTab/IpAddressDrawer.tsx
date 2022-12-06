import { useState } from 'react'

import { Col, Form, Input, RadioChangeEvent, Row, Space } from 'antd'
import { Radio }                                          from 'antd'
import { useIntl }                                        from 'react-intl'

import { Drawer, showToast }                   from '@acx-ui/components'
import { useUpdateRadiusClientConfigMutation } from '@acx-ui/rc/services'

interface IpAddressDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  editMode: boolean
}

export function IpAddressDrawer (props: IpAddressDrawerProps) {
  const { $t } = useIntl()
  const { visible, setVisible, editMode } = props
  const [form] = Form.useForm()
  const [addType, setAddType ] = useState(1)
  const [resetField, setResetField] = useState(false)
  const [updateConfig] = useUpdateRadiusClientConfigMutation()

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ipAddress: [data.singleIpAddress]
      }
      await updateConfig(
        {
          payload
        }).unwrap()
      form.resetFields()
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const footer = (
    <Drawer.FormFooter
      showAddAnother={true}
      onCancel={resetFields}
      buttonLabel={({
        addAnother: $t({ defaultMessage: 'Add Another Address' }),
        save: editMode ? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })
      })}
      onSave={async (addAnotherRuleChecked: boolean) => {
        form.submit()
        // if (!addAnotherRuleChecked) {
        //   onClose()
        // }
      }}
    />
  )

  const onRadioChange = (e: RadioChangeEvent) => {
    setAddType(e.target.value)
  }

  const content = <Form layout='vertical' form={form} onFinish={onSubmit}>
    <Form.Item name='addressType' initialValue={1}>
      <Radio.Group value={addType} onChange={onRadioChange}>
        <Space direction='vertical'>
          <Radio value={1}>{$t({ defaultMessage: 'Single IP Address' })}</Radio>
          <Radio value={2}>{$t({ defaultMessage: 'IP Address Range' })}</Radio>
        </Space>
      </Radio.Group>
    </Form.Item>
    {addType === 1 &&
      <Row>
        <Col span={8}>
          <Form.Item
            name='singleIpAddress'
            label='IP Address'
            rules={[
              { required: true, message: $t({ defaultMessage: 'Please enter ip address' }) }
            ]}
            children={<Input/>}/>
        </Col>
      </Row>
    }
    {addType === 2 &&
      <Row>
        <Col span={16}>
          <Space>
            <Form.Item
              name='ipAddressRangeStart'
              label='Start IP Address'
              rules={[
                { required: true, message: $t({ defaultMessage: 'Please enter start IP address' }) }
              ]}
              children={<Input/>}/>
            <Form.Item
              name='ipAddressRangeEnd'
              label='End IP Address'
              rules={[
                { required: true, message: $t({ defaultMessage: 'Please enter end IP address' }) }
              ]}
              children={<Input/>}/>
          </Space>
        </Col>
      </Row>
    }
  </Form>

  return (
    <Drawer
      //eslint-disable-next-line max-len
      title={$t({ defaultMessage: 'Add Incoming IP Address' })}
      visible={visible}
      onClose={() => setVisible(false)}
      children={content}
      footer={footer}
      destroyOnClose={resetField}
      width={500}
    />
  )
}
