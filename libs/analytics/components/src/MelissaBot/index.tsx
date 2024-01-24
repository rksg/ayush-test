/* eslint-disable max-len */
import { useEffect, useRef, useState } from 'react'

import { Input, InputRef } from 'antd'
import { defer, get }      from 'lodash'
import { useIntl }         from 'react-intl'
import { useLocation }     from 'react-router-dom'

import { Conversation, FulfillmentMessage, Content } from '@acx-ui/components'
import { useIsSplitOn, Features }                    from '@acx-ui/feature-toggle'
import { MelissaHeaderIcon, MelissaIcon }            from '@acx-ui/icons'

import { AskMelissaBody, queryAskMelissa, uploadFile } from './services'
import { MelissaDrawer, SubTitle, Title }              from './styledComponents'

export const BOT_NAME = 'Melissa'

const scrollToBottom=()=>{
  const msgBody=document.querySelector('.ant-drawer-body')
  if(msgBody){
    msgBody.scrollTop = msgBody.scrollHeight
  }
}

interface MelissaBotState{
  isOpen: boolean
  responseCount: number
  showFloatingButton: boolean
  isReplying: boolean
  isInputDisabled: boolean
  incidentId: string
}

const initialState:MelissaBotState = {
  isOpen: false,
  responseCount: 0,
  showFloatingButton: false,
  isReplying: false,
  isInputDisabled: false,
  incidentId: ''
}


export function MelissaBot (){
  const { $t } = useIntl()
  const GENERIC_ERROR_MSG= $t({ defaultMessage: 'Oops! We are currently experiencing unexpected technical difficulties. Please try again later.' })
  const isMelissaBotEnabled = useIsSplitOn(Features.RUCKUS_AI_CHATBOT_TOGGLE)
  const { pathname, search } = useLocation()
  const inputRef = useRef<InputRef>(null)
  const isSummaryLatest = useRef(false)
  const initCount = useRef(0)
  const [state,setState] = useState(initialState)
  const [inputValue, setInputValue] = useState('')
  const [messages,setMessages] = useState<Content[]>([])
  const [fileName, setFileName] = useState('')

  const showDrawer = () => {
    setState({ ...state,isOpen: true })
    defer(()=>{
      if(inputRef.current){
        inputRef.current.focus()
      }
    })
  }

  const onClose = () => {
    setState({ ...state,isOpen: false })
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
        await uploadFile(incidentId,form).catch((error)=>{
          // eslint-disable-next-line no-console
          console.error(error.message)
          setState({ ...state,isReplying: false })
          const errorMessage: Content = {
            type: 'bot',
            contentList: [{ text: { text: [GENERIC_ERROR_MSG] } }]
          }
          messages.push(errorMessage)
          setMessages(messages)
          defer(doAfterResponse)
        })
      }
      setState({ ...state,
        responseCount: state.responseCount+1,
        isReplying: false,
        isInputDisabled: false
      })
      const confirmMessage: Content = {
        type: 'bot',
        contentList: [{ text: { text: ['done!'] } }]
      }
      messages.push(confirmMessage)
      setMessages(messages)
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
  const subTitleText = $t({ defaultMessage: 'with Generative AI' })
  const askAnything = $t({ defaultMessage: 'Ask Anything' })
  const title = <><Title>{BOT_NAME}</Title><SubTitle>{subTitleText}</SubTitle></>
  const askMelissa = (body:AskMelissaBody) => {
    isMelissaBotEnabled && queryAskMelissa(body).then(async (json)=>{
      isSummaryLatest.current = false
      setState({ ...state,
        responseCount: state.responseCount+1,
        isReplying: false,
        isInputDisabled: false
      })
      const fulfillmentMessages:FulfillmentMessage[]=get(json,'queryResult.fulfillmentMessages')
      if(fulfillmentMessages) {
        const { incidentId: createdIncidentId } = get(fulfillmentMessages, '[3].data', {})
        if(createdIncidentId) {
          setState({ ...state,incidentId: createdIncidentId })
        }
        messages.push({ type: 'bot', contentList: fulfillmentMessages })
        setMessages(messages)
        defer(doAfterResponse)
      }else{
        const errorMessage:string=get(json,'error')
        if(errorMessage){
          throw new Error(errorMessage)
        }
        else
          throw new Error(GENERIC_ERROR_MSG)
      }
    }).catch((error)=>{
      // eslint-disable-next-line no-console
      console.error(error.message)
      setState({ ...state,
        isReplying: false,
        isInputDisabled: false })
      const errorMessage: Content = {
        type: 'bot',
        contentList: [{ text: { text: [GENERIC_ERROR_MSG] } }]
      }
      messages.push(errorMessage)
      setMessages(messages)
      defer(doAfterResponse)
    })
  }
  useEffect(()=> {
    if (fileName) {
      setState({ ...state,
        responseCount: state.responseCount+1,
        isReplying: false,
        isInputDisabled: false })
      const uploadingMessage: Content = {
        type: 'bot',
        contentList: [{ text: { text: [`uploading ${fileName}...`] } }]
      }
      messages.push(uploadingMessage)
      setMessages(messages)
      defer(doAfterResponse)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileName])
  useEffect(()=>{
    if (state.incidentId) {
      addUploader(state.incidentId,
        document.querySelector('.ant-drawer-body .conversation')!.lastChild!)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[state.incidentId])
  useEffect(()=>{
    if(pathname.includes('/dashboard')){
      setState({ ...state,showFloatingButton: false })
    }else if(state.responseCount){
      setState({ ...state,showFloatingButton: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[pathname,state.responseCount])
  useEffect(()=>{
    isSummaryLatest.current = false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[search])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function eventHandler (e:CustomEvent<{ isRecurringUser:boolean, summary: string }>){
    const { isRecurringUser, summary } = e.detail
    if(isRecurringUser && isSummaryLatest.current === false && summary){
      isSummaryLatest.current = true
      messages.push({
        type: 'bot',
        isRuckusAi: true,
        contentList: [{ text: { text: [summary] } }]
      })
      setMessages(messages)
      defer(doAfterResponse)
    }
    showDrawer()
  }
  useEffect(()=>{
    window.addEventListener('showMelissaBot',eventHandler as EventListener)
    return ()=>{
      window.removeEventListener('showMelissaBot',eventHandler as EventListener)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  useEffect(()=>{
    /* istanbul ignore else */
    if(initCount.current === 0){
      initCount.current +=1
      setInputValue('')
      setState({ ...state,isInputDisabled: true })
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
  return (isMelissaBotEnabled ? <>{state.showFloatingButton && <MelissaIcon
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
    icon={<MelissaHeaderIcon/>}
    onClose={onClose}
    visible={state.isOpen}
    width={390}
    footer={<Input ref={inputRef}
      placeholder={askAnything}
      value={inputValue}
      disabled={state.isInputDisabled}
      style={{ height: '52px' }}
      onChange={(e) => {
        setInputValue(e.target.value)
      }}
      onKeyDown={(e) => {
        const trimedInputValue = inputValue.trim()
        if (e.key === 'Enter' && trimedInputValue !== '') {
          const userMessage: Content = {
            type: 'user',
            contentList: [{ text: { text: [trimedInputValue] } }]
          }
          messages.push(userMessage)
          setState({ ...state, isReplying: true, isInputDisabled: true })
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
      isReplying={state.isReplying}
      classList='conversation'
      listCallback={askMelissa}
      style={{ height: 410, width: 350, whiteSpace: 'pre-line' }} />
  </MelissaDrawer></>
    : <div/>)
}