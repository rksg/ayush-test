import { useEffect, useState } from 'react'

import { Form, Input, Select } from 'antd'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { Drawer, PasswordInput, Tooltip }    from '@acx-ui/components'
import {
  useLazyGetTwiliosIncomingPhoneNumbersQuery,
  useUpdateNotificationSmsProviderMutation
} from '@acx-ui/rc/services'
import {
  SmsProviderType,
  NotificationSmsConfig,
  URLRegExp
} from '@acx-ui/rc/utils'

import { MessageMapping } from '../MessageMapping'

import { SmsProviderData, getProviderQueryParam } from '.'

interface SetupSmsProviderDrawerProps {
  visible: boolean
  isEditMode: boolean
  editData?: SmsProviderData
  setVisible: (visible: boolean) => void
  setSelected: (selectedType: SmsProviderType) => void
}

export const SetupSmsProviderDrawer = (props: SetupSmsProviderDrawerProps) => {
  const { $t } = useIntl()

  const params = useParams()
  const { visible, isEditMode, setVisible, editData, setSelected } = props
  const [providerType, setProviderType] = useState<SmsProviderType>()
  const [form] = Form.useForm()
  const [isValidTwiliosNumber, setIsValidTwiliosNumber] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>()

  const [updateSmsProvider] = useUpdateNotificationSmsProviderMutation()
  const [getTwiliosIncomingPhoneNumbers] = useLazyGetTwiliosIncomingPhoneNumbersQuery()

  useEffect(() => {
    if(isEditMode && editData?.providerType ) {
      setProviderType(editData?.providerType)
      form.setFieldValue('smsProvider', editData?.providerType)
    }
  }, [])

  useEffect(() => {
    form.validateFields(['phoneNumber'])
  }, [phoneNumbers])

  const twilioPhoneNumberList = phoneNumbers?.map((item) => ({
    label: item,
    value: item
  }))

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const handleGetTwiliosIncomingPhoneNumbers = async () => {
    try {
      await form.validateFields(['accountSid', 'authToken'])
      const payload: NotificationSmsConfig = {
        accountSid: form.getFieldValue('accountSid'),
        authToken: form.getFieldValue('authToken')
      }
      const phoneList = await getTwiliosIncomingPhoneNumbers({
        params: params, payload: payload })
      const myNumber = phoneList.data?.incommingPhoneNumbers ?? []
      setPhoneNumbers(myNumber)
      setIsValidTwiliosNumber(myNumber.length > 0)
      form.setFieldValue('phoneNumber', myNumber.length > 0 ? myNumber[0] : '')
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onSubmit = async () => {
    try {
      await form.validateFields()
      const providerData: NotificationSmsConfig =
        providerType === SmsProviderType.TWILIO
          ? {
            // twilio
            accountSid: form.getFieldValue('accountSid'),
            authToken: form.getFieldValue('authToken'),
            fromNumber: form.getFieldValue('phoneNumber')
          }
          : {
            // esendex, other
            apiKey: form.getFieldValue('apiKey'),
            url: providerType === SmsProviderType.ESENDEX
              ? undefined : form.getFieldValue('sendUrl')
          }

      await updateSmsProvider({
        params: { provider: getProviderQueryParam(providerType as SmsProviderType) },
        payload: providerData }).unwrap()
      setSelected(providerType as SmsProviderType)
      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const providerList = [
    {
      label: $t({ defaultMessage: 'Twilio' }),
      value: SmsProviderType.TWILIO
    },
    {
      label: $t({ defaultMessage: 'Esendex' }),
      value: SmsProviderType.ESENDEX
    },
    {
      label: $t({ defaultMessage: 'Other' }),
      value: SmsProviderType.OTHERS
    }
  ]

  const handleProviderChange = (value: string) => {
    setProviderType(value as SmsProviderType)
  }

  const formContent = <Form layout='vertical' form={form} >
    <Form.Item
      name='smsProvider'
      label={$t({ defaultMessage: 'SMS Provider' })}
      rules={[
        { required: true,
          message: $t({ defaultMessage:
            'Please select the provider' })
        }
      ]}
      initialValue={providerType}
    >
      <Select
        options={providerList}
        placeholder={$t({ defaultMessage: 'Select...' })}
        onChange={handleProviderChange}
      />
    </Form.Item>
    {providerType === SmsProviderType.TWILIO && <>
      <Form.Item
        name='accountSid'
        label={$t({ defaultMessage: 'Account SID' })}
        initialValue={editData?.providerData.accountSid ?? ''}
        rules={[
          { required: true },
          { validator: (_, value) => {
            if(value.length !== 34 || !value.startsWith('AC')) {
              return Promise.reject(
                `${$t({ defaultMessage: 'This is not a valid account SID' })} `
              )
            }
            return Promise.resolve()}
          }
        ]}
        children={<Input onBlur={handleGetTwiliosIncomingPhoneNumbers}/>}
      />
      <Form.Item
        name='authToken'
        label={$t({ defaultMessage: 'Auth Token' })}
        initialValue={editData?.providerData.authToken ?? ''}
        rules={[
          { required: true },
          { validator: (_, value) => {
            if(value.length !== 32 || !(/^[A-Za-z0-9]*$/.test(value))) {
              return Promise.reject(
                `${$t({ defaultMessage: 'This is not a valid Twilio auth token' })} `
              )
            }
            return Promise.resolve()}
          }
        ]}
        children={<PasswordInput onBlur={handleGetTwiliosIncomingPhoneNumbers}/>}
      />
      <Form.Item
        name='phoneNumber'
        label={$t({ defaultMessage: 'Phone Number' })}
        initialValue={editData?.providerData.fromNumber ?? ''}
        rules={[
          { validator: () => {
            const hasNumber = form.getFieldValue('phoneNumber')
            return !isValidTwiliosNumber && hasNumber === '' ? Promise.reject(
              `${$t(MessageMapping.received_invalid_twilios_number)}`
            ) : Promise.resolve()}
          }
        ]}
        children={<Select
          options={twilioPhoneNumberList}
          placeholder={$t({ defaultMessage: 'Select...' })}
          disabled={!isValidTwiliosNumber}
        />}
      />
    </>}
    {providerType === SmsProviderType.ESENDEX &&
      <Form.Item
        name='apiKey'
        label={$t({ defaultMessage: 'API Key' })}
        initialValue={editData?.providerData.apiKey ?? ''}
        rules={[
          { required: true }
        ]}
        children={<Input.TextArea rows={8} />}
      />}
    {providerType === SmsProviderType.OTHERS && <>
      <Form.Item
        name='apiKey'
        label={$t({ defaultMessage: 'API Key' })}
        initialValue={editData?.providerData.apiKey ?? ''}
        rules={[
          { required: true }
        ]}
        children={<Input.TextArea rows={8} />}
      />

      <Form.Item
        name='sendUrl'
        label={<>
          {$t({ defaultMessage: 'Send URL' })}
          <Tooltip.Question
            // eslint-disable-next-line max-len
            title={$t({ defaultMessage: 'The URL of this SMS provider. This should include variables for phone number, message, and API key.' })}
            placement='right'
          />
        </>}
        initialValue={editData?.providerData.url ?? ''}
        rules={[
          { required: true, message: $t({ defaultMessage: 'Please enter Send URL' }) },
          { validator: (_, value) => URLRegExp(value) }
        ]}
        children={<Input />}
      />
    </>}
  </Form>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Set SMS Provider' })}
      width={452}
      visible={visible}
      onClose={onClose}
      children={formContent}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Save' })
          }}
          onCancel={onClose}
          onSave={onSubmit}
        />
      }
    />
  )
}
