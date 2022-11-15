import { useState } from 'react'

import TextArea    from 'antd/lib/input/TextArea'
import { useIntl } from 'react-intl'

import { Modal } from '@acx-ui/components'

import * as UI from '../styledComponents'

export default function PortalTermsModal (props:{
  updateTermsConditions : (value:string)=>void,
  terms?:string
}) {
  const { $t } = useIntl()
  const { updateTermsConditions, terms } = props
  const [visible, setVisible]=useState(false)
  const [newTerms, setNewTerms]=useState(terms)

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
      <Modal
        title={$t({ defaultMessage: 'Terms & Conditions' })}
        visible={visible}
        width={400}
        okText='OK'
        onCancel={()=>{
          setNewTerms(terms)
          setVisible(false)
        }}
        onOk={()=>{
          updateTermsConditions(newTerms as string)
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

