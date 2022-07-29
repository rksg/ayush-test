import { BarChartOutlined, TableOutlined } from '@ant-design/icons'
import { storiesOf }                       from '@storybook/react'

import { StackedAreaChart }  from '../StackedAreaChart'
import { data as chartData } from '../StackedAreaChart/stories'
import { BasicTable }        from '../Table/stories/BasicTable'

import { ContentSwitcher, ContentSwitcherProps } from '.'

const tabDetails: ContentSwitcherProps['tabDetails'] = [
  {
    label: 'Chart',
    value: 'chart',
    icon: <BarChartOutlined />,
    children: <StackedAreaChart data={chartData} />
  },
  {
    label: 'Table',
    value: 'table',
    icon: <TableOutlined />,
    children: <BasicTable />
  }
]

storiesOf('ContentSwitcher', module)
  .add('Basic',()=><ContentSwitcher tabDetails={tabDetails} size='small'/>)
