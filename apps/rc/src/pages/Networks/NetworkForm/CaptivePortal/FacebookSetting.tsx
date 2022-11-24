import { useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Modal } from '@acx-ui/components'

import appPhoto from '../../../../assets/images/network-wizard-diagrams/facebook-sample-customised.png'
import * as UI  from '../styledComponents'

import PreviewApp    from './PreviewApp'
import SocialAuthURL from './SocialAuthURL'

type DataType = {
  facebookID: string,
  facebookSecret: string
}
export default function FacebookSetting () {
  const { $t } = useIntl()
  const [form] = Form.useForm<DataType>()
  const formParent = Form.useFormInstance()
  const [visible, setVisible]=useState(false)
  const [appIDValue, setAppIDValue]=useState('')
  const [appSecretValue, setAppSecretValue]=useState('')
  const description='-The selected Facebook app will '+
  'affect the popup that users see on their first sign in to the network'
  const getContent = <Form layout='vertical'
    form={form}
    onFinish={()=>{
      setAppIDValue(form.getFieldValue(['socialIdentities','facebook','config','appId']))
      setAppSecretValue(form.getFieldValue(['socialIdentities','facebook','config','appSecret']))
      formParent.setFieldValue(['socialIdentities','facebook','source'], 'CUSTOM')
      formParent.setFieldsValue({ ...form.getFieldsValue() })
      setVisible(false)
    }}
  >
    <Form.Item label={<>
      {$t({ defaultMessage: 'Select Facebook app to be used for sign in' })}&nbsp;&nbsp;
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <PreviewApp appDescription={description} appPhoto={appPhoto}/>
    </>}/>
    <Form.Item
      name={['socialIdentities','facebook','config','appId']}
      rules={[
        { required: true }
      ]}
      label={$t({ defaultMessage: 'App ID' })}
      children={
        <Input/>
      }
    />
    <Form.Item
      name={['socialIdentities','facebook','config','appSecret']}
      rules={[
        { required: true }
      ]}
      label={$t({ defaultMessage: 'App Secret' })}
      children={
        <Input.Password/>
      }
    />
    <Form.Item>
      <label>{$t({ defaultMessage: 'You also need to go to your' })}&nbsp;&nbsp;
        <a href='https://developers.facebook.com/'
          target='_blank'
          rel='noreferrer'>
          {$t({ defaultMessage: 'Facebook Developer Account' })}</a>&nbsp;&nbsp;
        {$t({ defaultMessage: 'and paste the following URI in the app settings under:' })}
      </label><br/>
      <label>{$t({ defaultMessage: 'Facebook Login > Settings > Client '+
      'OAuth Settings > Valid OAuth redirect URIs' })}</label>
      <SocialAuthURL/>
    </Form.Item>
  </Form>
  return (
    <>
      <UI.ConfigurationSolid onClick={() => {
        setVisible(true)}}/>
      <Modal
        title={$t({ defaultMessage: 'Edit Facebook App' })}
        visible={visible}
        width={600}
        okText={$t({ defaultMessage: 'Save' })}
        onCancel={()=>{
          form.setFieldValue(['socialIdentities','facebook','config','appId'], appIDValue)
          form.setFieldValue(['socialIdentities','facebook','config','appSecret'], appSecretValue)
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

