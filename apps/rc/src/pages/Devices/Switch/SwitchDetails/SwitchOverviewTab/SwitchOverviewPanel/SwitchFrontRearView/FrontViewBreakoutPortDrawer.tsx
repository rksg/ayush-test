
import { useContext } from 'react'

import { Space, Tooltip } from 'antd'
import _                  from 'lodash'
import { useIntl }        from 'react-intl'

import { Table, TableProps, Drawer }                                     from '@acx-ui/components'
import { getInactiveTooltip }                                            from '@acx-ui/rc/components'
import {  SwitchPortStatus, defaultSort, sortProp, SwitchPortViewModel } from '@acx-ui/rc/utils'
import { filterByAccess }                                                from '@acx-ui/user'

import * as UI from './styledComponents'

import { SwitchPanelContext } from '.'


export interface BreakOutPortDrawerType {
  setDrawerVisible: (visible: boolean) => void,
  drawerVisible: boolean,
  portNumber: string,
  breakoutPorts: SwitchPortStatus[]
}

export function FrontViewBreakoutPortDrawer (props: BreakOutPortDrawerType) {
  const { $t } = useIntl()
  const { drawerVisible, setDrawerVisible, breakoutPorts, portNumber } = props
  const {
    editPortsFromPanelEnabled,
    setEditBreakoutPortDrawerVisible,
    selectedPorts,
    setSelectedPorts
  } = useContext(SwitchPanelContext)
  const breakoutPortsData = breakoutPorts?.map((port) => {
    return {
      ...port,
      inactiveRow: !!getInactiveTooltip(port),
      inactiveTooltip: getInactiveTooltip(port)
    }
  })

  const statusFilterOpts = [
    { key: '', value: $t({ defaultMessage: 'All Statuses' }) },
    {
      key: 'Up',
      value: $t({ defaultMessage: 'Up' })
    },
    {
      key: 'Down',
      value: $t({ defaultMessage: 'Down' })
    }
  ]

  const getPortsStatus = (ports: SwitchPortStatus[]) => {
    const upPortsCount = ports.filter(p => p.status === 'Up').length
    const downPortsCount = ports.filter(p => p.status === 'Down').length
    let statusArray = []
    if (upPortsCount > 0) {
      statusArray.push(`${upPortsCount} ${$t({ defaultMessage: 'Up' })}`)
    }
    if (downPortsCount > 0) {
      statusArray.push(`${downPortsCount} ${$t({ defaultMessage: 'Down' })}`)
    }
    if (statusArray.length > 0) {
      return statusArray.join(' ,')
    }
    return ''
  }

  const columns: TableProps<SwitchPortStatus>['columns'] = [
    {
      title: $t({ defaultMessage: 'Port Number' }),
      dataIndex: 'portIdentifier',
      key: 'portIdentifier',
      sorter: { compare: sortProp('portIdentifier', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Port Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: { compare: sortProp('name', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      sorter: { compare: sortProp('status', defaultSort) },
      filterMultiple: false,
      filterValueNullable: true,
      filterable: statusFilterOpts
    },
    {
      title: $t({ defaultMessage: 'Speed' }),
      dataIndex: 'portSpeed',
      key: 'portSpeed',
      sorter: { compare: sortProp('portSpeed', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'PoE Device Type' }),
      dataIndex: 'poeType',
      key: 'poeType',
      sorter: { compare: sortProp('poeType', defaultSort) },
      render: (data) => {
        return _.isEmpty(data) ? '--' : data
      }
    },
    {
      title: $t({ defaultMessage: 'PoE Usage (Consumed/Allocated)' }),
      dataIndex: 'poeUsed',
      key: 'poeUsed',
      sorter: { compare: sortProp('poeUsed', defaultSort) },
      render: (data, row) => {
        return <>{row.poeUsed} W/ {row.poeTotal} W</>
      }
    },
    {
      title: $t({ defaultMessage: 'Connected Device' }),
      dataIndex: 'neighborName',
      key: 'neighborName',
      render: (data, row) => {
        return row.neighborName || row.neighborMacAddress || '--'
      }
    },
    {
      title: $t({ defaultMessage: 'VLANs' }),
      dataIndex: 'toVlan',
      key: 'toVlan',
      sorter: { compare: sortProp('vlanIds', defaultSort) },
      render: (data, row) => <Space size={2} style={{ width: 'max-content' }}>
        <UI.BreakOutPortTagsOutlineIcon /> {row.unTaggedVlan || '--'}
        <UI.BreakOutPortTagsSolidIcon />  {filterUntaggedVlan(row.vlanIds, row.unTaggedVlan)}
      </Space>
    }
  ]

  const rowActions: TableProps<SwitchPortViewModel>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      setSelectedPorts(selectedRows)
      setEditBreakoutPortDrawerVisible(true)
      setDrawerVisible(false)
    }
  }]

  return <Drawer
    // eslint-disable-next-line max-len
    title={`${portNumber}: ${$t({ defaultMessage: 'Breakout Port' })} (${getPortsStatus(breakoutPorts)})`}
    visible={drawerVisible}
    width={'950px'}
    onClose={() => {
      setDrawerVisible(false)
    }}
    children={
      <div>
        <Table
          type={'compactBordered'}
          columns={columns}
          dataSource={breakoutPortsData}
          rowKey='portIdentifier'
          rowActions={filterByAccess(rowActions)}
          rowSelection={editPortsFromPanelEnabled ? {
            type: 'checkbox',
            renderCell: (checked, record, index, originNode) => {
              return record?.inactiveRow
                ? <Tooltip title={record?.inactiveTooltip}>{originNode}</Tooltip>
                : originNode
            },
            getCheckboxProps: (record) => {
              return {
                disabled: record?.inactiveRow
              }
            },
            selectedRowKeys: selectedPorts.map(i=>i.portIdentifier)
          }: undefined}
        />
      </div>
    }
  />
}



function filterUntaggedVlan (vlanIds?: string, unTaggedVlan?: string) {
  if (vlanIds) {
    let vlanIdsArray = vlanIds?.split(' ')
    if (unTaggedVlan) {
      let taggedVlan = ''
      if (vlanIdsArray.length > 1) {
        vlanIdsArray = _.remove(vlanIdsArray, n => n !== unTaggedVlan)
        vlanIdsArray.sort((a, b) => Number(a) - Number(b))
        taggedVlan = vlanIdsArray.join(', ')
      } else {
        taggedVlan = '--'
      }
      return taggedVlan
    } else {
      return vlanIdsArray.join(', ')
    }
  }
  return '--'
}
