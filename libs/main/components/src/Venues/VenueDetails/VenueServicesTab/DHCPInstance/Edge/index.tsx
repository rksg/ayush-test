import { useMemo } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { GridCol, GridRow, Loader, Subtitle }                                         from '@acx-ui/components'
import { useGetDhcpHostStatsQuery, useGetDhcpStatsQuery, useGetEdgeClusterListQuery } from '@acx-ui/rc/services'
import { EdgeDhcpHostStatus }                                                         from '@acx-ui/rc/utils'

import { DhcpTable }  from './DhcpTable'
import { LeaseTable } from './LeaseTable'

const EdgeDhcpTab = () => {

  const { $t } = useIntl()
  const { venueId = '' } = useParams()

  const edgeClusterDataPayload = {
    filters: { venueId: [venueId] }
  }
  const { clusterList, clusterIds, isEdgeLoading } = useGetEdgeClusterListQuery(
    { payload: edgeClusterDataPayload },
    {
      skip: !!!venueId,
      selectFromResult: ({ data, isLoading }) => ({
        clusterList: data?.data,
        clusterIds: data?.data?.map(item => item.clusterId ?? ''),
        isEdgeLoading: isLoading
      })
    }
  )
  const getDhcpStatsPayload = {
    filters: { edgeClusterIds: clusterIds },
    pageSize: 10000
  }
  const { dhcpList, isDhcpStatsLoading } = useGetDhcpStatsQuery(
    { payload: getDhcpStatsPayload },
    {
      skip: !Boolean(clusterIds?.length),
      selectFromResult: ({ data, isLoading }) => ({
        dhcpList: data?.data.map(item => ({
          ...item,
          edgeClusterIds: item.edgeClusterIds?.filter(clusterId => clusterIds?.includes(clusterId))
        })),
        isDhcpStatsLoading: isLoading
      })
    }
  )
  const getDhcpHostStatsPayload = {
    fields: ['id'],
    filters: {
      venueId: [venueId],
      hostStatus: [EdgeDhcpHostStatus.ONLINE]
    }
  }
  const { data: dhcpHostStats } = useGetDhcpHostStatsQuery({
    payload: getDhcpHostStatsPayload
  }, {
    skip: !clusterIds?.length
  })

  const dhcpTableData = useMemo(() => {
    return dhcpList?.map(item => ({
      ...item,
      clusterIdNameList: item.edgeClusterIds?.map(id => ({
        id, name: clusterList?.find(c => c.clusterId === id)?.name ?? '' }))
    }))
  }, [dhcpList, clusterList])

  return (
    <Loader states={[{
      isFetching: isEdgeLoading || isDhcpStatsLoading,
      isLoading: false
    }]}>
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <DhcpTable data={dhcpTableData} />
        </GridCol>
      </GridRow>
      <GridRow style={{ marginTop: '50px' }}>
        <GridCol col={{ span: 24 }}>
          <Subtitle level={4}>
            {$t(
              { defaultMessage: 'Lease Table ({count} Online)' },
              { count: dhcpHostStats?.totalCount ?? 0 }
            )}
          </Subtitle>
          <LeaseTable
            venueId={venueId}
            dhcpStats={dhcpList}
          />
        </GridCol>
      </GridRow>
    </Loader>
  )
}

export default EdgeDhcpTab
