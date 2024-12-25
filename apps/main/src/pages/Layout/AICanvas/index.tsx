import { useEffect, useRef, useState } from 'react'

import { Spin }         from 'antd'
import { DndProvider }  from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import { Button, Drawer, DrawerTypes }                                              from '@acx-ui/components'
import { CloseSymbol, RuckusAiDog, SendMessageOutlined, HistoricalOutlined, Plus  } from '@acx-ui/icons'
import { useChatAiMutation, useLazyGetChatQuery }                                   from '@acx-ui/rc/services'
import { ChatMessage }                                                              from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                               from '@acx-ui/react-router-dom'

import Canvas             from './Canvas'
import { DraggableChart } from './components/WidgetChart'
import * as UI            from './styledComponents'


export default function AICanvas () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [chatAi] = useChatAiMutation()
  const [getChat] = useLazyGetChatQuery()
  const [loading, setLoading] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [sessionId, setSessionId] = useState('134657a9-6357-4b58-81a9-c1005556ab4d')
  const [chats, setChats] = useState([] as ChatMessage[])

  const [ searchText, setSearchText ] = useState('')
  const scroll = useRef(null)
  const linkToDashboard = useTenantLink('/dashboard')
  const placeholder = $t({ defaultMessage: `Enter a description to generate widgets 
  based on your needs. The more you describe, the better widgets I can recommend.` })

  useEffect(()=>{
    setTimeout(()=>{
      // @ts-ignore
      scroll.current.scrollTo({ top: scroll.current.scrollHeight })
    }, 100)
  }, [chats])

  const getChats = async ()=>{
    const response = await getChat({ params: { sessionId } }).unwrap()
    setChats(response.messages)
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
      { chat.role === 'AI' && chat.widgets && <DraggableChart data={{
        ...chat.widgets[0],
        sessionId,
        id: chat.id,
        chatId: chat.id,
        axisType: chat.widgets[0]?.type // TODO: Remove after API response changed
      }}
      /> }

    </div>
  }
  const history = [
    {
      duration: 'Yesterday',
      history: [
        {
          title: 'Alerts and notifications'
        },
        {
          title: 'Device inventory & Status'
        }
      ]
    },
    {
      duration: 'Previous 7 days',
      history: [
        {
          title: 'Client related'
        },
        {
          title: 'Map'
        }
      ]
    },
    {
      duration: 'December 20, 2024',
      history: [
        {
          title: 'Network topology'
        }
      ]
    }
  ]

  const content = <UI.History>
    {
      history.map(i => <div className='duration'>
        <div className='title'>{i.duration}</div>
        {
          i.history.map(j => <div className='chat'>{j.title}</div>)
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
                    rows={10}
                    placeholder={placeholder}
                  />
                  <Button
                    icon={<SendMessageOutlined />}
                    disabled={loading || searchText.length <= 1}
                    onClick={()=> { handleSearch() }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Canvas />
        <Drawer
          drawerType={DrawerTypes.Dark}
          visible={historyVisible}
          onClose={onHistoryDrawer}
          children={content}
          placement={'left'}
          mask={true}
          maskClosable={true}
          maskStyle={{}}
          width={'400px'}
        />
      </UI.Wrapper>
    </DndProvider>

  )
}
