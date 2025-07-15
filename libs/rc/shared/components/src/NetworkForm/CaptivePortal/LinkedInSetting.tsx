import { useState, useEffect, useContext } from 'react'

import { Form, Input, Tooltip, Checkbox } from 'antd'
import { useIntl }                        from 'react-intl'

import { Button, Modal, PasswordInput } from '@acx-ui/components'
import { GuestPortal }                  from '@acx-ui/rc/utils'

import appPhoto           from '../assets/images/network-wizard-diagrams/linkedin-sample-customised.png'
import NetworkFormContext from '../NetworkFormContext'
import * as UI            from '../styledComponents'

import PreviewApp    from './PreviewApp'
import SocialAuthURL from './SocialAuthURL'
type DataType = {
  guestPortal: GuestPortal
}

const ACX_UI_LINKEDIN_NOTE_HIDDEN_KEY = 'ACX-linkedIn-note-hidden'
export default function LinkedInSetting (props:{
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
  const [checkHiddenNote, setCheckHiddenNote]=useState(false)
  const [visibleNote, setVisibleNote]=useState(true)
  const [appIDValue, setAppIDValue]=useState('')
  const [appSecretValue, setAppSecretValue]=useState('')
  const linkedInNote = $t({
    defaultMessage:
      'Please note'
  })
  const linkedInInfo = $t({
    defaultMessage:
      '“Sign In with LinkedIn” has been deprecated as of August 1, 2023. ' +
      'Please switch to “Sign In with LinkedIn using OpenID Connect”' +
      ' to ensure that your service is not interrupted.'
  })

  const getLinkedInNoteHiddenIds = () => {
    let storedIds = localStorage.getItem(ACX_UI_LINKEDIN_NOTE_HIDDEN_KEY)
    let networdIds = []
    if (storedIds) {
      networdIds = JSON.parse(storedIds)
    }
    return networdIds
  }

  const clickCloseNote = () => {
    let networdIds = getLinkedInNoteHiddenIds()
    if (networdIds.indexOf(data?.id) === -1) {
      networdIds.push(data?.id)
    }
    localStorage.setItem(ACX_UI_LINKEDIN_NOTE_HIDDEN_KEY, JSON.stringify(networdIds))
  }
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
      if (editMode) {
        setVisibleNote(getLinkedInNoteHiddenIds().indexOf(data.id) > -1)
      }
    }
  }, [data])
  const getContent = <Form<DataType> layout='vertical'
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
    <Form.Item label={$t({ defaultMessage: 'Select LinkedIn app to be used for sign in' })}
      extra={<div style={{ textAlign: 'right', marginTop: -60 }}>
        <PreviewApp type='linkedin' appPhoto={appPhoto}/></div>}
    />
    <Form.Item
      name={['guestPortal','socialIdentities','linkedin','config','appId']}
      rules={[
        { required: true }
      ]}
      initialValue=''
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
      initialValue=''
      label={$t({ defaultMessage: 'Client Secret' })}
      children={
        <PasswordInput />
      }
    />
    <Form.Item><>
      <label>{$t({ defaultMessage: 'You also need to go to your' })}&nbsp;&nbsp;
        <a href='https://developer.linkedin.com/'
          target='_blank'
          rel='noreferrer'>
          {$t({ defaultMessage: 'LinkedIn Developer Console' })}</a>&nbsp;&nbsp;
        {$t({ defaultMessage: 'and paste the following URI in the app settings under:' })}
      </label><br/>
      <label>{$t({ defaultMessage: 'Authentication > OAuth 2.0 > '+
      'Authorized Redirect URLs' })}</label>
      <SocialAuthURL redirectURL={props.redirectURL}/></>
    </Form.Item>
  </Form>
  return (
    <>
      <Tooltip title={$t({ defaultMessage: 'Edit LinkedIn app' })}
        placement='bottom'><Button onClick={() => {setVisible(true)}}
          data-testid='settingicon'
          type='link'><UI.ConfigurationSolid/></Button></Tooltip>
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
          setCheckHiddenNote(false)
        }}
        onOk={()=>{
          clickCloseNote()
          form.submit()
        }}
        maskClosable={false}
      >
        {getContent}
        {editMode && !visibleNote &&
          <UI.AlertNote message={<>
            <span style={{ fontWeight: 'bold' }}>{linkedInNote}:</span>
            <div>{linkedInInfo}</div>
            <br/>
            <div> <Checkbox checked={checkHiddenNote}
              onChange={()=>{ setCheckHiddenNote(!checkHiddenNote) }} />
              &nbsp;&nbsp;{$t({ defaultMessage: 'Don’t show this again' })}
            </div>
          </>}
          type='info'
          closable
          closeText='Dismiss'
          onClose={clickCloseNote} />
        }
      </Modal>
    </>
  )
}

