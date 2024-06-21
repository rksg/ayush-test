import { useState } from 'react'

import { Form, Input, Select } from 'antd'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { Drawer }                            from '@acx-ui/components'
import {
  useLazyGetTwiliosIncomingPhoneNumbersQuery,
  useUpdateNotificationSmsProviderMutation
} from '@acx-ui/rc/services'
import {
  SmsProviderType,
  NotificationSmsConfig
} from '@acx-ui/rc/utils'

import { getProviderQueryParam } from '.'

interface SetupSmsProviderDrawerProps {
  visible: boolean
  isEditMode: boolean
  editData?: NotificationSmsConfig
  setVisible: (visible: boolean) => void
}

export const SetupSmsProviderDrawer = (props: SetupSmsProviderDrawerProps) => {
  const { $t } = useIntl()

  const params = useParams()
  const { visible, setVisible, editData } = props
  const [providerType, setProviderType] = useState<SmsProviderType>()
  const [form] = Form.useForm()

  const [updateSmsProvider] = useUpdateNotificationSmsProviderMutation()
  const [getTwiliosIncomingPhoneNumbers] = useLazyGetTwiliosIncomingPhoneNumbersQuery()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  let incomingPhoneList = [
    {
      label: $t({ defaultMessage: '+19388887785' }),
      value: '+19388887785'
    }
  ]

  const handleGetTwiliosIncomingPhoneNumbers = async () => {
    const payload = {
      sid: 'AC76930bb18cb76e44e743bbd1572c5eaa',
      authId: '3dc75201133cb439febd5c12e34a91f5'
    }
    const phoneList = await getTwiliosIncomingPhoneNumbers({
      params: params, payload: payload })
    const myNumber = phoneList.data?.incommingPhoneNumbers ?? []
    incomingPhoneList = myNumber?.map((item) => ({
      label: item,
      value: item
    }))
  }

  const onSubmit = async () => {
    try {
      await form.validateFields()
      const providerData: NotificationSmsConfig = {
        // twilio
        accountSid: form.getFieldValue('accountSid'),
        authToken: form.getFieldValue('authToken'),
        fromNumber: form.getFieldValue('phoneNumber'),
        // esendex
        apiKey: form.getFieldValue('apiPassword'),
        // others
        // apiKey: form.getFieldValue('apiKey'),
        url: form.getFieldValue('sendUrl')
      }

      await updateSmsProvider({
        params: { provider: getProviderQueryParam(providerType as SmsProviderType) },
        payload: providerData }).unwrap()

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

  const formContent = <Form layout='vertical'form={form} >
    <Form.Item
      name='smsProvider'
      label={$t({ defaultMessage: 'SMS Provider' })}
      rules={[
        { required: true,
          message: $t({ defaultMessage:
            'Please select the provider' })
        }
      ]}
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
        initialValue={editData?.accountSid ?? ''}
        rules={[
          { required: true }
        ]}
        children={<Input />}
      />
      <Form.Item
        name='authToken'
        label={$t({ defaultMessage: 'Auth Token' })}
        initialValue={editData?.authToken ?? ''}
        rules={[
          { required: true }
        ]}
        children={<Input onBlur={handleGetTwiliosIncomingPhoneNumbers}/>}
      />
      <Form.Item
        name='phoneNumber'
        label={$t({ defaultMessage: 'Phone Number' })}
        // rules={[
        //   { required: true }
        // ]}
        children={<Select
          options={incomingPhoneList}
          placeholder={$t({ defaultMessage: 'Select...' })}
          onChange={handleProviderChange}
        />}
      />
    </>}
    {providerType === SmsProviderType.ESENDEX &&
      <Form.Item
        name='apiKey'
        label={$t({ defaultMessage: 'API Key' })}
        rules={[
          { required: true }
        ]}
        children={<Input.TextArea rows={8} />}
      />}
    {providerType === SmsProviderType.OTHERS && <>
      <Form.Item
        name='apiKey'
        label={$t({ defaultMessage: 'API Key' })}
        rules={[
          { required: true }
        ]}
        children={<Input.TextArea rows={8} />}
      />
      <Form.Item
        name='sendUrl'
        label={$t({ defaultMessage: 'Send URL' })}
        rules={[
          { required: true }
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
