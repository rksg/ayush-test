import React, { useEffect, useState, useRef } from 'react'

import { Dropdown, Menu, MenuProps, Tooltip, Space }   from 'antd'
import moment                                          from 'moment-timezone'
import { DndProvider, useDrag, useDragLayer, useDrop } from 'react-dnd'
import { HTML5Backend }                                from 'react-dnd-html5-backend'
import { IntlShape, useIntl }                          from 'react-intl'

import { Button, Drawer }            from '@acx-ui/components'
import { MoveSolid, PentagramSolid } from '@acx-ui/icons'
import {
  AccountCircleSolid,
  MoreVertical
}                    from '@acx-ui/icons-new'
import {
  useReorderDashboardsMutation,
  useRemoveDashboardsMutation
} from '@acx-ui/rc/services'
import { DashboardInfo } from '@acx-ui/rc/utils'

import { ItemTypes }         from '../AICanvas/components/GroupItem'
import { MAXIMUM_DASHBOARD } from '../AICanvas/index.utils'

import { formatDashboardList } from './index.utils'
import * as UI                 from './styledComponents'


type ListItemProps = {
  item: DashboardInfo;
  index: number;
  handleDrag: (from: number, to: number) => void;
  handleReorder: () => void;
  handleMenuClick: MenuProps['onClick'],
  isDraggingItemRef: React.MutableRefObject<boolean>
}

function CustomDragPreview () {
  const { $t } = useIntl()
  const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset()
  }))

  if (!isDragging || !item || !currentOffset) {
    return null
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    top: 0,
    left: 0,
    transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
    zIndex: 100,
    width: '380px',
    cursor: 'grab'
  }

  return (
    <div style={style}>
      <UI.DashboardItem
        className='dragged'
        style={{ cursor: 'grab' }}
      >
        { getItemInfo({ item, $t }) }
      </UI.DashboardItem>
    </div>
  )
}

const getActionMenu = (
  data: DashboardInfo,
  handleMenuClick: MenuProps['onClick'],
  $t: IntlShape['$t']
) => {
  const isEditable = !data.author
  const isLanding = data.isLanding
  const isDefault = data.isDefault
  const getKey = (type: string) => `${type}_${data.id}`
  return <Menu
    onClick={handleMenuClick}
    items={[
      ...(!isLanding ? [{
        label: $t({ defaultMessage: 'Set as Landing Page' }),
        key: getKey('landing')
      }] : []),
      ...(!isDefault ? [{ //TODO: can view default dashboard
        label: $t({ defaultMessage: 'View' }),
        key: getKey('view')
      }] : []),
      ...(!isDefault && isEditable ? [{
        label: $t({ defaultMessage: 'Edit in Canvas Editor' }),
        key: getKey('edit')
      }] : []),
      ...(!isDefault ? [{
        label: $t({ defaultMessage: 'Remove from Dashboard' }),
        key: getKey('remove')
      }] : [])
    ]}
  />
}

const getItemInfo = (props: {
  item: DashboardInfo,
  $t: IntlShape['$t'],
  handleMenuClick?: MenuProps['onClick'],
}) => {
  const { item, $t, handleMenuClick } = props
  const dropdownMenu = getActionMenu(item, handleMenuClick, $t)
  const hasDropdownMenu = dropdownMenu.props.items.length > 0
  const dashboardName = item.isDefault
    ? $t({ defaultMessage: 'RUCKUS One Default Dashboard' }) : item.name

  return <>
    <div className={`mark ${item?.isLanding ? 'star' : 'move'}`}>{
      item?.isLanding
      // eslint-disable-next-line max-len
        ? <Tooltip title={$t({ defaultMessage: 'This dashboard is set as my account\'s landing page.' })}>
          <PentagramSolid />
        </Tooltip>
        : <MoveSolid />
    }</div>
    <div className='info'>
      <div className='title' title={dashboardName}>{ dashboardName }</div>
      { item.widgetIds && <div className='desp'>
        { item.widgetIds && <span className='count'>{
          $t({ defaultMessage: '{count} widgets' }, { count: item.widgetIds?.length })
        }</span>
        }
        { item.updatedDate && <span className='date'>{
          moment(item.updatedDate).format('YYYY/MM/DD')
        }</span> }
        { item.author && <span className='author'>
          <AccountCircleSolid size='sm' style={{ marginRight: '4px' }} />
          <span className='name' title={item.author}>{ item.author }</span>
        </span>
        }
      </div>}
    </div>
    {hasDropdownMenu && <div className='action'>
      <Dropdown
        overlay={dropdownMenu}
        key='actionMenu'
        trigger={['click']}
      >
        <MoreVertical
          size='sm'
          data-testid='dashboard-more-btn'
        // onClick={(e) => e.stopPropagation()}
        />
      </Dropdown>
    </div>}
  </>
}

