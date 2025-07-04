import '@testing-library/jest-dom'
import * as router                   from '@acx-ui/react-router-dom'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { DevelopersTab } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useParams: jest.fn(),
  useLocation: jest.fn(),
  useTenantLink: () => ({
    hash: '',
    pathname: '/t1/t/analytics/admin/developers',
    search: ''
  })
}))

jest.mock('./ApplicationTokens', () => ({
  useApplicationTokens: jest.fn(() => ({
    title: 'Application Tokens',
    component: <div>application tokens</div>
  }))
}))

jest.mock('./Webhooks', () => ({
  useWebhooks: jest.fn(() => ({
    title: 'Webhooks',
    component: <div>webhooks</div>
  }))
}))

const params = { activeTab: 'applicationTokens', tenantId: 'tenant-id' }

describe('DevelopersTab', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset()
  })
  it('should handle default tab', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ tenantId: 't1' })
    )
    jest.spyOn(router, 'useLocation').mockImplementation(
      () => ({
        pathname: '/developers', search: '', state: {}
      }) as unknown as ReturnType<typeof router.useLocation>
    )
    render(<Provider><DevelopersTab /></Provider>, { route: { params } })
    expect(await screen.findByText('application tokens')).toBeInTheDocument()
  })

  it('should handle tab changes', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ activeSubTab: 'applicationTokens', tenantId: 't1' })
    )
    jest.spyOn(router, 'useLocation').mockImplementation(
      () => ({
        pathname: '/developers/applicationTokens',
        search: '',
        state: {}
      }) as unknown as ReturnType<typeof router.useLocation>
    )
    render(<Provider>
      <DevelopersTab />
    </Provider> , { route: { params } })

    const webhooksTab = await screen.findByRole('tab', { name: /Webhooks/i })
    expect(webhooksTab).toBeInTheDocument()

    fireEvent.click(webhooksTab)
    expect(mockedUsedNavigate).toHaveBeenCalled()
    expect(mockedUsedNavigate.mock.calls[0][0].pathname)
      .toEqual('/t1/t/analytics/admin/developers/webhooks')
  })
})
