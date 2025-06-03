import { useCallback, useEffect, useRef, useState, memo } from 'react'

import { Divider, Form, InputRef, Spin } from 'antd'
import { debounce, difference }          from 'lodash'
import moment                            from 'moment'
import { DndProvider }                   from 'react-dnd'
import { HTML5Backend }                  from 'react-dnd-html5-backend'
import { useIntl }                       from 'react-intl'
import { v4 as uuidv4 }                  from 'uuid'

import { Loader, showActionModal, Tooltip } from '@acx-ui/components'
import {
  SendMessageSolid,
  HistoricalOutlined,
  Plus,
  Close
}    from '@acx-ui/icons-new'
import {
  useStreamChatsAiMutation,
  useGetAllChatsQuery,
  useGetChatsMutation,
  useStopChatMutation
} from '@acx-ui/rc/services'
import { ChatHistory, ChatMessage, RuckusAiChat } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }             from '@acx-ui/react-router-dom'

import {
  getStreamingWordingKey,
  StreamingMessages
} from '../../index.utils'

import Canvas, { CanvasRef, Group } from './Canvas'
import { DraggableChart }           from './components/WidgetChart'
import HistoryDrawer                from './HistoryDrawer'
import * as UI                      from './styledComponents'


enum MessageRole {
  AI = 'AI',
  SYSTEM = 'SYSTEM',
  STREAMING = 'STATUS',
  USER = 'USER'
}

