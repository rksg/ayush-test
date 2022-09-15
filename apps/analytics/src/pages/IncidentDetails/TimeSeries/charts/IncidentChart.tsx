import { MarkAreaComponentOption } from 'echarts'
import { useIntl }                 from 'react-intl'
import AutoSizer                   from 'react-virtualized-auto-sizer'

import { Incident, getSeriesData, mapCodeToReason, incidentSeverities, calculateSeverity } from '@acx-ui/analytics/utils'
import { Card, cssStr, MultiLineTimeSeriesChart, ChartMarker }                             from '@acx-ui/components'
import { NavigateFunction, Path, useNavigate, useTenantLink }                              from '@acx-ui/react-router-dom'
import { intlFormats }                                                                     from '@acx-ui/utils'

import { codeToFailureTypeMap } from '../config'
import { ChartsData }           from '../services'

export const onMarkedAreaClick = (
  navigate: NavigateFunction,
  basePath: Path,
  relatedIncidents: Incident[]
) => (
  props: ChartMarker
) => {
  const currentIncident = relatedIncidents.find((incident: Incident) => (
    incident.startTime === props.startTime && incident.endTime === props.endTime))
  navigate({
    ...basePath,
    pathname: `${basePath.pathname}/${currentIncident!.id}`
  })
}

export const markAreaProps = (
  relatedIncidents: Incident[],
  incident: Incident
) => ({
  data: relatedIncidents?.map(mark => {
    return [
      {
        xAxis: mark.startTime,
        data: mark,
        itemStyle: {
          opacity: mark.id === incident.id ? 1 : 0.3,
          color: cssStr(incidentSeverities[calculateSeverity(incident.severity)].color)
        }
      },
      {
        xAxis: mark.endTime
      }
    ]
  }) } as MarkAreaComponentOption
)

export const IncidentChart = ({ incident, data }: { incident: Incident, data: ChartsData }) => {
  const { incidentCharts, relatedIncidents } = data
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/incidents/')
  const title = mapCodeToReason(
    codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap],
    useIntl()
  )

  const seriesMapping = [{
    key: codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap],
    name: title
  }]

  const chartResults = getSeriesData(incidentCharts, seriesMapping)

  return <Card
    key={'incidentChart'}
    title={title}
    isIncidentChart={true}
    type={'no-border'}
  >
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          style={{ height, width }}
          data={chartResults}
          dataFormatter={(value: unknown) =>
            $t(intlFormats.percentFormat, { value: value as number })}
          yAxisProps={{ max: 1, min: 0 }}
          disableLegend={true}
          onMarkedAreaClick={onMarkedAreaClick(navigate, basePath, relatedIncidents)}
          markAreaProps={markAreaProps(relatedIncidents, incident)}
        />
      )}
    </AutoSizer>
  </Card>
}
