
import { Drawer, Space } from 'antd'
import _                 from 'lodash'
import { useIntl }       from 'react-intl'

import { Table, TableProps }                        from '@acx-ui/components'
import {  SwitchPortStatus, defaultSort, sortProp } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'


export interface StackPortsDrawerType {
  setDrawerVisible: (visible: boolean) => void,
  drawerVisible: boolean,
  portNumber: string,
  stackPorts: SwitchPortStatus[]
}

export function FrontViewStackPortDrawer (props: StackPortsDrawerType) {
  const { $t } = useIntl()
  const { drawerVisible, setDrawerVisible, stackPorts, portNumber } = props

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
    if(statusArray.length>0) {
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
      sorter: { compare: sortProp('status', defaultSort) }
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
      dataIndex: 'toVlan',
      key: 'toVlan',
      sorter: { compare: sortProp('toVlan', defaultSort) },
      render: (data, row) => {
        if (!data) {
          if (row.poeEnabled === false) {
            return 'off'
          }
          const poeTotal = (row.poeTotal) ? Math.round(row.poeTotal / 1000) : 0
          const poeUsed = (row.poeUsed) ? Math.round(row.poeUsed / 1000) : 0
          const poePercentage = (!poeUsed || !poeTotal) ? 0 : Math.round(poeUsed / poeTotal * 100)
          return `${poeUsed}/${poeTotal}W (${poePercentage}%)`
        } else {
          return data
        }
      }
    },
    {
      title: $t({ defaultMessage: 'Connected Device' }),
      dataIndex: 'neighborName',
      key: 'neighborName',
      // sorter: { compare: sortProp('neighborName', defaultSort) },
      render: (data, row) => {
        return row.neighborName || row.neighborMacAddress || '--'
      }
    },
    {
      title: $t({ defaultMessage: 'VLANs' }),
      dataIndex: 'toVlan',
      key: 'toVlan',
      // sorter: { compare: sortProp('toVlan', defaultSort) },
      render: (data, row) => <Space size={2}>
        <UI.StackTagsOutlineIcon /> {row.unTaggedVlan || '--'}
        <UI.StackTagsSolidIcon /> {filterUntaggedVlan(row.vlanIds, row.unTaggedVlan)}
      </Space>
    }
  ]



  return <Drawer
    // eslint-disable-next-line max-len
    title={`${portNumber}: ${$t({ defaultMessage: 'Breakout Port' })} (${getPortsStatus(stackPorts)})`}
    visible={drawerVisible}
    width={'950px'}
    onClose={() => {
      setDrawerVisible(false)
    }}
    mask={false}
    children={
      <div>
        <Table
          columns={columns}
          dataSource={stackPorts}
          rowKey='portIdentifier'
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
