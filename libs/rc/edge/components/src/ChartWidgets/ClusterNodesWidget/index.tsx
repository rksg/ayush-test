import { useIntl } from 'react-intl'

import { cssStr, DonutChartData }                                from '@acx-ui/components'
import { EdgeClusterStatus, EdgeStatus, EdgeStatusSeverityEnum } from '@acx-ui/rc/utils'

import { getEdgeStatusDisplayName }                  from '../../utils/general'
import { EdgeOverviewDonutWidget, ReduceReturnType } from '../EdgeOverviewDonutWidget'

interface EdgePortsWidgetProps {
  isLoading: boolean
  clusterData: EdgeClusterStatus | undefined
}

export const EdgeClusterNodesWidget = (props: EdgePortsWidgetProps) => {
  const { isLoading, clusterData } = props
  const { $t } = useIntl()

  const chartData = getClusterNodesChartData(clusterData?.edgeList)

  return <EdgeOverviewDonutWidget
    title={$t({ defaultMessage: 'Nodes' })}
    data={chartData}
    isLoading={isLoading}
    size={{ width: 100, height: 100 }}
  />
}

export const getClusterNodesChartData =
(nodes: EdgeStatus[] | undefined): DonutChartData[] => {
  const seriesMapping = [
    { key: EdgeStatusSeverityEnum.OPERATIONAL,
      name: EdgeStatusSeverityEnum.OPERATIONAL,
      color: cssStr('--acx-semantics-green-50') },
    { key: EdgeStatusSeverityEnum.TRANSIENT_ISSUE,
      name: getEdgeStatusDisplayName(EdgeStatusSeverityEnum.TRANSIENT_ISSUE, false),
      color: cssStr('--acx-semantics-yellow-40') },
    { key: EdgeStatusSeverityEnum.IN_SETUP_PHASE,
      name: EdgeStatusSeverityEnum.IN_SETUP_PHASE,
      color: cssStr('--acx-neutrals-50') },
    { key: EdgeStatusSeverityEnum.OFFLINE,
      name: EdgeStatusSeverityEnum.OFFLINE,
      color: cssStr('--acx-neutrals-50') },
    { key: EdgeStatusSeverityEnum.REQUIRES_ATTENTION,
      name: EdgeStatusSeverityEnum.REQUIRES_ATTENTION,
      color: cssStr('--acx-semantics-red-50') }
  ] as Array<{ key: string, name: string, color: string }>

  const chartData: DonutChartData[] = []

  if (nodes && nodes.length > 0) {
    const nodesSummary = nodes.reduce<ReduceReturnType>((acc, { deviceStatusSeverity }) => {
      acc[deviceStatusSeverity] = (acc[deviceStatusSeverity] || 0) + 1
      return acc
    }, {})

    seriesMapping.forEach(({ key, name, color }) => {
      if (nodesSummary[key]) {
        chartData.push({
          name,
          value: nodesSummary[key],
          color
        })
      }
    })
  }

  return chartData
}