import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableProps, Button }                                       from '@acx-ui/components'
import { Features, useIsSplitOn }                                                  from '@acx-ui/feature-toggle'
import { useGetSwitchStaticRoutesQuery, useDeleteSwitchStaticRoutesMutation }      from '@acx-ui/rc/services'
import { defaultSort, sortProp, StaticRoute, SwitchRbacUrlsInfo, SwitchViewModel } from '@acx-ui/rc/utils'
import { SwitchScopes }                                                            from '@acx-ui/types'
import { filterByAccess }                                                          from '@acx-ui/user'
import { getOpsApi }                                                               from '@acx-ui/utils'

import StaticRoutesDrawer from './StaticRoutesDrawer'

const StaticRoutes = (props: { readOnly: boolean, switchDetail?: SwitchViewModel }) => {

  const { $t } = useIntl()
  const params = useParams()
  const { readOnly, switchDetail } = props
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<StaticRoute>()
  const { data, isFetching: isDataFetching } = useGetSwitchStaticRoutesQuery({
    params: { ...params, venueId: switchDetail?.venueId },
    enableRbac: isSwitchRbacEnabled
  })
  const [deleteSwitchStaticRoutes] = useDeleteSwitchStaticRoutesMutation()

  useEffect(() => {
  }, [data])

  const columns: TableProps<StaticRoute>['columns'] = [
    {
      title: $t({ defaultMessage: 'ID' }),
      key: 'id',
      dataIndex: 'id',
      show: false
    },{
      title: $t({ defaultMessage: 'Destination IP' }),
      key: 'destinationIp',
      dataIndex: 'destinationIp',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('destinationIp', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Next Hop' }),
      key: 'nextHop',
      dataIndex: 'nextHop',
      sorter: { compare: sortProp('nextHop', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Admin Distance' }),
      key: 'adminDistance',
      dataIndex: 'adminDistance',
      sorter: { compare: sortProp('adminDistance', defaultSort) }
    }
  ]

  const rowActions: TableProps<StaticRoute>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      scopeKey: [SwitchScopes.UPDATE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.addStaticRoute)],
      onClick: (selectedRows) => {
        openDrawer(selectedRows[0])
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: [SwitchScopes.UPDATE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.deleteStaticRoutes)],
      onClick: (selectedRows, clearSelection) => {
        deleteSwitchStaticRoutes({
          params: { ...params, venueId: switchDetail?.venueId || '' },
          payload: selectedRows.map(item => item.id),
          enableRbac: isSwitchRbacEnabled
        })
        clearSelection()
      }
    }
  ]

  const openDrawer = (data?: StaticRoute) => {
    setCurrentEditData(data)
    setDrawerVisible(true)
  }

  const toolBarRender = () => [
    isSupport8100 && switchDetail?.model?.startsWith('ICX8100')
      ? []
      : <Button type='link' onClick={() => openDrawer()} data-testid='addRouteButton'>
        {$t({ defaultMessage: 'Add Route' })}
      </Button>
  ]

  return (
    <Loader states={[
      {
        isLoading: false,
        isFetching: isDataFetching
      }
    ]}>
      <StaticRoutesDrawer
        switchDetail={switchDetail}
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        data={currentEditData}
      />
      <Table<StaticRoute>
        headerTitle={$t({ defaultMessage: 'Static Routes' })}
        toolBarRender={readOnly ? undefined : toolBarRender}
        columns={columns}
        rowActions={readOnly ? undefined : filterByAccess(rowActions)}
        dataSource={data}
        rowSelection={readOnly ? undefined : { type: 'checkbox' }}
        rowKey='id'
        type='form'
      />
    </Loader>
  )
}

export default StaticRoutes
