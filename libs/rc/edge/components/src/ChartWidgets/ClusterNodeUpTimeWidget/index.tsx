import { Typography } from 'antd'
import { isEmpty }    from 'lodash'
import moment         from 'moment-timezone'
import { useIntl }    from 'react-intl'
import AutoSizer      from 'react-virtualized-auto-sizer'

import { Loader, NoData, MultiBarTimeSeriesChart, GridCol, cssStr, getDefaultEarliestStart, GridRow } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                     from '@acx-ui/feature-toggle'
import { CommonOperation, Device, EdgeStatus, getUrl }                                                from '@acx-ui/rc/utils'
import { TenantLink }                                                                                 from '@acx-ui/react-router-dom'
import { TimeStamp }                                                                                  from '@acx-ui/types'
import { useDateFilter }                                                                              from '@acx-ui/utils'

import { useEdgeUpTimeData } from '../../hooks/useEdgeUpTimeData'

import * as UI from './styledComponents'

interface EdgeClusterNodeUpTimeWidgetProps {
  nodeIndex: number,
  edgeData: EdgeStatus | undefined

}
export const EdgeClusterNodeUpTimeWidget = (props: EdgeClusterNodeUpTimeWidgetProps) => {
  const { $t } = useIntl()
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)

  const { nodeIndex, edgeData } = props
  const filters = useDateFilter({ showResetMsg, earliestStart: getDefaultEarliestStart() })
  const { isLoading, queryResults } = useEdgeUpTimeData({
    serialNumber: edgeData?.serialNumber,
    filters
  })

  return <Loader states={[{ isLoading }]}>
    <UI.Wrapper>
      {isEmpty(queryResults.timeSeries)
        ? <GridCol col={{ span: 24 }} style={{ height: '50px' }}>
          <AutoSizer>
            {() =><NoData />}
          </AutoSizer>
        </GridCol>
        : <GridCol col={{ span: 24 }} style={{ height: '100px' }}>
          <GridRow>
            <GridCol col={{ span: 3 }} style={{ minWidth: '100px' }}>
              <Typography.Title level={5}>
                {$t({ defaultMessage: 'Node {index}: {nodeDetailLink}' },
                  {
                    index: nodeIndex,
                    nodeDetailLink: <TenantLink to={`${getUrl({
                      feature: Device.Edge,
                      oper: CommonOperation.Detail,
                      params: { id: edgeData?.serialNumber } })}/overview`}>
                      {edgeData?.name}
                    </TenantLink>
                  })}
              </Typography.Title>
            </GridCol>
            <GridCol col={{ span: 21 }} style={{ height: '50px' }}>
              <AutoSizer>
                {({ height, width }) =>
                  <MultiBarTimeSeriesChart
                    style={{ width, height }}
                    data={[
                      {
                        key: 'EdgeStatus',
                        name: 'Edge',
                        color: cssStr('--acx-semantics-green-50'),
                        // eslint-disable-next-line max-len
                        data: queryResults?.timeSeries as [TimeStamp, string, TimeStamp, number | null, string][]
                      }
                    ]}
                    chartBoundary={[
                      moment(filters?.startDate).valueOf(),
                      moment(filters?.endDate).valueOf()
                    ]}
                    hasXaxisLabel
                  />
                }
              </AutoSizer>
            </GridCol>
          </GridRow>
        </GridCol>
      }
    </UI.Wrapper>
  </Loader>
}