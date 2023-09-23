import { useEffect, useState } from 'react'

import { Space }   from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Table, TableProps, Tooltip, Loader } from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import {
  useLazyGetSwitchVlanQuery,
  useLazyGetSwitchVlanUnionByVenueQuery,
  useSwitchPortlistQuery
} from '@acx-ui/rc/services'
import {
  getSwitchModel,
  isOperationalSwitch,
  SwitchPortViewModel,
  SwitchVlan,
  usePollingTableQuery
} from '@acx-ui/rc/utils'
import { useParams }                 from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'
import { getIntl }                   from '@acx-ui/utils'

import { SwitchLagDrawer } from '../SwitchLagDrawer'

import { EditPortDrawer }                         from './editPortDrawer'
import { EditPortDrawer as EditPortDrawerLegacy } from './editPortDrawerLegacy'
import * as UI                                    from './styledComponents'

const STACK_PORT_FIELD = 'usedInFormingStack'

export function SwitchPortTable ({ isVenueLevel }: {
  isVenueLevel: boolean
}) {
  const { $t } = useIntl()
  const { serialNumber, venueId, tenantId, switchId } = useParams()
  const [selectedPorts, setSelectedPorts] = useState([] as SwitchPortViewModel[])
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [lagDrawerVisible, setLagDrawerVisible] = useState(false)
  const [vlanList, setVlanList] = useState([] as SwitchVlan[])
  const isSwitchVoiceVlanEnhanced = useIsSplitOn(Features.SWITCH_VOICE_VLAN)

  const [getSwitchVlan] = useLazyGetSwitchVlanQuery()
  const [getSwitchesVlan] = useLazyGetSwitchVlanUnionByVenueQuery()

  const vlanFilterOptions = Array.isArray(vlanList) ? vlanList.map(v => ({
    key: v.vlanId.toString(), value: v.vlanId.toString()
  })) : []

  useEffect(() => {
    const setData = async () => {
      if (isVenueLevel) {
        const vlanList = await getSwitchesVlan({ params: { tenantId, venueId } }).unwrap()
        setVlanList(vlanList)
      } else {
        const vlanUnion = await getSwitchVlan({ params: { tenantId, switchId } }).unwrap()
        // eslint-disable-next-line max-len
        const vlanList = vlanUnion.switchDefaultVlan?.concat(vlanUnion.switchVlan || [])
          .concat(vlanUnion.profileVlan || [])
          .sort((a, b) => (a.vlanId > b.vlanId) ? 1 : -1)
        setVlanList(vlanList)
      }
    }
    setData()
  }, [isVenueLevel])

  const statusFilterOptions = [
    { key: 'Up', value: $t({ defaultMessage: 'UP' }) },
    { key: 'Down', value: $t({ defaultMessage: 'DOWN' }) }
  ]

  const queryFields = ['portIdentifier', 'name', 'status', 'adminStatus', 'portSpeed',
    'poeUsed', 'vlanIds', 'neighborName', 'tag', 'cog', 'cloudPort', 'portId', 'switchId',
    'switchSerial', 'switchMac', 'switchName', 'switchUnitId', 'switchModel',
    'unitStatus', 'unitState', 'deviceStatus', 'poeEnabled', 'poeTotal', 'unTaggedVlan',
    'lagId', 'syncedSwitchConfig', 'ingressAclName', 'egressAclName', 'usedInFormingStack',
    'id', 'poeType', 'signalIn', 'signalOut', 'lagName', 'opticsType',
    'broadcastIn', 'broadcastOut', 'multicastIn', 'multicastOut', 'inErr', 'outErr',
    'crcErr', 'inDiscard', 'usedInFormingStack', 'mediaType', 'poeUsage'
  ]

  const tableQuery = usePollingTableQuery({
    useQuery: useSwitchPortlistQuery,
    defaultPayload: {
      filters: venueId ? { venueId: [venueId] } :
        serialNumber ? { switchId: [serialNumber] } : {},
      fields: queryFields
    },
    search: {
      searchTargetFields: ['name', 'portIdentifier', 'neighborName']
    },
    sorter: {
      sortField: 'portIdentifierFormatted',
      sortOrder: 'ASC'
    },
    enableSelectAllPagesData: queryFields
  })

  const columns: TableProps<SwitchPortViewModel>['columns'] = [{
    key: 'portIdentifierFormatted',
    title: $t({ defaultMessage: 'Port Number' }),
    dataIndex: 'portIdentifierFormatted',
    searchable: true,
    sorter: true,
    defaultSortOrder: 'ascend',
    fixed: 'left',
    render: (_, row) => row['portIdentifier']
  }, {
    key: 'name',
    title: $t({ defaultMessage: 'Port Name' }),
    dataIndex: 'name',
    searchable: true,
    sorter: true
  }, {
    key: 'switchName',
    title: $t({ defaultMessage: 'Switch' }),
    dataIndex: 'switchName',
    sorter: true
  }, {
    key: 'status',
    title: $t({ defaultMessage: 'Status' }),
    dataIndex: 'status',
    filterMultiple: false,
    filterable: statusFilterOptions,
    sorter: true
  }, {
    key: 'adminStatus',
    title: $t({ defaultMessage: 'Admin Status' }),
    dataIndex: 'adminStatus',
    sorter: true
  }, {
    key: 'portSpeed',
    title: $t({ defaultMessage: 'Speed' }),
    dataIndex: 'portSpeed',
    sorter: true
  }, {
    //   key: '', // TODO
    //   title: $t({ defaultMessage: 'Speed of Duplex' }),
    //   dataIndex: '',
    //   sorter: true
    // }, {
    key: 'poeType',
    title: $t({ defaultMessage: 'PoE Device Type' }),
    dataIndex: 'poeType',
    sorter: true,
    show: false
  }, {
    key: 'poeUsed',
    title: $t({ defaultMessage: 'PoE Usage' }),
    dataIndex: 'poeUsage',
    sorter: true,
    render: (_, row) => {
      if (!row.poeUsage) {
        if (row.poeEnabled === false) {
          return 'off'
        }
        const poeTotal = (row.poeTotal) ? Math.round(row.poeTotal / 1000) : 0
        const poeUsed = (row.poeUsed) ? Math.round(row.poeUsed / 1000) : 0
        const poePercentage = (!poeUsed || !poeTotal) ? 0 : Math.round(poeUsed / poeTotal * 100)
        return `${poeUsed}/${poeTotal}W (${poePercentage}%)`
      } else {
        return row.poeUsage
      }
    }
  }, {
    key: 'vlanIds',
    title: $t({ defaultMessage: 'VLANs' }),
    dataIndex: 'vlanIds',
    filterable: vlanFilterOptions || false,
    sorter: true,
    render: (_, row) => <Space size={2}>
      <UI.TagsOutlineIcon /> {row.unTaggedVlan || '--'}
      <UI.TagsSolidIcon /> {filterUntaggedVlan(row.vlanIds, row.unTaggedVlan)}
    </Space>
  }, {
    key: 'signalIn',
    title: $t({ defaultMessage: 'Bandwidth IN (%)' }),
    dataIndex: 'signalIn',
    sorter: true,
    show: false
  }, {
    key: 'signalOut',
    title: $t({ defaultMessage: 'Bandwidth OUT (%)' }),
    dataIndex: 'signalOut',
    sorter: true,
    show: false
  }, {
    key: 'lagName',
    title: $t({ defaultMessage: 'LAG Name' }),
    dataIndex: 'lagName',
    sorter: true,
    show: false
  }, {
    key: 'neighborName',
    title: $t({ defaultMessage: 'Neighbor Name' }),
    dataIndex: 'neighborName',
    searchable: true,
    sorter: true
  }, {
    key: 'opticsType',
    title: $t({ defaultMessage: 'Optics' }),
    dataIndex: 'opticsType',
    sorter: true,
    show: false
  }, {
    key: 'multicastIn',
    title: $t({ defaultMessage: 'Incoming Multicast Packets' }),
    dataIndex: 'multicastIn',
    sorter: true,
    show: false
  }, {
    key: 'multicastOut',
    title: $t({ defaultMessage: 'Outgoing Multicast Packets' }),
    dataIndex: 'multicastOut',
    sorter: true,
    show: false
  }, {
    key: 'broadcastIn',
    title: $t({ defaultMessage: 'Incoming Broadcast Packets' }),
    dataIndex: 'broadcastIn',
    sorter: true,
    show: false
  }, {
    key: 'broadcastOut',
    title: $t({ defaultMessage: 'Outgoing Broadcast Packets' }),
    dataIndex: 'broadcastOut',
    sorter: true,
    show: false
  }, {
    key: 'inErr',
    title: $t({ defaultMessage: 'In Errors' }),
    dataIndex: 'inErr',
    sorter: true,
    show: false
  }, {
    key: 'outErr',
    title: $t({ defaultMessage: 'Out Errors' }),
    dataIndex: 'outErr',
    sorter: true,
    show: false
  }, {
    key: 'crcErr',
    title: $t({ defaultMessage: 'CRC Errors' }),
    dataIndex: 'crcErr',
    sorter: true,
    show: false
  }, {
    key: 'inDiscard',
    title: $t({ defaultMessage: 'In Discards' }),
    dataIndex: 'inDiscard',
    sorter: true,
    show: false
  }, {
    key: 'ingressAclName',
    title: $t({ defaultMessage: 'Ingress ACL' }),
    dataIndex: 'ingressAclName',
    sorter: true,
    show: false
  }, {
    key: 'egressAclName',
    title: $t({ defaultMessage: 'Egress ACL' }),
    dataIndex: 'egressAclName',
    sorter: true,
    show: false
  },
  {
    key: 'tags',
    title: $t({ defaultMessage: 'Tags' }),
    dataIndex: 'tags',
    sorter: true
  }]

  const getColumns = () => columns.filter(
    item => !isVenueLevel
      ? item.key !== 'switchName'
      : item
  )

  const rowActions: TableProps<SwitchPortViewModel>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      setSelectedPorts(selectedRows)
      setDrawerVisible(true)
    }
  }]

  const getAllPagesData = () => {
    const data = transformData(tableQuery.getAllPagesData())
    return data?.filter(port => !port.inactiveRow) || []
  }

  return <Loader states={[tableQuery]}>
    <Table
      settingsId='switch-port-table'
      columns={getColumns()}
      dataSource={transformData(tableQuery.data?.data)}
      getAllPagesData={getAllPagesData}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      enableApiFilter={true}
      rowKey='portId'
      rowActions={filterByAccess(rowActions)}
      rowSelection={hasAccess() ? {
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
        }
      } : undefined}
      actions={!isVenueLevel
        ? filterByAccess([{
          label: $t({ defaultMessage: 'Manage LAG' }),
          onClick: () => {setLagDrawerVisible(true)}
        }])
        : []
      }
    />

    {lagDrawerVisible && <SwitchLagDrawer
      visible={lagDrawerVisible}
      setVisible={setLagDrawerVisible}
    />}

    { drawerVisible && !isSwitchVoiceVlanEnhanced && <EditPortDrawerLegacy
      key='edit-port'
      visible={drawerVisible}
      setDrawerVisible={setDrawerVisible}
      isCloudPort={selectedPorts.map(item => item.cloudPort).includes(true)}
      isMultipleEdit={selectedPorts?.length > 1}
      isVenueLevel={isVenueLevel}
      selectedPorts={selectedPorts}
    />}

    { drawerVisible && isSwitchVoiceVlanEnhanced && <EditPortDrawer
      key='edit-port'
      visible={drawerVisible}
      setDrawerVisible={setDrawerVisible}
      isCloudPort={selectedPorts.map(item => item.cloudPort).includes(true)}
      isMultipleEdit={selectedPorts?.length > 1}
      isVenueLevel={isVenueLevel}
      selectedPorts={selectedPorts}
    />}

  </Loader>
}

