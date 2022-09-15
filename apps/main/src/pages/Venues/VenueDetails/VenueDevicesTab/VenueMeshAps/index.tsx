import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import { Button, Table, TableProps, Loader } from '@acx-ui/components'
import { useMeshApsQuery }                   from '@acx-ui/rc/services'
import {
  useTableQuery,
  APMesh,
  APMeshRole
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { 
  ListIcon,
  LineChartIcon,
  MeshIcon
} from './styledComponents'

function venueNameColTpl (name: string, meshRole: string, id: string){
  const icon = {
    [APMeshRole.RAP]: 'icon-arrow-corner',
    [APMeshRole.MAP]: 'icon-ap-single',
    [APMeshRole.EMAP]: 'icon-wired',
    [APMeshRole.DISABLED]: ''
  }
  const tooltipTitle = {
    [APMeshRole.RAP]: 'Root AP',
    [APMeshRole.MAP]: 'Mesh AP',
    [APMeshRole.EMAP]: 'eMesh AP',
    [APMeshRole.DISABLED]: 'disabled'
  }
  return (
    <Tooltip title={tooltipTitle[meshRole as APMeshRole]} 
      className={icon[meshRole as APMeshRole]}>
      <TenantLink to={`aps/${id}/details/overview`}>{name}</TenantLink>
    </Tooltip>
  )
}

const getNamesTooltip = (object: { count: number, names: string[] }, maxShow = 10) => {
  if (!object || object.count === 0) {
    return
  }

  let names: string[]
  let tooltip: string
  names = object.names.slice(0, maxShow)
  if (names && object.names.length > 0) {
    tooltip = '<table>'
    names.forEach(name => {
      tooltip += `<tr><td>${name}</td></tr>`
    })
    if (object.count > maxShow) {
      tooltip += `<tr><td>And ${object.count - maxShow} more</td></tr>`
    }
    tooltip += '</table>'

    return tooltip
  }

  return ''
}

function getCols (intl: ReturnType<typeof useIntl>) {
  const columns: TableProps<APMesh>['columns'] = [
    {
      key: 'name',
      title: intl.$t({ defaultMessage: 'AP' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      width: 400,
      render: function (data, row) {
        return (
          venueNameColTpl(data as string, row.meshRole, row.serialNumber)
        )
      }
    },
    {
      key: 'venueName',
      title: intl.$t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return (
          <TenantLink to={`venues/${row.venueId}/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      key: 'apUpRssi',
      title: intl.$t({ defaultMessage: 'Signal' }),
      dataIndex: 'apUpRssi',
      sorter: true,
      width: 5,
      render: function (data, row) {
        if(row.meshRole !== APMeshRole.RAP && row.meshRole !== APMeshRole.EMAP){
          return (
            <span className='icon-signal-down'>{data}</span>
          )
        }
        return
      }
    },
    {
      key: 'apDownRssi',
      dataIndex: 'apDownRssi',
      sorter: true,
      width: 50,
      render: function (data, row) {
        if(row.meshRole !== APMeshRole.RAP && row.meshRole !== APMeshRole.EMAP){
          return (
            <span className='icon-wlan'>{data}</span>
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
      render: function (data, row) {
        if (row.clients && typeof row.clients === 'object') {
          return <Tooltip title={getNamesTooltip(row.clients)}>{data || 0}</Tooltip>
        }else{
          return data || 0
        }
      }
    },
    {
      key: 'hops',
      title: intl.$t({ defaultMessage: 'Hop Count' }),
      dataIndex: 'hops',
      align: 'center'
    }
  ]
  return columns
}

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
  ]
}

export const transformData = (venueMeshApsList: APMesh[]) => {
  if(!venueMeshApsList) return
  venueMeshApsList.map((item: APMesh) =>{
    // set the apDownRssi/apUpRssi value for each child
    if (item && item.uplink && item.uplink.length > 0) {
      item.apUpRssi = item.uplink[0].rssi
    }

    if (item.rssi) {
      item.apDownRssi = item.rssi
    }

    if(Array.isArray(item.downlink) && item.downlink.length > 0){
      item.children = item.downlink
      transformData(item.downlink)
    }
  })
  
  return venueMeshApsList
}

export function VenueMeshApsTable () {
  const VenueMeshApsTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useMeshApsQuery,
      defaultPayload
    })
    
    const data = tableQuery?.data?.data ? transformData(tableQuery?.data?.data) : []

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false }
      ]}>
        <Table
          columns={getCols(useIntl())}
          dataSource={data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='serialNumber'
        />
      </Loader>
    )
  }

  return (
    <>
      <span className='ant-input-group ant-input-group-compact'>
        <Button icon={<LineChartIcon />}
          size='small' 
          style={{ borderRadius: '5px 0 0 5px' , display: 'inline', alignItems: 'center' }} />
        <Button icon={<ListIcon />}
          size='small' 
          style={{ borderRadius: 0 , display: 'inline', alignItems: 'center' }} />
        <Button type='secondary'
          icon={<MeshIcon />}
          size='small' 
          style={{ borderRadius: '0 5px 5px 0' , display: 'inline', alignItems: 'center' }} />
        <MeshIcon style={{ stroke: 'white' }} />
      </span>
      <VenueMeshApsTable />
    </>
  )
}