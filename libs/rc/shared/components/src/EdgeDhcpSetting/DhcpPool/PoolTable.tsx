import { useIntl } from 'react-intl'

import {
  Table,
  TableProps
} from '@acx-ui/components'
import { Features }                            from '@acx-ui/feature-toggle'
import { useGetEdgePinViewDataListQuery }      from '@acx-ui/rc/services'
import { defaultSort, EdgeDhcpPool, sortProp } from '@acx-ui/rc/utils'
import { filterByAccess }                      from '@acx-ui/user'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

export function PoolTable (props:{
  data: EdgeDhcpPool[]
  openDrawer: (data?: EdgeDhcpPool) => void
  onDelete?: (data:EdgeDhcpPool[]) => void
  openImportModal: (visible: boolean) => void
  isRelayOn: boolean
}) {
  const { $t } = useIntl()
  const { data, openDrawer, onDelete, openImportModal, isRelayOn } = props
  const isDHCPCSVEnabled = useIsEdgeFeatureReady(Features.EDGES_DHCP_CSV_TOGGLE)
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)

  // get list of used DHCP pool PIN used and greyout it
  const { pinUsedIds } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id', 'venueId', 'edgeClusterInfo'],
      filters: {}
    }
  }, {
    skip: !isEdgePinReady,
    selectFromResult: ({ data }) => {
      return {
        pinUsedIds: data?.data?.map(d => d.edgeClusterInfo?.dhcpPoolId) ?? []
      }
    }
  })

  const isPinUsedPool = (rows: EdgeDhcpPool[]) => rows.some(item => pinUsedIds.includes(item.id))

  const rowActions: TableProps<EdgeDhcpPool>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      disabled: (selectedRows) => isPinUsedPool(selectedRows),
      tooltip: (selectedRows) => isPinUsedPool(selectedRows)
        // eslint-disable-next-line max-len
        ? $t({ defaultMessage: 'The selected pool is configured as PIN DHCP pool and cannot be edited' })
        : undefined,
      onClick: (rows: EdgeDhcpPool[]) => {
        openDrawer(rows[0])
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      disabled: (selectedRows) => isPinUsedPool(selectedRows),
      tooltip: (selectedRows) => isPinUsedPool(selectedRows)
        // eslint-disable-next-line max-len
        ? $t({ defaultMessage: 'The selected pool is configured as PIN DHCP pool and cannot be deleted' })
        : undefined,
      onClick: (rows: EdgeDhcpPool[], clearSelection) => {
        onDelete?.(rows)
        clearSelection()
      }
    }
  ]

  const columns: TableProps<EdgeDhcpPool>['columns'] = [
    {
      key: 'poolName',
      title: $t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'poolName',
      width: 200,
      sorter: { compare: sortProp('poolName', defaultSort) }
    },
    {
      key: 'subnetMask',
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'subnetMask',
      sorter: { compare: sortProp('subnetMask', defaultSort) }
    },
    {
      key: 'poolStartIp',
      title: $t({ defaultMessage: 'Pool Range' }),
      dataIndex: 'poolStartIp',
      render: (_, row) => {
        return `${row.poolStartIp} - ${row.poolEndIp}`
      }
    },
    {
      key: 'gatewayIp',
      title: $t({ defaultMessage: 'Gateway' }),
      dataIndex: 'gatewayIp',
      sorter: { compare: sortProp('gatewayIp', defaultSort) }
    }
  ]

  const actions = [{
    label: $t({ defaultMessage: 'Add DHCP Pool' }),
    onClick: () => openDrawer()
  }, ...(isDHCPCSVEnabled ? [{
    label: $t({ defaultMessage: 'Import from file' }),
    onClick: () => openImportModal(true)
  }]:[])]

  return (
    <Table
      rowKey='id'
      columns={columns.filter(col=>
        (col.key !== 'gatewayIp' && isRelayOn) || !isRelayOn)
      }
      dataSource={data}
      rowActions={filterByAccess(rowActions)}
      actions={filterByAccess(actions)}
      rowSelection={{}}
    />
  )
}
