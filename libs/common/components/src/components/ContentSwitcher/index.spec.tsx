import { BarChartOutlined, TableOutlined } from '@ant-design/icons'
import userEvent                           from '@testing-library/user-event'

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

const mockOnChangeFn = jest.fn()

describe('ContentSwitcher',()=>{
  it('should render component',() => {
    const { asFragment } =render(<ContentSwitcher tabDetails={tabDetails}/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render properly with two tabs',async () => {
    render(<ContentSwitcher tabDetails={tabDetails}/>)
    expect(await screen.findByText('Chart content')).toBeVisible()
    fireEvent.click(screen.getByText('Table'))
    expect(await screen.findByText('Table content')).toBeVisible()
  })
  it('should render component with default selection',async () => {
    render(<ContentSwitcher tabDetails={tabDetails} defaultValue={'table'}/>)
    expect(await screen.findByText('Table content')).toBeVisible()
  })
  it('should render component with default selection: formInitValue', async () => {
    render(<ContentSwitcher tabDetails={tabDetails} formInitValue={'table'}/>)
    expect(await screen.findByText('Table content')).toBeVisible()
  })

  it('should trigger onChange function',async () => {
    const user = userEvent.setup()
    render(
      <ContentSwitcher tabDetails={tabDetails} defaultValue={'chart'} onChange={mockOnChangeFn}/>
    )
    await user.click(await screen.findByText('Table'))
    expect(mockOnChangeFn).toBeCalledTimes(1)
  })

  it('should render component with extra components', () => {
    const { asFragment } = render(<ContentSwitcher tabDetails={tabDetails}
      defaultValue={'table'}
      extra={'Some text'} />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render component with persistent tab', async () => {
    localStorage.setItem('tab-content-switcher', 'table')
    render(
      <ContentSwitcher
        tabId={'tab'}
        tabDetails={tabDetails}
        tabPersistence={true}
      />
    )
    expect(await screen.findByText('Table content')).toBeVisible()
  })
})