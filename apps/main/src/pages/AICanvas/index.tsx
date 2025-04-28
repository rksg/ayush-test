import { useCallback, useEffect, useRef, useState, memo } from 'react'

import { Divider, Form, Spin } from 'antd'
import { debounce }            from 'lodash'
import moment                  from 'moment'
import { DndProvider }         from 'react-dnd'
import { HTML5Backend }        from 'react-dnd-html5-backend'
import { useIntl }             from 'react-intl'
import { v4 as uuidv4 }        from 'uuid'

import { Button, Loader, showActionModal, Tooltip }               from '@acx-ui/components'
import { SendMessageOutlined,
  HistoricalOutlined, Plus, Close, CanvasCollapse, CanvasExpand }    from '@acx-ui/icons-new'
import { useChatAiMutation, useGetAllChatsQuery, useGetChatsMutation, useSendFeedbackMutation } from '@acx-ui/rc/services'
import { ChatHistory, ChatMessage }                                                             from '@acx-ui/rc/utils'

import Canvas, { CanvasRef, Group } from './Canvas'
import { DraggableChart }           from './components/WidgetChart'
import HistoryDrawer                from './HistoryDrawer'
import * as UI                      from './styledComponents'

const Message = (props:{
    chat: ChatMessage,
    sessionId:string,
    groups: Group[],
    canvasRef?: React.RefObject<CanvasRef>,
    onUserFeedback: (feedback: string, message: ChatMessage) => void
}) => {
  const { chat, sessionId, groups, canvasRef, onUserFeedback } = props
  const chatBubbleRef = useRef<HTMLDivElement>(null)
  const messageTailRef = useRef<HTMLDivElement>(null)
  const { $t } = useIntl()
  const deletedHint = $t({ defaultMessage:
    'Older chat conversations have been deleted due to the 30-day retention policy.' })

  const [sendFeedback] = useSendFeedbackMutation()

  const onSubmitFeedback = (feedback: boolean, message: ChatMessage) => {
    const userFeedback = feedback ? 'THUMBS_UP' : 'THUMBS_DOWN'
    if (userFeedback === message.userFeedback) {
      return
    }
    onUserFeedback(userFeedback, message)
    sendFeedback({
      params: { sessionId: sessionId, messageId: message.id },
      payload: feedback
    }).catch(()=> {
      onUserFeedback('', message)
    })
  }

  useEffect(() => {
    if (chatBubbleRef.current && messageTailRef.current) {
      const isFixed = messageTailRef.current.classList.contains('fixed') ||
        messageTailRef.current.classList.contains('message-tail')
      if (!isFixed) {
        messageTailRef.current.style.width = `${chatBubbleRef.current.offsetWidth}px`
      }
    }
  }, [chat.text])

  return chat.role ==='SYSTEM' ? <Divider plain>{deletedHint}</Divider>
    : <div className='message'>
      <div className={`chat-container ${chat.role === 'USER' ? 'right' : ''}`}>
        {/* eslint-disable-next-line max-len */}
        <div className='chat-bubble' ref={chatBubbleRef} dangerouslySetInnerHTML={{ __html: chat.text }} />
      </div>
      { chat.role === 'AI' && !!chat.widgets?.length && <DraggableChart data={{
        ...chat.widgets[0],
        sessionId,
        id: chat.id,
        chatId: chat.id
      }}
      groups={groups}
      removeShadowCard={canvasRef?.current?.removeShadowCard}
      /> }
      {
        chat.created &&
        <div ref={messageTailRef}
          data-testid='messageTail'
          // eslint-disable-next-line max-len
          className={`${chat.role === 'AI' ? 'ai-message-tail' : 'message-tail'} ${!!chat.widgets?.length ? 'fixed' : 'dynamic'} ${(!!chat.widgets?.length && chat.widgets[0].chartType === 'pie') ? 'fixed-narrower' : ''}`}>
          <div className={`timestamp ${chat.role === 'USER' ? 'right' : ''}`}>
            {moment(chat.created).format('hh:mm A')}
          </div>
          {
            chat.role === 'AI' &&
            <div className='user-feedback' data-testid={`user-feedback-${chat.id}`}>
              <UI.ThumbsUp
                data-testid='thumbs-up-btn'
                // eslint-disable-next-line max-len
                className={`${chat.userFeedback ? (chat.userFeedback === 'THUMBS_UP' ? 'clicked' : '') : ''}`}
                onClick={() => {
                  onSubmitFeedback(true, chat)
                }}
              />
              <UI.ThumbsDown
                data-testid='thumbs-down-btn'
                // eslint-disable-next-line max-len
                className={`${chat.userFeedback ? (chat.userFeedback === 'THUMBS_DOWN' ? 'clicked' : '') : ''}`}
                onClick={() => {
                  onSubmitFeedback(false, chat)
                }}
              />
            </div>
          }
        </div>
      }
    </div>
}

