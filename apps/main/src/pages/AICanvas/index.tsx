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
import { useChatAiMutation, useLazyGetChatQuery, useGetAllChatsQuery } from '@acx-ui/rc/services'
import { ChatHistory, ChatMessage }                                    from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                  from '@acx-ui/react-router-dom'

import Canvas, { CanvasRef } from './Canvas'
import { DraggableChart }    from './components/WidgetChart'
import HistoryDrawer         from './HistoryDrawer'
import * as UI               from './styledComponents'

export default function AICanvas () {
  const canvasRef = useRef<CanvasRef>(null)
  const { $t } = useIntl()
  const scroll = useRef(null)
  const linkToDashboard = useTenantLink('/dashboard')
  const navigate = useNavigate()
  const [chatAi] = useChatAiMutation()

  const [getChat] = useLazyGetChatQuery()
  const [loading, setLoading] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(true)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [canvasHasChanges, setCanvasHasChanges] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [chats, setChats] = useState([] as ChatMessage[])
  const [ searchText, setSearchText ] = useState('')
  const [ isNewChat, setIsNewChat ] = useState(false)

  const placeholder = $t({ defaultMessage: `Feel free to ask me anything about your deployment!
  I can also generate on-the-fly widgets for operational data, including Alerts and Metrics.` })

  const questions = [
    'What can you do?',
    'Design custom metrics widget',
    'Generate alerts widget',
    'Generate device health widget'
  ] // Only support english default questions in phase 1

  const getAllChatsQuery = useGetAllChatsQuery({})
  const { data: historyData } = getAllChatsQuery

  useEffect(()=>{
    setTimeout(()=>{
      // @ts-ignore
      scroll?.current?.scrollTo({ top: scroll.current.scrollHeight })
    }, 100)
  }, [chats])

  useEffect(()=>{
    if(historyData?.length) {
      const latestId = historyData[historyData.length - 1].id
      if(sessionId !== latestId) {
        setSessionId(latestId)
      }
    } else if(historyData?.length === 0) {
      setIsChatLoading(false)
      setHistoryVisible(false)
      onNewChat()
    }
  }, [historyData])

  useEffect(() => {
    if(!isNewChat && sessionId) {
      getChats()
    }
  }, [sessionId])

  const getChats = async ()=>{
    setIsChatLoading(true)
    const response = await getChat({ params: { sessionId } }).unwrap()
    setChats(response.messages)
    setIsChatLoading(false)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if(event.key === 'Enter'){
      event.preventDefault()
      handleSearch()
    }
  }
  const handleSearch = async (suggestion?: string) => {
    if ((!suggestion && searchText.length <= 1) || loading) return
    const question = suggestion || searchText
    const newMessage = {
      id: uuidv4(),
      role: 'USER',
      text: question
    }
    setChats([...chats, newMessage])
    setLoading(true)
    setSearchText('')
    const response = await chatAi({
      payload: {
        question,
        ...(sessionId && { sessionId })
      }
    }).unwrap()

    if((historyData?.length && sessionId !== historyData[historyData.length - 1].id)
      || !historyData?.length){
      getAllChatsQuery.refetch()
    }
    // const response: RuckusAiChat = {
    //   sessionId: '001',
    //   messages: [
    //     {
    //       id: '1',
    //       role: 'USER',
    //       text: 'Generate Network Health Overview Widget'
    //     },
    //     {
    //       id: '555',
    //       role: 'AI',
    //       text: `2 widgets found- Alert and incidents widgets. Drag and drop the selected widgets to
    //        the canvas on the right.`,
    //       widgets: [{
    //         title: '',
    //         chartType: 'pie'
    //       }]
    //     }
    //   ]
    // }
    if(sessionId && isNewChat) {
      setIsNewChat(false)
    }
    if(response.sessionId && !sessionId) {
      setSessionId(response.sessionId)
    }
    setLoading(false)
    setChats(response.messages)
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
    setSessionId('')
    setIsNewChat(true)
    setChats([])
  }

  const Message = (props:{ chat: ChatMessage }) => {
    const { chat } = props
    return <div className='message'>
      <div className={`chat-container ${chat.role === 'USER' ? 'right' : ''}`}>
        <div className='chat-bubble'>
          {chat.text}
        </div>
      </div>
      { chat.role === 'AI' && !!chat.widgets?.length && <DraggableChart data={{
        ...chat.widgets[0],
        sessionId,
        id: chat.id,
        chatId: chat.id
      }}
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
                <Close onClick={onClickClose}/>
              </div>
            </div>
            <div className='content'>
              <Loader states={[{ isLoading: isChatLoading }]}>
                <div className='chatroom' ref={scroll}>
                  <div className='messages-wrapper'>
                    {chats?.map((i) => (
                      <Message key={i.id} chat={i} />
                    ))}
                    {loading && <div className='loading'><Spin /></div>}
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
                      disabled={loading || searchText.length <= 1}
                      onClick={()=> { handleSearch() }}
                    />
                  </div>
                </div>
              </Loader>
            </div>
          </div>
        </div>
        <Canvas ref={canvasRef} onCanvasChange={handleCanvasChange} />
        <HistoryDrawer
          visible={historyVisible}
          onClose={onHistoryDrawer}
          historyData={historyData as ChatHistory[]}
          sessionId={sessionId}
          onClickChat={onClickChat}
        />
      </UI.Wrapper>
    </DndProvider>
  )
}
