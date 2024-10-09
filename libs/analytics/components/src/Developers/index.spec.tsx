import '@testing-library/jest-dom'
import userEvent   from '@testing-library/user-event'
import * as router from 'react-router-dom'

import { Provider, dataApiURL, store }      from '@acx-ui/store'
import { render, screen, mockGraphqlQuery } from '@acx-ui/test-utils'

// import { switchCountFixture } from './OverviewTab/SummaryBoxes/__tests__/fixtures'
// import { api }                from './OverviewTab/SummaryBoxes/services'

import { DevelopersTab } from '.'
import { webhookDtoKeys } from './Webhooks/services'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useParams: jest.fn(),
  useLocation: jest.fn()
}))

jest.mock('./ApplicationTokens', () => ({
  useApplicationTokens: jest.fn(() => ({
    title: 'Application Tokens',
    component: <div>applicationTokens</div>
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
  // afterEach(() =>
  //   store.dispatch(api.util.resetApiState())
  // )
  it('should handle default tab', async () => {
    // mockGraphqlQuery(dataApiURL, 'SwitchCount', { data: switchCountFixture })
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ tenantId: 't1' })
    )
    jest.spyOn(router, 'useLocation').mockImplementation(
      () => ({
        pathname: '/developers',
        search: '',
        state: {}
      }) as unknown as ReturnType<typeof router.useLocation>
    )

    render(
      <Provider>
        <DevelopersTab />
      </Provider>, { route: { params } })
    userEvent.click(await screen.findByText('Application Tokens'))
    expect(await screen.findByText('applicationTokens')).toBeInTheDocument()

    await new Promise((r)=>{setTimeout(r, 1000)})

    expect(mockedUsedNavigate).toHaveBeenCalled()
    // expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
    //   '/t1/t/analytics/developers/applicationTokens'
    // )
  })

  it('should handle tab changes', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ activeSubTab: 'webhooks', tenantId: 't1' })
    )
    jest.spyOn(router, 'useLocation').mockImplementation(
      () => ({
        pathname: '/developers/webhooks',
        search: '',
        state: {}
      }) as unknown as ReturnType<typeof router.useLocation>
    )
    render(<Provider>
      <DevelopersTab />
    </Provider> , { route: { params } })
    const webhooksTab = screen.getByRole('tab', { name: /Webhooks/i })
    expect(webhooksTab).toBeInTheDocument()

    userEvent.click(webhooksTab)
    expect(mockedUsedNavigate).toHaveBeenCalled()
    console.log(mockedUsedNavigate.mock.calls)
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t1/t/analytics/developers/webhooks'
    )
  })
})