const Messages = memo((props:{
  moreloading: boolean,
  aiBotLoading: boolean,
  chats: ChatMessage[],
  sessionId:string,
  groups: Group[],
  canvasRef: React.RefObject<CanvasRef>,
  onUserFeedback: (feedback: string, message: ChatMessage) => void
})=> {
  const { $t } = useIntl()
  const welcomeMessage = {
    id: 'welcomeMessage',
    role: 'AI',
    text: $t({ defaultMessage:
      'Hello, I am RUCKUS digital system engineer, you can ask me anything about your network.' })
  }
  const { moreloading, aiBotLoading, chats, sessionId, groups, canvasRef, onUserFeedback } = props
  return <div className='messages-wrapper'>
    {
      !chats?.length && <Message key={welcomeMessage.id}
        chat={welcomeMessage}
        sessionId={sessionId}
        groups={groups}
        onUserFeedback={onUserFeedback} />
    }
    {moreloading && <div className='loading'><Spin /></div>}
    {chats?.map((i) => (
      // eslint-disable-next-line max-len
      <Message key={i.id} chat={i} sessionId={sessionId} groups={groups} canvasRef={canvasRef} onUserFeedback={onUserFeedback}/>
    ))}
    {aiBotLoading && <div className='loading'><Spin /></div>}
  </div>})

