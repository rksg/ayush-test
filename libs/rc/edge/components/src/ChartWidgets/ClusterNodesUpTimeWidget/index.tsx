import { useMemo } from 'react'

import { Typography } from 'antd'
import { find }       from 'lodash'
import moment         from 'moment-timezone'
import { useIntl }    from 'react-intl'
import AutoSizer      from 'react-virtualized-auto-sizer'

import {
  NoData,
  MultiBarTimeSeriesChart,
  GridCol, cssStr, GridRow,
  Card,
  Tooltip,
  Loader
} from '@acx-ui/components'
import { getDefaultEarliestStart }                     from '@acx-ui/components'
import { useIsSplitOn, Features }                      from '@acx-ui/feature-toggle'
import { formatter }                                   from '@acx-ui/formatter'
import { CommonOperation, Device, EdgeStatus, getUrl } from '@acx-ui/rc/utils'
import { TenantLink }                                  from '@acx-ui/react-router-dom'
import { TimeStamp }                                   from '@acx-ui/types'
import { useDateFilter }                               from '@acx-ui/utils'

import { useClusterNodesUpTimeData } from '../../hooks/useClusterNodesUpTimeData'

import * as UI from './styledComponents'

export const EdgeClusterNodesUpTimeWidget = (props: {
  edges: EdgeStatus[] | undefined,
}) => {
  const { $t } = useIntl()
  const { edges } = props
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const filters = useDateFilter({ showResetMsg, earliestStart: getDefaultEarliestStart() })

  const serialNumbers = useMemo(() => edges?.map(edge => edge.serialNumber) || [], [edges])

  const { isLoading, queryResults } = useClusterNodesUpTimeData({
    serialNumbers,
    filters
  })

  const totalUpDowntime = useMemo(() => ({
    // eslint-disable-next-line max-len
    totalUptime: queryResults?.reduce((sum, result) => sum + (result.totalUptime || 0), 0) || 0,
    totalDowntime: queryResults?.reduce((sum, result) => sum + (result.totalDowntime || 0), 0) || 0
  }), [queryResults])
  console.log(isLoading)

  return <Loader states={[{ isLoading }]}>
    <GridRow>
      <UI.EdgeStatusHeader col={{ span: 16 }}>
        <Card.Title>
          {
            // eslint-disable-next-line max-len
            $t({ defaultMessage: '{count, plural, one {{singular}} other {{plural}}} Status' },
              { count: edges?.length ?? 0,
                singular: $t({ defaultMessage: 'Node' }),
                plural: $t({ defaultMessage: 'Nodes' })
              })}
          <Tooltip
            title={$t({
              defaultMessage: 'Historical data is slightly delayed, and not real-time'
            })}>
            <UI.HistoricalIcon />
          </Tooltip>
        </Card.Title>
      </UI.EdgeStatusHeader>
      <UI.Status col={{ span: 4 }} style={{ height: '20px' }}>
        {$t({ defaultMessage: 'Total Uptime' })}
        {': '}
        <UI.Duration>
          {formatter('durationFormat')((totalUpDowntime.totalUptime * 1000) || 0)}
        </UI.Duration>
      </UI.Status>
      <UI.Status col={{ span: 4 }}>
        {$t({ defaultMessage: 'Total Downtime' })}
        {': '}
        <UI.Duration>
          {formatter('durationFormat')(totalUpDowntime?.totalDowntime * 1000 || 0)}
        </UI.Duration>
      </UI.Status>
    </GridRow>
    <GridRow>
      <GridCol col={{ span: 24 }}>
        {queryResults?.map((resultData, nodeIndex) => {
          // eslint-disable-next-line max-len
          const edgeData = find(edges, { serialNumber: resultData.serialNumber }) as EdgeStatus | undefined

          return <GridRow style={{ height: '30px', marginTop: 5 }}>
            <GridCol col={{ span: 3 }} style={{ minWidth: '100px', justifyContent: 'center' }}>
              <Typography.Title
                level={5}
                ellipsis={{ tooltip: edgeData?.name }}
              >
                {$t({ defaultMessage: 'Node {index}: {nodeDetailLink}' },
                  {
                    index: nodeIndex,
                    nodeDetailLink: <TenantLink to={`${getUrl({
                      feature: Device.Edge,
                      oper: CommonOperation.Detail,
                      params: { id: resultData.serialNumber } })}/overview`}>
                      {edgeData?.name}
                    </TenantLink>
                  })}
              </Typography.Title>
            </GridCol>
            <GridCol col={{ span: 21 }} style={{ height: '30px' }}>
              <AutoSizer>
                {(resultData.totalUptime + resultData.totalDowntime) === 0
                  ? () => <NoData />
                  : ({ height, width }) =>
                    <MultiBarTimeSeriesChart
                      style={{ width, height }}
                      data={[
                        {
                          key: 'EdgeStatus',
                          name: 'Edge',
                          color: cssStr('--acx-semantics-green-50'),
                          // eslint-disable-next-line max-len
                          data: resultData?.timeSeries as [TimeStamp, string, TimeStamp, number | null, string][]
                        }
                      ]}
                      chartBoundary={[
                        moment(filters?.startDate).valueOf(),
                        moment(filters?.endDate).valueOf()
                      ]}
                      hasXaxisLabel={true}
                    />
                }
              </AutoSizer>
            </GridCol>
          </GridRow>
        })}
      </GridCol>
    </GridRow>
  </Loader>
}