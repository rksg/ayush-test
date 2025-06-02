import { ChangeEvent, useEffect, useRef, useState } from 'react'

import { Checkbox, List, Dropdown, Menu, Space, MenuProps } from 'antd'
import _                                                    from 'lodash'
import moment                                               from 'moment-timezone'
import { useIntl }                                          from 'react-intl'

import { Button, Drawer, Loader, Tabs, showActionModal, Tooltip } from '@acx-ui/components'
import { SearchOutlined }                                         from '@acx-ui/icons'
import {
  AccountCircleSolid,
  GlobeOutlined,
  LockOutlined,
  MoreVertical
}                    from '@acx-ui/icons-new'
import {
  useCloneCanvasMutation,
  useDeleteCanvasMutation,
  useGetCanvasesQuery,
  useLazyGetCanvasesQuery,
  useLazyGetCanvasByIdQuery
} from '@acx-ui/rc/services'
import { Canvas, CanvasInfo, DashboardInfo } from '@acx-ui/rc/utils'
import { noDataDisplay }                     from '@acx-ui/utils'

import {
  MAXIMUM_OWNED_CANVAS,
  MAXIMUM_DASHBOARD
} from '../AICanvas/index.utils'

import * as UI from './styledComponents'

enum TabKey {
  Owned = 'owned',
  Shared = 'shared',
}

type CustomPayload = {
  searchString?: string,
  filters?: {
    isOwned: boolean[]
  }
}

type CanvasList = {
  owned: CanvasInfo[]
  shared: CanvasInfo[]
}

const getCanvasPayload = (customPayload?: CustomPayload) => {
  return {
    page: 1,
    pageSize: 9999,
    sortOrder: 'DESC',
    searchTargetFields: [
      'name', 'author'
    ],
    ...customPayload,
    filters: {
      usedAsOwnDashboard: [false],
      ...customPayload?.filters
    }
  }
}

