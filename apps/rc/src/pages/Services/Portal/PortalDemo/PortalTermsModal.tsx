import { useState } from 'react'

import TextArea    from 'antd/lib/input/TextArea'
import { useIntl } from 'react-intl'

import { Button } from '@acx-ui/components'

import * as UI from '../styledComponents'

export default function PortalTermsModal (props:{
  updateTermsConditions : (value:string)=>void,
  terms?:string
}) {
  const { $t } = useIntl()
  const { updateTermsConditions, terms } = props
  const [visible, setVisible]=useState(false)
  const [newTerms, setNewTerms]=useState(terms)
  const footer = [
    <Button
      key='back'
      type='link'
      onClick={()=>{
        setNewTerms(terms)
        setVisible(false)}}
      children={$t({ defaultMessage: 'Cancel' })}
    />,
    <Button
      key='forward'
      type='secondary'
      onClick={()=>{
        updateTermsConditions(newTerms as string)
        setVisible(false)}}
      children={$t({ defaultMessage: 'OK' })}
    />
  ]
  const getContent = <div>
    <TextArea placeholder={$t({ defaultMessage: 'Paste the text here...' })}
      value={newTerms}
      rows={8}
      onChange={(e)=>setNewTerms(e.target.value)}
      style={{ resize: 'none', borderRadius: 0 }}
    ></TextArea>
  </div>

  return (
    <>
      <UI.SettingOutlined onClick={() => {
        setNewTerms(terms)
        setVisible(true)}}/>
      <UI.Modal
        title={$t({ defaultMessage: 'Terms & Conditions' })}
        visible={visible}
        onCancel={()=>setVisible(false)}
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