export default function AICanvasModal (props: {
  isModalOpen: boolean,
  setIsModalOpen: (p: boolean) => void
  editCanvasId?: string
}) {
  const { isModalOpen, setIsModalOpen, editCanvasId } = props
  const canvasRef = useRef<CanvasRef>(null)
  const { $t } = useIntl()
  const scrollRef = useRef(null)
  const [form] = Form.useForm()
  const [chatAi] = useChatAiMutation()
  const [getChats] = useGetChatsMutation()
  const [aiBotLoading, setAiBotLoading] = useState(false)
  const [moreloading, setMoreLoading] = useState(false)
  const [isChatsLoading, setIsChatsLoading] = useState(true)
  const [reload, setReload] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [canvasHasChanges, setCanvasHasChanges] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [chats, setChats] = useState([] as ChatMessage[])
  const [ searchText, setSearchText ] = useState('')
  const [ isNewChat, setIsNewChat ] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(2)
  const [groups, setGroups] = useState([] as Group[])
  const [showCanvas, setShowCanvas] = useState(localStorage.getItem('show-canvas') == 'true')
  const [skipScrollTo, setSkipScrollTo] = useState(false)

  const maxSearchTextNumber = 300
  const placeholder = $t({ defaultMessage: `Feel free to ask me anything about your deployment!
  I can also generate on-the-fly widgets for operational data, including Alerts and Metrics.` })

  const questions = [
    'What can you do?',
    'Give me a table for the Top 10 clients based on traffic.',
    'Show me the trending of the network traffic for last week.',
    'How many clients were connected to my network yesterday?'
  ] // Only support english default questions



  const getAllChatsQuery = useGetAllChatsQuery({})
  const { data: historyData } = getAllChatsQuery

  useEffect(()=>{
    if(page === 1 || aiBotLoading) {
      setTimeout(()=>{
        if (skipScrollTo) {
          setSkipScrollTo(false)
          return
        }
        // @ts-ignore
        if(scrollRef?.current?.scrollTo){
          // @ts-ignore
          scrollRef?.current?.scrollTo({ top: scrollRef.current.scrollHeight })
        }
      }, 100)
    }
  }, [chats])

  useEffect(()=>{
    if(historyData?.length) {
      const latestId = historyData[historyData.length - 1].id
      if(sessionId !== latestId) {
        setSessionId(latestId)
        setReload(true)
      }
    } else if(historyData?.length === 0) {
      setIsChatsLoading(false)
      setHistoryVisible(false)
      onNewChat()
    }
  }, [historyData])

  const getLatestPageChats = () => {
    getSessionChats(1)
    setPage(1)
  }

  useEffect(() => {
    if((!isNewChat && sessionId) || reload) {
      getLatestPageChats()
      if(reload) {
        setReload(false)
      }
    }
  }, [sessionId])

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    if(e.currentTarget.scrollTop === 0) {
      if(page < totalPages && sessionId) {
        const newPage = page + 1
        getSessionChats(newPage)
        setPage(newPage)
        if(newPage !== totalPages) {
          e.currentTarget.scrollTop = 20
        }
      }
    }
  }

  const getSessionChats = async (pageNum: number)=>{
    if(pageNum ===1) {
      setIsChatsLoading(true)
    } else {
      setMoreLoading(true)
    }
    const response = await getChats({
      params: { sessionId },
      payload: {
        page: pageNum,
        pageSize: 100,
        sortOrder: 'DESC'
      }
    }).unwrap()
    setTotalPages(response.totalPages)
    if(pageNum ===1) {
      setChats([...response.data].reverse())
    } else {
      setChats([...[...response.data].reverse(), ...chats])
    }
    if(pageNum ===1) {
      setIsChatsLoading(false)
    } else {
      setMoreLoading(false)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if(event.key === 'Enter' && !event.shiftKey){
      event.preventDefault()
      handleSearch()
    }
  }
  const handleSearch = async (suggestion?: string) => {
    if ((!suggestion && searchText.length <= 1) || aiBotLoading) return
    let question = suggestion || searchText
    question = question.replaceAll('\n', '<br/>')
    const newMessage = {
      id: uuidv4(),
      role: 'USER',
      text: question
    }
    setChats([...chats, newMessage])
    setAiBotLoading(true)
    setSearchText('')
    form.setFieldValue('searchInput', '')
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    await chatAi({
      customHeaders: { timezone },
      payload: {
        question,
        pageSize: 100,
        ...(sessionId && { sessionId })
      }
    })
      .then(({ data: response, error })=>{
        if(error) {
          getSessionChats(1)
        } else {
          if((historyData?.length && sessionId !== historyData[historyData.length - 1].id)
        || !historyData?.length){
            getAllChatsQuery.refetch()
          }
          if(sessionId && isNewChat) {
            setIsNewChat(false)
          }
          if(response) {
            if(response.sessionId && !sessionId) {
              setSessionId(response.sessionId)
            }
            setChats([...response.messages].reverse())
            setTotalPages(response.totalPages)
            setPage(1)
          }
        }
        setAiBotLoading(false)
      })
  }

  const checkChanges = (hasChanges:boolean, callback:()=>void, handleSave:()=>void) => {
    if (hasChanges) {
      showActionModal({
        type: 'confirm',
        width: 400,
        title: $t({ defaultMessage: 'Unsaved Changes' }),
        content: <div>
          {$t({ defaultMessage: 'Do you want to save your changes to Canvas:' })}
          <span style={{ padding: ' 0 1px 0 3px', fontWeight: '700' }}>
            {canvasRef?.current?.currentCanvas?.name}</span>?
          <div>{$t({ defaultMessage: 'Unsaved changes will be lost if discarded.' })}</div>
        </div>,
        customContent: {
          action: 'CUSTOM_BUTTONS',
          buttons: [{
            text: $t({ defaultMessage: 'Cancel' }),
            type: 'default',
            key: 'cancel'
          }, {
            text: $t({ defaultMessage: 'Discard' }),
            type: 'primary',
            key: 'discard',
            closeAfterAction: true,
            handler: callback
          }, {
            text: $t({ defaultMessage: 'Save' }),
            type: 'primary',
            key: 'ok',
            closeAfterAction: true,
            handler: handleSave
          }]
        }
      })
    } else {
      callback()
    }
  }

  const onClickClose = () => {
    checkChanges(canvasHasChanges, onClose, ()=> {
      handleSaveCanvas()
      onClose()
    })
  }

  const handleCanvasChange = useCallback((hasChanges: boolean) => {
    setCanvasHasChanges(hasChanges)
  }, [])

  const handleSaveCanvas = async () => {
    await canvasRef.current?.save()
    setCanvasHasChanges(false)
  }

  const onClose = () => {
    setIsModalOpen(false)
  }


  const onClickChat = (id: string) => {
    setIsNewChat(false)
    setSessionId(id)
    setHistoryVisible(false)
  }

  const onHistoryDrawer = () => {
    setHistoryVisible(!historyVisible)
  }

  const onNewChat = () => {
    if(historyData && historyData.length >= 10){
      return
    }
    setIsNewChat(true)
    setSessionId('')
    setChats([])
  }

  const cacheUserFeedback = (userFeedback: string, message: ChatMessage) => {
    const updatedMessage = {
      ...message,
      userFeedback: userFeedback
    }
    setSkipScrollTo(true)
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === message.id ? updatedMessage : chat
      )
    )
  }

  const onClickCanvasMode = () => {
    checkChanges(canvasHasChanges, ()=>{
      setCanvasMode(!showCanvas)
      setCanvasHasChanges(false)
    }, ()=>{
      handleSaveCanvas()
      setCanvasMode(!showCanvas)
    })
  }

  const setCanvasMode = (value: boolean) => {
    setShowCanvas(value)
    localStorage.setItem('show-canvas', value.toString())
  }

  return (
    <UI.ChatModal
      visible={isModalOpen}
      onCancel={onClose}
      width={showCanvas ? 'calc(100vw - 80px)' : '1000px'}
      style={{ top: 40, height: 'calc(100vh - 40px)' }}
      footer={null}
      closable={false}
      maskClosable={false}
      showCanvas={showCanvas}
    >
      <DndProvider backend={HTML5Backend}>
        <UI.Wrapper showCanvas={showCanvas}>
          <div className='chat-wrapper'>
            {
              historyVisible && <HistoryDrawer
                visible={historyVisible}
                onClose={onHistoryDrawer}
                historyData={historyData as ChatHistory[]}
                sessionId={sessionId}
                onClickChat={onClickChat}
              />
            }
            <div className='chat'>
              <div className='header'>
                <div className='actions'>
                  {historyData?.length ?
                    <>
                      <HistoricalOutlined data-testid='historyIcon' onClick={onHistoryDrawer} />
                      <Tooltip
                        placement='right'
                        title={historyData && historyData.length >= 10
                          ? $t({ defaultMessage: `You’ve reached the maximum number of chats (10).
                      Please delete an existing chat to add a new one.` })
                          : ''}
                      >
                        <Plus
                          data-testid='newChatIcon'
                          className={
                            'newChat' + (historyData && historyData.length >= 10 ?
                              ' disabled' : '')
                          }
                          onClick={onNewChat}
                        />
                      </Tooltip>
                    </> : null
                  }
                  {
                    showCanvas ? <CanvasCollapse
                      data-testid='canvasCollapseIcon'
                      onClick={onClickCanvasMode}
                    />
                      : <CanvasExpand
                        data-testid='canvasExpandIcon'
                        onClick={onClickCanvasMode}
                      />
                  }
                </div>
                <div className='title'>
                  <span>{$t({ defaultMessage: 'RUCKUS DSE' })}</span>
                </div>
                <div className='actions' style={{ width: '56px', justifyContent: 'end' }}>
                  <Close data-testid='close-icon' onClick={onClickClose}/>
                </div>
              </div>
              <div className='content'>
                <Loader states={[{ isLoading: isChatsLoading }]}
                  style={{
                    borderBottomLeftRadius: '24px',
                    borderBottomRightRadius: '24px'
                  }}>
                  <div className='chatroom' ref={scrollRef} onScroll={handleScroll}>
                    <Messages
                      moreloading={moreloading}
                      aiBotLoading={aiBotLoading}
                      chats={chats}
                      sessionId={sessionId}
                      canvasRef={canvasRef}
                      groups={groups}
                      onUserFeedback={cacheUserFeedback} />
                    {
                      !chats?.length && <div className='placeholder'>
                        {
                          questions.map(question => <div
                            key={question}
                            onClick={()=> {
                              handleSearch(question)
                            }}
                          >
                            {question}
                          </div>)
                        }
                      </div>
                    }
                  </div>
                  <div className='input'>
                    <Form form={form} >
                      <Form.Item
                        name='searchInput'
                        children={<UI.Input
                          autoFocus
                          maxLength={maxSearchTextNumber}
                          data-testid='search-input'
                          onKeyDown={onKeyDown}
                          onChange={debounce(({ target: { value } }) => setSearchText(value), 10)}
                          style={{ height: 90, resize: 'none' }}
                          placeholder={placeholder}
                        />}
                      />
                    </Form>
                    {
                      searchText.length > 0 && <div className='text-counter'>
                        {searchText.length + '/' + maxSearchTextNumber}</div>
                    }
                    <Button
                      data-testid='search-button'
                      icon={<SendMessageOutlined />}
                      disabled={aiBotLoading || searchText.length <= 1}
                      onClick={()=> { handleSearch() }}
                    />
                  </div>
                </Loader>
              </div>
            </div>
          </div>
          {
            showCanvas && <Canvas
              ref={canvasRef}
              canvasHasChanges={canvasHasChanges}
              onCanvasChange={handleCanvasChange}
              checkChanges={checkChanges}
              groups={groups}
              setGroups={setGroups}
              editCanvasId={editCanvasId}
            />
          }
        </UI.Wrapper>
      </DndProvider>
    </UI.ChatModal>
  )
}
