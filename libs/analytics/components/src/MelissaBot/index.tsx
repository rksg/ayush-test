
import { useEffect, useRef, useState } from 'react'

import { Input }       from 'antd'
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

const isLocal = true

let MELISSA_URL_ORIGIN=window.location.origin
let MELISSA_URL_BASE_PATH='/analytics'
let MELISSA_ROUTE_PATH='/api/ask-mlisa'

if(isLocal){
  MELISSA_URL_ORIGIN='http://localhost:31337'
  MELISSA_URL_BASE_PATH=''
  MELISSA_ROUTE_PATH=''
}

export function MelissaBot (){
  const { $t } = useIntl()
  const { pathname } = useLocation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef = useRef<any>(null)
  const initCount = useRef(0)
  const [open, setOpen] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
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
  const doAfterResponse = ()=>{
    scrollToBottom()
    if(inputRef.current){
      inputRef.current.focus()
    }
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
    const MELISSA_API_ENDPOINT=`${MELISSA_ROUTE_PATH}/v1/integrations/messenger/webhook/melissa-agent/sessions/dfMessenger-${userId}`
    const MELISSA_API_URL=`${MELISSA_URL_ORIGIN}${MELISSA_URL_BASE_PATH}${MELISSA_API_ENDPOINT}`
    fetch(MELISSA_API_URL,
      { method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mlisa-Timezone': moment.tz.guess(),
          'X-Set-New-Ui': 'true'
        },
        body: JSON.stringify(body)
      }).then(async (res)=>{
      const json=await res.json()
      setIsReplying(false)
      setResponseCount(responseCount+1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fulfillmentMessages:any[]=get(json,'queryResult.fulfillmentMessages')
      if(fulfillmentMessages){
        messages.push({ type: 'bot', contentList: fulfillmentMessages })
        setMessages(messages)
        setIsInputDisabled(false)
        defer(doAfterResponse)
      }else{
        const errorMessage:string=get(json,'error')
        if(errorMessage)
          throw new Error(errorMessage)
        else
          throw new Error('Something went wrong.')
      }
    }).catch((error)=>{
      setIsReplying(false)
      // eslint-disable-next-line no-console
      console.error(error)
      const errorMessage: content = {
        type: 'bot',
        contentList: [{ text: { text: [error.message] } }]
      }
      messages.push(errorMessage)
      setMessages(messages)
      setIsInputDisabled(false)
      defer(doAfterResponse)
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
        width: '56px',
        position: 'fixed',
        right: '15px',
        bottom: '15px',
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
            setIsReplying(true)
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
        isReplying={isReplying}
        classList='conversation'
        style={{ height: 410, width: 416, whiteSpace: 'pre-line' }} />
    </MelissaDrawer></>
  )
}