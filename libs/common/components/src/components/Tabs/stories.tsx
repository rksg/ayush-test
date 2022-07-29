import { BarChartOutlined, TableOutlined } from '@ant-design/icons'
import { storiesOf }                       from '@storybook/react'

import { StackedAreaChart }  from '../StackedAreaChart'
import { data as chartData } from '../StackedAreaChart/stories'
import { BasicTable }        from '../Table/stories/BasicTable'

import { ContentToggle, ContentToggleProps } from '.'

const tabDetails:ContentToggleProps['tabDetails']=[
  {
    label: 'Chart',
    value: 'chart',
    icon: <BarChartOutlined />,
    content: <StackedAreaChart data={chartData} />
  },
  {
    label: 'Table',
    value: 'table',
    icon: <TableOutlined />,
    content: <BasicTable />
  }
]

storiesOf('Content Toggle', module)
  .add('Basic',()=><ContentToggle tabDetails={tabDetails} size='middle'/>)