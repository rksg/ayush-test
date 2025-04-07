
import { useEffect } from 'react'

import { Form, Input, Radio, Space } from 'antd'
import { useWatch }                  from 'antd/lib/form/Form'
import { useIntl }                   from 'react-intl'

import { Drawer, Select }                     from '@acx-ui/components'
import { MacAclRule, MacAddressFilterRegExp } from '@acx-ui/rc/utils'

interface SwitchAccessControlDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  data?: MacAclRule,
  dataSource?: MacAclRule[],
  handleSaveRule: (data: MacAclRule) => void
}

export const SwitchAccessControlDrawer = (props: SwitchAccessControlDrawerProps) => {
  const { Option } = Select
  const { $t } = useIntl()
  const { visible, setVisible, data, dataSource, handleSaveRule } = props
  const [form] = Form.useForm()
  const editMode = data && Object.values(data).length > 0

  useEffect(() => {
    if(visible) {
      form.resetFields()
      if(editMode) {
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

  const validateMacAndSetMask = (value: string, isAny: boolean, maskField: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (_: any, value: string) => {
      if (!value || isAny) return Promise.resolve()

      await MacAddressFilterRegExp(value)

      let mask = form.getFieldValue(maskField)
      if(!mask){
        if (value.includes(':')) {
          mask = 'ff:ff:ff:ff:ff:ff'
        } else if (value.includes('-')) {
          mask = 'ff-ff-ff-ff-ff-ff'
        } else if (value.includes('.')) {
          mask = 'ffff.ffff.ffff'
        } else {
          mask = 'ffffffffffff'
        }
        form.setFieldValue(maskField, mask)
      }

      return Promise.resolve()
    }
  }

  const getTitle = () => {
    return $t({ defaultMessage: '{operation} Rule' },
      { operation: editMode ? $t({ defaultMessage: 'Edit' }) :
        $t({ defaultMessage: 'Add' }) })
  }

  const handleClose = () => {
    setVisible(false)
  }

  const handleSave = async () => {
    form.validateFields().then(() => {
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
        id,
        key,
        action,
        sourceAddress: sourceAddress?.toLowerCase(),
        sourceMask: sourceMask ? sourceMask.toLowerCase() : '',
        destinationAddress: destinationAddress?.toLowerCase(),
        destinationMask: destinationMask ? destinationMask.toLowerCase() : ''
      }

      const isDuplicate = dataSource?.some(rule =>
        rule.sourceAddress?.toLowerCase() === payload.sourceAddress &&
            rule.destinationAddress?.toLowerCase() === payload.destinationAddress &&
            (editMode ? rule.key !== payload.key : true)
      )

      if (isDuplicate) {
        form.setFields([{
          name: 'action',
          errors: [$t({ defaultMessage: 'Rule is duplicated' })]
        }])
        return
      }

      form.submit()

      if(editMode){
        handleSaveRule(payload)
      }else{
        handleSaveRule({ ...payload, key: Date.now().toString() })
      }
      handleClose()
    }).catch(() => {
      // eslint-disable-next-line no-console
      console.log('error')})
  }

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
              data-testid='sourceAny'
              value={'any'}
            >
              {$t({ defaultMessage: 'Any' })}
            </Radio>
            <Radio
              data-testid='sourceMac'
              value={'sourceMac'}
            >
              <Form.Item
                name='sourceAddress'
                label={$t({ defaultMessage: 'Source Mac Address' })}
                rules={[
                  { required: !isAnySrcAddress },
                  { validator: validateMacAndSetMask(
                    'sourceAddress', isAnySrcAddress, 'sourceMask') }
                ]}
                children={<Input
                  data-testid='sourceAddress'
                  disabled={isAnySrcAddress}
                  placeholder={'HHHH.HHHH.HHHH'}
                  style={{ width: '300px' }}
                />}
                validateFirst
              />
              <Form.Item
                name='sourceMask'
                label={$t({ defaultMessage: 'Mask' })}
                rules={[
                  { required: !isAnySrcAddress },
                  { validator: (_, value) => MacAddressFilterRegExp(value) }
                ]}
                children={<Input
                  data-testid='sourceMask'
                  placeholder={'HHHH.HHHH.HHHH'}
                  disabled={isAnySrcAddress} />}
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
              data-testid='destinationAny'
              value={'any'}
            >
              {$t({ defaultMessage: 'Any' })}
            </Radio>
            <Radio
              data-testid='destinationMac'
              value={'destinationMac'}
            >
              <Form.Item
                name='destinationAddress'
                label={$t({ defaultMessage: 'Destination MAC Address' })}
                rules={[
                  { required: !isAnyDestAddress },
                  { validator: validateMacAndSetMask(
                    'destinationAddress', isAnyDestAddress, 'destinationMask') }
                ]}
                children={<Input
                  data-testid='destinationAddress'
                  disabled={isAnyDestAddress}
                  placeholder={'HHHH.HHHH.HHHH'}
                  style={{ width: '300px' }}
                />}
                validateFirst
              />
              <Form.Item
                name='destinationMask'
                label={$t({ defaultMessage: 'Destination Mask' })}
                rules={[
                  { required: !isAnyDestAddress },
                  { validator: (_, value) => MacAddressFilterRegExp(value) }
                ]}
                children={<Input
                  data-testid='destinationMask'
                  placeholder={'HHHH.HHHH.HHHH'}
                  disabled={isAnyDestAddress} />}
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
        save: data && Object.values(data).length > 0 ?
          $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' })
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
