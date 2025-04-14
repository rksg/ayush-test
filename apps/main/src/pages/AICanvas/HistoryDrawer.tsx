import { useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import moment          from 'moment'
import { useIntl }     from 'react-intl'

import { Drawer, DrawerTypes, showActionModal, Tooltip } from '@acx-ui/components'
import { DeleteOutlined, EditOutlined, Check, Close }    from '@acx-ui/icons-new'
import { useDeleteChatMutation, useUpdateChatMutation }  from '@acx-ui/rc/services'
import { ChatHistory, HistoryListItem }                  from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export interface DrawerProps {
  visible: boolean
  onClose: () => void
  historyData: ChatHistory[]
  sessionId: string
  onClickChat: (id:string) => void
}
export default function HistoryDrawer (props: DrawerProps) {
  const { $t } = useIntl()
  const { visible, onClose, historyData, sessionId, onClickChat } = props
  const [updateChat] = useUpdateChatMutation()
  const [deleteChat] = useDeleteChatMutation()
  const [history, setHistory] = useState([] as HistoryListItem[])
  const [editModeId, setEditModeId] = useState('')
  const [form] = Form.useForm()
  const deletedHint = $t({ defaultMessage:
    'Older chat conversations will be deleted due to the 30-day retention policy.' })

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
    const list = checkDate([...response].reverse())
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

  useEffect(()=>{
    if(historyData?.length) {
      setHistoryList(historyData)
    } else if(historyData?.length === 0) {
      setHistory([])
    }
  }, [historyData])

  const onSubmit = (chat: ChatHistory) => {
    updateChat({
      params: { sessionId: chat.id },
      payload: form.getFieldValue('chatTitle')
    }).then(()=>{
      setTimeout(()=>{
        onCancelEditChat()
      }, 300)
    })
  }

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
        })
      }
    })
  }

  const isEditMode = (chat: ChatHistory) : boolean => {
    return (editModeId === chat.id)
  }

  const onEditChatTitle = (chat: ChatHistory) => {
    form.setFieldValue('chatTitle', chat.name)
    setEditModeId(chat.id)
  }

  const onCancelEditChat = () => {
    setEditModeId('')
  }

  const handleDrawerClose = () => {
    form.setFieldValue('chatTitle', '')
    onCancelEditChat()
    onClose()
  }

  const editChatTitle = (j: ChatHistory) =>
    <div className={'chat-title' + (sessionId === j.id ? ' active' : '') + ' edit'} key={j.id}>
      <div className='edit-input'>
        <Form.Item
          name='chatTitle'
          rules={[
            { required: true },
            { min: 1 },
            { max: 64 }
          ]}
          validateFirst
          children={<Input/>}
        />
      </div>
      <div className='action button-group'>
        <div className='button confirm'
          data-testid='confirm'
          onClick={() => {
            onSubmit(j)
          }}>
          <Check size='sm'/>
        </div>
        <div className='button cancel'
          data-testid='cancel'
          onClick={() => {
            onCancelEditChat()
          }}>
          <Close size='sm'/>
        </div>
      </div>
    </div>

  const content = <UI.History>
    <Form form={form} onFinish={onSubmit}>
      {
        history.map(i => <div className='duration' key={i.duration}>
          <div className='time'>{i.duration}</div>
          {
            i.history.map(j =>
            // eslint-disable-next-line max-len
              isEditMode(j) ? (
                editChatTitle(j)
              ) : (
                <div className={'chat-title' + (sessionId === j.id ? ' active' : '')} key={j.id}>
                  <Tooltip title={j.name}>
                    <div className='title' onClick={() => onClickChat(j.id)}>
                      {j.name}
                    </div>
                  </Tooltip>
                  <div className='action'>
                    <div className='button'
                      data-testid='edit'
                      onClick={()=> { onEditChatTitle(j) }}>
                      <EditOutlined size='sm' />
                    </div>
                    <div className='button'
                      data-testid='delete'
                      onClick={()=> { onDeleteChat(j) }}>
                      <DeleteOutlined size='sm' />
                    </div>
                  </div>
                </div>))
          }
        </div>)
      }
    </Form>
    <div className='hint'>{deletedHint}</div>
  </UI.History>

  return (
    <Drawer
      drawerType={DrawerTypes.ModalLeft}
      visible={visible}
      onClose={handleDrawerClose}
      children={content}
      placement={'left'}
      width={'320px'}
      mask={true}
      maskClosable={true}
      getContainer={false}
      style={{ position: 'absolute' }}
    />
  )
}
