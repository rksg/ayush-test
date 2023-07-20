import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer, render,
  screen
} from '@acx-ui/test-utils'

import { mockEdgeData, mockEdgeList } from '../../__tests__/fixtures'

import EditEdge from './index'

jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })
  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl
  }
})

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./DnsServer', () => (() => <div data-testid='DnsServer' />))
jest.mock('./GeneralSettings', () => (() => <div data-testid='GeneralSettings' />))
jest.mock('./Ports', () => (() => <div data-testid='Ports' />))
jest.mock('./StaticRoutes', () => (() => <div data-testid='StaticRoutes' />))

describe('EditEdge', () => {

  let params: { tenantId: string, serialNumber: string, activeTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '0000000030'
    }
    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getEdge.url,
        (req, res, ctx) => res(ctx.json(mockEdgeData))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      )
    )
  })

  it('Active General Settings tab successfully', async () => {
    params.activeTab = 'general-settings'
    render(
      <Provider>
        <EditEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab' }
      })
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('tab', { name: 'General Settings', selected: true })).toBeVisible()
    expect(await screen.findByTestId('GeneralSettings')).toBeVisible()
  })

  it('Active Ports tab successfully', async () => {
    params.activeTab = 'ports'
    render(
      <Provider>
        <EditEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab' }
      })
    expect(await screen.findByRole('tab', { name: 'Ports', selected: true })).toBeVisible()
    expect(await screen.findByTestId('Ports')).toBeVisible()
  })

  it('Active DNS Server tab successfully', async () => {
    params.activeTab = 'dns'
    render(
      <Provider>
        <EditEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab' }
      })
    expect(await screen.findByRole('tab', { name: 'DNS Server', selected: true })).toBeVisible()
    expect(await screen.findByTestId('DnsServer')).toBeVisible()
  })

  it('Active Static Routes tab successfully', async () => {
    params.activeTab = 'routes'
    render(
      <Provider>
        <EditEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab' }
      })
    expect(await screen.findByRole('tab', { name: 'Static Routes', selected: true })).toBeVisible()
    expect(await screen.findByTestId('StaticRoutes')).toBeVisible()
  })

  it('switch tab', async () => {
    params.activeTab = 'general-settings'
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab' }
      })
    await user.click(screen.getByRole('tab', { name: 'DNS Server' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge/${params.serialNumber}/edit/dns`,
      hash: '',
      search: ''
    })
    await user.click(screen.getByRole('tab', { name: 'Ports' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/edge/${params.serialNumber}/edit/ports/ports-general`,
      hash: '',
      search: ''
    })
  })
})