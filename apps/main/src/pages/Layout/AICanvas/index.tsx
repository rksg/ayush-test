import { useState } from 'react'

import { Space, Divider, message } from 'antd'
import { useIntl }        from 'react-intl'

import { Button, cssStr }    from '@acx-ui/components'
import { HistoricalOutlined, Plus, RuckusAiDog, SendMessageOutlined } from '@acx-ui/icons'

import * as UI from './styledComponents'
import Grid from '../Grid'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

type ChatMessage = {
  id: string,
  type: string,
  text: string
}

export default function AICanvas (
//   props: {
//   visible: boolean, setVisible:(visible: boolean) => void
// }
) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  // const { visible, setVisible } = props
  const [ sectionsSubVisible, setSectionsSubVisible ] = useState(false)
  const [ restoreSubVisible, setRestoreSubVisible ] = useState(false)
  const [chats, setChats] = useState([{
    id:'1',
    type: 'me',
    text: 'Generate Network Health Overview Widget'
  },{
    id: '2',
    type: 'ai',
    text: '2 widgets found- Alert and incidents widgets. Drag and drop the selected widgets to the canvas on the right.',
    widgets: [{
      chartType: 'pie',
      payload: '',

    }]
  }
  ]);
  const [ dirty, setDirty ] = useState(false)
  const [ searchText, setSearchText ] = useState('')
  const siderWidth = localStorage.getItem('acx-sider-width') || cssStr('--acx-sider-width')
  const linkToDashboard = useTenantLink('/dashboard')
  const placeholder = 'Enter a description to generate widgets based on your needs. The more you describe, the better widgets I can recommend.'
  const onKeyDown = (event: React.KeyboardEvent) => event.key === 'Enter' && handleSearch()
  const handleSearch = () => {
    if (searchText.length <= 1) return
    console.log('searchText: ', searchText)
  }
  const onClose = () => {
    setDirty(false)
    setSectionsSubVisible(false)
    // setVisible(false)
    navigate(linkToDashboard)
  }

  const Message = (props:{chat: ChatMessage}) => {
    const { chat } = props
    return <div className={`chat-container ${chat.type === 'me' ? "right" : ""}`}>
      <div className='chat-bubble'>
        {chat.text}
      </div>
      {/* {chat.type === 'me' && <div className="show-widgets">Show widgets</div>} */}
    </div>
  }

  return (
    <UI.Preview $siderWidth={siderWidth} $subToolbar={sectionsSubVisible || restoreSubVisible}>
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
            <Button type='primary' onClick={()=>{onClose()}}>
              {$t({ defaultMessage: 'Publish' })}
            </Button>
            <Button type='primary' onClick={()=>{onClose()}}>
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
