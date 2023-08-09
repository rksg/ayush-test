import { useState, useEffect, useContext } from 'react'

import { Form, Input, Tooltip } from 'antd'
import { useIntl }              from 'react-intl'

import { Button, Modal, PasswordInput } from '@acx-ui/components'
import { GuestPortal }                  from '@acx-ui/rc/utils'

import appPhoto           from '../../../../../assets/images/network-wizard-diagrams/twitter-sample-customised.png'
import NetworkFormContext from '../NetworkFormContext'
import * as UI            from '../styledComponents'

import PreviewApp    from './PreviewApp'
import SocialAuthURL from './SocialAuthURL'
type DataType = {
  guestPortal: GuestPortal
}
export default function TwitterSetting (props:{
  redirectURL: string
}) {
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
  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldValue(['guestPortal','socialIdentities',
        'twitter','config','appId'],
      data.guestPortal?.socialIdentities?.twitter?.config?.appId)
      form.setFieldValue(['guestPortal','socialIdentities',
        'twitter','config','appSecret'],
      data.guestPortal?.socialIdentities?.twitter?.config?.appSecret)
      setAppIDValue(data.guestPortal?.socialIdentities?.twitter?.config?.appId||'')
      setAppSecretValue(data.guestPortal?.socialIdentities?.twitter?.config?.appSecret||'')
      formParent.setFieldValue(['guestPortal','socialIdentities',
        'twitter','config','appId'],
      data.guestPortal?.socialIdentities?.twitter?.config?.appId)
      formParent.setFieldValue(['guestPortal','socialIdentities',
        'twitter','config','appSecret'],
      data.guestPortal?.socialIdentities?.twitter?.config?.appSecret)
    }
  }, [data])
  const getContent = <Form<DataType> layout='vertical'
    form={form}
    onFinish={()=>{
      setAppIDValue(form.getFieldValue(['guestPortal','socialIdentities',
        'twitter','config','appId']))
      setAppSecretValue(form.getFieldValue(['guestPortal','socialIdentities',
        'twitter','config','appSecret']))
      formParent.setFieldValue(['guestPortal','socialIdentities','twitter','source'], 'CUSTOM')
      formParent.setFieldsValue({ ...form.getFieldsValue() })
      setVisible(false)
    }}
  >
    <Form.Item label={$t({ defaultMessage: 'Select Twitter app to be used for sign in' })}
      extra={<div style={{ textAlign: 'right', marginTop: -60 }}>
        <PreviewApp type='twitter' appPhoto={appPhoto}/></div>}
    />
    <Form.Item
      name={['guestPortal','socialIdentities','twitter','config','appId']}
      rules={[
        { required: true }
      ]}
      initialValue=''
      label={$t({ defaultMessage: 'Consumer Key' })}
      children={
        <Input/>
      }
    />
    <Form.Item
      name={['guestPortal','socialIdentities','twitter','config','appSecret']}
      rules={[
        { required: true }
      ]}
      initialValue=''
      label={$t({ defaultMessage: 'Consumer Secret' })}
      children={
        <PasswordInput />
      }
    />
    <Form.Item><>
      <label>{$t({ defaultMessage: 'You also need to go to your' })}&nbsp;&nbsp;
        <a href='https://developer.twitter.com/apps'
          target='_blank'
          rel='noreferrer'>
          {$t({ defaultMessage: 'Twitter Application Management' })}</a>&nbsp;&nbsp;
        {$t({ defaultMessage: 'and paste the following URI in the app settings under:' })}
      </label><br/>
      <label>{$t({ defaultMessage: 'Settings > Callback URL' })}</label><br/>
      <SocialAuthURL redirectURL={props.redirectURL}/></>
    </Form.Item>
  </Form>
  return (
    <>
      <Tooltip title={$t({ defaultMessage: 'Edit Twitter app' })}
        placement='bottom'><Button onClick={() => {setVisible(true)}}
          title='settingicon'
          type='link'><UI.ConfigurationSolid/></Button></Tooltip>
      <Modal
        title={$t({ defaultMessage: 'Edit Twitter App' })}
        visible={visible}
        width={600}
        okText={$t({ defaultMessage: 'Save' })}
        onCancel={()=>{
          form.setFieldValue(['guestPortal','socialIdentities',
            'twitter','config','appId'], appIDValue)
          form.setFieldValue(['guestPortal','socialIdentities',
            'twitter','config','appSecret'], appSecretValue)
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

