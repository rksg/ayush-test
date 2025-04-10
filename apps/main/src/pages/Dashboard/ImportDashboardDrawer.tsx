import { ChangeEvent, useEffect, useState } from 'react'

import { Checkbox, List, Dropdown, Menu, Space, MenuProps } from 'antd'
import moment                                               from 'moment-timezone'
import { useIntl }                                          from 'react-intl'

import { Button, Drawer, showActionModal } from '@acx-ui/components'
import { SearchOutlined }                  from '@acx-ui/icons'
import {
  AccountCircleSolid,
  GlobeOutlined,
  LockOutlined,
  MoreVertical
}                    from '@acx-ui/icons-new'

import { mockCanvasList } from './mockData'
import * as UI            from './styledComponents'

export interface CanvasInfo {
  key: string
  id: string
  name: string
  updatedDate: string
  widgetCount: number
  visible: boolean //public
  author?: string
  usedAsOwnDashboard: boolean
}

export const ImportDashboardDrawer = (props: {
  visible: boolean
  handlePreview: (id: string) => void
  onBackClick: () => void
  onApplyClick: (keys: React.Key[]) => void
  onClose: () => void
}) => {
  const { $t } = useIntl()
  const { visible } = props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [canvasList, setCanvasList] = useState([] as CanvasInfo[])
  const [filteredCanvasList, setFilteredCanvasList] = useState([] as CanvasInfo[])
  const [selectedItem, setSelectedItem] = useState({} as CanvasInfo)
  const [selectedCanvases, setSelectedCanvases] = useState<React.Key[]>([])

  useEffect(() => {
    const list = getCanvasList()
    setCanvasList(list)
    setFilteredCanvasList(list)
    setSelectedCanvases(
      list.filter(canvas => canvas.usedAsOwnDashboard).map(canvas => canvas.key)
    )
  }, [visible])

  const getCanvasList = () => {
    return mockCanvasList.map((item) => {
      return { ...item, key: item.id }
    })
  }

  const handleCheck = (checked: boolean, key: React.Key) => {
    setSelectedCanvases(prev =>
      checked ? [...prev, key] : prev.filter(k => k !== key)
    )
  }

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      case 'edit':
        break
      case 'delete':
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Canvas' }),
            entityValue: selectedItem.name
          },
          onOk: () => {
          }
        })
        break
      case 'clone':
        break
      default: // view
        props.handlePreview(selectedItem.id)
        break
    }
  }

  const getActionMenu = (data: CanvasInfo) => {
    const isEditable = !data.visible || !data.author
    return <Menu
      onClick={handleMenuClick}
      items={[{
        label: $t({ defaultMessage: 'View' }),
        key: 'view'
      },
      ...(isEditable ? [{
        label: $t({ defaultMessage: 'Edit in Canvas Editor' }),
        key: 'edit'
      }, {
        label: $t({ defaultMessage: 'Delete' }),
        key: 'delete'
      }] : [{
        label: $t({ defaultMessage: 'Clone as Private Copy' }),
        key: 'clone'
      }])
      ]}
    />
  }

  return <Drawer
    title={$t({ defaultMessage: 'Import Dashboards' })}
    width={420}
    onBackClick={props.onBackClick}
    visible={props.visible}
    onClose={props.onClose}
    children={<>
      { $t({ defaultMessage: 'Available canvases:' }) }
      <UI.SearchInput
        data-testid='search-input'
        allowClear
        placeholder={$t({ defaultMessage: 'Search by canvas name or owner name..' })}
        prefix={<SearchOutlined />}
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onChange={(ev: ChangeEvent) => {
          //TODO: search by api
          // const text = (ev.target as HTMLInputElement).value
          // const lowerCaseText = text.toLowerCase()
          // setFilteredCanvasList(canvasList.filter(item => {
          //   return item.name.toLowerCase().includes(lowerCaseText)
          //     || item.author?.toLowerCase().includes(lowerCaseText)
          // }))
        }}
      />

      <List
        bordered={false}
        dataSource={filteredCanvasList}
        itemLayout='vertical'
        size='small'
        renderItem={(item) => {
          return <UI.ListItem>
            <Checkbox
              checked={selectedCanvases.includes(item.key)}
              onChange={e => handleCheck(e.target.checked, item.key)}
            >
              <div className='info'>
                <div className='title'>
                  <span className='name'>{ item.name }</span>
                  { item?.visible ? <GlobeOutlined size='sm' /> : <LockOutlined size='sm' /> }
                </div>
                <div className='desp'>
                  <span className='count'>{
                    $t({ defaultMessage: '{count} widgets' }, { count: item.widgetCount })
                  }</span>
                  { item?.updatedDate && <span className='date'>{
                    moment(item.updatedDate).format('YYYY/MM/DD')
                  }</span> }
                  { item?.author && <span className='author'>
                    <AccountCircleSolid size='sm' />
                    <span className='name'>{ item.author }</span>
                  </span>
                  }
                </div>
              </div>
            </Checkbox>

            <div className='action'>
              <Dropdown overlay={getActionMenu(item)} trigger={['click']} key='actionMenu'>
                <Button
                  data-testid='canvas-more-btn'
                  type='link'
                  size='small'
                  icon={<MoreVertical size='sm' />}
                  onClick={() => {
                    setSelectedItem(item)
                  }}
                />
              </Dropdown>
            </div>

          </UI.ListItem>
        }}
      />
    </>}
    footer={
      <Space style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
        <Button
          onClick={() => {}} //TODO
          type='primary'
        >
          {$t({ defaultMessage: 'Canvas Editor' })}
        </Button>
        <div>
          <Button onClick={props.onBackClick}>
            {$t({ defaultMessage: 'Cancel' })}
          </Button>
          <Button
            onClick={() => { //TODO
              // console.log('selectedCanvases: ', selectedCanvases)
              props.onApplyClick(selectedCanvases)
            }}
            type='primary'
          >
            {$t({ defaultMessage: 'Apply' })}
          </Button>
        </div>
      </Space>
    }
  />
}