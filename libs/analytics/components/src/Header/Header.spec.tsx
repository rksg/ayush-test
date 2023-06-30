import { BrowserRouter } from 'react-router-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { Header, useHeaderExtra } from '.'

jest.mock('../NetworkFilter', () => ({
  NetworkFilter: () => <div data-testid='NetworkFilter'>network filter</div>
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  RangePicker: () => <div data-testid='RangePicker' />
}))

describe('Analytics header', () => {
  it('should render header correctly', async () => {
    render(<BrowserRouter><Provider>
      <Header title={'Title'} shouldQuerySwitch/>
    </Provider></BrowserRouter>)
    expect(await screen.findByText('Title')).toBeVisible()
    expect(await screen.findByTestId('NetworkFilter')).toBeVisible()
    expect(await screen.findByTestId('RangePicker')).toBeVisible()
  })
  it('should render header extra correctly for R1', async () => {
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
  it('should render header extra correctly for RA', async () => {
    const env = process.env
    env.NX_IS_MLISA_SA = 'true'
    const Component = () => {
      const component = useHeaderExtra({
        shouldQuerySwitch: true,
        withIncidents: true
      })
      return <span>{component}</span>
    }
    render(<BrowserRouter><Provider><Component/></Provider></BrowserRouter>)
    expect(screen.queryByTestId('NetworkFilter')).not.toBeInTheDocument()
    expect(await screen.findByTestId('RangePicker')).toBeVisible()
    env.NX_IS_MLISA_SA = undefined
  })
})