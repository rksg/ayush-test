import React, { useEffect, useState } from 'react'

import { Checkbox, Form, Input, Radio, RadioChangeEvent, Select, Space } from 'antd'
import { useIntl }                                                       from 'react-intl'
import { useParams }                                                     from 'react-router-dom'

import { Drawer, PasswordInput, Tooltip }    from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import {
  useLazyGetTwiliosIncomingPhoneNumbersQuery,
  useLazyGetTwiliosMessagingServicesQuery,
  useLazyGetTwiliosWhatsappServicesQuery,
  useUpdateNotificationSmsProviderMutation
} from '@acx-ui/rc/services'
import {
  SmsProviderType,
  NotificationSmsConfig,
  URLRegExp,
  ErrorsResult,
  ErrorDetails,
  TwiliosWhatsappServices
} from '@acx-ui/rc/utils'

import { SmsProviderData, getProviderQueryParam, isTwilioFromNumber } from '.'

interface SetupSmsProviderDrawerProps {
  visible: boolean
  isEditMode: boolean
  editData?: SmsProviderData
  setVisible: (visible: boolean) => void
  setSelected: (selectedType: SmsProviderType, callback?: () => void) => void
}

enum MessageMethod {
  MessagingService,
  PhoneNumber
}

export const SetupSmsProviderDrawer = (props: SetupSmsProviderDrawerProps) => {
  const { $t } = useIntl()

  const params = useParams()
  const { visible, isEditMode, setVisible, editData, setSelected } = props
  const [providerType, setProviderType] = useState<SmsProviderType>()
  const [form] = Form.useForm()
  const { useWatch } = Form
  const [isValidTwiliosNumber, setIsValidTwiliosNumber] = useState(false)
  const [isValidTwiliosService, setIsValidTwiliosService] = useState(false)
  const [isValidAccountSID, setIsValidAccountSID] = useState<boolean>()
  const [isValidAuthToken, setIsValidAuthToken] = useState<boolean>()
  const [validAccountSID, setValidAccountSID] = useState<string>()
  const [validAuthToken, setValidAuthToken] = useState<string>()
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>()
  const [messagingServices, setMessagingServices] = useState<string[]>()
  const [messageMethod, setMessageMethod] = useState<MessageMethod>()
  const [twilioEditMethod, setTwilioEditMethod] = useState<MessageMethod>()
  const [phoneNumberErrorMessage, setPhoneNumberErrorMessage] = useState<string>()
  const [messagingServiceErrorMessage, setMessagingServiceErrorMessage] = useState<string>()
  const isSmsMessagingServiceEnabled = useIsSplitOn(Features.NUVO_SMS_MESSAGING_SERVICE_TOGGLE)
  const isEnabledWhatsApp = useIsSplitOn(Features.WHATSAPP_SELF_SIGN_IN_TOGGLE)

  const [updateSmsProvider] = useUpdateNotificationSmsProviderMutation()
  const [getTwiliosIncomingPhoneNumbers] = useLazyGetTwiliosIncomingPhoneNumbersQuery()
  const [getTwiliosIncomingServices] = useLazyGetTwiliosMessagingServicesQuery()
  const [getTwiliosWhatsappServices] = useLazyGetTwiliosWhatsappServicesQuery()

  const enableWhatsapp = useWatch<string>('enableWhatsapp', form)

  // eslint-disable-next-line max-len
  const twilioUrl = <a href='https://console.twilio.com/' target='_blank' rel='noreferrer' >Twilio</a>

  useEffect(() => {
    if(isEditMode && editData?.providerType ) {
      setProviderType(editData?.providerType)
      form.setFieldValue('smsProvider', editData?.providerType)
    }
  }, [])

  useEffect(() => {
    if (providerType) {
      if(providerType === SmsProviderType.TWILIO) {
        if(isEditMode) {
          form.validateFields(['accountSid','authToken'])
          const fromNumber = editData?.providerData.fromNumber ?? ''
          const enableWhatsapp = editData?.providerData.enableWhatsapp ?? false
          const messageMethod = isTwilioFromNumber(fromNumber)
            ? MessageMethod.PhoneNumber
            : MessageMethod.MessagingService
          setMessageMethod(messageMethod)
          setTwilioEditMethod(messageMethod)
          form.setFieldsValue({
            messageMethod,
            ...(isEnabledWhatsApp && {
              enableWhatsapp,
              authTemplateSid: editData?.providerData.authTemplateSid ?? ''
            })
          })
        }
        else if (isValidAccountSID === false && isValidAuthToken === false) {
          // If add twilio form was touched and provider was changed, validate sid and token again
          form.validateFields(['accountSid','authToken'])
        }
      }
      else {
        setIsValidAccountSID(false)
        setIsValidAuthToken(false)
      }
    }
  }, [providerType])

  useEffect(() => {
    form.validateFields(['phoneNumber', 'messagingService'])
  }, [phoneNumbers, messagingServices])

  useEffect(() => {
    if (providerType === SmsProviderType.TWILIO && isValidAccountSID && isValidAuthToken) {
      if (messageMethod === MessageMethod.MessagingService) {
        handleGetTwiliosIncomingServices()
      }
      else {
        handleGetTwiliosIncomingPhoneNumbers()
      }
    }
  }, [isValidAccountSID, isValidAuthToken, messageMethod, validAccountSID, validAuthToken])

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const handleGetTwiliosIncomingPhoneNumbers = async () => {
    try {
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
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleGetTwiliosIncomingServices = async () => {
    try {
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
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onSubmit = async () => {
    try {
      await form.validateFields()
      const whatsappConfig = enableWhatsapp ? {
        enableWhatsapp: form.getFieldValue('enableWhatsapp'),
        authTemplateSid: form.getFieldValue('authTemplateSid')
      } : {}
      const providerData: NotificationSmsConfig =
        providerType === SmsProviderType.TWILIO
          ? isSmsMessagingServiceEnabled && messageMethod === MessageMethod.MessagingService ?
            {
              // twilio with messaging service
              accountSid: form.getFieldValue('accountSid'),
              authToken: form.getFieldValue('authToken'),
              fromNumber: form.getFieldValue('messagingService'),
              ...whatsappConfig
            }
            :
            {
            // twilio with phone number
              accountSid: form.getFieldValue('accountSid'),
              authToken: form.getFieldValue('authToken'),
              fromNumber: form.getFieldValue('phoneNumber'),
              ...whatsappConfig
            }
          : {
            // esendex, other
            apiKey: form.getFieldValue('apiKey'),
            url: providerType === SmsProviderType.ESENDEX
              ? undefined : form.getFieldValue('sendUrl')
          }

      setSelected(providerType as SmsProviderType, () => {
        updateSmsProvider({
          params: { provider: getProviderQueryParam(providerType as SmsProviderType) },
          payload: providerData
        }).unwrap()
      })
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
              setIsValidAccountSID(false)
              return Promise.reject(
                `${$t({ defaultMessage: 'This is not a valid account SID' })} `
              )
            }
            setIsValidAccountSID(true)
            // In scenario where account sid is changed from one valid sid immediately to another valid sid
            setValidAccountSID(value)
            return Promise.resolve()}
          }
        ]}
        children={<Input />}
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
            // In scenario where account sid is changed from one valid token immediately to another valid token
            setValidAuthToken(value)
            return Promise.resolve()}
          }
        ]}
        children={<PasswordInput />}
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
    {/* eslint-disable-next-line max-len */}
    {isEnabledWhatsApp && providerType === SmsProviderType.TWILIO && messageMethod !== undefined && <>
      <Form.Item
        name='enableWhatsapp'
        valuePropName='checked'
        children={
          <Checkbox
            children={<div style={{ display: 'flex', gap: '5px' }}>
              <div>{$t({ defaultMessage: 'Enabled WhatsApp' })}</div>
              <Tooltip.Question
                title={$t({
                  // eslint-disable-next-line max-len
                  defaultMessage: 'WhatsApp is used to enable WhatsApp functionalities for the Captive Portal Self Sign-In network. Ensure that your selected messaging service or phone number is configured to support WhatsApp through {twilioUrl}.'
                }, { twilioUrl: twilioUrl }
                )}
                placement='right'
                iconStyle={{
                  width: 16,
                  height: 16
                }}
              />
            </div>}
          />
        }
      />
      {enableWhatsapp && (<Form.Item
        name='authTemplateSid'
        label={<>
          {$t({ defaultMessage: 'WhatsApp Authentication Template SID' })}
          <Tooltip.Question
            title={$t({
              // eslint-disable-next-line max-len
              defaultMessage: 'The template SID is available in your {twilioUrl} Content Template Builder.'
            }, { twilioUrl: twilioUrl }
            )}
            placement='right'
            iconStyle={{
              width: 16,
              height: 16
            }}
          />
        </>}
        initialValue={isEditMode ? editData?.providerData.authTemplateSid ?? '' : ''}
        rules={[
          { required: true },
          { validator: async (_, value) => {
            try {
              const payload = {
                accountSid: form.getFieldValue('accountSid'),
                authToken: form.getFieldValue('authToken'),
                authTemplateSid: value
              }
              const templateStatus = await getTwiliosWhatsappServices({
                params: params, payload: payload
              })

              if (templateStatus.error) {
                const error = templateStatus.error as ErrorsResult<ErrorDetails>
                console.log(error) // eslint-disable-line no-console
                // eslint-disable-next-line max-len
                return Promise.reject(
                  $t({ defaultMessage: 'There is an error when fetching authTemplateSid status.' })
                )
              }

              if ((templateStatus.data as TwiliosWhatsappServices).approvalFetch?.sid === value
                // eslint-disable-next-line max-len
                && (templateStatus.data as TwiliosWhatsappServices).approvalFetch?.accountSid === form.getFieldValue('accountSid')
                // eslint-disable-next-line max-len
                && (templateStatus.data as TwiliosWhatsappServices).approvalFetch?.whatsapp.status === 'approved') {
                return Promise.resolve()
              } else {
                return Promise.reject(
                  $t({ defaultMessage: 'This authTemplateSid is not approved.' })
                )
              }
            } catch (error) {
              console.log(error) // eslint-disable-line no-console
            }
            return Promise.resolve()}
          }
        ]}
        children={<Input />}
      />)}
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
