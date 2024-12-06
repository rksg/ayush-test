import { createContext, useState } from 'react'

import { Spin }         from 'antd'
import { DndProvider }  from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import { Button, cssStr }                                                    from '@acx-ui/components'
import { HistoricalOutlined, Plus, RuckusAiDog, SendMessageOutlined }        from '@acx-ui/icons'
import { useChatAiMutation }                                                 from '@acx-ui/rc/services'
import { ChatMessage, ChatWidget, RuckusAiChat, WidgetData, WidgetListData } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                        from '@acx-ui/react-router-dom'

import Canvas      from './Canvas'
import * as UI     from './styledComponents'
import WidgetChart from './WidgetChart'


export default function AICanvas (
//   props: {
//   visible: boolean, setVisible:(visible: boolean) => void
// }
) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [chatAi] = useChatAiMutation()
  // const { visible, setVisible } = props
  const [ sectionsSubVisible, setSectionsSubVisible ] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [chats, setChats] = useState([] as ChatMessage[])
  const [widgets, setWidgets] = useState([] as WidgetListData[])

  const [ dirty, setDirty ] = useState(false)
  const [ searchText, setSearchText ] = useState('')
  const siderWidth = localStorage.getItem('acx-sider-width') || cssStr('--acx-sider-width')
  const linkToDashboard = useTenantLink('/dashboard')
  const placeholder = 'Enter a description to generate widgets based on your needs. The more you describe, the better widgets I can recommend.'

  const onKeyDown = (event: React.KeyboardEvent) => {
    if(event.key === 'Enter'){
      event.preventDefault()
      handleSearch()
    }
  }
  const handleSearch = async (suggestion?: string) => {
    if (!suggestion && searchText.length <= 1) return
    const question = suggestion || searchText
    const newMessage = {
      id: uuidv4(),
      role: 'USER',
      text: question
    }
    setChats([...chats, newMessage])
    setLoading(true)
    setSearchText('')
    // const response = await chatAi({
    //   payload: {
    //     question,
    //     ...(sessionId && { sessionId })
    //   }
    // }).unwrap()
    const response: RuckusAiChat = {
      sessionId: '001',
      messages: [
        {
          id: '1',
          role: 'USER',
          text: 'Generate Network Health Overview Widget'
        },
        {
          id: '555',
          role: 'AI',
          text: '2 widgets found- Alert and incidents widgets. Drag and drop the selected widgets to the canvas on the right.',
          widgets: [{
            // title: 'Chart 1', TODO:
            chartType: 'pie'
          }]
        }
      ]
    }
    if(response.sessionId && !sessionId) {
      setSessionId(response.sessionId)
    }
    setTimeout(() => {
      setLoading(false)
      setChats(response.messages)
      const latest = response.messages[response.messages.length - 1]
      if(latest.widgets) {
        setWidgets([...widgets, {
          chartType: latest.widgets[0].chartType,
          sessionId: response.sessionId,
          id: latest.id
        }])
      }
    }, 1000)
  }

  const onClose = () => {
    setDirty(false)
    setSectionsSubVisible(false)
    // setVisible(false)
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
      { chat.role === 'AI' && chat.widgets?.length && <WidgetChart data={{
        chartType: chat.widgets[0].chartType,
        sessionId,
        id: chat.id
      }}
      /> }

    </div>
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <UI.Preview $siderWidth={siderWidth} $subToolbar={sectionsSubVisible}>
        <div className='chat'>
          <div className='header'>
            <div className='title'>
              <RuckusAiDog />
              <span>RUCKUS AI</span>
            </div>
            <div className='actions'>
              <Button icon={<Plus />} onClick={()=>{}} />
              <Button icon={<HistoricalOutlined />} onClick={()=>{onClose()}} />
            </div>
          </div>
          <div className='content'>
            <div className='chatroom'>
              <div className='placeholder'>
                <div onClick={()=> {
                  handleSearch('Generate Top Wi-Fi Networks Pie Chart')
                }}>
                “Generate Top Wi-Fi Networks Pie Chart”
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
                <Button icon={<SendMessageOutlined />} onClick={()=> { handleSearch() }} />
              </div>
            </div>
          </div>
        </div>
        <Canvas />
      </UI.Preview>
    </DndProvider>

  )
}
