import { useIntl } from 'react-intl'

import { Table, TableProps, Loader, Tooltip } from '@acx-ui/components'
import {
  useMeshApsQuery } from '@acx-ui/rc/services'
import {
  APMesh,
  APMeshRole } from '@acx-ui/rc/utils'
import { useParams }     from '@acx-ui/react-router-dom'
import { useTableQuery } from '@acx-ui/utils'


import {
  MeshSignalSpan
} from '../styledComponents'

import { getNamesTooltip, getSignalStrengthTooltip, getSnrIcon, venueNameColTpl } from './VenueMeshUtils'


function getCols (intl: ReturnType<typeof useIntl>) {
  const columns: TableProps<APMesh>['columns'] = [
    {
      key: 'name',
      title: intl.$t({ defaultMessage: 'AP' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      width: 400,
      render: function (_, row) {
        return (
          venueNameColTpl(row.name!, row.meshRole, row.serialNumber, intl)
        )
      }
    },
    {
      key: 'apUpRssi',
      title: intl.$t({ defaultMessage: 'Signal' }),
      dataIndex: 'apUpRssi',
      sorter: false,
      width: 160,
      render: function (_, row) {
        if(row.meshRole !== APMeshRole.RAP && row.meshRole !== APMeshRole.EMAP){
          const UpIcon = getSnrIcon(row.apUpRssi as number, true)
          const DownIcon = getSnrIcon(row.apDownRssi as number, false)
          const upTooltip = getSignalStrengthTooltip(intl, row.apUpRssi as number)
          const downTooltip = getSignalStrengthTooltip(intl, row.apDownRssi as number)
          return (
            <div>
              {row.apUpRssi && <Tooltip placement='bottom' title={upTooltip}>
                <MeshSignalSpan style={{ paddingRight: '30px' }}>
                  <UpIcon />
                  {row.apUpRssi}
                </MeshSignalSpan>
              </Tooltip>}
              {row.apDownRssi && <Tooltip placement='bottom' title={downTooltip}>
                <MeshSignalSpan>
                  <DownIcon />
                  {row.apDownRssi}
                </MeshSignalSpan>
              </Tooltip>}
            </div>
          )
        }
        return
      }
    },
    {
      key: 'apMac',
      title: intl.$t({ defaultMessage: 'Mac Address' }),
      dataIndex: 'apMac',
      sorter: true,
      width: 230,
      align: 'center'
    },
    {
      key: 'model',
      title: intl.$t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      sorter: true,
      align: 'center'
    },
    {
      key: 'IP',
      title: intl.$t({ defaultMessage: 'IP' }),
      dataIndex: 'IP',
      sorter: true,
      align: 'center'
    },
    {
      key: 'clients',
      title: intl.$t({ defaultMessage: 'Connected clients' }),
      dataIndex: 'clients',
      align: 'center',
      render: function (_, row) {
        if (row.clients && typeof row.clients === 'object') {
          return <Tooltip title={
            getNamesTooltip(row.clients, intl)}>{ row.clients.count || 0}</Tooltip>
        }else{
          return row.clients || 0
        }
      }
    },
    {
      key: 'hops',
      title: intl.$t({ defaultMessage: 'Hop Count' }),
      dataIndex: 'hops',
      align: 'center',
      render: function (_, { hops }) {
        return hops || 0
      }
    }
  ]
  return columns
}

function transformData (data: APMesh[]) {
  return data.map((item: APMesh) => {
    const newItem = { ...item }
    if (item && item.uplink && item.uplink.length > 0) {
      newItem.apUpRssi = item.uplink[0].rssi
    }

    if (item.rssi) {
      newItem.apDownRssi = item.rssi
    }
    if(Array.isArray(item.downlink) && item.downlink.length > 0){
      newItem.children = transformData(item.downlink)
    }

    return newItem
  })
}

export function VenueMeshApsTable () {
  const params = useParams()

  const defaultPayload = {
    fields: [
      'clients',
      'serialNumber',
      'apDownRssis',
      'downlink',
      'IP',
      'apUpRssi',
      'apMac',
      'venueName',
      'meshRole',
      'uplink',
      'venueId',
      'name',
      'apUpMac',
      'apRssis',
      'model',
      'hops',
      'cog'
    ],
    filters: { venueId: [params.venueId] }
  }

  const settingsId = 'venue-mesh-aps-table'
  const tableQuery = useTableQuery({
    useQuery: useMeshApsQuery,
    defaultPayload,
    pagination: { settingsId }
  })

  return (
    <Loader states={[
      tableQuery
    ]}>
      <Table
        settingsId={settingsId}
        columns={getCols(useIntl())}
        dataSource={transformData(tableQuery?.data?.data || [])}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='serialNumber'
      />
    </Loader>
  )

}
