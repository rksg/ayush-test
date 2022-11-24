import { useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Modal } from '@acx-ui/components'

import appPhoto from '../../../../assets/images/network-wizard-diagrams/google-sample-customised.png'
import * as UI  from '../styledComponents'

import PreviewApp    from './PreviewApp'
import SocialAuthURL from './SocialAuthURL'

type DataType = {
  googleID: string,
  googleSecret: string
}
export default function GoogleSetting () {
  const { $t } = useIntl()
  const [form] = Form.useForm<DataType>()
  const [visible, setVisible]=useState(false)
  const [appIDValue, setAppIDValue]=useState('')
  const [appSecretValue, setAppSecretValue]=useState('')
  const description='-The selected Google app will affect the popup '+
  'that users see on their first sign in to the network'
  const getContent = <Form layout='vertical'
    form={form}
    onFinish={()=>{
      setAppIDValue(form.getFieldValue(['socialIdentities','google','config','appId']))
      setAppSecretValue(form.getFieldValue(['socialIdentities','google','config','appSecret']))
      setVisible(false)
    }}
  >
    <Form.Item label={<>
      {$t({ defaultMessage: 'Select Google app to be used for sign in' })}&nbsp;&nbsp;
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <PreviewApp appDescription={description} appPhoto={appPhoto}/>
    </>}/>
    <Form.Item
      name={['socialIdentities','google','config','appId']}
      rules={[
        { required: true }
      ]}
      label={$t({ defaultMessage: 'Client ID' })}
      children={
        <Input/>
      }
    />
    <Form.Item
      name={['socialIdentities','google','config','appSecret']}
      rules={[
        { required: true }
      ]}
      label={$t({ defaultMessage: 'Client Secret' })}
      children={
        <Input.Password/>
      }
    />
    <Form.Item>
      <label>{$t({ defaultMessage: 'You also need to go to your' })}&nbsp;&nbsp;
        <a href='https://console.cloud.google.com/apis/dashboard'
          target='_blank'
          rel='noreferrer'>
          {$t({ defaultMessage: 'Google Developer Console' })}</a>&nbsp;&nbsp;
        {$t({ defaultMessage: 'and paste the following URI in the app settings under:' })}
      </label><br/>
      <label>{$t({ defaultMessage: 'Credentials > OAuth 2.0 client IDs > '+
      'Click on client name > Authorized redirect URIs' })}</label>
      <SocialAuthURL/>
    </Form.Item>
  </Form>
  return (
    <>
      <UI.ConfigurationSolid onClick={() => {
        setVisible(true)}}/>
      <Modal
        title={$t({ defaultMessage: 'Edit Google App' })}
        visible={visible}
        width={600}
        okText={$t({ defaultMessage: 'Save' })}
        onCancel={()=>{
          form.setFieldValue(['socialIdentities','google','config','appId'], appIDValue)
          form.setFieldValue(['socialIdentities','google','config','appSecret'], appSecretValue)
          setVisible(false)
        }}
        onOk={()=>{
          form.submit()
        }}
        maskClosable={false}
      >
        {getContent}
      </Modal>
    </>
  )
}

