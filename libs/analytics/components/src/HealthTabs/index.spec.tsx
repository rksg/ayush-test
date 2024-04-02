import '@testing-library/jest-dom'
import * as router from 'react-router-dom'

import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

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


describe('HealthTabs', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset()
  })
  it('should handle default tab', async () => {
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

    render(<router.BrowserRouter>
      <Provider>
        <HealthTabs />
      </Provider>
    </router.BrowserRouter>)
    fireEvent.click(await screen.findByText('Wireless'))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t1/t/analytics/health/wireless'
    )
  })
  it('should handle tab changes', async () => {
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
    render(<router.BrowserRouter>
      <Provider>
        <HealthTabs />
      </Provider>
    </router.BrowserRouter>)
    fireEvent.click(await screen.findByText('Wired'))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t1/t/analytics/health/wired'
    )
  })
})
