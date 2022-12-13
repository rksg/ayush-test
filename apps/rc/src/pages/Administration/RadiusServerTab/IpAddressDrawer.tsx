import { useEffect, useState } from 'react'

import { Col, Form, Input, RadioChangeEvent, Row, Space } from 'antd'
import { Radio }                                          from 'antd'
import Checkbox, { CheckboxChangeEvent }                  from 'antd/lib/checkbox'
import { useIntl }                                        from 'react-intl'

import { Button, Drawer, showToast }           from '@acx-ui/components'
import { useUpdateRadiusClientConfigMutation } from '@acx-ui/rc/services'
import { ClientConfig }                        from '@acx-ui/rc/utils'

interface IpAddressDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  editMode: boolean
  editIpAddress?: string
  clientConfig: ClientConfig
}

interface ipAddressForm {
  singleIpAddress : string
}

export function IpAddressDrawer (props: IpAddressDrawerProps) {
  const { $t } = useIntl()
  const { visible, setVisible, editMode, clientConfig, editIpAddress } = props
  const [form] = Form.useForm()
  const [addType, setAddType ] = useState(1)
  const [resetField, setResetField] = useState(false)
  const [updateConfig, updateConfigState] = useUpdateRadiusClientConfigMutation()
  const [checked, setChecked] = useState(false)

  const resetFields = () => {
    setResetField(true)
    setChecked(false)
    onClose()
  }

  useEffect(()=>{
    if (editIpAddress !== null && visible) {
      form.setFieldValue('singleIpAddress', editIpAddress)
    }
  }, [editIpAddress, visible])

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const onSubmit = async (data: ipAddressForm) => {
    try {
      let payload
      if(editMode) {
        payload = {
          // eslint-disable-next-line max-len
          ipAddress: clientConfig.ipAddress?.filter((e) => e !== editIpAddress).concat(data.singleIpAddress)
        }
      }else {
        payload = {
          ipAddress: clientConfig.ipAddress?.concat(data.singleIpAddress)
        }
      }
      await updateConfig({ payload }).unwrap()
      form.resetFields()
      if (!checked) {
        onClose()
      }
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const footer = [
    <div key='footerAddAnother'>
      {!editMode &&
        < Checkbox
          onChange={(e: CheckboxChangeEvent) => setChecked(e.target.checked)}
          checked={checked}
          children='Add Another IP Address'
        />
      }
    </div>,
    <div key='footer'>
      <Button key='cancel' onClick={resetFields} >
        { $t({ defaultMessage: 'Cancel' }) }
      </Button>
      <Button
        key='submit'
        type={'secondary'}
        onClick={() => form.submit()}
        loading={updateConfigState.isLoading}>
        Apply
      </Button>
    </div>
  ]

  const onRadioChange = (e: RadioChangeEvent) => {
    setAddType(e.target.value)
  }

  const ipAddressRegExp = (value: string) =>{
    // eslint-disable-next-line max-len
    const REG = new RegExp(/((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/)
    if (value && !REG.test(value)) {
      return Promise.reject($t({ defaultMessage: 'Invalid IP address format' }))
    }
    return Promise.resolve()
  }

  const content = <Form layout='vertical' form={form} onFinish={onSubmit}>
    <Form.Item name='addressType' initialValue={1}>
      <Radio.Group value={addType} onChange={onRadioChange}>
        <Space direction='vertical'>
          <Radio value={1}>{$t({ defaultMessage: 'Single IP Address' })}</Radio>
          <Radio value={2} disabled>{$t({ defaultMessage: 'IP Address Range' })}</Radio>
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
              { required: true },
              { validator: (_, value) => ipAddressRegExp(value) }
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
      // eslint-disable-next-line max-len
      title={editMode ? $t({ defaultMessage: 'Edit Incoming IP Address' }): $t({ defaultMessage: 'Add Incoming IP Address' })}
      visible={visible}
      onClose={() => setVisible(false)}
      children={content}
      footer={footer}
      destroyOnClose={resetField}
      width={500}
    />
  )
}
