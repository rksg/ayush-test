import { useEffect, useState } from 'react'

import { Form, Input, Radio, RadioChangeEvent, Select, Space } from 'antd'
import { useIntl }                                             from 'react-intl'
import { useParams }                                           from 'react-router-dom'

import { Drawer, PasswordInput, Tooltip }    from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import {
  useLazyGetTwiliosIncomingPhoneNumbersQuery,
  useLazyGetTwiliosMessagingServicesQuery,
  useUpdateNotificationSmsProviderMutation
} from '@acx-ui/rc/services'
import {
  SmsProviderType,
  NotificationSmsConfig,
  URLRegExp
} from '@acx-ui/rc/utils'

import { SmsProviderData, getProviderQueryParam, isTwilioFromNumber } from '.'

interface SetupSmsProviderDrawerProps {
  visible: boolean
  isEditMode: boolean
  editData?: SmsProviderData
  setVisible: (visible: boolean) => void
  setSelected: (selectedType: SmsProviderType) => void
}

enum MessageMethod {
  MessagingService,
  PhoneNumber
}

interface ErrorsResult<T> {
  data: T;
  status: number;
}

interface ErrorDetails {
  code: string,
  message?: string,
  errorMessage?: string
}

export const SetupSmsProviderDrawer = (props: SetupSmsProviderDrawerProps) => {
  const { $t } = useIntl()

  const params = useParams()
  const { visible, isEditMode, setVisible, editData, setSelected } = props
  const [providerType, setProviderType] = useState<SmsProviderType>()
  const [form] = Form.useForm()
  const [isValidTwiliosNumber, setIsValidTwiliosNumber] = useState(false)
  const [isValidTwiliosService, setIsValidTwiliosService] = useState(false)
  const [isValidAuthToken, setIsValidAuthToken] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>()
  const [messagingServices, setMessagingServices] = useState<string[]>()
  const [messageMethod, setMessageMethod] = useState<MessageMethod>()
  const [twilioEditMethod, setTwilioEditMethod] = useState<MessageMethod>()
  const [phoneNumberErrorMessage, setPhoneNumberErrorMessage] = useState<string>()
  const [messagingServiceErrorMessage, setMessagingServiceErrorMessage] = useState<string>()
  const isSmsMessagingServiceEnabled = useIsSplitOn(Features.NUVO_SMS_MESSAGING_SERVICE_TOGGLE)

  const [updateSmsProvider] = useUpdateNotificationSmsProviderMutation()
  const [getTwiliosIncomingPhoneNumbers] = useLazyGetTwiliosIncomingPhoneNumbersQuery()
  const [getTwiliosIncomingServices] = useLazyGetTwiliosMessagingServicesQuery()

  useEffect(() => {
    if(isEditMode && editData?.providerType ) {
      setProviderType(editData?.providerType)
      form.setFieldValue('smsProvider', editData?.providerType)
    }
  }, [])

  useEffect(() => {
    if(isEditMode && editData?.providerType === SmsProviderType.TWILIO) {
      form.validateFields(['authToken'])
      if (isTwilioFromNumber(editData.providerData.fromNumber ?? '')) {
        setMessageMethod(MessageMethod.PhoneNumber)
        setTwilioEditMethod(MessageMethod.PhoneNumber)
        handleGetTwiliosIncomingPhoneNumbers()
      } else {
        setMessageMethod(MessageMethod.MessagingService)
        setTwilioEditMethod(MessageMethod.MessagingService)
        handleGetTwiliosIncomingServices()
      }
    }
  }, [providerType])

  useEffect(() => {
    form.validateFields(['phoneNumber', 'messagingService'])
  }, [phoneNumbers, messagingServices])

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const handleGetTwiliosIncomingPhoneNumbers = async () => {
    try {
      if (providerType === SmsProviderType.TWILIO) {
        await form.validateFields(['accountSid', 'authToken'])
        const payload: NotificationSmsConfig = {
          accountSid: form.getFieldValue('accountSid'),
          authToken: form.getFieldValue('authToken')
        }
        const phoneList = await getTwiliosIncomingPhoneNumbers({
          params: params, payload: payload })
        const myNumber = phoneList.data?.incommingPhoneNumbers ?? []
        if (phoneList.error) {
          const error = phoneList.error as ErrorsResult<ErrorDetails>
          setPhoneNumberErrorMessage(error.data.errorMessage ?? '')
        }
        setPhoneNumbers(myNumber)
        setIsValidTwiliosNumber(myNumber.length > 0)
        form.setFieldValue('phoneNumber', myNumber.length > 0
          ? (isEditMode && twilioEditMethod === MessageMethod.PhoneNumber
          && myNumber.includes(editData?.providerData.fromNumber ?? ''))
            ? editData?.providerData.fromNumber ?? myNumber[0]
            : myNumber[0]
          : '')
        form.validateFields(['phoneNumber'])
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleGetTwiliosIncomingServices = async () => {
    try {
      if (providerType === SmsProviderType.TWILIO) {
        await form.validateFields(['accountSid', 'authToken'])
        const payload: NotificationSmsConfig = {
          accountSid: form.getFieldValue('accountSid'),
          authToken: form.getFieldValue('authToken')
        }
        const servicesList = await getTwiliosIncomingServices({
          params: params, payload: payload })
        const myServices = servicesList.data?.messagingServiceResources ?? []
        if (servicesList.error) {
          const error = servicesList.error as ErrorsResult<ErrorDetails>
          setMessagingServiceErrorMessage(error.data.errorMessage ?? '')
        }
        setMessagingServices(myServices)
        setIsValidTwiliosService(myServices.length > 0)
        form.setFieldValue('messagingService', myServices.length > 0
          ? (isEditMode && twilioEditMethod === MessageMethod.MessagingService
          && myServices.includes(editData?.providerData.fromNumber ?? ''))
            ? editData?.providerData.fromNumber ?? myServices[0]
            : myServices[0]
          : '')
        form.validateFields(['messagingService'])
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onSubmit = async () => {
    try {
      await form.validateFields()
      const providerData: NotificationSmsConfig =
        providerType === SmsProviderType.TWILIO
          ? isSmsMessagingServiceEnabled && messageMethod === MessageMethod.MessagingService ?
            {
              // twilio with messaging service
              accountSid: form.getFieldValue('accountSid'),
              authToken: form.getFieldValue('authToken'),
              fromNumber: form.getFieldValue('messagingService')
            }
            :
            {
            // twilio with phone number
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

  const handleMessageMethodChange = (e: RadioChangeEvent) => {
    setMessageMethod(e.target.value)
    if (e.target.value === MessageMethod.MessagingService) {
      handleGetTwiliosIncomingServices()
    }
    if (e.target.value === MessageMethod.PhoneNumber) {
      handleGetTwiliosIncomingPhoneNumbers()
    }
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
        initialValue={isEditMode ? editData?.providerData.accountSid ?? '' : ''}
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
        children={<Input onBlur={() => {
          handleGetTwiliosIncomingPhoneNumbers()
          if (isSmsMessagingServiceEnabled) {
            handleGetTwiliosIncomingServices()
          }
        }} />}
      />
      <Form.Item
        name='authToken'
        label={$t({ defaultMessage: 'Auth Token' })}
        initialValue={isEditMode ? editData?.providerData.authToken ?? '' : ''}
        rules={[
          { required: true },
          { validator: (_, value) => {
            if(value.length !== 32 || !(/^[A-Za-z0-9]*$/.test(value))) {
              setIsValidAuthToken(false)
              return Promise.reject(
                `${$t({ defaultMessage: 'This is not a valid Twilio auth token' })} `
              )
            }
            setIsValidAuthToken(true)
            return Promise.resolve()}
          }
        ]}
        children={<PasswordInput onBlur={() => {
          handleGetTwiliosIncomingPhoneNumbers()
          if (isSmsMessagingServiceEnabled) {
            handleGetTwiliosIncomingServices()
          }
        }} />}
      />
      {isSmsMessagingServiceEnabled && <>
        <Form.Item
          name='messageMethod'
          label={$t({ defaultMessage: 'Send messages through...' })}
          initialValue={messageMethod}
          rules={[
            { required: true, message: $t({ defaultMessage: 'Please select a messaging method' }) }
          ]}
        >
          <Radio.Group
            disabled={!isValidAuthToken}
            onChange={handleMessageMethodChange}
            value={messageMethod}>
            <Space direction='vertical'>
              <Radio value={MessageMethod.MessagingService}>
                {$t({ defaultMessage: 'Messaging Service' })}
              </Radio>
              <Radio value={MessageMethod.PhoneNumber}>
                {$t({ defaultMessage: 'Phone Number' })}
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        {messageMethod === MessageMethod.MessagingService && isValidAuthToken && <Form.Item
          name='messagingService'
          label={$t({ defaultMessage: 'Messaging Service' })}
          rules={[
            { validator: () => {
              const hasService = form.getFieldValue('messagingService')
              return !isValidTwiliosService && hasService === ''
                ? Promise.reject(messagingServiceErrorMessage)
                : Promise.resolve()}
            }
          ]}
          children={<Select
            options={messagingServices?.map((item) => ({
              label: item,
              value: item
            }))}
            placeholder={$t({ defaultMessage: 'Select...' })}
            disabled={!isValidTwiliosService}
          />}
        />}
      </>}
      {(!isSmsMessagingServiceEnabled ||
        (messageMethod === MessageMethod.PhoneNumber && isValidAuthToken))
         && <Form.Item
           name='phoneNumber'
           label={$t({ defaultMessage: 'Phone Number' })}
           rules={[
             { validator: () => {
               const hasNumber = form.getFieldValue('phoneNumber')
               return !isValidTwiliosNumber && hasNumber === ''
                 ? Promise.reject(phoneNumberErrorMessage)
                 : Promise.resolve()}
             }
           ]}
           children={<Select
             options={phoneNumbers?.map((item) => ({
               label: item,
               value: item
             }))}
             placeholder={$t({ defaultMessage: 'Select...' })}
             disabled={!isValidTwiliosNumber}
           />}
         />}
    </>}
    {providerType === SmsProviderType.ESENDEX &&
      <Form.Item
        name='apiKey'
        label={$t({ defaultMessage: 'API Key' })}
        initialValue={isEditMode ? editData?.providerData.apiKey ?? '' : ''}
        rules={[
          { required: true }
        ]}
        children={<Input.TextArea rows={8} />}
      />}
    {providerType === SmsProviderType.OTHERS && <>
      <Form.Item
        name='apiKey'
        label={$t({ defaultMessage: 'API Key' })}
        initialValue={isEditMode ? editData?.providerData.apiKey ?? '' : ''}
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
        initialValue={isEditMode ? editData?.providerData.url ?? '' : ''}
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