function transformData (data?: SwitchPortViewModel[]) {
  return data?.map((port: SwitchPortViewModel) => {
    return {
      ...port,
      inactiveRow: !!getInactiveTooltip(port),
      inactiveTooltip: getInactiveTooltip(port)
    }
  })
}

export function getInactiveTooltip (port: SwitchPortViewModel): string {
  const { $t } = getIntl()

  if (!isOperationalSwitchPort(port)) {
    return $t({
      defaultMessage: 'The port can not be edited since it is on a switch that is not operational'
    })
  }

  if (isStackPort(port)) {
    return $t({ defaultMessage: 'This is a stacking port and can not be configured' })
  }

  if (isLAGMemberPort(port)) {
    return $t({ defaultMessage: 'This is a LAG member port and can not be configured' })
  }

  return ''
}

export function isLAGMemberPort (port: SwitchPortViewModel): boolean {
  // 0: default, -1: after lag delete
  return !!port.lagId && port.lagId.trim() !== '0' && port.lagId.trim() !== '-1'
}

function isOperationalSwitchPort (port: SwitchPortViewModel): boolean {
  return port && port.deviceStatus
    ? isOperationalSwitch(port.deviceStatus, port.syncedSwitchConfig)
    : false
}

function isStackPort (port: SwitchPortViewModel): boolean {
  const slot = port.portIdentifier.split('/')?.[1]
  if (isICX7650Port(getSwitchModel(port.switchUnitId)) && (slot === '3' || slot === '4')) {
    return true
  }

  // Normal port
  if (!port[STACK_PORT_FIELD]) {
    return false
  }

  // The switch is not in stack mode
  // Note: SZ limitation: should still block ICX7650 default stacking port even it's in standalone mode
  if (port.stack === false && !isICX7650Port(getSwitchModel(port.switchUnitId))) {
    return false
  }

  return port[STACK_PORT_FIELD]
}

function isICX7650Port (switchModel?: string) {
  return switchModel?.includes('7650')
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
