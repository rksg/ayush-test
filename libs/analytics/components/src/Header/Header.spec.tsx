import { BrowserRouter } from 'react-router-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { Header, useHeaderExtra, useNetworkFilter } from '.'

jest.mock('../NetworkFilter', () => ({
  NetworkFilter: () => <div data-testid='NetworkFilter'>network filter</div>
}))
jest.mock('../NetworkFilter/SANetworkFilter', () => ({
  SANetworkFilter: () => <div data-testid='mlisaNetworkFilter'>Mlisa network filter</div>
}))
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  RangePicker: () => <div data-testid='RangePicker' />,
  TimeRangeDropDown: () => <div data-testid='TimeRangeDropDown' />
}))

describe('Analytics header', () => {
  it('should render header correctly', async () => {
    render(<BrowserRouter><Provider>
      <Header title={'Title'} shouldQuerySwitch />
    </Provider></BrowserRouter>)
    expect(await screen.findByText('Title')).toBeVisible()
    expect(await screen.findByTestId('NetworkFilter')).toBeVisible()
    expect(await screen.findByTestId('RangePicker')).toBeVisible()
  })
  it('should render header extra correctly', async () => {
    const Component = () => {
      const component = useHeaderExtra({
        shouldQuerySwitch: true,
        withIncidents: true
      })
      return <span>{component}</span>
    }
    render(<BrowserRouter><Provider><Component/></Provider></BrowserRouter>)
    expect(await screen.findByTestId('NetworkFilter')).toBeVisible()
    expect(await screen.findByTestId('RangePicker')).toBeVisible()
  })
  it('should render header extra with TimeRangeDropDown correctly', async () => {
    const Component = () => {
      const component = useHeaderExtra({
        shouldQuerySwitch: true,
        withIncidents: true,
        datepicker: 'dropdown'
      })
      return <span>{component}</span>
    }
    render(<BrowserRouter><Provider><Component/></Provider></BrowserRouter>)
    expect(await screen.findByTestId('NetworkFilter')).toBeVisible()
    expect(await screen.findByTestId('TimeRangeDropDown')).toBeVisible()
  })
  it('should not render network filter', async () => {
    const Component = () => {
      const component = useHeaderExtra({
        shouldQuerySwitch: true,
        withIncidents: true,
        excludeNetworkFilter: true
      })
      return <span>{component}</span>
    }
    render(<BrowserRouter><Provider><Component/></Provider></BrowserRouter>)
    expect(screen.queryByTestId('NetworkFilter')).toBeNull()
    expect(await screen.findByTestId('RangePicker')).toBeVisible()
  })
  it('should not render time range dropdown', async () => {
    const Component = () => {
      const component = useNetworkFilter({
        shouldQuerySwitch: true,
        shouldQueryOnlyDomains: true
      })
      return <span>{component}</span>
    }
    render(<BrowserRouter><Provider><Component/></Provider></BrowserRouter>)
    expect(screen.queryByTestId('RangePicker')).toBeNull()
    expect(await screen.findByTestId('NetworkFilter')).toBeVisible()
  })
})
