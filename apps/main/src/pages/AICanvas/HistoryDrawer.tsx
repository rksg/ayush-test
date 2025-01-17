import { useIntl } from 'react-intl'

import { Drawer, DrawerTypes, showActionModal, Tooltip } from '@acx-ui/components'
import { DeleteOutlined, EditOutlined }                  from '@acx-ui/icons-new'
import { useDeleteChatMutation, useUpdateChatMutation }  from '@acx-ui/rc/services'
import { ChatHistory, HistoryListItem }                  from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export interface DrawerProps {
  visible: boolean
  onClose: () => void
  history: HistoryListItem[]
  sessionId: string
  onClickChat: (id:string) => void
}
export default function HistoryDrawer (props: DrawerProps) {
  const { $t } = useIntl()
  const { visible, onClose, history, sessionId, onClickChat } = props
  const [updateChat] = useUpdateChatMutation()
  const [deleteChat] = useDeleteChatMutation()

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
