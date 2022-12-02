import { useState, useEffect, useContext } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Modal } from '@acx-ui/components'

import appPhoto           from '../../../../assets/images/network-wizard-diagrams/google-sample-customised.png'
import NetworkFormContext from '../NetworkFormContext'
import * as UI            from '../styledComponents'

import PreviewApp    from './PreviewApp'
import SocialAuthURL from './SocialAuthURL'

type DataType = {
  googleID: string,
  googleSecret: string
}
export default function GoogleSetting () {
  const {
    data,
    editMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const [form] = Form.useForm<DataType>()
  const formParent = Form.useFormInstance()
  const [visible, setVisible]=useState(false)
  const [appIDValue, setAppIDValue]=useState('')
  const [appSecretValue, setAppSecretValue]=useState('')
  const description='-The selected Google app will affect the popup '+
  'that users see on their first sign in to the network'
  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldValue(['guestPortal','socialIdentities',
        'google','config','appId'],
      data.guestPortal?.socialIdentities?.google?.config?.appId)
      form.setFieldValue(['guestPortal','socialIdentities',
        'google','config','appSecret'],
      data.guestPortal?.socialIdentities?.google?.config?.appSecret)
      setAppIDValue(data.guestPortal?.socialIdentities?.google?.config?.appId||'')
      setAppSecretValue(data.guestPortal?.socialIdentities?.google?.config?.appSecret||'')
      formParent.setFieldValue(['guestPortal','socialIdentities',
        'google','config','appId'],
      data.guestPortal?.socialIdentities?.google?.config?.appId)
      formParent.setFieldValue(['guestPortal','socialIdentities',
        'google','config','appSecret'],
      data.guestPortal?.socialIdentities?.google?.config?.appSecret)
    }
  }, [data])
  const getContent = <Form layout='vertical'
    form={form}
    onFinish={()=>{
      setAppIDValue(form.getFieldValue(['guestPortal','socialIdentities',
        'google','config','appId']))
      setAppSecretValue(form.getFieldValue(['guestPortal','socialIdentities',
        'google','config','appSecret']))
      formParent.setFieldValue(['guestPortal','socialIdentities','google','source'], 'CUSTOM')
      formParent.setFieldsValue({ ...form.getFieldsValue() })
      setVisible(false)
    }}
  >
    <Form.Item label={<>
      {$t({ defaultMessage: 'Select Google app to be used for sign in' })}&nbsp;&nbsp;
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <PreviewApp appDescription={description} appPhoto={appPhoto}/>
    </>}/>
    <Form.Item
      name={['guestPortal','socialIdentities','google','config','appId']}
      rules={[
        { required: true }
      ]}
      label={$t({ defaultMessage: 'Client ID' })}
      children={
        <Input/>
      }
    />
    <Form.Item
      name={['guestPortal','socialIdentities','google','config','appSecret']}
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
      <UI.ConfigurationSolid title='settingicon'
        onClick={() => {setVisible(true)}}/>
      <Modal
        title={$t({ defaultMessage: 'Edit Google App' })}
        visible={visible}
        width={600}
        okText={$t({ defaultMessage: 'Save' })}
        onCancel={()=>{
          form.setFieldValue(['guestPortal','socialIdentities',
            'google','config','appId'], appIDValue)
          form.setFieldValue(['guestPortal','socialIdentities',
            'google','config','appSecret'], appSecretValue)
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

