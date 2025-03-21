
import { useEffect } from 'react'

import { Form, Input, Radio, Space } from 'antd'
import { useWatch }                  from 'antd/lib/form/Form'
import { useIntl }                   from 'react-intl'

import { Drawer, Select } from '@acx-ui/components'
import { MacAclRule }     from '@acx-ui/rc/utils'

interface SwitchAccessControlDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  data?: MacAclRule,
  handleSaveRule: (data: MacAclRule) => void
}

export const SwitchAccessControlDrawer = (props: SwitchAccessControlDrawerProps) => {
  const { Option } = Select
  const { $t } = useIntl()
  const { visible, setVisible, data, handleSaveRule } = props
  const [form] = Form.useForm()

  useEffect(() => {
    if(visible) {
      form.resetFields()
      if(data && Object.values(data).length > 0) {
        form.setFieldsValue(data)
        if(data?.sourceAddress === 'any'){
          form.setFieldValue('sourceMacType', 'any')
          form.setFieldValue('sourceAddress', '')
        }else{
          form.setFieldValue('sourceMacType', 'sourceMac')
        }
        if(data?.destinationAddress === 'any'){
          form.setFieldValue('destinationMacType', 'any')
          form.setFieldValue('destinationAddress', '')
        }else{
          form.setFieldValue('destinationMacType', 'destinationMac')
        }
      }
    }
  }, [visible, form, data])

  const {
    sourceMacType,
    destinationMacType
  } = (useWatch([], form) ?? {})

  const isAnySrcAddress = sourceMacType === 'any'
  const isAnyDestAddress = destinationMacType === 'any'

  const getTitle = () => {
    return $t({ defaultMessage: '{operation} Route' },
      { operation: data ? $t({ defaultMessage: 'Edit' }) :
        $t({ defaultMessage: 'Add' }) })
  }

  const handleClose = () => {
    setVisible(false)
  }

  const handleSave = async () => {
    form.validateFields().then(() => {
      form.submit()
      let {
        id,
        key,
        action,
        sourceMacType,
        destinationMacType,
        sourceAddress,
        sourceMask,
        destinationAddress,
        destinationMask
      } = form.getFieldsValue()

      if(sourceMacType === 'any'){
        sourceAddress = 'any'
        sourceMask = ''
      }

      if(destinationMacType === 'any'){
        destinationAddress = 'any'
        destinationMask = ''
      }

      const payload = {
        id, key, action, sourceAddress, sourceMask, destinationAddress, destinationMask }
      if(data && Object.values(data).length > 0){
        handleSaveRule(payload)
      }else{
        handleSaveRule({ ...payload, key: Date.now().toString() })
      }
      handleClose()
    }).catch(() => {
      //do nothing...
    })
  }

  // const handleFinish = (formData: MacAclRule) => {
  //   const payload = formData
  //   console.log(payload)

  // const params = {
  //   tenantId,
  //   switchId,
  //   staticRouteId: formData.id
  // }
  // if(data) {
  //   updateSwitchStaticRoute({ params, payload, enableRbac: isSwitchRbacEnabled }).unwrap()
  //     .catch((error) => {
  //       console.log(error) // eslint-disable-line no-console
  //     })
  // } else {
  //   addSwitchStaticRoute({ params, payload, enableRbac: isSwitchRbacEnabled }).unwrap()
  //     .catch((error) => {
  //       console.log(error) // eslint-disable-line no-console
  //     })
  // }
  // form.resetFields()
  // }

  const drawerContent = <Form layout='vertical' form={form}>
    <Form.Item
      name='action'
      initialValue={'permit'}
      label={$t({ defaultMessage: 'Action' })}
    >
      <Select>
        <Option value={'permit'}>
          {$t({ defaultMessage: 'Permit' })}
        </Option>
        <Option value={'deny'}>
          {$t({ defaultMessage: 'Deny' })}
        </Option>
      </Select>
    </Form.Item>
    <Form.Item
      name='sourceMacType'
      initialValue={'any'}
      label={$t({ defaultMessage: 'Source MAC' })}
      rules={[{
        required: true
      }]}
      children={
        <Radio.Group>
          <Space direction='vertical'>
            <Radio
              value={'any'}
            >
              {$t({ defaultMessage: 'Any' })}
            </Radio>
            <Radio
              value={'sourceMac'}
            >
              <Form.Item
                name='sourceAddress'
                label={$t({ defaultMessage: 'Source Mac Address' })}
                rules={[
                  { required: !isAnySrcAddress }
                ]}
                children={<Input disabled={isAnySrcAddress} style={{ width: '300px' }} />}
                validateFirst
              />
              <Form.Item
                name='sourceMask'
                label={$t({ defaultMessage: 'Mask' })}
                rules={[
                  { required: !isAnySrcAddress }
                ]}
                children={<Input disabled={isAnySrcAddress} />}
                validateFirst
              />
            </Radio>
          </Space>
        </Radio.Group>
      }
    />
    <Form.Item
      name='destinationMacType'
      initialValue={'any'}
      label={$t({ defaultMessage: 'Destination MAC' })}
      rules={[{
        required: true
      }]}
      children={
        <Radio.Group>
          <Space direction='vertical'>
            <Radio
              value={'any'}
            >
              {$t({ defaultMessage: 'Any' })}
            </Radio>
            <Radio
              value={'destinationMac'}
            >
              <Form.Item
                name='destinationAddress'
                label={$t({ defaultMessage: 'Destination MAC Address' })}
                rules={[
                  { required: !isAnyDestAddress }
                ]}
                children={<Input disabled={isAnyDestAddress} style={{ width: '300px' }} />}
                validateFirst
              />
              <Form.Item
                name='destinationMask'
                label={$t({ defaultMessage: 'Destination Mask' })}
                rules={[
                  { required: !isAnyDestAddress }
                ]}
                children={<Input disabled={isAnyDestAddress} />}
                validateFirst
              />
            </Radio>
          </Space>
        </Radio.Group>
      }
    />
    <Form.Item name='key' />
  </Form>

  const footer = (
    <Drawer.FormFooter
      buttonLabel={{
        save: !!data ? $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' })
      }}
      onCancel={handleClose}
      onSave={handleSave}
    />
  )

  return (
    <Drawer
      title={getTitle()}
      visible={visible}
      onClose={handleClose}
      children={drawerContent}
      footer={footer}
      width={400}
    />
  )
}