const Message = (props:{
    chat: ChatMessage,
    sessionId:string,
    groups: Group[],
    canvasRef?: React.RefObject<CanvasRef>
  }) => {
  const { chat, sessionId, groups, canvasRef } = props
  const { $t } = useIntl()
  const deletedHint = $t({ defaultMessage:
    'Older chat conversations have been deleted due to the 30-day retention policy.' })

  const streamingMsgKey = chat.role === MessageRole.STREAMING
    ? getStreamingWordingKey(chat.text) : undefined

  return chat.role === MessageRole.SYSTEM
    ? <Divider plain>{deletedHint}</Divider>
    : <div className='message'>
      <div className={`chat-container ${chat.role === MessageRole.USER ? 'right' : ''}`}>
        { chat.role !== MessageRole.STREAMING
          // eslint-disable-next-line max-len
          ? <div className='chat-bubble' dangerouslySetInnerHTML={{ __html: chat.text }} />
          : <div className='chat-bubble loading' style={{ width: '90%' }}>
            <div className='loader'></div>
            { streamingMsgKey && $t(StreamingMessages[streamingMsgKey]) }
          </div>
        }
      </div>
      { chat.role === MessageRole.AI && !!chat.widgets?.length && <DraggableChart data={{
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
        <div className={`timestamp ${chat.role === MessageRole.USER ? 'right' : ''}`}>
          { chat.created !== '-' && chat.role !== MessageRole.STREAMING
            ? moment(chat.created).format('hh:mm A') : <>&nbsp;</>
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
  canvasRef: React.RefObject<CanvasRef>
})=> {
  const { $t } = useIntl()
  const welcomeMessage = {
    id: 'welcomeMessage',
    role: 'AI',
    text: $t({ defaultMessage:
      'Hello, I am RUCKUS digital system engineer, you can ask me anything about your network.' })
  }
  const { moreloading, chats, sessionId, groups, canvasRef } = props
  return <div className='messages-wrapper'>
    {
      !chats?.length && <Message key={welcomeMessage.id}
        chat={welcomeMessage}
        sessionId={sessionId}
        groups={groups} />
    }
    {moreloading && <div className='loading'><Spin /></div>}
    {chats?.map((i) => (
      <Message key={i.id} chat={i} sessionId={sessionId} groups={groups} canvasRef={canvasRef}/>
    ))}
  </div>})

export default function AICanvas () {
  const canvasRef = useRef<CanvasRef>(null)
  const { $t } = useIntl()
  const scrollRef = useRef(null)
  const searchInputRef = useRef<InputRef>(null)
  const linkToDashboard = useTenantLink('/dashboard')
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [streamChatsAi] = useStreamChatsAiMutation()
  const [getChats] = useGetChatsMutation()
  const [stopChat] = useStopChatMutation()
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
  const [streamingMessageIds, setStreamingMessageIds] = useState<string[] | []>([])

  const maxSearchTextNumber = 300
  const placeholder = $t({ defaultMessage: `Feel free to ask me anything about your deployment!
  I can also generate on-the-fly widgets for operational data, including Alerts and Metrics.` })

  const questions = [
    'What can you do?',
    'Give me a table for the Top 10 clients based on traffic.',
    'Show me the trending of the network traffic for last week.',
    'How many clients were connected to my network yesterday?'
  ] // Only support english default questions in phase 1



  const getAllChatsQuery = useGetAllChatsQuery({})
  const { data: historyData } = getAllChatsQuery

  useEffect(()=>{
    if(page === 1 || aiBotLoading) {
      setTimeout(()=>{
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

  const getSessionChats = async (pageNum: number, sessionChatId?: string)=>{
    if(pageNum ===1) {
      setIsChatsLoading(true)
    } else {
      setMoreLoading(true)
    }
    const id: string = sessionChatId || sessionId
    const response = await getChats({
      params: { sessionId: id },
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

  const handlePollStreaming = async (sessionId: string, streamMessageIds: string[]) => {
    try {
      const streamingResponse = await getChats({
        params: { sessionId },
        payload: {
          page: 1,
          pageSize: 100,
          sortOrder: 'DESC'
        }
      }).unwrap()

      const streamingMessageIds = streamingResponse.data
        .filter(msg => msg.role === MessageRole.STREAMING).map(msg => msg.id)
      const successedStreamIds = difference(streamMessageIds, streamingMessageIds)

      if (!!streamingMessageIds.length) {
        await new Promise(res => setTimeout(res, 300))
        setChats([...streamingResponse.data].reverse())
        await handlePollStreaming(sessionId, streamMessageIds)
      } else {
        if(streamingResponse) {
          const tempChats = streamingResponse.data.map(msg => {
            if (successedStreamIds.includes(msg.id)) {
              return {
                ...msg,
                role: MessageRole.STREAMING,
                text: '5'
              }
            }
            return msg
          })
          setChats(tempChats.reverse())
          setTimeout(()=>{
            setChats([...streamingResponse.data].reverse())
            setTotalPages(streamingResponse.totalPages)
            setPage(1)
          }, 500)
        }
        setAiBotLoading(false)
        setStreamingMessageIds([])
      }
    } catch (error) {
      console.error(error) // eslint-disable-line no-console
      setAiBotLoading(false)
      setStreamingMessageIds([])
      getSessionChats(1, sessionId)
    }
  }

  const handleSearch = async (suggestion?: string) => {
    if ((!suggestion && searchText.length <= 1) || aiBotLoading) return
    let question = suggestion || searchText
    question = question.replaceAll('\n', '<br/>')
    const newMessage = {
      id: uuidv4(),
      created: '-',
      role: MessageRole.USER,
      text: question
    }
    const fakeInitStreamingMessage = {
      id: uuidv4(),
      created: '-',
      role: MessageRole.STREAMING,
      text: '0'
    }
    setChats([...chats, newMessage, fakeInitStreamingMessage])
    setAiBotLoading(true)
    setSearchText('')
    form.setFieldValue('searchInput', '')
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    await streamChatsAi({
      customHeaders: { timezone },
      payload: {
        question,
        pageSize: 100,
        ...(sessionId && { sessionId })
      }
    }).then(async ({ data, error })=>{
      if(error) {
        getSessionChats(1)
      } else {
        const response = data as RuckusAiChat
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
          const startStreamingIds = response?.messages
            .filter(msg => msg.role === MessageRole.STREAMING).map(msg => msg.id)

          setStreamingMessageIds(startStreamingIds)
          await handlePollStreaming(response.sessionId, startStreamingIds)
        }
      }
    })
  }

  const handleStop = async () => {
    const [messageId] = streamingMessageIds
    if (messageId) {
      try {
        await stopChat({
          params: { sessionId, messageId },
          payload: {
            page: 1,
            pageSize: 100,
            sortOrder: 'DESC'
          }
        }).unwrap()
        searchInputRef.current?.focus()
      } catch (error) {
        // console.error(error) // eslint-disable-line no-console
      }
    }
  }

  const onClickClose = () => {
    if (canvasHasChanges) {
      showActionModal({
        type: 'confirm',
        width: 400,
        title: $t({ defaultMessage: 'Unsaved Canvas Changes' }),
        content: $t({ defaultMessage: 'Are you sure you want to cancel the chatbot?' +
            ' Unsaved changes to the canvas will be lost.' }),
        customContent: {
          action: 'CUSTOM_BUTTONS',
          buttons: [{
            text: $t({ defaultMessage: 'Cancel' }),
            type: 'default',
            key: 'cancel'
          }, {
            text: $t({ defaultMessage: 'Discard Changes' }),
            type: 'primary',
            key: 'discard',
            closeAfterAction: true,
            handler: onClose
          }, {
            text: $t({ defaultMessage: 'Save Canvas' }),
            type: 'primary',
            key: 'ok',
            closeAfterAction: true,
            handler: handleSaveCanvas
          }]
        }
      })
    } else {
      onClose()
    }
  }

  const handleCanvasChange = useCallback((hasChanges: boolean) => {
    setCanvasHasChanges(hasChanges)
  }, [])

  const handleSaveCanvas = async () => {
    await canvasRef.current?.save()
    setCanvasHasChanges(false)
    onClose()
  }

  const onClose = () => {
    navigate(linkToDashboard)
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

  const isStopAllowed = aiBotLoading && !!streamingMessageIds.length

  return (
    <DndProvider backend={HTML5Backend}>
      <UI.Wrapper>
        <div className='chat-wrapper'>
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
                          'newChat' + (historyData && historyData.length >= 10 ? ' disabled' : '')
                        }
                        onClick={onNewChat}
                      />
                    </Tooltip>
                  </> : null
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
              <Loader states={[{ isLoading: isChatsLoading }]}>
                <div className='chatroom' ref={scrollRef} onScroll={handleScroll}>
                  <Messages
                    moreloading={moreloading}
                    aiBotLoading={aiBotLoading}
                    chats={chats}
                    sessionId={sessionId}
                    canvasRef={canvasRef}
                    groups={groups} />
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
                  <div className='input'>
                    <Form form={form} >
                      <Form.Item
                        name='searchInput'
                        children={<UI.Input
                          ref={searchInputRef}
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
                    <Tooltip title={isStopAllowed ? $t({ defaultMessage: 'Stop generating' }) : ''}>
                      <UI.SearchButton
                        data-testid='search-button'
                        icon={aiBotLoading ? <UI.StopIcon /> : <SendMessageSolid />}
                        disabled={aiBotLoading ? !isStopAllowed : searchText.length <= 1}
                        onClick={()=> { aiBotLoading ? handleStop() : handleSearch() }}
                      />
                    </Tooltip>
                  </div>
                </div>
              </Loader>
            </div>
          </div>
        </div>
        <Canvas
          ref={canvasRef}
          onCanvasChange={handleCanvasChange}
          groups={groups}
          setGroups={setGroups}
        />
        {
          historyVisible && <HistoryDrawer
            visible={historyVisible}
            onClose={onHistoryDrawer}
            historyData={historyData as ChatHistory[]}
            sessionId={sessionId}
            onClickChat={onClickChat}
          />
        }
      </UI.Wrapper>
    </DndProvider>
  )
}
