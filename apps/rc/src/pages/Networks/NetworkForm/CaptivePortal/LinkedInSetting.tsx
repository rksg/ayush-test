import { useState, useEffect, useContext } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Modal } from '@acx-ui/components'

import appPhoto           from '../../../../assets/images/network-wizard-diagrams/linkedin-sample-customised.png'
import NetworkFormContext from '../NetworkFormContext'
import * as UI            from '../styledComponents'

import PreviewApp    from './PreviewApp'
import SocialAuthURL from './SocialAuthURL'
type DataType = {
  linkedinID: string,
  linkedinSecret: string
}
export default function LinkedInSetting () {
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
  const description='-The selected LinkedIn app will affect the popup that '+
  'users see on their first sign in to the network'
  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldValue(['guestPortal','socialIdentities',
        'linkedin','config','appId'],
      data.guestPortal?.socialIdentities?.linkedin?.config?.appId)
      form.setFieldValue(['guestPortal','socialIdentities',
        'linkedin','config','appSecret'],
      data.guestPortal?.socialIdentities?.linkedin?.config?.appSecret)
      setAppIDValue(data.guestPortal?.socialIdentities?.linkedin?.config?.appId||'')
      setAppSecretValue(data.guestPortal?.socialIdentities?.linkedin?.config?.appSecret||'')
      formParent.setFieldValue(['guestPortal','socialIdentities','linkedin','source'], 'CUSTOM')
      formParent.setFieldValue(['guestPortal','socialIdentities',
        'linkedin','config','appId'],
      data.guestPortal?.socialIdentities?.linkedin?.config?.appId)
      formParent.setFieldValue(['guestPortal','socialIdentities',
        'linkedin','config','appSecret'],
      data.guestPortal?.socialIdentities?.linkedin?.config?.appSecret)
    }
  }, [data])
  const getContent = <Form layout='vertical'
    form={form}
    onFinish={()=>{
      setAppIDValue(form.getFieldValue(['guestPortal','socialIdentities',
        'linkedin','config','appId']))
      setAppSecretValue(form.getFieldValue(['guestPortal','socialIdentities',
        'linkedin','config','appSecret']))
      formParent.setFieldValue(['guestPortal','socialIdentities','linkedin','source'], 'CUSTOM')
      formParent.setFieldsValue({ ...form.getFieldsValue() })
      setVisible(false)
    }}
  >
    <Form.Item label={<>
      {$t({ defaultMessage: 'Select LinkedIn app to be used for sign in' })}&nbsp;&nbsp;
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <PreviewApp appDescription={description} appPhoto={appPhoto}/>
    </>}/>
    <Form.Item
      name={['guestPortal','socialIdentities','linkedin','config','appId']}
      rules={[
        { required: true }
      ]}
      label={$t({ defaultMessage: 'Client ID' })}
      children={
        <Input/>
      }
    />
    <Form.Item
      name={['guestPortal','socialIdentities','linkedin','config','appSecret']}
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
        <a href='https://developer.linkedin.com/'
          target='_blank'
          rel='noreferrer'>
          {$t({ defaultMessage: 'LinkedIn Developer Console' })}</a>&nbsp;&nbsp;
        {$t({ defaultMessage: 'and paste the following URI in the app settings under:' })}
      </label><br/>
      <label>{$t({ defaultMessage: 'Authentication > OAuth 2.0 > '+
      'Authorized Redirect URLs' })}</label>
      <SocialAuthURL/>
    </Form.Item>
  </Form>
  return (
    <>
      <UI.ConfigurationSolid onClick={() => {
        setVisible(true)}}/>
      <Modal
        title={$t({ defaultMessage: 'Edit LinkedIn App' })}
        visible={visible}
        width={600}
        okText={$t({ defaultMessage: 'Save' })}
        onCancel={()=>{
          form.setFieldValue(['guestPortal','socialIdentities',
            'linkedin','config','appId'], appIDValue)
          form.setFieldValue(['guestPortal','socialIdentities',
            'linkedin','config','appSecret'], appSecretValue)
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

