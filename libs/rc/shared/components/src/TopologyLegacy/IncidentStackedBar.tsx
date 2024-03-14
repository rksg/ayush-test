import { Typography } from 'antd'

import { IncidentsBySeverityData }                   from '@acx-ui/analytics/components'
import { Loader, StackedBarChart, SuspenseBoundary } from '@acx-ui/components'
import { noDataDisplay }                             from '@acx-ui/utils'



export default function IncidentStackedBar (props: {
  incidentData: IncidentsBySeverityData,
  isLoading: boolean,
  category: string
}) {
  const { incidentData, isLoading, category } = props
  const totalIncidents = incidentData?.P1
  + incidentData?.P2
  + incidentData?.P3
  + incidentData?.P4
  const { DefaultFallback: Spinner } = SuspenseBoundary
  return <Loader
    fallback={<Spinner size='small' />}
    states={[{
      isLoading
    }]}>
    { incidentData ?
      <div style={{
        display: 'inline-flex'
      }}>
        { !!totalIncidents && <StackedBarChart
          style={{ height: 16, width: 135, marginRight: 4 }}
          barWidth={12}
          showLabels={false}
          showTotal={false}
          data={[{
            category,
            series: [
              {
                name: 'P1',
                value: incidentData?.P1
              },
              {
                name: 'P2',
                value: incidentData?.P2
              },
              {
                name: 'P3',
                value: incidentData?.P3
              },
              {
                name: 'P4',
                value: incidentData?.P4
              }
            ]
          }]} /> }
        <Typography.Text>
          { totalIncidents }
        </Typography.Text>
      </div>
      : noDataDisplay
    }
  </Loader>
}