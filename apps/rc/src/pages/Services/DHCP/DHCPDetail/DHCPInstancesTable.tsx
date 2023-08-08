
import React         from 'react'
import { useEffect } from 'react'

import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Table, TableProps, Card, Loader }            from '@acx-ui/components'
import { useVenuesListQuery, useGetDHCPProfileQuery } from '@acx-ui/rc/services'
import { Venue }                                      from '@acx-ui/rc/utils'
import { useTableQuery }                              from '@acx-ui/rc/utils'
import { DHCPUsage }                                  from '@acx-ui/rc/utils'
import { TenantLink }                                 from '@acx-ui/react-router-dom'


export default function DHCPInstancesTable (){

  const { $t } = useIntl()

  const params = useParams()
  const { data: dhcpProfile } = useGetDHCPProfileQuery({ params })

  const tableQuery = useTableQuery({
    useQuery: useVenuesListQuery,
    defaultPayload: {
      fields: ['name', 'id', 'aggregatedApStatus', 'switches'],
      filters: {
        id: dhcpProfile?.usage?.map((usage:DHCPUsage)=>usage.venueId)||['none']
      },
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  useEffect(()=>{
    if(dhcpProfile && dhcpProfile.usage){
      tableQuery.setPayload({
        ...tableQuery.payload,
        filters: {
          id: dhcpProfile?.usage?.map((usage:DHCPUsage)=>usage.venueId)||['none']
        }
      })
    }
  },[dhcpProfile])


  const columns: TableProps<Venue>['columns'] = [
    {
      key: 'VenueName',
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'venue',
      sorter: true,
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/overview`}>{row.name}</TenantLink>
        )
      }
    },
    {
      key: 'APs',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aggregatedApStatus',
      sorter: true,
      render: function (_, row) {
        const count = row.aggregatedApStatus
          ? Object.values(row.aggregatedApStatus)
            .reduce((a, b) => a + b, 0)
          : 0
        return ( <TenantLink
          to={`/venues/${row.id}/venue-details/devices`}
          children={count ? count : 0}
        />
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Switches' }),
      key: 'switches',
      dataIndex: 'switches',
      sorter: true,
      render: function (_, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/devices/switch`}
            children={row.switches ? row.switches : 0}
          />
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Capacity' }),
      key: 'usage',
      dataIndex: 'usage',
      render: function (__, row) {
        const venueIDIndex = _.find(dhcpProfile?.usage, dhcp => dhcp.venueId===row.id)
        if(venueIDIndex) {
          if(venueIDIndex?.totalIpCount===0 && venueIDIndex?.usedIpCount===0){
            return ''
          }
          return (100-((venueIDIndex?.usedIpCount/venueIDIndex?.totalIpCount)*100)).toFixed(2) + '%'
        }else{
          return ''
        }
      }
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Card title={$t({ defaultMessage: 'Instances ({count})' },
        { count: tableQuery.data?.totalCount||0 })}>
        <Table
          columns={columns}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          dataSource={tableQuery.data?.data}
          rowKey='id'
        />
      </Card>
    </Loader>
  )
}

