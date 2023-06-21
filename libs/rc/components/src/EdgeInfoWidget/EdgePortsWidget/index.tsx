import { useIntl } from 'react-intl'

import { cssStr, DonutChartData, onChartClick }    from '@acx-ui/components'
import { EdgePortAdminStatusEnum, EdgePortStatus } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }   from '@acx-ui/react-router-dom'

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
}

export const EdgePortsWidget = ({ isLoading, edgePortsSetting }: EdgePortsWidgetProps) => {
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}/details/overview`)

  const handleDonutClick = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/ports`
    })
  }

  const chartData = getPortsAdminStatusChartData(edgePortsSetting)

  return <EdgeOverviewDonutWidget
    title={$t({ defaultMessage: 'Ports' })}
    data={chartData}
    isLoading={isLoading}
    emptyMessage={$t({ defaultMessage: 'No data' })}
    onClick={onChartClick(handleDonutClick)}
  />
}