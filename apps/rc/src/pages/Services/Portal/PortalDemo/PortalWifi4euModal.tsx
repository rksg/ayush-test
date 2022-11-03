import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button } from '@acx-ui/components'

import * as UI from '../styledComponents'
export default function PortalWifi4euModal (props:{
  updateWiFi4EU: (value:string) => void,
  wifi4eu?: string
}) {
  const { $t } = useIntl()
  const { updateWiFi4EU, wifi4eu } = props
  const [visible, setVisible]=useState(false)
  const [newWifi4eu, setNewWifi4eu]=useState(wifi4eu)
  const footer = [
    <Button
      key='back'
      type='link'
      onClick={()=>{
        setNewWifi4eu(wifi4eu)
        setVisible(false)}}
      children={$t({ defaultMessage: 'Cancel' })}
    />,
    <Button
      key='forward'
      type='secondary'
      onClick={()=>{
        updateWiFi4EU(newWifi4eu as string)
        setVisible(false)}}
      children={$t({ defaultMessage: 'OK' })}
    />
  ]
  const getContent = <div>
    <UI.FieldLabel>{$t({ defaultMessage: 'WiFi4EU UUID' })}</UI.FieldLabel>
    <UI.FieldInput onChange={(e)=>setNewWifi4eu(e.target.value)}
      value={newWifi4eu}
      placeholder={
        $t({ defaultMessage: 'Copy from your WiFi4EU installation report' })}></UI.FieldInput>
  </div>

  return (
    <>
      <UI.SettingOutlined onClick={() => {
        setNewWifi4eu(wifi4eu)
        setVisible(true)}}/>
      <UI.Modal
        title={$t({ defaultMessage: 'WiFi4EU Snippet Settings' })}
        visible={visible}
        width={400}
        footer={footer}
        closable={false}
        maskClosable={false}
      >
        {getContent}
      </UI.Modal>
    </>

  )
}

