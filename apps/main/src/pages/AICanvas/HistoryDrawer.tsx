import { useEffect, useState } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { Drawer, DrawerTypes, showActionModal, Tooltip } from '@acx-ui/components'
import { DeleteOutlined, EditOutlined }                  from '@acx-ui/icons-new'
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
    } else if(historyData?.length === 0) {
      setHistory([])
    }
  }, [historyData])

  const onEditChatTitle = (chat: ChatHistory) => {
    //TODO: edit title UI
    updateChat({
      params: { sessionId: chat.id },
      payload: 'test123'
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

  const content = <UI.History>
    {
      history.map(i => <div className='duration' key={i.duration}>
        <div className='time'>{i.duration}</div>
        {
          i.history.map(j =>
            <div className={'chat' + (sessionId === j.id ? ' active' : '')} key={j.id}>
              <Tooltip title={j.name}>
                <div className='title' onClick={() => onClickChat(j.id)}>
                  {j.name}
                </div>
              </Tooltip>
              <div className='action'>
                <div className='button'
                  data-testid='edit'
                  style={{ cursor: 'not-allowed' }}
                  onClick={()=> { onEditChatTitle(j) }}>
                  <EditOutlined size='sm' />
                </div>
                <div className='button'
                  data-testid='delete'
                  onClick={()=> { onDeleteChat(j) }}>
                  <DeleteOutlined size='sm' />
                </div>
              </div>
            </div>)
        }
      </div>)
    }
  </UI.History>

  return (
    <Drawer
      drawerType={DrawerTypes.Left}
      visible={visible}
      onClose={onClose}
      children={content}
      placement={'left'}
      width={'320px'}
    />
  )
}
