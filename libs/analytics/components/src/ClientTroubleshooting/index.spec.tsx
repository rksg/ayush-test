import { MemoryRouter, BrowserRouter } from 'react-router-dom'

import { dataApiURL }                                                             from '@acx-ui/analytics/services'
import { Provider, store }                                                        from '@acx-ui/store'
import { render, screen, fireEvent, mockGraphqlQuery, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { api } from './services'

import { ClientTroubleshooting } from './index'
describe('ClientTroubleshootingTab', () => {
  const params = {
    tenantId: 'tenant-id',
    activeTab: 'troubleshooting',
    clientId: 'mac'
  }
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'ClientInfo', {
      data: {
        client: {
          connectionDetailsByAp: [],
          connectionEvents: [],
          connectionQualities: [],
          incidents: []
        }
      }
    })
  })
  it('should render loader', () => {
    render(
      <Provider><ClientTroubleshooting clientMac='mac' /></Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(screen.getAllByRole('img', { name: 'loader' })[0]).toBeVisible()
  })
  it('should render correctly without search params', async () => {
    const { asFragment } = render(
      <Provider><ClientTroubleshooting clientMac='mac' /></Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByTestId('history-collapse')).toBeVisible()
    const fragment = asFragment()
    const charts = fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
    expect(charts).toHaveLength(4)
  })
  it('should render correctly with search params', async () => {
    const { asFragment } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/:tenantId/users/wifi/user-Id/details/troubleshooting',
        // eslint-disable-next-line max-len
        search: '?clientTroubleShootingSelections=%257B%2522category%2522%253A%255B%255B%2522performance%2522%255D%252C%255B%2522Infrastructure%2522%255D%255D%257D'
      }]}>
        <Provider><ClientTroubleshooting clientMac='mac' /></Provider>
      </MemoryRouter>
    )
    expect(await screen.findByTestId('history-collapse')).toBeVisible()
    const fragment = asFragment()
    const charts = fragment.querySelectorAll('div[_echarts_instance_]')
    expect(charts).toHaveLength(4)
  })
  it('should handle history button toggle', async () => {
    render(
      <MemoryRouter initialEntries={[{
        pathname: '/:tenantId/users/wifi/user-Id/details/troubleshooting',
        // eslint-disable-next-line max-len
        search: '?clientTroubleShootingSelections=%257B%2522category%2522%253A%255B%255B%2522performance%2522%255D%252C%255B%2522Infrastructure%2522%255D%255D%257D'
      }]}>
        <Provider><ClientTroubleshooting clientMac='mac' /></Provider>
      </MemoryRouter>
    )
    fireEvent.click(await screen.findByTestId('history-collapse'))
    expect(await screen.findByText('History')).toBeVisible()
    fireEvent.click(await screen.findByText('History'))
    expect(await screen.findByTestId('history-collapse')).toBeVisible()
  })
  it('should set search param on option selection', async () => {
    const location = {
      ...window.location
    }
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location
    })
    const { asFragment } = render(
      <BrowserRouter window={window}>
        <Provider><ClientTroubleshooting clientMac='mac' /></Provider>
      </BrowserRouter>
    )
    await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByText('All Categories')

    const selectionInput = await screen.findAllByRole('combobox')
    fireEvent.mouseDown(selectionInput[0])
    fireEvent.click(await screen.findByText('Performance'))
    fireEvent.click(await screen.findByText('Apply'))
    const fragment = asFragment()
    const charts = fragment.querySelectorAll('div[_echarts_instance_]')
    expect(charts).toHaveLength(4)
  })
})