import { useEffect, useRef, useState } from 'react'

import { Spin }         from 'antd'
import moment           from 'moment'
import { DndProvider }  from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import { Button, Drawer, DrawerTypes, Loader }                                      from '@acx-ui/components'
import { CloseSymbol, RuckusAiDog, SendMessageOutlined, HistoricalOutlined, Plus  } from '@acx-ui/icons'
import { useChatAiMutation, useLazyGetAllChatsQuery, useLazyGetChatQuery }          from '@acx-ui/rc/services'
import { ChatHistory, ChatMessage, HistoryListItem }                                from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                               from '@acx-ui/react-router-dom'

import Canvas             from './Canvas'
import { DraggableChart } from './components/WidgetChart'
import * as UI            from './styledComponents'


export default function AICanvas () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [chatAi] = useChatAiMutation()
  const [getChat] = useLazyGetChatQuery()
  const [getAllChats] = useLazyGetAllChatsQuery()
  const [loading, setLoading] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [history, setHistory] = useState([] as HistoryListItem[])
  const [chats, setChats] = useState([] as ChatMessage[])

  const [ searchText, setSearchText ] = useState('')
  const scroll = useRef(null)
  const linkToDashboard = useTenantLink('/dashboard')
  const placeholder = $t({ defaultMessage: `Feel free to ask me anything about your deployment! 
  I can also generate on-the-fly widgets for operational data, including Alerts and Metrics.` })

  useEffect(()=>{
    setTimeout(()=>{
      // @ts-ignore
      scroll?.current?.scrollTo({ top: scroll.current.scrollHeight })
    }, 100)
  }, [chats])

  const checkDate = (chats: ChatHistory[]) => {
    const list = {
      today: [],
      yesterday: [],
      sevendays: []
    } as { [key:string]: { title: string; id: string }[] }
    chats.forEach((chat: ChatHistory) => {
      const inputDate = moment(chat.updatedDate)
      const now = moment()
      const diffDays = now.diff(inputDate, 'days')

      if (diffDays === 0) {
        list.today.push({
          title: chat.name,
          id: chat.id
        })
      } else if (diffDays === 1) {
        list.yesterday.push({
          title: chat.name,
          id: chat.id
        })
      } else if (diffDays <= 7) {
        list.sevendays.push({
          title: chat.name,
          id: chat.id
        })
      } else {
        const title = inputDate.format('MMMM D, YYYY')
        if(!list[title]) {
          list[title] = []
        }
        list[title].push({
          title: chat.name,
          id: chat.id
        })
      }
    })
    return list
  }

  const getHistory = async () => {
    const response = await getAllChats({}).unwrap()
    if(response.length) {
      setSessionId(response[response.length - 1].id)
      const list = checkDate(response)
      const historyList = [] as HistoryListItem[]
      Object.keys(list).forEach(key => {
        if(list[key].length) {
          if(key === 'today') {
            historyList.push({
              duration: $t({ defaultMessage: 'Today' }),
              history: list[key]
            })
          } else if(key === 'yesterday') {
            historyList.push({
              duration: $t({ defaultMessage: 'Yesterday' }),
              history: list[key]
            })
          } else if(key === 'sevendays') {
            historyList.push({
              duration: $t({ defaultMessage: 'Previous 7 days' }),
              history: list[key]
            })
          } else {
            historyList.push({
              duration: key,
              history: list[key]
            })
          }
        }
      })
      setHistory(historyList)
    }
  }

  useEffect(()=>{
    getHistory()
  }, [])

  const getChats = async ()=>{
    setIsChatLoading(true)
    const response = await getChat({ params: { sessionId } }).unwrap()
    setChats(response.messages)
    setIsChatLoading(false)
  }

  useEffect(() => {
    if(sessionId) {
      getChats()
    }
  }, [sessionId])

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
    if(response.sessionId && !sessionId) {
      setSessionId(response.sessionId)
    }
    setLoading(false)
    setChats(response.messages)
  }

  const onClose = () => {
    navigate(linkToDashboard)
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

    </div>
  }

  const onClickChat = (id: string) => {
    setSessionId(id)
    setHistoryVisible(false)
  }

  const content = <UI.History>
    {
      history.map(i => <div className='duration'>
        <div className='title'>{i.duration}</div>
        {
          i.history.map(j =>
            <div
              className={'chat' + (sessionId === j.id ? ' active' : '')}
              onClick={() => onClickChat(j.id)}
            >
              {j.title}
            </div>)
        }
      </div>)
    }
  </UI.History>

  const onHistoryDrawer = () => {
    setHistoryVisible(!historyVisible)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <UI.Wrapper>

        <div className='chat-wrapper'>
          <div className='chat'>
            <div className='header'>
              <div className='actions'>
                <HistoricalOutlined onClick={onHistoryDrawer} />
                <Plus style={{ marginLeft: '16px' }} onClick={()=>{}} />
              </div>
              <div className='title'>
                <RuckusAiDog />
                <span>{$t({ defaultMessage: 'RUCKUS AI' })}</span>
              </div>
              <div className='actions' style={{ width: '56px', justifyContent: 'end' }}>
                <CloseSymbol onClick={()=>{onClose()}}/>
              </div>
            </div>
            <div className='content'>
              <Loader states={[{ isLoading: isChatLoading }]}>
                <div className='chatroom' ref={scroll}>
                  <div className='placeholder'>
                    <div onClick={()=> {
                      handleSearch('Generate Top Wi-Fi Networks Pie Chart')
                    }}>
                    “Generate Top Wi-Fi Networks Pie Chart”
                    </div>
                    <div onClick={()=> {
                      handleSearch('Generate Switch Traffic by Volume Line Chart')
                    }}>
                    “Generate Switch Traffic by Volume Line Chart”
                    </div>
                  </div>
                  <div className='messages-wrapper'>
                    {chats?.map((i) => (
                      <Message key={i.id} chat={i} />
                    ))}
                    {loading && <div className='loading'><Spin /></div>}
                  </div>
                  <div className='input'>
                    <UI.Input
                      autoFocus
                      value={searchText}
                      onChange={({ target: { value } }) => setSearchText(value)}
                      onKeyDown={onKeyDown}
                      data-testid='search-input'
                      style={{ height: 90, resize: 'none' }}
                      placeholder={placeholder}
                    />
                    <Button
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
        <Canvas />
        <Drawer
          drawerType={DrawerTypes.Left}
          visible={historyVisible}
          onClose={onHistoryDrawer}
          children={content}
          placement={'left'}
          width={'320px'}
        />
      </UI.Wrapper>
    </DndProvider>

  )
}
