import { Space }   from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Tooltip,
  Loader
} from '@acx-ui/components'
import { useSwitchListQuery, useSwitchPortlistQuery } from '@acx-ui/rc/services'
import {
  getSwitchModel,
  isOperationalSwitch,
  STACK_MEMBERSHIP,
  SwitchPortViewModel,
  SwitchStatusEnum,
  useTableQuery
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'
import { getIntl }   from '@acx-ui/utils'

import * as UI from './styledComponents'

const STACK_PORT_FIELD = 'SwitchPortStackingPortField'

export function SwitchTable ({ isVenueLevel } : {
  isVenueLevel: boolean
}) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { serialNumber } = useParams()

  const tableQuery = useTableQuery({
    useQuery: useSwitchListQuery,
    defaultPayload: {
      "fields":[
        "check-all","name","deviceStatus","model","activeSerial","switchMac","ipAddress","venueName","uptime",
        "clientCount","cog","id","serialNumber","isStack","formStacking","venueId","switchName","configReady",
        "syncedSwitchConfig","syncDataId","operationalWarning","cliApplied","suspendingDeployTime"
      ]
    }
  })

  const getStackMemberStatus = (unitStatus: string) => {
    if (unitStatus === STACK_MEMBERSHIP.ACTIVE) {
      return $t({ defaultMessage: ' (Active)' })
    } else if (unitStatus === STACK_MEMBERSHIP.STANDBY) {
      return $t({ defaultMessage: ' (Standby)' })
    } else {
      return $t({ defaultMessage: ' (Member)' })
    }
  }

  const columns: TableProps<any>['columns'] = [{
    key: 'name',
    title: $t({ defaultMessage: 'Switch' }),
    dataIndex: 'name',
    sorter: true,
    defaultSortOrder: 'ascend',
    render: (data, row) => {
      return <>
        { data || row.switchName || row.serialNumber }
        { !row.isFirstLevel && getStackMemberStatus(row.unitStatus) }
      </>
    }
  }, {
    key: 'switchName',
    title: $t({ defaultMessage: 'Status' }),
    dataIndex: 'switchName',
    sorter: true
  }, {
    key: 'status',
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'status',
    sorter: true
  }, {
    key: 'adminStatus',
    title: $t({ defaultMessage: 'Serial Number' }),
    dataIndex: 'adminStatus',
    sorter: true,
    // show: false
  }, {
    key: 'portSpeed',
    title: $t({ defaultMessage: 'MAC Address' }),
    dataIndex: 'portSpeed',
    sorter: true
  }, {
    key: 'poeType',
    title: $t({ defaultMessage: 'IP Address' }),
    dataIndex: 'poeType',
    sorter: true
  },
  // { TODO: Health scope
  //   key: 'incidents',
  //   title: $t({ defaultMessage: 'Incidents' }),
  //   dataIndex: 'incidents',
  // },
  {
    key: 'poeUsed',
    title: $t({ defaultMessage: 'Venue' }),
    dataIndex: 'poeUsed',
    sorter: true,
  }, {
    key: 'vlanIds',
    title: $t({ defaultMessage: 'Up Time' }),
    dataIndex: 'vlanIds',
    sorter: true,
  }, {
    key: 'signalIn',
    title: $t({ defaultMessage: 'Clients' }),
    dataIndex: 'signalIn',
    sorter: true
  },
  // { TODO: tags
  //   key: 'tags',
  //   title: $t({ defaultMessage: 'Tags' }),
  //   dataIndex: 'tags'
  // }
]

  const getColumns = () => columns.filter(
    item => !isVenueLevel
      ? item.key !== 'switchName'
      : item
  )

  const isActionVisible = (
    selectedRows: SwitchPortViewModel[],
    { selectOne, isOperational }: { selectOne?: boolean, isOperational?: boolean }) => {
    let visible = true
    if (isOperational) {
      visible = selectedRows.every(ap => ap.deviceStatus === SwitchStatusEnum.OPERATIONAL)
    }
    if (selectOne) {
      visible = visible && selectedRows.length === 1
    }
    return visible
  }

  const rowActions: TableProps<SwitchPortViewModel>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true }),
    onClick: (rows) => {
      // navigate(`${rows[0].serialNumber}/edit/details`, { replace: false })
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: async (rows, clearSelection) => {
      // TODO:
    }
  }, {
    label: $t({ defaultMessage: 'Reboot' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true, isOperational: true }),
    onClick: (rows, clearSelection) => {
      // TODO:
    }
  }, {
    label: $t({ defaultMessage: 'Download Log' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true, isOperational: true }),
    onClick: (rows) => {
      // TODO:
    }
  }]

  // TODO: add search string and filter to retrieve data
  // const retrieveData () => {}

  return <Loader states={[tableQuery]}>
    <Table
      columns={getColumns()}
      dataSource={transformData(tableQuery.data?.data)}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      rowKey='serialNumber'
      rowActions={rowActions}
      rowSelection={{
        type: 'checkbox',
        renderCell: (checked, record, index, originNode) => {
          return record.isFirstLevel
            ? originNode
            : null
        }
      }}
    />
  </Loader>
}

function transformData (data?: SwitchPortViewModel[]) {
  // return data?.map((port: SwitchPortViewModel) => {
  //   return {
  //     ...port,
  //     inactiveRow: !!getInactiveTooltip(port),
  //     inactiveTooltip: getInactiveTooltip(port)
  //   }
  // })
  return data
}

function getInactiveTooltip (port: SwitchPortViewModel): string {
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

function isLAGMemberPort (port: SwitchPortViewModel): boolean {
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