export const DashboardDrawer = (props: {
  data: DashboardInfo[],
  visible: boolean
  onClose: () => void
  onNextClick: (visible: boolean) => void
  handleOpenPreview: (data: DashboardInfo[]) => void
  handleOpenCanvas: (id?: string) => void
}) => {
  const { $t } = useIntl()
  // const [selectedItem, setSelectedItem] = useState({} as DashboardInfo)
  const [dashboardList, setDashboardList] = useState(props.data as DashboardInfo[])
  const isDraggingItemRef = useRef(false)
  const [reorderDashboards] = useReorderDashboardsMutation()
  const [removeDashboards] = useRemoveDashboardsMutation()

  useEffect(() => {
    setDashboardList(props.data)
  }, [props.data])

  const handleMenuClick: MenuProps['onClick'] = async (e) => {
    const [action, id] = e.key.split('_')
    let updated = dashboardList
    const targetIndex = dashboardList.findIndex(item => item.id === id)
    switch (action) { // TODO: should call api
      case 'landing':
        updated = [
          dashboardList[targetIndex],
          ...dashboardList.slice(0, targetIndex),
          ...dashboardList.slice(targetIndex + 1)
        ]
        const updatedIds = updated.map(item => item.id)
        await reorderDashboards({ payload: updatedIds })
        setDashboardList(formatDashboardList(updated))
        break
      case 'edit':
        props.handleOpenCanvas(id)
        break
      case 'remove':
        updated = [
          ...dashboardList.slice(0, targetIndex),
          ...dashboardList.slice(targetIndex + 1)
        ]
        await removeDashboards({ payload: [id] })
        setDashboardList(formatDashboardList(updated))
        break
      default: // view
        const previewDashboard = dashboardList.filter(item => item.id === id)
        props.handleOpenPreview(previewDashboard)
        break
    }
  }

  const ListItem: React.FC<ListItemProps> = ({
    item, index, isDraggingItemRef, handleReorder, handleMenuClick
  }) => {
    const ref = useRef<HTMLDivElement>(null)
    const originalIndexRef = useRef<number | undefined>()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [{ isDragging, draggedItem }, drag, preview] = useDrag({
      type: ItemTypes.CARD,
      canDrag: () => index !== 0,
      item: () => {
        originalIndexRef.current = index
        isDraggingItemRef.current = true
        return { ...item, index }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        draggedItem: monitor.getItem()
      }),
      end: (item, monitor) => {
        const didDrop = monitor.didDrop()
        const originalIndex = originalIndexRef.current
        if (!didDrop && originalIndex !== undefined) {
          handleDrag(item.index, originalIndex)
        }
        originalIndexRef.current = undefined
        isDraggingItemRef.current = false
      }
    })

    const [, drop] = useDrop({
      accept: ItemTypes.CARD,
      hover (dragged: { index: number }, monitor) { //TODO
        const dragIndex = dragged.index
        const hoverIndex = index
        if (!ref.current) return
        if (dragIndex === hoverIndex) return

        const hoverBoundingRect = ref.current.getBoundingClientRect()
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
        const clientOffset = monitor.getClientOffset()
        if (!clientOffset) return

        const hoverClientY = clientOffset.y - hoverBoundingRect.top
        const shouldInsertAtIndex1 =
          hoverIndex === 1 && hoverClientY < hoverMiddleY

        if (hoverIndex === 0) return

        const targetIndex = shouldInsertAtIndex1 ? 1 : hoverIndex
        if (targetIndex === 0) return
        if (dragIndex === targetIndex) return

        handleDrag(dragIndex, targetIndex)
        dragged.index = targetIndex
        // isDraggingItemRef.current = false
      },
      drop: () => {
        handleReorder()
        isDraggingItemRef.current = false
      }
    })

    useEffect(() => {
      preview(null, { captureDraggingState: true })
    }, [preview])

    drag(drop(ref))

    return (
      <UI.DashboardItem {...!item.isLanding && { ref: ref }}
        className={`${draggedItem?.id === item.id ? 'dragging' : ''}`}
      >
        { getItemInfo({ item, $t, handleMenuClick }) }
      </UI.DashboardItem>
    )
  }

  const handleDrag = async (from: number, to: number) => {
    if (from === to || to === 0) return
    const updated = [...dashboardList]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    setDashboardList(formatDashboardList(updated))
  }

  const handleReorder = async () => {
    const updatedIds = dashboardList.map(item => item.id)
    await reorderDashboards({
      payload: updatedIds
    })
  }

  return <Drawer
    title={$t({ defaultMessage: 'My Dashboards ({count})' }, { count: dashboardList?.length })}
    subTitle={$t({ defaultMessage: 'Imports from private or public canvases' })}
    width={420}
    visible={props.visible}
    onClose={props.onClose}
    children={<DndProvider backend={HTML5Backend}>
      <UI.DashboardList className={isDraggingItemRef.current ? 'dragging' : ''}>
        {dashboardList.map((item, index) => (
          <ListItem
            key={item.id}
            item={item}
            index={index}
            isDraggingItemRef={isDraggingItemRef}
            handleDrag={handleDrag}
            handleReorder={handleReorder}
            handleMenuClick={handleMenuClick}
          />
        ))}
        <CustomDragPreview />
      </UI.DashboardList>
    </DndProvider>}
    footer={
      <Space style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
        <Tooltip title={dashboardList?.length === MAXIMUM_DASHBOARD
          // eslint-disable-next-line max-len
          ? $t({ defaultMessage: 'Maximum of {maximum} dashboards reached, import unavailable' }, { maximum: MAXIMUM_DASHBOARD })
          : ''
        }>
          <span>
            <Button
              onClick={() => props.onNextClick(true)}
              type='primary'
              disabled={dashboardList?.length === MAXIMUM_DASHBOARD}
            >
              {$t({ defaultMessage: 'Import Dashboard' })}
            </Button>
          </span>
        </Tooltip>
      </Space>
    }
  />
}