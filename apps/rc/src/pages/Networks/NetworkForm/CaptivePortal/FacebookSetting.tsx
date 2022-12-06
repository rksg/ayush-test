import { useState, useEffect, useContext } from 'react'

import { Form, Input, Tooltip } from 'antd'
import { useIntl }              from 'react-intl'

import { Modal } from '@acx-ui/components'

import appPhoto           from '../../../../assets/images/network-wizard-diagrams/facebook-sample-customised.png'
import NetworkFormContext from '../NetworkFormContext'
import * as UI            from '../styledComponents'

import PreviewApp    from './PreviewApp'
import SocialAuthURL from './SocialAuthURL'
type DataType = {
  facebookID: string,
  facebookSecret: string
}
export default function FacebookSetting () {
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
  const description='-The selected Facebook app will '+
  'affect the popup that users see on their first sign in to the network'
  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldValue(['guestPortal','socialIdentities',
        'facebook','config','appId'],
      data.guestPortal?.socialIdentities?.facebook?.config?.appId)
      form.setFieldValue(['guestPortal','socialIdentities',
        'facebook','config','appSecret'],
      data.guestPortal?.socialIdentities?.facebook?.config?.appSecret)
      setAppIDValue(data.guestPortal?.socialIdentities?.facebook?.config?.appId||'')
      setAppSecretValue(data.guestPortal?.socialIdentities?.facebook?.config?.appSecret||'')
      formParent.setFieldValue(['guestPortal','socialIdentities',
        'facebook','config','appId'],
      data.guestPortal?.socialIdentities?.facebook?.config?.appId)
      formParent.setFieldValue(['guestPortal','socialIdentities',
        'facebook','config','appSecret'],
      data.guestPortal?.socialIdentities?.facebook?.config?.appSecret)
    }
  }, [data])
  const getContent = <Form layout='vertical'
    form={form}
    onFinish={()=>{
      setAppIDValue(form.getFieldValue(['guestPortal','socialIdentities',
        'facebook','config','appId']))
      setAppSecretValue(form.getFieldValue(['guestPortal','socialIdentities',
        'facebook','config','appSecret']))
      formParent.setFieldValue(['guestPortal','socialIdentities',
        'facebook','source'], 'CUSTOM')
      formParent.setFieldsValue({ ...form.getFieldsValue() })
      setVisible(false)
    }}
  >
    <Form.Item label={$t({ defaultMessage: 'Select Facebook app to be used for sign in' })}
      extra={<div style={{ textAlign: 'right', marginTop: -63 }}>
        <PreviewApp appDescription={description} appPhoto={appPhoto}/></div>}
    />
    <Form.Item
      name={['guestPortal','socialIdentities','facebook','config','appId']}
      rules={[
        { required: true }
      ]}
      label={$t({ defaultMessage: 'App ID' })}
      children={
        <Input/>
      }
    />
    <Form.Item
      name={['guestPortal','socialIdentities','facebook','config','appSecret']}
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
      <Tooltip title={$t({ defaultMessage: 'Edit Facebook app' })}
        placement='bottom'><UI.ConfigurationSolid title='settingicon'
          onClick={() => {setVisible(true)}}/></Tooltip>
      <Modal
        title={$t({ defaultMessage: 'Edit Facebook App' })}
        visible={visible}
        width={600}
        okText={$t({ defaultMessage: 'Save' })}
        onCancel={()=>{
          form.setFieldValue(['guestPortal','socialIdentities',
            'facebook','config','appId'], appIDValue)
          form.setFieldValue(['guestPortal','socialIdentities',
            'facebook','config','appSecret'], appSecretValue)
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

