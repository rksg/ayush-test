import { BarChartOutlined, TableOutlined } from '@ant-design/icons'

import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { ContentSwitcher, ContentSwitcherProps } from '.'

const tabDetails: ContentSwitcherProps['tabDetails'] = [
  {
    label: 'Chart',
    value: 'chart',
    icon: <BarChartOutlined />,
    children: <h1>Chart content</h1>,
    disabled: true
  },
  {
    label: 'Table',
    value: 'table',
    icon: <TableOutlined />,
    children: <h2>Table content</h2>
  }
]

describe('ContentSwitcher',()=>{
  it('should render component',() => {
    const { asFragment } =render(<ContentSwitcher tabDetails={tabDetails}/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render properly with two tabs',() => {
    const { asFragment } =render(<ContentSwitcher tabDetails={tabDetails}/>)
    const chartContent = asFragment()
    expect(chartContent).toMatchSnapshot('chartContent')
    fireEvent.click(screen.getByText('Table'))
    const tableContent = asFragment()
    expect(tableContent).toMatchSnapshot('tableContent')
    expect(tableContent).not.toBe(chartContent)
  })
  it('should render component with default selection',() => {
    const { asFragment } =render(<ContentSwitcher tabDetails={tabDetails} defaultValue={'table'}/>)
    expect(asFragment()).toMatchSnapshot()
  })
})