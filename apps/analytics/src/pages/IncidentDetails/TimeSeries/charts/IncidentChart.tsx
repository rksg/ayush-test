import { MarkAreaComponentOption } from 'echarts'
import { useIntl }                 from 'react-intl'
import AutoSizer                   from 'react-virtualized-auto-sizer'

import { Incident, getSeriesData, mapCodeToReason, incidentSeverities, calculateSeverity } from '@acx-ui/analytics/utils'
import { Card, cssStr, MultiLineTimeSeriesChart, ChartMarker }                             from '@acx-ui/components'
import { useNavigate, useTenantLink }                                                      from '@acx-ui/react-router-dom'
import { intlFormats }                                                                     from '@acx-ui/utils'

import { codeToFailureTypeMap } from '../config'
import { ChartsData }           from '../services'

export const IncidentChart = ({ incident, data }: { incident: Incident, data: ChartsData }) => {
  const { incidentCharts, relatedIncidents } = data
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/incidents/')
  const title = mapCodeToReason(
    codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap],
    useIntl()
  )

  const onMarkedAreaClick = (props: ChartMarker) => {
    const currentIncident = relatedIncidents.find(incident => (
      incident.startTime === props.startTime && incident.endTime === props.endTime))
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${currentIncident!.id}`
    })
  }

  const seriesMapping = [{
    key: codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap],
    name: title
  }]

  const colors = relatedIncidents.map(i => {
    return incidentSeverities[calculateSeverity(i.severity)].color
  })

  const markAreaProps = {
    data: relatedIncidents?.map((mark, index) => {
      return [
        {
          xAxis: mark.startTime,
          data: mark,
          itemStyle: {
            opacity: mark.id === incident.id ? 1 : 0.3,
            color: cssStr(colors![index])
          }
        },
        {
          xAxis: mark.endTime
        }
      ]
    }) 
  } as MarkAreaComponentOption

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
          areaColor={'green'}
          yAxisProps={{ max: 1, min: 0 }}
          disableLegend={true}
          handleMarkedAreaClick={(props) => onMarkedAreaClick(props)}
          markAreaProps={markAreaProps}
        />
      )}
    </AutoSizer>
  </Card>
}
