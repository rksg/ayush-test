import { useEffect, useRef, useState } from 'react'

import { Form, Spin }   from 'antd'
import { debounce }     from 'lodash'
import moment           from 'moment'
import { DndProvider }  from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import { Button, Drawer, DrawerTypes, Loader, showActionModal, Tooltip } from '@acx-ui/components'
import { DeleteOutlined, EditOutlined, SendMessageOutlined,
  HistoricalOutlined, Plus, Close, RuckusAiDog }    from '@acx-ui/icons-new'
import { useChatAiMutation, useLazyGetChatQuery, useGetAllChatsQuery, useUpdateChatMutation,
  useDeleteChatMutation }          from '@acx-ui/rc/services'
import { ChatHistory, ChatMessage, HistoryListItem } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                from '@acx-ui/react-router-dom'

import Canvas             from './Canvas'
import { DraggableChart } from './components/WidgetChart'
import * as UI            from './styledComponents'


export default function AICanvas () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [chatAi] = useChatAiMutation()
  const [updateChat] = useUpdateChatMutation()
  const [deleteChat] = useDeleteChatMutation()
  const [getChat] = useLazyGetChatQuery()
  const [loading, setLoading] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [history, setHistory] = useState([] as HistoryListItem[])
  const [chats, setChats] = useState([] as ChatMessage[])
  const [form] = Form.useForm()

  const [ searchText, setSearchText ] = useState('')
  const scroll = useRef(null)
  const linkToDashboard = useTenantLink('/dashboard')
  const placeholder = $t({ defaultMessage: `Feel free to ask me anything about your deployment! 
  I can also generate on-the-fly widgets for operational data, including Alerts and Metrics.` })
  const questions = [
    'What can you do?',
    'Design custom metrics widget',
    'Generate alerts widget',
    'Generate device health widget'
  ]

  const getAllChatsQuery = useGetAllChatsQuery({})
  const { data: historyData } = getAllChatsQuery

  useEffect(()=>{
    form.setFieldValue('searchText', '')
  }, [])

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
    } as { [key:string]: ChatHistory[] }
    chats.forEach((chat: ChatHistory) => {
      const inputDate = moment(chat.updatedDate)
      const now = moment()
      const diffDays = now.diff(inputDate, 'days')

      if (diffDays === 0) {
        list.today.push(chat)
      } else if (diffDays === 1) {
        list.yesterday.push(chat)
      } else if (diffDays <= 7) {
        list.sevendays.push(chat)
      } else {
        const title = inputDate.format('MMMM D, YYYY')
        if(!list[title]) {
          list[title] = []
        }
        list[title].push(chat)
      }
    })
    return list
  }

  const setHistoryList = (response: ChatHistory[]) => {
    const latestId = response[response.length - 1].id
    if(sessionId !== latestId) {
      setSessionId(latestId)
    }
    const list = checkDate(response)
    const historyList = [] as HistoryListItem[]
    Object.keys(list).forEach(key => {
      if(list[key].length) {
        if(key === 'today') {
          historyList.push({
            duration: $t({ defaultMessage: 'Today' }),
            history: list[key].reverse()
          })
        } else if(key === 'yesterday') {
          historyList.push({
            duration: $t({ defaultMessage: 'Yesterday' }),
            history: list[key].reverse()
          })
        } else if(key === 'sevendays') {
          historyList.push({
            duration: $t({ defaultMessage: 'Previous 7 days' }),
            history: list[key].reverse()
          })
        } else {
          historyList.push({
            duration: key,
            history: list[key].reverse()
          })
        }
      }
    })
    setHistory(historyList)
  }

  useEffect(()=>{
    if(historyData?.length) {
      setHistoryList(historyData)
    }
  }, [historyData])

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
    }else{
      setSearchText(form.getFieldValue('searchQ'))
    }
  }
  const handleSearch = async (suggestion?: string) => {
    if ((!suggestion && searchText?.length <= 1) || loading) return
    const question = suggestion || searchText
    const newMessage = {
      id: uuidv4(),
      role: 'USER',
      text: question
    }
    setChats([...chats, newMessage])
    setLoading(true)
    // setSearchText('')
    form.setFieldValue('searchQ', '')
    const response = await chatAi({
      payload: {
        question,
        ...(sessionId && { sessionId })
      }
    }).unwrap()

    if(historyData && sessionId !== historyData[historyData.length - 1].id){
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
      {
        chat.created && <div className={`timestamp ${chat.role === 'USER' ? 'right' : ''}`}>
          {moment(chat.created).format('h:m A')}
        </div>
      }

    </div>
  }

  const onClickChat = (id: string) => {
    setSessionId(id)
    setHistoryVisible(false)
  }

  const onEditChatTitle = (chat: ChatHistory) => {
    updateChat({
      params: { sessionId: chat.id },
      payload: 'test123'
    }).then()
  }

  // const onEditIcon = (chat: ChatHistory) => {
  // }

  const onDeleteChat = (chat: ChatHistory) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Chat' }),
        entityValue: chat.name
      },
      onOk: () => {
        deleteChat({
          params: { sessionId: chat.id }
        }).then()
      }
    })
  }

  const content = <UI.History>
    {
      history.map(i => <div className='duration'>
        <div className='time'>{i.duration}</div>
        {
          i.history.map(j =>
            <div className={'chat' + (sessionId === j.id ? ' active' : '')}>
              <Tooltip title={j.name}>
                <div className='title' onClick={() => onClickChat(j.id)}>
                  {j.name}
                </div>
              </Tooltip>
              <div className='action'>
                <div className='button' onClick={()=> { onEditChatTitle(j) }}>
                  <EditOutlined size='sm' />
                </div>
                <div className='button' onClick={()=> { onDeleteChat(j) }}>
                  <DeleteOutlined size='sm' />
                </div>
              </div>
            </div>)
        }
      </div>)
    }
  </UI.History>

  const onHistoryDrawer = () => {
    setHistoryVisible(!historyVisible)
  }

  const onNewChat = () => {
    if(historyData && historyData.length >= 10){
      return
    }
    setSessionId('')
    setChats([])
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <UI.Wrapper>

        <div className='chat-wrapper'>
          <div className='chat'>
            <div className='header'>
              <div className='actions'>
                <HistoricalOutlined onClick={onHistoryDrawer} />
                <Tooltip
                  placement='right'
                  title={historyData && historyData.length >= 10
                    ? $t({ defaultMessage: `You’ve reached the maximum number of chats (10). 
                    Please delete an existing chat to add a new one.` })
                    : ''}
                >
                  <Plus
                    className={
                      'newChat' + (historyData && historyData.length >= 10 ? ' disabled' : '')
                    }
                    onClick={onNewChat}
                  />
                </Tooltip>
              </div>
              <div className='title'>
                <RuckusAiDog size='lg' />
                <span>{$t({ defaultMessage: 'RUCKUS AI' })}</span>
              </div>
              <div className='actions' style={{ width: '56px', justifyContent: 'end' }}>
                <Close onClick={()=>{onClose()}}/>
              </div>
            </div>
            <div className='content'>
              <Loader states={[{ isLoading: isChatLoading }]}>
                <div className='chatroom' ref={scroll}>
                  {/* <div className='placeholder'>
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
                  </div> */}
                  <div className='messages-wrapper'>
                    {chats?.map((i) => (
                      <Message key={i.id} chat={i} />
                    ))}
                    {loading && <div className='loading'><Spin /></div>}
                  </div>
                  {
                    !chats?.length && <div className='placeholder'>
                      {
                        questions.map(question => <div onClick={()=> {
                          handleSearch(question)
                        }}>
                          {question}
                        </div>)
                      }
                    </div>
                  }
                  <div className='input'>
                    <Form form={form}>
                      <Form.Item
                        name='searchQ'
                        children={<UI.Input
                          autoFocus
                          // value={searchText}
                          // onChange={({ target: { value } }) => setSearchText(value)}
                          onKeyDown={debounce(onKeyDown, 300)}
                          data-testid='search-input'
                          style={{ height: 90, resize: 'none' }}
                          placeholder={placeholder}
                        />}
                      />
                    </Form>
                    <Button
                      icon={<SendMessageOutlined />}
                      disabled={loading || searchText?.length <= 1}
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
