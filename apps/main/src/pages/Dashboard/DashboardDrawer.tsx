import React, { useEffect, useState } from 'react'

import { Dropdown, Menu, MenuProps, Tooltip } from 'antd'
import moment                                 from 'moment-timezone'
import { useIntl }                            from 'react-intl'

import { Button, Drawer }            from '@acx-ui/components'
import { MoveSolid, PentagramSolid } from '@acx-ui/icons'
import {
  AccountCircleSolid,
  MoreVertical
}                    from '@acx-ui/icons-new'

import * as UI from './styledComponents'

import { DashboardInfo } from './index'

import type { DataNode, TreeProps } from 'antd/es/tree'

export const DashboardDrawer = (props: {
  data: DashboardInfo[],
  visible: boolean
  onClose: () => void
  onNextClick: (visible: boolean) => void
  handlePreview: (id: string) => void
}) => {
  const { $t } = useIntl()
  const [selectedItem, setSelectedItem] = useState({} as DashboardInfo)
  const [dashboardList, setDashboardList] = useState(props.data as DataNode[])

  useEffect(() => {
    setDashboardList(props.data)
  }, [props.data])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onDragEnter: TreeProps['onDragEnter'] = (info) => {
  }

  const onDrop: TreeProps['onDrop'] = (info) => {
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
    const isDraggable = !((info.dragNode as unknown as DashboardInfo)?.isLanding === true)

    const loop = (
      data: DataNode[],
      key: React.Key,
      callback: (node: DataNode, i: number, data: DataNode[]) => void
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data)
        }
        if (data[i].children) {
          loop(data[i].children!, key, callback)
        }
      }
    }

    const data = [...dashboardList]
    if (!isDraggable || dropPosition === -1 ) {
      return
    }

    let dragObj: DataNode
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    let ar: DataNode[] = []
    let i: number
    loop(data, dropKey, (_item, index, arr) => {
      ar = arr
      i = index
    })
    if (dropPosition === -1) {
      ar.splice(i!, 0, dragObj!)
    } else {
      ar.splice(i! + 1, 0, dragObj!)
    }

    setDashboardList(data)
  }

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      case 'landing':
        break
      case 'edit':
        break
      case 'remove':
        break
      default: // view
        props.handlePreview(selectedItem.id)
        break
    }
  }

  const getActionMenu = (data: DashboardInfo) => {
    const isEditable = !data.author
    const isLanding = data.isLanding
    const isDefault = data.isDefault
    return <Menu
      onClick={handleMenuClick}
      items={[
        ...(!isLanding ? [{
          label: $t({ defaultMessage: 'Set as Landing Page' }),
          key: 'landing'
        }] : []),
        ...(!isDefault ? [{ //TODO: can view default dashboard
          label: $t({ defaultMessage: 'View' }),
          key: 'view'
        }] : []),
        ...(isEditable && !isDefault ? [{
          label: $t({ defaultMessage: 'Edit in Canvas Editor' }),
          key: 'edit'
        }, {
          label: $t({ defaultMessage: 'Remove from Dashboard' }),
          key: 'remove'
        }] : [])
      ]}
    />
  }

  return <Drawer
    title={$t({ defaultMessage: 'My Dashboards ({count})' }, { count: dashboardList?.length })}
    width={420}
    visible={props.visible}
    onClose={props.onClose}
    children={<>
      <UI.DashboardList
        className='draggable-tree'
        blockNode
        onDragEnter={onDragEnter}
        onDrop={onDrop}
        draggable={node => !(node as DashboardInfo).isLanding}
        treeData={dashboardList}
        titleRender={item => {
          const data = item as DashboardInfo
          const dropdownMenu = getActionMenu(data)
          const hasDropdownMenu = dropdownMenu.props.items.length > 0
          return (<>
            <div className={`mark ${data?.isLanding ? 'star' : 'move'}`}>{
              data?.isLanding
                // eslint-disable-next-line max-len
                ? <Tooltip title={$t({ defaultMessage: 'This dashboard is set as my account\'s landing page.' })}>
                  <PentagramSolid />
                </Tooltip>
                : <MoveSolid />
            }</div>
            <div className='info'>
              <div className='title'>{
                data.isDefault ? $t({ defaultMessage: 'RUCKUS One Default Dashboard' }) : data.name
              }</div>
              { data.widgetIds && <div className='desp'>
                { data.widgetIds && <span className='count'>{
                  $t({ defaultMessage: '{count} widgets' }, { count: data.widgetIds.length })
                }</span>
                }
                { data.updatedDate && <span className='date'>{
                  moment(data.updatedDate).format('YYYY/MM/DD')
                }</span> }
                { data.author && <span className='author'>
                  <AccountCircleSolid size='sm' style={{ marginRight: '4px' }} />
                  <span className='name'>{ data.author }</span>
                </span>
                }
              </div>}
            </div>
            {hasDropdownMenu && <div className='action'>
              <Dropdown overlay={dropdownMenu} trigger={['click']} key='actionMenu'>
                <Button
                  data-testid='dashboard-more-btn'
                  type='link'
                  size='small'
                  icon={<MoreVertical size='sm' />}
                  onClick={() => {
                    setSelectedItem(data)
                  }}
                />
              </Dropdown>
            </div>}
          </>) as React.ReactNode
        }}
      />

      <Button
        type='link'
        size='small'
        style={{ marginBottom: '30px' }}
        onClick={() => {
          props.onNextClick(true)
        }}
      >{
          $t({ defaultMessage: 'Import dashboards from available canvases' })
        }</Button>
    </>}
  />
}