export const ImportDashboardDrawer = (props: {
  visible: boolean
  dashboardList: DashboardInfo[]
  handleOpenPreview: (data: Canvas[]) => void
  handleOpenCanvas: (id?: string) => void
  onBackClick: () => void
  onImportClick: (keys: React.Key[]) => void
  onClose: () => void
}) => {
  const { $t } = useIntl()
  const { visible, dashboardList } = props
  const [activeTab, setActiveTab] = useState(TabKey.Owned)
  const [ownedCanvasList, setOwnedCanvasList] = useState([] as CanvasInfo[])
  const [sharedCanvasList, setSharedCanvasList] = useState([] as CanvasInfo[])
  const [selectedItem, setSelectedItem] = useState({} as CanvasInfo)
  const [selectedCanvases, setSelectedCanvases] = useState<React.Key[]>([])
  const [searchText, setSearchText] = useState('')

  const maximumImportCount = MAXIMUM_DASHBOARD - dashboardList.length
  const importedOwnedCanvasCount = dashboardList.filter(item => !item.authorId).length - 1
  const isCanvasLimitReached
    = (importedOwnedCanvasCount + ownedCanvasList.length) >= MAXIMUM_OWNED_CANVAS

  const [ getCanvases, getCanvasesState ] = useLazyGetCanvasesQuery()
  const [ getCanvasById ] = useLazyGetCanvasByIdQuery()
  const [ cloneCanvas ] = useCloneCanvasMutation()
  const [ deleteCanvas ] = useDeleteCanvasMutation()

  const getCanvasesQuery = useGetCanvasesQuery({
    payload: getCanvasPayload()
  }, {
    skip: !visible
  })
  const { data: canvasList } = getCanvasesQuery

  const canvasTabs = [{
    key: TabKey.Owned,
    label: $t({ defaultMessage: 'My Canvases' }),
    list: ownedCanvasList
  }, {
    key: TabKey.Shared,
    label: $t({ defaultMessage: 'Public Canvases' }),
    list: sharedCanvasList
  }]

  const debouncedSearch = useRef(_.debounce(async (searchText: string) => {
    const shared = await getSharedCanvasList(searchText)
    setSharedCanvasList(shared)
    setSelectedCanvases([])
  }, 500)).current

  const getCanvasList = async (refetch = false, customPayload?: CustomPayload) => {
    let list = canvasList
    const payload = getCanvasPayload(customPayload)

    if (refetch) {
      list = await getCanvases({
        payload }, false // force refetch
      ).unwrap()
    }

    return list
      ? list.data.reduce((acc, item) => {
        if (item.owned) {
          acc.owned.push(item)
        } else {
          acc.shared.push(item)
        }
        return acc
      }, { shared: [], owned: [] } as CanvasList)
      : { shared: [], owned: [] } as CanvasList
  }

  const getOwnedCanvasList = async () => {
    const { owned } = await getCanvasList()
    return owned
  }

  const getSharedCanvasList = async (searchText: string) => {
    const { shared } = await getCanvasList(true, {
      searchString: searchText,
      filters: {
        isOwned: [false]
      }
    })
    return shared
  }

  const handleCheck = (checked: boolean, id: React.Key) => {
    setSelectedCanvases(prev =>
      checked ? [...prev, id] : prev.filter(k => k !== id)
    )
  }

  const handleMenuClick: MenuProps['onClick'] = async (e) => {
    switch (e.key) {
      case 'edit':
        props.handleOpenCanvas(selectedItem.id)
        break
      case 'delete':
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Canvas' }),
            entityValue: selectedItem.name
          },
          onOk: async () => {
            await deleteCanvas({ params: { canvasId: selectedItem.id } })
            const { owned } = await getCanvasList()
            setOwnedCanvasList(owned)
            setSelectedCanvases([])
          }
        })
        break
      case 'clone':
        await cloneCanvas({
          params: { canvasId: selectedItem.id },
          payload: {}
        })
        const { owned } = await getCanvasList()
        setOwnedCanvasList(owned)
        setSelectedCanvases([])
        setActiveTab(TabKey.Owned)
        break
      default: // view
        await getCanvasById({
          params: { canvasId: selectedItem.id }
        }).unwrap().then(async (res) => {
          props.handleOpenPreview([res])
        })
        break
    }
  }

  const getActionMenu = (data: CanvasInfo) => {
    const isEditable = data.owned
    const menuItems = [{
      label: $t({ defaultMessage: 'View' }),
      key: 'view',
      visible: true
    }, {
      label: $t({ defaultMessage: 'Edit in Canvas Editor' }),
      key: 'edit',
      visible: isEditable
    }, {
      label: $t({ defaultMessage: 'Delete' }),
      key: 'delete',
      visible: isEditable
    }, {
      label: $t({ defaultMessage: 'Clone as Private Copy' }),
      key: 'clone',
      visible: !isCanvasLimitReached && !isEditable
    }].filter(item => item.visible)
      .map(({ visible, ...rest }) => rest)

    return <Menu
      onClick={handleMenuClick}
      items={menuItems}
    />
  }

  const renderCanvasList = (data: CanvasInfo[]) => {
    return <Loader
      style={{ //TODO: check with UX
        scale: getCanvasesState.isLoading ? '0.8' : '1',
        background: '#fff', minHeight: '100px'
      }}
      states={[{
        isFetching: false,
        isLoading: getCanvasesState.isLoading
      }]}>
      <List
        bordered={false}
        dataSource={data}
        itemLayout='vertical'
        size='small'
        renderItem={(item) => {
          const authorName = item.author || noDataDisplay
          const checkboxDisabled = !selectedCanvases.includes(item.id)
            && selectedCanvases.length === maximumImportCount
          return <UI.CanvasListItem>
            <Tooltip title={checkboxDisabled ?
              $t({ defaultMessage: 'Maximum of {maximum} dashboards reached, import unavailable' },
                { maximum: MAXIMUM_DASHBOARD }) : ''}
            placement='right'>
              <Checkbox
                checked={selectedCanvases.includes(item.id)}
                onChange={e => handleCheck(e.target.checked, item.id)}
                disabled={checkboxDisabled}
              >
                <div className='info'>
                  <div className='title'>
                    <span className='name' title={item.name}>{ item.name }</span>
                    { item?.visible ? <GlobeOutlined size='sm' /> : <LockOutlined size='sm' /> }
                  </div>
                  <div className='desp'>
                    <span className='count'>{
                      $t({ defaultMessage: '{count} widgets' }, { count: item.widgetCount })
                    }</span>
                    { item?.updatedDate && <span className='date'>{
                      moment(item.updatedDate).format('YYYY/MM/DD')
                    }</span> }
                    { !item?.owned && <span className='author'>
                      <Tooltip
                        title={$t({ defaultMessage: 'The creator or owner of this canvas.' })}
                        placement='bottom'
                        overlayInnerStyle={{ fontSize: '12px', minHeight: '28px' }}
                      >
                        <AccountCircleSolid size='sm' />
                        <span className='name'>{ authorName }</span>
                      </Tooltip>
                    </span>
                    }
                  </div>
                </div>
              </Checkbox>
            </Tooltip>

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
    </Loader>
  }

  useEffect(() => {
    if (visible) {
      getCanvasesQuery.refetch()
      setSelectedCanvases([])
    }
  }, [visible])

  useEffect(() => {
    const fetchCanvasList = async () => {
      const owned = await getOwnedCanvasList()
      const shared = await getSharedCanvasList(searchText)
      setOwnedCanvasList(owned)
      setSharedCanvasList(shared)
      setSelectedCanvases([])
    }
    if (visible) {
      fetchCanvasList()
    }
  }, [canvasList, visible])

  return <Drawer
    title={$t({ defaultMessage: 'Select Canvases for your Dashboards' })}
    width={420}
    onBackClick={props.onBackClick}
    visible={props.visible}
    onClose={props.onClose}
    zIndex={999}
    forceRender={true}
    destroyOnClose={false}
    mask={true}
    maskClosable={true}
    children={
      props.visible && <UI.Tabs
        type='third'
        activeKey={activeTab}
        defaultActiveKey={TabKey.Owned}
        onChange={(tab: string) => {
          setActiveTab(tab as unknown as TabKey)
        }}
      >
        {canvasTabs.map(tab => (
          <Tabs.TabPane tab={tab.label} key={tab.key} data-title={tab.label}>
            { tab.key === TabKey.Shared && visible && <UI.SearchInput
              data-testid='search-input'
              allowClear
              placeholder={$t({ defaultMessage: 'Search by canvas name or owner name..' })}
              prefix={<SearchOutlined />}
              defaultValue={searchText}
              onChange={async (event: ChangeEvent) => {
                const searchText = (event.target as HTMLInputElement).value
                setSearchText(searchText)
                debouncedSearch(searchText)
              }}
            />}
            { renderCanvasList(tab.list as CanvasInfo[]) }
          </Tabs.TabPane>
        ))}
      </UI.Tabs>}
    footer={
      <Space style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
        <Button
          onClick={() => props.handleOpenCanvas()}
          type='primary'
        >
          {$t({ defaultMessage: 'Canvas Creator' })}
        </Button>
        <div>
          <Button onClick={props.onBackClick}>
            {$t({ defaultMessage: 'Cancel' })}
          </Button>
          <Button
            onClick={() => {
              props.onImportClick(selectedCanvases)
            }}
            type='primary'
            disabled={selectedCanvases.length === 0}
          >
            {$t({ defaultMessage: 'Import ({count})' }, { count: selectedCanvases.length })}
          </Button>
        </div>
      </Space>
    }
  />
}