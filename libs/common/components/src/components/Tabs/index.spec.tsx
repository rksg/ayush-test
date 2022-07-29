import { BarChartOutlined, TableOutlined } from '@ant-design/icons'

import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { Tabs, TabsProps } from '.'

const tabDetails: TabsProps['tabDetails'] = [
  {
    label: 'Chart',
    value: 'chart',
    icon: <BarChartOutlined />,
    children: <h1>Chart content</h1>
  },
  {
    label: 'Table',
    value: 'table',
    icon: <TableOutlined />,
    children: <h2>Table content</h2>
  }
]

describe('ContentToggle',()=>{
  it('should render component',() => {
    const { asFragment } =render(<Tabs tabDetails={tabDetails}/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render proper content while toggle',() => {
    const { asFragment } =render(<Tabs tabDetails={tabDetails}/>)
    const chartContent = asFragment()
    expect(chartContent).toMatchSnapshot('chartContent')
    fireEvent.click(screen.getByText('Table'))
    const tableContent = asFragment()
    expect(tableContent).toMatchSnapshot('tableContent')
    expect(tableContent).not.toBe(chartContent)
  })
  it('should render component with default selection',() => {
    const { asFragment } =render(<Tabs tabDetails={tabDetails} defaultValue={'table'}/>)
    expect(asFragment()).toMatchSnapshot()
  })
})