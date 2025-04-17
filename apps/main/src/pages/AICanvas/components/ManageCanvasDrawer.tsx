import { useState } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { Drawer, DrawerTypes, showActionModal }                      from '@acx-ui/components'
import { DeleteOutlined, EditOutlined, GlobeOutlined, LockOutlined } from '@acx-ui/icons-new'
import { useDeleteCanvasMutation }                                   from '@acx-ui/rc/services'
import { Canvas }                                                    from '@acx-ui/rc/utils'

import { DashboardIcon } from '../Canvas'
import * as UI           from '../styledComponents'

import { EditCanvasModal } from './EditCanvasModal'

export interface DrawerProps {
  visible: boolean
  onClose: () => void
  canvasList: Canvas[]
}
export default function ManageCanvasDrawer (props: DrawerProps) {
  const { $t } = useIntl()
  const { visible, onClose, canvasList } = props
  const [editCanvasVisible, setEditCanvasVisible] = useState(false)
  const [editCanvas, setEditCanvas] = useState({} as Canvas)
  const [deleteCanvas] = useDeleteCanvasMutation()

  const onEdit = (canvas: Canvas) => {
    setEditCanvas(canvas)
    setEditCanvasVisible(true)
  }

  const onDelete = (canvas: Canvas) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Canvas' }),
        entityValue: canvas.name
      },
      onOk: () => {
        deleteCanvas({
          params: { canvasId: canvas.id }
        })
      }
    })
  }

  const content = <div>
    {
      canvasList.map(item => <UI.CanvasListItem>
        <div className='info'>
          <div className='title'>
            <span className='name'>{ item.name }</span>
            { item.visible ? <GlobeOutlined size='sm' /> : <LockOutlined size='sm' /> }
            { item.dashboardIds && <DashboardIcon /> }
          </div>
          <div className='desp'>
            <span className='count'>{
              $t({ defaultMessage: '{count} widgets' }, { count: item?.widgetIds?.length || 0 })
            }</span>
            { item?.updatedDate && <span className='date'>{
              moment(item.updatedDate).format('YYYY/MM/DD')
            }</span> }
          </div>
        </div>

        <div className='action'>
          <div className='button'
            data-testid='edit'
            onClick={()=> { onEdit(item) }}>
            <EditOutlined size='sm' />
          </div>
          <div className='button'
            data-testid='delete'
            onClick={()=> { onDelete(item) }}>
            <DeleteOutlined size='sm' />
          </div>
        </div>
      </UI.CanvasListItem>)
    }
  </div>

  return (
    <>
      <Drawer
        title={$t({ defaultMessage: 'Manage My Canvases' })}
        drawerType={DrawerTypes.Default}
        visible={visible}
        onClose={onClose}
        children={content}
        width={'420px'}
        mask={true}
        maskClosable={true}
      />
      {
        editCanvasVisible && <EditCanvasModal
          visible={editCanvasVisible}
          handleCancel={()=> {setEditCanvasVisible(false)}}
          editCanvas={editCanvas}
        />
      }

    </>
  )
}
