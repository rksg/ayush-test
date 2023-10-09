
import { useEffect, useRef, useState } from 'react'

import { Divider, Input } from 'antd'
import { defer, get }     from 'lodash'
import moment             from 'moment-timezone'
import { useIntl }        from 'react-intl'

import { getUserProfile as getUserProfileRA } from '@acx-ui/analytics/utils'
import { Drawer }                             from '@acx-ui/components'


import icon from './melissaIcon.png'

const scrollToBottom=()=>{
  const msgBody=document.querySelector('.ant-drawer-body')
  if(msgBody){
    msgBody.scrollTop = msgBody.scrollHeight
  }
}

export function MelissaBot (){
  const { $t } = useIntl()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef = useRef<any>(null)
  const [open, setOpen] = useState(false)
  const [isInputDisabled, setIsInputDisabled] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [messages,setMessages] = useState<string[]>([])

  const showDrawer = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }
  const imageAlt = $t({ defaultMessage: 'Chat with Melissa' })
  const title = $t({ defaultMessage: 'Melissa infused with ChatGPT' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const askMelissa = (body:any) => {
    const { userId } = getUserProfileRA()
    // eslint-disable-next-line max-len
    fetch(`${window.location.origin}/analytics/api/ask-mlisa/v1/integrations/messenger/webhook/melissa-agent/sessions/dfMessenger-${userId}`,
      { method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mlisa-Timezone': moment.tz.guess()
        },
        body: JSON.stringify(body)
      }).then(async (res)=>{
      const json=await res.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fulfillmentMessages:any[]=get(json,'queryResult.fulfillmentMessages')
      fulfillmentMessages.forEach(message=>{
        if(message.text){
          messages.push(message.text.text[0])
        }
      })
      setMessages(messages)
      setIsInputDisabled(false)
      defer(()=>{
        scrollToBottom()
        if(inputRef.current){
          inputRef.current.focus()
        }
      })
    })
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{
    setInputValue('')
    setIsInputDisabled(true)
    askMelissa({
      queryInput: {
        event: {
          languageCode: 'en',
          name: 'Welcome'
        }
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  return (
    <><img
      src={icon}
      alt={imageAlt}
      onClick={showDrawer}
      style={{
        position: 'fixed',
        right: '10px',
        bottom: '10px',
        zIndex: 999999,
        cursor: 'pointer'
      }} />
    <Drawer
      title={title}
      icon={<img src={icon} alt={imageAlt} style={{ height: '40px' }}/>}
      onClose={onClose}
      visible={open}
      width={400}
      footer={<Input ref={inputRef}
        placeholder='Ask Ruckus Chat anything'
        value={inputValue}
        disabled={isInputDisabled}
        onChange={(e)=>{
          setInputValue(e.target.value)
        }}
        onKeyDown={(e)=>{
          if(e.key === 'Enter'){
            messages.push(inputValue)
            setIsInputDisabled(true)
            setInputValue('')
            setMessages(messages)
            scrollToBottom()
            askMelissa({
              queryInput: {
                text: {
                  languageCode: 'en',
                  text: inputValue
                }
              }
            })
          }
        }}/>}
    >
      {messages.map((message) => <><p style={{ whiteSpace: 'pre-line' }}>
        {message}</p><Divider /></>)}
    </Drawer></>
  )
}