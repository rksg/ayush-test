import { useIntl } from 'react-intl'

import { cssStr, DonutChartData }                  from '@acx-ui/components'
import { EdgePortAdminStatusEnum, EdgePortStatus } from '@acx-ui/rc/utils'

import { EdgeOverviewDonutWidget, ReduceReturnType } from '../EdgeOverviewDonutWidget'

export const getPortsAdminStatusChartData =
(ports: EdgePortStatus[] | undefined): DonutChartData[] => {
  const seriesMapping = [
    { key: EdgePortAdminStatusEnum.Enabled,
      name: EdgePortAdminStatusEnum.Enabled,
      color: cssStr('--acx-semantics-green-50') },
    { key: EdgePortAdminStatusEnum.Disabled,
      name: EdgePortAdminStatusEnum.Disabled,
      color: cssStr('--acx-accents-orange-30') }
  ] as Array<{ key: string, name: string, color: string }>

  const chartData: DonutChartData[] = []

  if (ports && ports.length > 0) {
    const portsSummary = ports.reduce<ReduceReturnType>((acc, { adminStatus }) => {
      acc[adminStatus] = (acc[adminStatus] || 0) + 1
      return acc
    }, {})

    seriesMapping.forEach(({ key, name, color }) => {
      if (portsSummary[key]) {
        chartData.push({
          name,
          value: portsSummary[key],
          color
        })
      }
    })
  }

  return chartData
}

interface EdgePortsWidgetProps {
  isLoading: boolean
  edgePortsSetting: EdgePortStatus[] | undefined
  onClick?: (type: string) => void
}

export const EdgePortsWidget = (props: EdgePortsWidgetProps) => {
  const { isLoading, edgePortsSetting, onClick } = props
  const { $t } = useIntl()

  const handleClick = () => {
    if (typeof onClick === 'function')
      onClick('port')
  }

  const chartData = getPortsAdminStatusChartData(edgePortsSetting)

  return <EdgeOverviewDonutWidget
    title={$t({ defaultMessage: 'Ports' })}
    data={chartData}
    isLoading={isLoading}
    onClick={handleClick}
  />
}