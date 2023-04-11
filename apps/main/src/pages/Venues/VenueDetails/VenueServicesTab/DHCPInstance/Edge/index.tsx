import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { ContentSwitcher, ContentSwitcherProps, GridCol, GridRow, Loader }                              from '@acx-ui/components'
import { EdgeDhcpLeaseTable, EdgeDhcpPoolTable }                                                        from '@acx-ui/rc/components'
import { useGetDhcpByEdgeIdQuery, useGetDhcpHostStatsQuery, useGetDhcpStatsQuery, useGetEdgeListQuery } from '@acx-ui/rc/services'
import { EdgeDhcpHostStatus }                                                                           from '@acx-ui/rc/utils'

import { EdgeDhcpBasicInfo } from './BasicInfo'

const EdgeDhcpTab = () => {

  const { $t } = useIntl()
  const { venueId } = useParams()

  const edgeDataPayload = {
    filter: { venueId: [venueId] }
  }
  const { edgeData, isEdgeLoading } = useGetEdgeListQuery(
    { payload: edgeDataPayload },
    {
      skip: !!!venueId,
      selectFromResult: ({ data, isLoading }) => ({
        edgeData: data?.data[0],
        isEdgeLoading: isLoading
      })
    }
  )
  const { dhcpId, isDhcpLoading } = useGetDhcpByEdgeIdQuery(
    { params: { edgeId: edgeData?.serialNumber } },
    {
      skip: !!!edgeData?.serialNumber,
      selectFromResult: ({ data, isLoading }) => ({
        dhcpId: data?.id,
        isDhcpLoading: isLoading
      })
    }
  )
  const getDhcpStatsPayload = {
    filters: { id: [dhcpId] }
  }
  const { dhcpData, isDhcpStatsLoading } = useGetDhcpStatsQuery(
    { payload: getDhcpStatsPayload },
    {
      skip: !!!dhcpId,
      selectFromResult: ({ data, isLoading }) => ({
        dhcpData: data?.data[0],
        isDhcpStatsLoading: isLoading
      })
    }
  )
  const getDhcpHostStatsPayload = {
    filters: { edgeId: [edgeData?.serialNumber], hostStatus: [EdgeDhcpHostStatus.ONLINE] },
    sortField: 'name',
    sortOrder: 'ASC'
  }
  const { data: dhcpHostStats } = useGetDhcpHostStatsQuery({ payload: getDhcpHostStatsPayload })

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Pools ({count})' },
        { count: dhcpData?.dhcpPoolNum || 0 }),
      value: 'pools',
      children: (
        <GridCol col={{ span: 24 }}>
          <EdgeDhcpPoolTable edgeId={edgeData?.serialNumber} />
        </GridCol>
      )
    },
    {
      label: $t({ defaultMessage: 'Leases ({count} online)' },
        { count: dhcpHostStats?.totalCount || 0 }),
      value: 'leases',
      children: (
        <GridCol col={{ span: 24 }}>
          <EdgeDhcpLeaseTable edgeId={edgeData?.serialNumber} />
        </GridCol>
      )
    }
  ]

  return (
    <Loader states={[{
      isFetching: isDhcpLoading || isEdgeLoading || isDhcpStatsLoading,
      isLoading: false
    }]}>
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <EdgeDhcpBasicInfo
            edgeData={edgeData}
            dhcpData={dhcpData}
          />
        </GridCol>
        <ContentSwitcher tabDetails={tabDetails} size='large' />
      </GridRow>
    </Loader>
  )
}

export default EdgeDhcpTab