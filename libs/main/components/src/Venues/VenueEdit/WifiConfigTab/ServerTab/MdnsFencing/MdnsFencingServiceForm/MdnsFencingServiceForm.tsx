import { useContext } from 'react'

import { Divider, Form, FormInstance, Input, Select } from 'antd'
import { FormattedMessage, useIntl }                  from 'react-intl'

import { Tooltip }                                                                                        from '@acx-ui/components'
import { MdnsFencingService, BridgeServiceEnum, mdnsProxyRuleTypeLabelMapping, trailingNorLeadingSpaces } from '@acx-ui/rc/utils'

import { MdnsFencingServiceContext } from '../MdnsFencingServiceTable'

import { CustomMappingFieldset }      from './CustomMapping/CustomMappingFieldset'
import { WiredConnectionFieldset }    from './WiredConnection/WiredConnectionFieldset'
import { WirelessConnectionFieldset } from './WirelessConnection/WirelessConnectionFieldset'


interface MdnsFencingServicesFormProps {
  form: FormInstance<MdnsFencingService>
}

export default function MdnsFencingServiceForm (props: MdnsFencingServicesFormProps) {
  const { $t } = useIntl()
  const { Option } = Select
  const { form } = props

  const { currentServiceRef, otherServices } = useContext(MdnsFencingServiceContext)

  const serviceType = Form.useWatch('service', form)

  const usedServices = otherServices
    .map(s => s.service)
    .filter(s => s !== 'OTHER')

  const usedCustomServices = otherServices
    .filter(s => s.service === 'OTHER')
    .map(s => s.customServiceName)

  const customServiceNameDuplicationValidator = async () => {
    const customServiceName = form.getFieldValue('customServiceName')

    return (usedCustomServices && usedCustomServices.includes(customServiceName))
      ? Promise.reject($t({ defaultMessage: 'The Custom Service Name already exists' }))
      : Promise.resolve()
  }

  return (
    <Form
      form={form}
      layout='vertical'
      initialValues={{}}
      onFieldsChange={() => {
        const formData = form.getFieldsValue()
        if (currentServiceRef?.current) {
          Object.assign(currentServiceRef.current, formData)
        }
      }}
    >
      <Form.Item name='rowId' noStyle>
        <Input type='hidden' />
      </Form.Item>
      <Form.Item
        name='service'
        label={$t({ defaultMessage: 'Service' })}
        style={{ width: '280px' }}
        rules={[{ required: true }]}
      >
        <Select
          placeholder={$t({ defaultMessage: 'Select service...' })}
          getPopupContainer={trigger => trigger.parentElement}
          children={
            Object.keys(mdnsProxyRuleTypeLabelMapping).map((key) => {
              const isUsed = usedServices.includes(key)
              return (
                <Option key={key} value={key} disabled={isUsed}>
                  {$t(mdnsProxyRuleTypeLabelMapping[key as BridgeServiceEnum])}
                </Option>
              )
            })
          }
        />
      </Form.Item>
      { serviceType === BridgeServiceEnum.OTHER &&
      <Form.Item
        name='customServiceName'
        label={
          <>
            {$t({ defaultMessage: 'Custom Service Name' })}
            <Tooltip.Question
              placement='bottom'
              title={<FormattedMessage
                defaultMessage={`The name can only contain between 2 and 64 characters.
                  Only the following characters are allowed: 'a-z', 'A-Z', '0-9',
                  space and other special characters ({specialChars})
                `}
                values={{
                  specialChars: '!";#$%\'()*+,-./:;<=>?@[]^_{|}~*&\\`'
                }}
              />}
            />
          </>
        }
        style={{ width: '280px' }}
        rules={[
          { required: true },
          { min: 2 },
          { max: 32 },
          { validator: () => customServiceNameDuplicationValidator() },
          { validator: (_, value) => trailingNorLeadingSpaces(value) }
        ]}
        children={<Input />}
      />
      }
      <Form.Item
        name='description'
        label={$t({ defaultMessage: 'Description' })}
        style={{ width: '280px' }}
        initialValue={''}
        children={<Input.TextArea rows={3} maxLength={64} />}
      />
      <Divider />
      <WirelessConnectionFieldset />
      <WiredConnectionFieldset />
      <CustomMappingFieldset />
    </Form>
  )
}
