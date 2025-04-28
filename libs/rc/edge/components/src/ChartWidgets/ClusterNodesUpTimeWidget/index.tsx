import { useMemo } from 'react'

import { Typography, Col, Row } from 'antd'
import { find }                 from 'lodash'
import moment                   from 'moment-timezone'
import { useIntl }              from 'react-intl'
import AutoSizer                from 'react-virtualized-auto-sizer'

import {
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
import { NodeStatusTimeSeriesChart } from '../NodeStatusTimeSeriesChart'

import * as UI from './styledComponents'

export const EdgeClusterNodesUpTimeWidget = (props: {
  edges: EdgeStatus[] | undefined,
}) => {
  const { $t } = useIntl()
  const { edges } = props
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const {
    startDate, endDate
  } = useDateFilter({ showResetMsg, earliestStart: getDefaultEarliestStart() })

  const serialNumbers = useMemo(() => edges?.map(edge => edge.serialNumber) || [], [edges])

  const { isLoading, queryResults } = useClusterNodesUpTimeData({
    serialNumbers,
    startDate,
    endDate
  })

  const totalUpDowntime = useMemo(() => ({
    // eslint-disable-next-line max-len
    totalUptime: queryResults?.reduce((sum, result) => sum + (result.totalUptime || 0), 0) || 0,
    totalDowntime: queryResults?.reduce((sum, result) => sum + (result.totalDowntime || 0), 0) || 0
  }), [queryResults])

  const usedData = queryResults?.map((resultData, nodeIndex) => {
    // eslint-disable-next-line max-len
    const edgeData = find(edges, { serialNumber: resultData.serialNumber }) as EdgeStatus | undefined

    return {
      nodeId: resultData.serialNumber ,
      nodeName: edgeData?.name ?? `Edge ${nodeIndex}`,
      key: 'EdgeStatus' + nodeIndex,
      // eslint-disable-next-line max-len
      data: resultData?.timeSeries as [TimeStamp, string, TimeStamp, number | null, string][]
    }})

  return <Loader states={[{ isLoading }]}>
    <Row>
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
    </Row>
    <Row>
      <Col span={24}>
        <Row >
          <UI.NodeListWrapper span={3}>
            <UI.StyledSpace
              size={1}
              direction='vertical'
            >
              {queryResults?.map((resultData, nodeIndex) => {
              // eslint-disable-next-line max-len
                const edgeData = find(edges, { serialNumber: resultData.serialNumber }) as EdgeStatus | undefined

                return <Typography.Title
                  key={resultData.serialNumber}
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
              })}
            </UI.StyledSpace>
          </UI.NodeListWrapper>
          <Col span={21}>
            <AutoSizer>
              {({ height, width }) =>
                <NodeStatusTimeSeriesChart
                  style={{ width, height }}
                  nodes={usedData}
                  chartBoundary={[
                    moment(startDate).valueOf(),
                    moment(endDate).valueOf()
                  ]}
                  hasXaxisLabel
                />
              }
            </AutoSizer>
          </Col>
        </Row>
      </Col>
    </Row>
  </Loader>
}