import { withKnobs, object } from '@storybook/addon-knobs'
import { storiesOf }         from '@storybook/react'

import { Table } from '../Table'

import { SparklineChart } from '.'

import type { SparklineChartProps } from '.'

const basicColumns = [
  {
    title: 'Application',
    dataIndex: 'appName',
    key: 'appName'
  },
  {
    dataIndex: 'client',
    title: 'Clients',
    key: 'client'
  },
  {
    title: 'Traffic',
    dataIndex: 'traffic',
    key: 'traffic'
  },
  {
    title: 'Traffic History',
    dataIndex: 'trafficHistory',
    key: 'trafficHistory'
  }
]

const sparklineChartStyle = { height: 16, width: '100%', display: 'inline' }

const SparkLineColumn = (
  data: SparklineChartProps['data']
) => <SparklineChart data={data} style={sparklineChartStyle} />

const basicData = [
  {
    key: '1',
    appName: 'Application1',
    client: 'xxxxx',
    traffic: 'xxxx (28%)',
    trafficHistory: SparkLineColumn([0, 10, 100, 400, 820, 932, 901, 934, 1290, 1330,
      1320, 820, 932, 901, 934, 1290, 1330, 1320])
  },
  {
    key: '2',
    appName: 'Application2',
    client: 'xxxxx',
    traffic: 'xxxx (18%)',
    trafficHistory: SparkLineColumn([1320, 820, 932, 901, 934, 1290, 1330, 1320,
      0, 10, 100, 400, 820, 932, 901, 934, 1290, 1330])
  },
  {
    key: '3',
    appName: 'Application3',
    client: 'xxxxx',
    traffic: 'xxxx (48%)',
    trafficHistory: SparkLineColumn([200, 1500, 1200, 1400, 1250, 1000, 1200, 1050, 900, 800,
      980, 780, 650, 900, 500, 400, 203, 345, 450])
  },
  {
    key: '4',
    appName: 'Application4',
    client: 'xxxxx',
    traffic: 'xxxx (20%)',
    trafficHistory: SparkLineColumn([220, 1000, 1200, 1400, 1290, 1330, 1320, 820, 932,
      1320, 820, 932, 901, 934, 901, 934, 1290, 1330])
  }
]

storiesOf('SparklineChart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () => <SparklineChart
    style={sparklineChartStyle}
    data={[0, 10, 100, 400, 820, 932, 901, 934, 1290, 1330,
      1320, 820, 932, 901, 934, 1290, 1330, 1320]}/>)
  .add('Table View', () => (
    <div style={{ width: 504, padding: 10, border: '1px solid lightgray' }}>
      <Table
        columns={basicColumns}
        dataSource={basicData}
        type='compact' />
    </div>))
  .add('With Knobs', () => <SparklineChart
    style={sparklineChartStyle}
    data={object('data', [0, 10, 100, 400, 820, 932, 901, 934, 1290, 1330,
      1320, 820, 932, 901, 934, 1290, 1330, 1320])}
  />)
