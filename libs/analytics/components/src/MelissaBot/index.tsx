import { useEffect, useRef, useState } from 'react'

import { Input, InputRef } from 'antd'
import { defer, get }      from 'lodash'
import moment              from 'moment-timezone'
import { useIntl }         from 'react-intl'
import { useLocation }     from 'react-router-dom'

import { getUserProfile as getUserProfileRA }        from '@acx-ui/analytics/utils'
import { Conversation, FulfillmentMessage, Content } from '@acx-ui/components'


import MelissaHeaderIcon                  from './melissaHeaderIcon.svg'
import MelissaIcon                        from './melissaIcon.svg'
import { MelissaDrawer, SubTitle, Title } from './styledComponents'

const scrollToBottom=()=>{
  const msgBody=document.querySelector('.ant-drawer-body')
  if(msgBody){
    msgBody.scrollTop = msgBody.scrollHeight
  }
}

const MELISSA_URL_ORIGIN=window.location.origin
const MELISSA_URL_BASE_PATH='/analytics'
const MELISSA_ROUTE_PATH='/api/ask-mlisa'

// To connect with local chatbot
// const MELISSA_URL_ORIGIN='http://localhost:31337'
// const MELISSA_URL_BASE_PATH=''
// const MELISSA_ROUTE_PATH=''

const uploadUrl = (id:string) => `${MELISSA_URL_ORIGIN}${MELISSA_URL_BASE_PATH}`+
  `${MELISSA_ROUTE_PATH}/upload/${id}`

interface AskMelissaBody {
  queryInput: {
    event?: {
      languageCode: string
      name: string
    }
    text?: {
      languageCode: string,
      text: string
    }
  }
}

export function MelissaBot (){
  const { $t } = useIntl()
  const { pathname } = useLocation()
  const inputRef = useRef<InputRef>(null)
  const initCount = useRef(0)
  const [open, setOpen] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [responseCount, setResponseCount] = useState(0)
  const [showFloatingButton, setShowFloatingButton] = useState(false)
  const [isInputDisabled, setIsInputDisabled] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [messages,setMessages] = useState<Content[]>([])
  const [incidentId, setIncidentId] = useState('')
  const [fileName, setFileName] = useState('')

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

  const addUploader = (incidentId: string, fileUploadButton:ChildNode ) => {
    const uploader = document.createElement('input')
    uploader.type = 'file'
    uploader.multiple = true
    uploader.addEventListener('change', async function (e) {
      const files : FileList = (e.target as HTMLInputElement).files!
      for (const file of files) {
        setFileName(file.name)
        const form = new FormData()
        form.append('file', file)
        await fetch(uploadUrl(incidentId), {
          method: 'POST',
          headers: {
            'X-Mlisa-Timezone': moment.tz.guess(),
            'X-Set-New-Ui': 'true'
          },
          body: form
        }).catch((error)=>{
          setIsReplying(false)
          // eslint-disable-next-line no-console
          console.error(error)
          const errorMessage: Content = {
            type: 'bot',
            contentList: [{ text: { text: [error.message] } }]
          }
          messages.push(errorMessage)
          setMessages(messages)
          setIsInputDisabled(false)
          defer(doAfterResponse)
        })
      }
      setIsReplying(false)
      setResponseCount(responseCount+1)
      const confirmMessage: Content = {
        type: 'bot',
        contentList: [{ text: { text: ['done!'] } }]
      }
      messages.push(confirmMessage)
      setMessages(messages)
      setIsInputDisabled(false)
      defer(doAfterResponse)
      setFileName('')
    })
    fileUploadButton.addEventListener('click', () => {
      uploader.click()
      /* istanbul ignore else */
      if(process.env['NODE_ENV']==='test'){
        uploader.setAttribute('data-testid','uploader')
        document.body.appendChild(uploader)
      }
    })
  }
  const imageAlt = $t({ defaultMessage: 'Chat with Melissa' })
  const melissaText = $t({ defaultMessage: 'Melissa' })
  const subTitleText = $t({ defaultMessage: 'infused with ChatGPT' })
  const askAnything = $t({ defaultMessage: 'Ask Anything' })
  const title = <><Title>{melissaText}</Title><SubTitle>{subTitleText}</SubTitle></>
  const askMelissa = (body:AskMelissaBody) => {
    const { userId } = getUserProfileRA()
    const MELISSA_API_ENDPOINT=`${MELISSA_ROUTE_PATH}/v1/integrations/messenger` +
      `/webhook/melissa-agent/sessions/dfMessenger-${userId}`
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
      const fulfillmentMessages:FulfillmentMessage[]=get(json,'queryResult.fulfillmentMessages')
      if(fulfillmentMessages) {
        const { incidentId: createdIncidentId } = get(fulfillmentMessages, '[2].data', {})
        if(createdIncidentId) {
          setIncidentId(createdIncidentId)
        }

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
      const errorMessage: Content = {
        type: 'bot',
        contentList: [{ text: { text: [error.message] } }]
      }
      messages.push(errorMessage)
      setMessages(messages)
      setIsInputDisabled(false)
      defer(doAfterResponse)
    })
  }
  useEffect(()=> {
    if (fileName) {
      setIsReplying(false)
      setResponseCount(responseCount+1)
      const uploadingMessage: Content = {
        type: 'bot',
        contentList: [{ text: { text: [`uploading ${fileName}...`] } }]
      }
      messages.push(uploadingMessage)
      setMessages(messages)
      setIsInputDisabled(false)
      defer(doAfterResponse)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileName])
  useEffect(()=>{
    if (incidentId) {
      addUploader(incidentId,
        document.querySelector('.ant-drawer-body .conversation')!.lastChild!)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[incidentId])
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
    /* istanbul ignore else */
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
        placeholder={askAnything}
        value={inputValue}
        disabled={isInputDisabled}
        style={{ height: '52px' }}
        onChange={(e) => {
          setInputValue(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const userMessage: Content = {
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