import { useEffect, useState } from 'react'

import { Form, Input }            from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { Modal }                    from '@acx-ui/components'
import { validateWifi4EuNetworkId } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'
export default function WiFi4euModal (props:{
  onChange: (value:string) => void,
  wifi4eu?: string,
  visible: boolean
  onCancel: ()=>void
}) {
  const { $t } = useIntl()
  const { onChange, wifi4eu, onCancel } = props
  const [visible, setVisible]=useState(false)
  const [newWifi4eu, setNewWifi4eu]=useState(wifi4eu)
  const [form] = Form.useForm()

  useEffect(()=> {
    setVisible(props.visible)
  }, [props.visible])

  const validator = (id?:string) => {
    if (validateWifi4EuNetworkId(id)){
      return Promise.resolve()
    }
    return Promise.reject()
  }

  const getContent = <Form
    form={form}
    layout='vertical'>
    <Form.Item
      name='wifi4eu_uuid'
      validateFirst
      validateTrigger={['onBlur']}
      label={$t({ defaultMessage: 'WiFi4EU UUID' })}
      children={<Input placeholder={
        $t({ defaultMessage: 'Copy from your WiFi4EU installation report' })}
      onChange={(e)=>setNewWifi4eu(e.target.value)}
      value={newWifi4eu}/>}
      rules={
        [
          {
            validator: (_, value) => validator(value),
            // eslint-disable-next-line max-len
            message: $t(defineMessage({ defaultMessage: 'Please provide a valid UUID' }))
          }
        ]
      }
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
          onCancel()
        }}
        onOk={async ()=>{
          try {
            await form.validateFields()
            onChange(newWifi4eu as string)
            setVisible(false)
          } catch(e) {
            // eslint-disable-next-line no-console
            console.log(e)
          }
        }}
        closable={false}
        maskClosable={false}
      >
        {getContent}
      </Modal>
    </>

  )
}

