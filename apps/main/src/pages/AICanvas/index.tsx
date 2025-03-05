import { useCallback, useEffect, useRef, useState } from 'react'

import { Spin }         from 'antd'
import { debounce }     from 'lodash'
import moment           from 'moment'
import { DndProvider }  from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import { Button, Loader, showActionModal, Tooltip } from '@acx-ui/components'
import { SendMessageOutlined,
  HistoricalOutlined, Plus, Close, RuckusAiDog }    from '@acx-ui/icons-new'
import { useChatAiMutation, useGetAllChatsQuery, useGetChatsMutation } from '@acx-ui/rc/services'
import { ChatHistory, ChatMessage }                                    from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                  from '@acx-ui/react-router-dom'

import Canvas, { CanvasRef, Group } from './Canvas'
import { DraggableChart }           from './components/WidgetChart'
import HistoryDrawer                from './HistoryDrawer'
import * as UI                      from './styledComponents'

export default function AICanvas () {
  const canvasRef = useRef<CanvasRef>(null)
  const { $t } = useIntl()
  const scrollRef = useRef(null)
  const linkToDashboard = useTenantLink('/dashboard')
  const navigate = useNavigate()
  const [chatAi] = useChatAiMutation()

  const [getChats] = useGetChatsMutation()
  const [aiBotLoading, setAiBotLoading] = useState(false)
  const [moreloading, setMoreLoading] = useState(false)
  const [isChatsLoading, setIsChatsLoading] = useState(true)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [canvasHasChanges, setCanvasHasChanges] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [chats, setChats] = useState([] as ChatMessage[])
  const [ searchText, setSearchText ] = useState('')
  const [ isNewChat, setIsNewChat ] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(2)
  const [groups, setGroups] = useState([] as Group[])

  const placeholder = $t({ defaultMessage: `Feel free to ask me anything about your deployment!
  I can also generate on-the-fly widgets for operational data, including Alerts and Metrics.` })

  const questions = [
    'What can you do?',
    'Show me the top-consuming clients.',
    'Generate a graph of my APs usage over the past 24 hours.',
    'Can you give me the trending network traffic from last week?'
  ] // Only support english default questions in phase 1

  const getAllChatsQuery = useGetAllChatsQuery({})
  const { data: historyData } = getAllChatsQuery

  useEffect(()=>{
    if(page === 1 || aiBotLoading) {
      setTimeout(()=>{
        // @ts-ignore
        scrollRef?.current?.scrollTo({ top: scrollRef.current.scrollHeight })
      }, 100)
    }
  }, [chats])

  useEffect(()=>{
    if(historyData?.length) {
      const latestId = historyData[historyData.length - 1].id
      if(sessionId !== latestId) {
        setSessionId(latestId)
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
    if(!isNewChat && sessionId) {
      getLatestPageChats()
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
    if(event.key === 'Enter'){
      event.preventDefault()
      handleSearch()
    }
  }
  const handleSearch = async (suggestion?: string) => {
    if ((!suggestion && searchText.length <= 1) || aiBotLoading) return
    const question = suggestion || searchText
    const newMessage = {
      id: uuidv4(),
      role: 'USER',
      text: question
    }
    setChats([...chats, newMessage])
    setAiBotLoading(true)
    setSearchText('')
    await chatAi({
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
            text: $t({ defaultMessage: 'Save Canvas' }),
            type: 'primary',
            key: 'ok',
            closeAfterAction: true,
            handler: handleSaveCanvas
          }, {
            text: $t({ defaultMessage: 'Discard Changes' }),
            type: 'primary',
            key: 'discard',
            closeAfterAction: true,
            handler: onClose
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

  const Message = (props:{ chat: ChatMessage }) => {
    const { chat } = props
    return <div className='message'>
      <div className={`chat-container ${chat.role === 'USER' ? 'right' : ''}`}>
        <div className='chat-bubble' dangerouslySetInnerHTML={{ __html: chat.text }} />
      </div>
      { chat.role === 'AI' && !!chat.widgets?.length && <DraggableChart data={{
        ...chat.widgets[0],
        sessionId,
        id: chat.id,
        chatId: chat.id
      }}
      groups={groups}
      /> }
      {
        chat.created && <div className={`timestamp ${chat.role === 'USER' ? 'right' : ''}`}>
          {moment(chat.created).format('hh:mm A')}
        </div>
      }
    </div>
  }

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
                <RuckusAiDog size='lg' />
                <span>{$t({ defaultMessage: 'RUCKUS One Assistant' })}</span>
              </div>
              <div className='actions' style={{ width: '56px', justifyContent: 'end' }}>
                <Close data-testid='close-icon' onClick={onClickClose}/>
              </div>
            </div>
            <div className='content'>
              <Loader states={[{ isLoading: isChatsLoading }]}>
                <div className='chatroom' ref={scrollRef} onScroll={handleScroll}>
                  <div className='messages-wrapper'>
                    {moreloading && <div className='loading'><Spin /></div>}
                    {chats?.map((i) => (
                      <Message key={i.id} chat={i} />
                    ))}
                    {aiBotLoading && <div className='loading'><Spin /></div>}
                  </div>
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
                    <UI.Input
                      autoFocus
                      data-testid='search-input'
                      onKeyDown={debounce(onKeyDown, 500)}
                      value={searchText}
                      onChange={({ target: { value } }) => setSearchText(value)}
                      style={{ height: 90, resize: 'none' }}
                      placeholder={placeholder}
                    />
                    <Button
                      data-testid='search-button'
                      icon={<SendMessageOutlined />}
                      disabled={aiBotLoading || searchText.length <= 1}
                      onClick={()=> { handleSearch() }}
                    />
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
