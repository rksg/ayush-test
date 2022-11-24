import { useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Modal } from '@acx-ui/components'

import appPhoto from '../../../../assets/images/network-wizard-diagrams/twitter-sample-customised.png'
import * as UI  from '../styledComponents'

import PreviewApp    from './PreviewApp'
import SocialAuthURL from './SocialAuthURL'
type DataType = {
  twitterID: string,
  twitterSecret: string
}
export default function TwitterSetting () {
  const { $t } = useIntl()
  const [form] = Form.useForm<DataType>()
  const [visible, setVisible]=useState(false)
  const [appIDValue, setAppIDValue]=useState('')
  const [appSecretValue, setAppSecretValue]=useState('')
  const description='-The selected Twitter app will affect the popup '+
  'that users see on their first sign in to the network'
  const getContent = <Form layout='vertical'
    form={form}
    onFinish={()=>{
      setAppIDValue(form.getFieldValue(['socialIdentities','twitter','config','appId']))
      setAppSecretValue(form.getFieldValue(['socialIdentities','twitter','config','appSecret']))
      setVisible(false)
    }}
  >
    <Form.Item label={<>
      {$t({ defaultMessage: 'Select Twitter app to be used for sign in' })}&nbsp;&nbsp;
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <PreviewApp appDescription={description} appPhoto={appPhoto}/>
    </>}/>
    <Form.Item
      name={['socialIdentities','twitter','config','appId']}
      rules={[
        { required: true }
      ]}
      label={$t({ defaultMessage: 'Consumer Key' })}
      children={
        <Input/>
      }
    />
    <Form.Item
      name={['socialIdentities','twitter','config','appSecret']}
      rules={[
        { required: true }
      ]}
      label={$t({ defaultMessage: 'Consumer Secret' })}
      children={
        <Input.Password/>
      }
    />
    <Form.Item>
      <label>{$t({ defaultMessage: 'You also need to go to your' })}&nbsp;&nbsp;
        <a href='https://developer.twitter.com/apps'
          target='_blank'
          rel='noreferrer'>
          {$t({ defaultMessage: 'Twitter Application Management' })}</a>&nbsp;&nbsp;
        {$t({ defaultMessage: 'and paste the following URI in the app settings under:' })}
      </label><br/>
      <label>{$t({ defaultMessage: 'Settings > Callback URL' })}</label><br/>
      <SocialAuthURL/>
    </Form.Item>
  </Form>
  return (
    <>
      <UI.ConfigurationSolid onClick={() => {
        setVisible(true)}}/>
      <Modal
        title={$t({ defaultMessage: 'Edit Twitter App' })}
        visible={visible}
        width={600}
        okText={$t({ defaultMessage: 'Save' })}
        onCancel={()=>{
          form.setFieldValue(['socialIdentities','twitter','config','appId'], appIDValue)
          form.setFieldValue(['socialIdentities','twitter','config','appSecret'], appSecretValue)
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

