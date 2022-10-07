import { unitOfTime } from 'moment-timezone'

import { Loader, GridRow, GridCol } from '@acx-ui/components'

import { timeSeriesCharts }                           from './config'
import { ChartDataProps, useChartsQuery, BufferType } from './services'

const defaultBuffer = {
  front: { value: 6, unit: 'hours' as unitOfTime.Base },
  back: { value: 6, unit: 'hours' as unitOfTime.Base }
}

const bufferList = {
  'ttc': defaultBuffer,
  'radius-failure': defaultBuffer,
  'eap-failure': defaultBuffer,
  'dhcp-failure': defaultBuffer,
  'auth-failure': defaultBuffer,
  'assoc-failure': defaultBuffer,
  'p-cov-clientrssi-low': 0,
  'p-load-sz-cpu-load': defaultBuffer,
  'p-switch-memory-high': {
    front: { value: 10, unit: 'days' as unitOfTime.Base },
    back: { value: 1, unit: 'second' as unitOfTime.Base }
  },
  'i-net-time-future': defaultBuffer,
  'i-net-time-past': defaultBuffer,
  'i-net-sz-net-latency': defaultBuffer,
  'i-apserv-high-num-reboots': defaultBuffer,
  'i-apserv-continuous-reboots': defaultBuffer,
  'i-apserv-downtime-high': defaultBuffer,
  'i-switch-vlan-mismatch': defaultBuffer,
  'i-switch-poe-pd': defaultBuffer,
  'i-apinfra-poe-low': defaultBuffer,
  'i-apinfra-wanthroughput-low': defaultBuffer
}

export const TimeSeries: React.FC<ChartDataProps> = (props) => {
  const buffer: BufferType = 0

  const queryProps = {
    ...props,
    incident: {
      ...props.incident,
      buffer: buffer
    }
  }

  const queryResults = useChartsQuery(queryProps)

  return (
    <Loader states={[queryResults]}>
      <GridRow>
        {props.charts.map((chart) => {
          const Chart = timeSeriesCharts[chart].chart!
          return <GridCol col={{ span: 24 }} style={{ height: '250px' }} key={chart}>
            <Chart incident={props.incident} data={queryResults.data!} />
          </GridCol>
        })}
      </GridRow>
    </Loader>
  )
}
