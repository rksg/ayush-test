import { useEffect, useState } from 'react'

import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { Drawer }                              from '@acx-ui/components'
import { useUpdateRadiusClientConfigMutation } from '@acx-ui/rc/services'
import { ClientConfig }                        from '@acx-ui/rc/utils'

interface IpAddressDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  editMode?: boolean
  editIpAddress?: string
  clientConfig: ClientConfig
}

export function IpAddressDrawer (props: IpAddressDrawerProps) {
  const { $t } = useIntl()
  const { visible, setVisible, editMode = false, clientConfig, editIpAddress } = props
  const [form] = Form.useForm()
  const [resetField, setResetField] = useState(false)
  const [updateConfig] = useUpdateRadiusClientConfigMutation()

  const resetFields = () => {
    setResetField(true)
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

  const ipAddressRegExp = (value: string) =>{
    // eslint-disable-next-line max-len
    const REG = new RegExp(/((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/)
    if (value && !REG.test(value)) {
      return Promise.reject($t({ defaultMessage: 'Invalid IP address format' }))
    }
    return Promise.resolve()
  }

  const content = <Form layout='vertical' form={form}>
    <Row>
      <Col span={12}>
        <Form.Item
          name='singleIpAddress'
          label={$t({ defaultMessage: 'IP Address' })}
          rules={[
            { required: true },
            { validator: (_, value) => ipAddressRegExp(value) }
          ]}
          validateFirst
          hasFeedback
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
      footer={
        <Drawer.FormFooter
          showAddAnother={true}
          buttonLabel={({
            save: $t({ defaultMessage: 'Apply' }),
            addAnother: $t({ defaultMessage: 'Add Another IP Address' })
          })}
          onCancel={resetFields}
          onSave={async (addAnotherRuleChecked: boolean) => {
            try {
              await form.validateFields()
              const ipAddress = form.getFieldValue('singleIpAddress')
              if(editMode) {
                await updateConfig({ payload: {
                  // eslint-disable-next-line max-len
                  ipAddress: clientConfig.ipAddress?.filter((e) => e !== editIpAddress).concat(ipAddress)
                } }).unwrap()
              }else {
                await updateConfig({ payload: {
                  // eslint-disable-next-line max-len
                  ipAddress: clientConfig.ipAddress ? clientConfig.ipAddress?.concat(ipAddress) : ipAddress
                } }).unwrap()
              }
              if (!addAnotherRuleChecked) {
                onClose()
              } else {
                form.resetFields()
              }
            } catch (error) {
              console.log(error) // eslint-disable-line no-console
            }
          }}
        />
      }
      destroyOnClose={resetField}
      width={400}
    />
  )
}
