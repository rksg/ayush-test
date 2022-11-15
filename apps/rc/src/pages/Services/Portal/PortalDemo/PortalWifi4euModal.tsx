import { useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Modal } from '@acx-ui/components'

import * as UI from '../styledComponents'
export default function PortalWifi4euModal (props:{
  updateWiFi4EU: (value:string) => void,
  wifi4eu?: string
}) {
  const { $t } = useIntl()
  const { updateWiFi4EU, wifi4eu } = props
  const [visible, setVisible]=useState(false)
  const [newWifi4eu, setNewWifi4eu]=useState(wifi4eu)
  const form = Form.useFormInstance()
  const getContent = <Form
    form={form}
    layout='vertical'>
    <Form.Item
      name='wifi4eu_uuid'
      label={$t({ defaultMessage: 'WiFi4EU UUID' })}
      validateFirst
      hasFeedback
      children={<Input placeholder={
        $t({ defaultMessage: 'Copy from your WiFi4EU installation report' })}
      onChange={(e)=>setNewWifi4eu(e.target.value)}
      value={newWifi4eu}/>}
    /></Form>
  return (
    <>
      <UI.SettingOutlined onClick={() => {
        setNewWifi4eu(wifi4eu)
        form.setFieldValue('wifi4eu_uuid', wifi4eu)
        setVisible(true)}}/>
      <Modal
        title={$t({ defaultMessage: 'WiFi4EU Snippet Settings' })}
        visible={visible}
        width={400}
        okText='OK'
        onCancel={()=>{
          setNewWifi4eu(wifi4eu)
          form.setFieldValue('wifi4eu_uuid', wifi4eu)
          setVisible(false)
        }}
        onOk={()=>{
          updateWiFi4EU(newWifi4eu as string)
          form.setFieldValue('wifi4eu_uuid', newWifi4eu)
          setVisible(false)
        }}
        closable={false}
        maskClosable={false}
      >
        {getContent}
      </Modal>
    </>

  )
}

