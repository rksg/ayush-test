
import { useEffect, useRef, useState } from 'react'

import { Divider, Input, Spin } from 'antd'
import { defer, get }           from 'lodash'
import moment                   from 'moment-timezone'
import { useIntl }              from 'react-intl'
import { useLocation }          from 'react-router-dom'

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
  const { pathname } = useLocation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef = useRef<any>(null)
  const initCount = useRef(0)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [responseCount, setResponseCount] = useState(0)
  const [showFloatingButton, setShowFloatingButton] = useState(false)
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
      setIsLoading(false)
      setResponseCount(responseCount+1)
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
  useEffect(()=>{
    if(pathname.includes('/dashboard')){
      setShowFloatingButton(false)
    }else if(responseCount){
      setShowFloatingButton(true)
    }
  },[pathname,responseCount])
  const eventHandler:EventListener = ()=>{
    setOpen(true)
  }
  useEffect(()=>{
    window.addEventListener('showMelissaBot',eventHandler)
    return ()=>{
      window.removeEventListener('showMelissaBot',eventHandler)
    }
  },[])
  useEffect(()=>{
    if(initCount.current === 0){
      initCount.current +=1
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
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  return (
    <>{showFloatingButton && <img
      src={icon}
      alt={imageAlt}
      onClick={showDrawer}
      style={{
        position: 'fixed',
        right: '10px',
        bottom: '10px',
        zIndex: 999999,
        cursor: 'pointer'
      }} />}
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
            setIsLoading(true)
            setIsInputDisabled(true)
            setInputValue('')
            setMessages(messages)
            defer(()=>{
              scrollToBottom()
            })
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
      {isLoading && <Spin/>}
    </Drawer></>
  )
}