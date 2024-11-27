import { useState } from 'react'

import { v4 as uuidv4 }              from 'uuid'
import { useIntl }        from 'react-intl'

import { Button, cssStr }    from '@acx-ui/components'
import { HistoricalOutlined, Plus, RuckusAiDog, SendMessageOutlined } from '@acx-ui/icons'
import { useChatAiMutation }                        from '@acx-ui/rc/services'

import * as UI from './styledComponents'
import Grid from '../Grid'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { Spin } from 'antd'
import { ChatMessage, ChatWidget, RuckusAiChat } from '@acx-ui/rc/utils'


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
  const [chats, setChats] = useState([] as ChatMessage[]
  // [
  //   {
  //   id:'1',
  //   role: 'me',
  //   text: 'Generate Network Health Overview Widget'
  //   },
  //   {
  //     id: '2',
  //     role: 'ai',
  //     text: '2 widgets found- Alert and incidents widgets. Drag and drop the selected widgets to the canvas on the right.',
  //     widgets: [{
  //       chartrole: 'pie',
  //       payload: '',

  //     }]
  //   }
  // ]
  );
  const [widgets, setWidgets] = useState([] as ChatWidget[])
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
  const handleSearch = async() => {
    if (searchText.length <= 1) return
    console.log('searchText: ', searchText)
    const newMessage = {
      id: uuidv4(),
      role: 'me',
      text: searchText
    }
    setChats([...chats, newMessage])
    setLoading(true)
    setSearchText('')
    // const response = await chatAi({
    //   payload: {
    //     question: searchText,
    //     ...(sessionId && { session_id: sessionId })
    //   }
    // }).unwrap()
    const response: RuckusAiChat = {
      sessionId: '001',
      messages:  [
        {
        id:'1',
        role: 'me',
        text: 'Generate Network Health Overview Widget'
        },
        {
          id: '2',
          role: 'ai',
          text: '2 widgets found- Alert and incidents widgets. Drag and drop the selected widgets to the canvas on the right.',
          widgets: [{
            chartrole: 'pie',
            payload: '',
    
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
      if(response.messages[response.messages.length - 1].widgets) {
        setWidgets(response.messages[response.messages.length - 1].widgets)
      }
      console.log('widgets: ', widgets)
      // setChats([
      //   ...chats,
      //   newMessage,
      //   {
      //     id: '2',
      //     role: 'ai',
      //     text: '2 widgets found- Alert and incidents widgets. Drag and drop the selected widgets to the canvas on the right.',
      //     widgets: [{
      //       chartrole: 'pie',
      //       payload: '',
    
      //     }]
      //   }
      // ])
    }, 2000)
  }

  const onClose = () => {
    setDirty(false)
    setSectionsSubVisible(false)
    // setVisible(false)
    navigate(linkToDashboard)
  }

  const Message = (props:{chat: ChatMessage}) => {
    const { chat } = props
    return <div className='message'>
      <div className={`chat-container ${chat.role === 'me' ? "right" : ""}`}>
        <div className='chat-bubble'>
          {chat.text}
        </div>
      </div>
      {chat.role === 'ai' && <div className='show-widgets'>Show widgets</div>}
    </div>
  }

  return (
    <UI.Preview $siderWidth={siderWidth} $subToolbar={sectionsSubVisible}>
      <div className='chat'>
        <div className='header'>
          <div className='title'>
            <RuckusAiDog />
            <span>RUCKUS AI</span>
          </div>
          <div className='actions'>
            <Button icon={<Plus />} onClick={()=>{}} />
            <Button icon={<HistoricalOutlined />} onClick={()=>{}} />
          </div>
        </div>
        <div className='content'>
          <div className='chatroom'>
            <div className='placeholder'>
              <div>“Generate Network Health Overview Widget”</div>
              <div>“Device Inventory & Status Tracker Widget”</div>
              <div>“Real-Time Traffic Analysis Widget”</div>
              <div>“Bandwidth Utilization by Device Widget”</div>
            </div>
            <div className="messages-wrapper">
              {chats?.map((i) => (
                <Message key={i.id} chat={i} />
              ))}
              {loading && <div className='loading'><Spin /></div>}
            </div>
            <div className="input">
              <UI.Input
                autoFocus
                value={searchText}
                onChange={({ target: { value } }) => setSearchText(value)}
                onKeyDown={onKeyDown}
                data-testid='search-input'
                rows={10}
                placeholder={placeholder}
              />
              <Button icon={<SendMessageOutlined />} onClick={handleSearch} />
            </div>
          </div>
          <div className='widgets'>
          </div>
        </div>
      </div>
      <div className='canvas'>
        <div className='header'>
          <div className='title'>
            <span>Custom-1</span>
          </div>
          <div className='actions'>
            <Button role='primary' onClick={()=>{onClose()}}>
              {$t({ defaultMessage: 'Publish' })}
            </Button>
            <Button role='primary' onClick={()=>{onClose()}}>
              {$t({ defaultMessage: 'Save' })}
            </Button>
            <Button className='black' onClick={()=>{onClose()}}>
              {$t({ defaultMessage: 'Preview' })}
            </Button>
          </div>
        </div>
        <div className='grid'>
        </div>
      </div>
    </UI.Preview>
  )
}
