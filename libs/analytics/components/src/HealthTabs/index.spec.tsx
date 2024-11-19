import '@testing-library/jest-dom'
import * as router from 'react-router-dom'

import { Provider, dataApiURL, store }                 from '@acx-ui/store'
import { render, screen, fireEvent, mockGraphqlQuery } from '@acx-ui/test-utils'

import { switchCountFixture } from './OverviewTab/SummaryBoxes/__tests__/fixtures'
import { api }                from './OverviewTab/SummaryBoxes/services'

import { HealthTabs } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useParams: jest.fn(),
  useLocation: jest.fn()
}))

jest.mock('../Health', () => ({
  HealthPage: () => <div>HealthPage</div>
}))

jest.mock('./OverviewTab', () => ({
  OverviewTab: () => <div>Mocked OverviewTab</div>
}))

jest.mock('./WiredTab', () => ({
  WiredTab: () => <div>Mocked WiredTab</div>
}))


const params = { activeTab: 'overview', tenantId: 'tenant-id' }

describe('HealthTabs', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset()
  })
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should handle default tab', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchCount', { data: switchCountFixture })
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ tenantId: 't1' })
    )
    jest.spyOn(router, 'useLocation').mockImplementation(
      () => ({
        pathname: '/health',
        search: '',
        state: {}
      }) as unknown as ReturnType<typeof router.useLocation>
    )

    render(
      <Provider>
        <HealthTabs />
      </Provider>, { route: { params } })
    fireEvent.click(await screen.findByText('Wireless'))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t1/t/analytics/health/wireless'
    )
  })

  it('should handle tab changes', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchCount', { data: switchCountFixture })
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ activeSubTab: 'wireless', tenantId: 't1' })
    )
    jest.spyOn(router, 'useLocation').mockImplementation(
      () => ({
        pathname: '/health/wireless',
        search: '',
        state: {}
      }) as unknown as ReturnType<typeof router.useLocation>
    )
    render(<Provider>
      <HealthTabs />
    </Provider> , { route: { params } })
    fireEvent.click(await screen.findByText('Wired'))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t1/t/analytics/health/wired'
    )
  })
})
