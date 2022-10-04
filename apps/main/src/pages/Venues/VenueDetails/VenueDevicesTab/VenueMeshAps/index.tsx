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
  MeshIcon,
  IconWrapper,
  WhiteButton
} from './styledComponents'

function venueNameColTpl (
  name: string, meshRole: string, id: string, intl: ReturnType<typeof useIntl>){
  const icon = {
    [APMeshRole.RAP]: 'icon-arrow-corner',
    [APMeshRole.MAP]: 'icon-ap-single',
    [APMeshRole.EMAP]: 'icon-wired',
    [APMeshRole.DISABLED]: ''
  }
  const tooltipTitle = {
    [APMeshRole.RAP]: intl.$t({ defaultMessage: 'Root AP' }),
    [APMeshRole.MAP]: intl.$t({ defaultMessage: 'Mesh AP' }),
    [APMeshRole.EMAP]: intl.$t({ defaultMessage: 'eMesh AP' }),
    [APMeshRole.DISABLED]: intl.$t({ defaultMessage: 'disabled' })
  }
  return (
    <IconWrapper>
      <Tooltip title={tooltipTitle[meshRole as APMeshRole]}
        className={`${icon[meshRole as APMeshRole]}`}>
        <TenantLink to={`aps/${id}/details/overview`}>{name}</TenantLink>
      </Tooltip>
    </IconWrapper>
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
          venueNameColTpl(data as string, row.meshRole, row.serialNumber, intl)
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
            <IconWrapper>
              <span className='icon-signal-down'>{data}</span>
            </IconWrapper>
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
            <IconWrapper><span className='icon-wlan'>{data}</span></IconWrapper>
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
      transformData(item.downlink)
    }
    return newItem
  })
}

export function VenueMeshApsTable () {
  const VenueMeshApsTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useMeshApsQuery,
      defaultPayload
    })

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false }
      ]}>
        <Table
          columns={getCols(useIntl())}
          dataSource={transformData(tableQuery?.data?.data || [])}
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
          size='small' />
        <Button icon={<ListIcon />}
          size='small' />
        <WhiteButton type='primary'
          icon={<MeshIcon />}
          size='small'
          style={{ borderRadius: '0 4px 4px 0' }}/>
      </span>
      <VenueMeshApsTable />
    </>
  )
}