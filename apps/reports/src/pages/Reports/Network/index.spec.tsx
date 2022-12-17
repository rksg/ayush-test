import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { NetworkFilterWithBandContext } from '../../../Routes'

import { NetworkReport } from '.'

jest.mock('./NetworkReportTabs', () => ({
  NetworkReportTabs: () => <div data-testid='networkReportTabs' />
}))
jest.mock('../index', () => ({
  Report: () => <div data-testid='report' />
}))

describe('Network Report', () => {
  const params = {
    tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
    activeTab: 'wireless'
  }
  it('should render wireless tab correctly', async () => {
    render(<Provider>
      <NetworkFilterWithBandContext.Provider value={{ filterData: {}, setFilterData: () => {} }}>
        <NetworkReport />
      </NetworkFilterWithBandContext.Provider>
    </Provider>, { route: { params } })
    expect(await screen.findByTestId('networkReportTabs')).toBeTruthy()
  })
  it('should render wired tab correctly', async () => {
    params.activeTab = 'wired'
    render(<Provider>
      <NetworkFilterWithBandContext.Provider value={{ filterData: {}, setFilterData: () => {} }}>
        <NetworkReport />
      </NetworkFilterWithBandContext.Provider>
    </Provider>, { route: { params } })
    expect(await screen.findByTestId('networkReportTabs')).toBeTruthy()
  })
})
