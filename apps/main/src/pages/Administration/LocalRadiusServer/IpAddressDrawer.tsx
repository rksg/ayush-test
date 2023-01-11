import { useEffect, useState } from 'react'

import { Col, Form, Input, Row }         from 'antd'
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }                       from 'react-intl'

import { Button, Drawer, showToast }           from '@acx-ui/components'
import { useUpdateRadiusClientConfigMutation } from '@acx-ui/rc/services'
import { ClientConfig }                        from '@acx-ui/rc/utils'

interface IpAddressDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  editMode?: boolean
  editIpAddress?: string
  clientConfig: ClientConfig
}

interface ipAddressForm {
  singleIpAddress : string
}

interface httpErrorResponse {
  status: number
}

export function IpAddressDrawer (props: IpAddressDrawerProps) {
  const { $t } = useIntl()
  const { visible, setVisible, editMode = false, clientConfig, editIpAddress } = props
  const [form] = Form.useForm()
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
          // eslint-disable-next-line max-len
          ipAddress: clientConfig.ipAddress ? clientConfig.ipAddress?.concat(data.singleIpAddress) : data.singleIpAddress
        }
      }
      await updateConfig({ payload }).unwrap()
      form.resetFields()
      if (!checked) {
        onClose()
      }
    } catch(error) {
      const errorResponse = error as httpErrorResponse
      let message
      if(errorResponse.status === 409) {
        message = $t({ defaultMessage: 'IP Address already exists' })
      }
      else{
        message = $t({ defaultMessage: 'An error occurred' })
      }
      showToast({
        type: 'error',
        content: message
      })
    }
  }

  const footer = [
    <div key='footerAddAnother'>
      {!editMode &&
        < Checkbox
          onChange={(e: CheckboxChangeEvent) => setChecked(e.target.checked)}
          checked={checked}
          children={$t({ defaultMessage: 'Add Another IP Address' })}
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

  const ipAddressRegExp = (value: string) =>{
    // eslint-disable-next-line max-len
    const REG = new RegExp(/((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/)
    if (value && !REG.test(value)) {
      return Promise.reject($t({ defaultMessage: 'Invalid IP address format' }))
    }
    return Promise.resolve()
  }

  const content = <Form layout='vertical' form={form} onFinish={onSubmit}>
    <Row>
      <Col span={12}>
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
      width={400}
    />
  )
}
