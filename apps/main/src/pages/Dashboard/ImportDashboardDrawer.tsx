import { ChangeEvent, useEffect, useState } from 'react'

import { Checkbox, List, Dropdown, Menu, Space, MenuProps } from 'antd'
import moment                                               from 'moment-timezone'
import { useIntl }                                          from 'react-intl'

import { Button, Drawer, Tabs, showActionModal } from '@acx-ui/components'
import { SearchOutlined }                        from '@acx-ui/icons'
import {
  AccountCircleSolid,
  GlobeOutlined,
  LockOutlined,
  MoreVertical
}                    from '@acx-ui/icons-new'

import { DashboardInfo }  from './index.utils'
import { mockCanvasList } from './mockData'
import * as UI            from './styledComponents'

enum TabKey {
  My = 'my',
  Shared = 'shared',
}

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
  dashboardList: DashboardInfo[]
  handlePreview: (id: string) => void
  onBackClick: () => void
  onApplyClick: (keys: React.Key[]) => void
  onClose: () => void
}) => {
  const { $t } = useIntl()
  const { visible, dashboardList } = props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [canvasList, setCanvasList] = useState([] as CanvasInfo[])
  const [myCanvasList, setMyCanvasList] = useState([] as CanvasInfo[])
  const [sharedCanvasList, setSharedCanvasList] = useState([] as CanvasInfo[])
  const [selectedItem, setSelectedItem] = useState({} as CanvasInfo)
  const [selectedCanvases, setSelectedCanvases] = useState<React.Key[]>([])
  const maximumImportCount = 10 - dashboardList.length

  useEffect(() => {
    const list = getCanvasList()
    const { my, shared } = list.reduce((acc, item) => {
      if (item.author) {
        acc.shared.push(item)
      } else {
        acc.my.push(item)
      }
      return acc
    }, { shared: [] as CanvasInfo[], my: [] as CanvasInfo[] })

    setCanvasList(list)
    setMyCanvasList(my)
    setSharedCanvasList(shared)
    setSelectedCanvases( //TODO
      list.filter(canvas => canvas.usedAsOwnDashboard).map(canvas => canvas.key)
    )
  }, [visible])

  const canvasTabs = [{
    key: TabKey.My,
    label: $t({ defaultMessage: 'My canvases' }),
    list: myCanvasList
  }, {
    key: TabKey.Shared,
    label: $t({ defaultMessage: 'Shared with me' }),
    list: sharedCanvasList
  }]

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

  const getList = (data: CanvasInfo[]) => {
    return <List
      bordered={false}
      dataSource={data}
      itemLayout='vertical'
      size='small'
      renderItem={(item) => {
        return <UI.CanvasListItem>
          <Checkbox
            checked={selectedCanvases.includes(item.key)}
            onChange={e => handleCheck(e.target.checked, item.key)}
            disabled={
              !selectedCanvases.includes(item.key)
            && selectedCanvases.length === maximumImportCount
            }
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

        </UI.CanvasListItem>
      }}
    />
  }

  return <Drawer
    title={$t({
      defaultMessage: 'Import Dashboards (up to {maximum})' }, { maximum: maximumImportCount }
    )}
    width={420}
    onBackClick={props.onBackClick}
    visible={props.visible}
    onClose={props.onClose}
    children={<UI.Tabs defaultActiveKey={TabKey.My} type='third'>
      {canvasTabs.map(tab => (
        <Tabs.TabPane tab={tab.label} key={tab.key}>
          { tab.key === TabKey.Shared && <UI.SearchInput
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
          />}
          { getList(tab.list as CanvasInfo[]) }
        </Tabs.TabPane>
      ))}
    </UI.Tabs>}
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
            {$t({ defaultMessage: 'Import ({count})' }, { count: selectedCanvases.length })}
          </Button>
        </div>
      </Space>
    }
  />
}