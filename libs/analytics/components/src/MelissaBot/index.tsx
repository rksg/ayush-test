
import { useEffect, useRef, useState } from 'react'

import { Input, Spin } from 'antd'
import { defer, get }  from 'lodash'
import moment          from 'moment-timezone'
import { useIntl }     from 'react-intl'
import { useLocation } from 'react-router-dom'

import { getUserProfile as getUserProfileRA } from '@acx-ui/analytics/utils'
import { Conversation, content }              from '@acx-ui/components'


import MelissaHeaderIcon from './melissaHeaderIcon.svg'
import MelissaIcon       from './melissaIcon.svg'
import { MelissaDrawer } from './styledComponents'

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
  const [messages,setMessages] = useState<content[]>([])

  const showDrawer = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }
  const imageAlt = $t({ defaultMessage: 'Chat with Melissa' })
  // const title = $t({ defaultMessage: 'Melissa infused with ChatGPT' })
  const title = <><span style={{ fontWeight: 700, fontSize: '16px' }}>Melissa</span>
    <span style={{
      fontSize: '12px',
      fontWeight: 700,
      paddingTop: '3px',
      marginLeft: '-5px' }}>infused with ChatGPT</span></>
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
      messages.push({ type: 'bot', contentList: fulfillmentMessages })
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
      src={MelissaIcon}
      alt={imageAlt}
      onClick={showDrawer}
      style={{
        position: 'fixed',
        right: '10px',
        bottom: '10px',
        zIndex: 999999,
        cursor: 'pointer'
      }} />}
    <MelissaDrawer
      title={title}
      icon={<img src={MelissaHeaderIcon} alt={imageAlt}/>}
      onClose={onClose}
      visible={open}
      width={464}
      footer={<Input ref={inputRef}
        placeholder='Ask anything'
        value={inputValue}
        disabled={isInputDisabled}
        onChange={(e) => {
          setInputValue(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const userMessage: content = {
              type: 'user',
              contentList: [{ text: { text: [inputValue] } }]
            }
            messages.push(userMessage)
            setIsLoading(true)
            setIsInputDisabled(true)
            setInputValue('')
            setMessages(messages)
            defer(() => {
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
        }} />}
    >
      <Conversation
        content={messages}
        classList='conversation'
        style={{ height: 410, width: 416, whiteSpace: 'pre-line' }} />
      {isLoading && <Spin />}
    </MelissaDrawer></>
  )
}