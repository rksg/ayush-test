import { useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Modal } from '@acx-ui/components'

import * as UI from './styledComponents'
export default function WiFi4euModal (props:{
  onChange: (value:string) => void,
  wifi4eu?: string
}) {
  const { $t } = useIntl()
  const { onChange, wifi4eu } = props
  const [visible, setVisible]=useState(false)
  const [newWifi4eu, setNewWifi4eu]=useState(wifi4eu)
  const getContent = <Form
    layout='vertical'>
    <Form.Item
      name='wifi4eu_uuid'
      label={$t({ defaultMessage: 'WiFi4EU UUID' })}
      children={<Input placeholder={
        $t({ defaultMessage: 'Copy from your WiFi4EU installation report' })}
      onChange={(e)=>setNewWifi4eu(e.target.value)}
      value={newWifi4eu}/>}
    /></Form>
  return (
    <>
      <UI.SettingOutlined onClick={() => {
        setNewWifi4eu(wifi4eu)
        setVisible(true)}}
      data-testid='settingicon'
      />
      <Modal
        title={$t({ defaultMessage: 'WiFi4EU Snippet Settings' })}
        visible={visible}
        width={400}
        okText={$t({ defaultMessage: 'OK' })}
        onCancel={()=>{
          setNewWifi4eu(wifi4eu)
          setVisible(false)
        }}
        onOk={()=>{
          onChange(newWifi4eu as string)
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

