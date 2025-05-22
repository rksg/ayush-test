import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { edgeDhcpApi }                                                      from '@acx-ui/rc/services'
import { EdgeDhcpUrls, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { Provider, store }                                                  from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { mockEdgeDhcpData } from '../__tests__/fixtures'

import EditDhcp from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const editPagePath = '/:tenantId/t/services/edgeDhcp/:serviceId/edit'

describe('EditEdgeDhcp', () => {
  let params: { tenantId: string, serviceId: string }
  const mockedUpdateReq = jest.fn()
  const mockedGetReq = jest.fn()

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'test'
    }

    store.dispatch(edgeDhcpApi.util.resetApiState())
    mockedGetReq.mockClear()
    mockedUpdateReq.mockClear()
    mockedUsedNavigate.mockClear()

    mockServer.use(
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (req, res, ctx) => {
          mockedGetReq()
          return res(ctx.json(mockEdgeDhcpData))
        }
      ),
      rest.put(
        EdgeDhcpUrls.updateDhcpService.url,
        (req, res, ctx) => {
          mockedUpdateReq(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should render edit edge dhcp successfully', async () => {
    render(
      <Provider>
        <EditDhcp />
      </Provider>, {
        route: { params, path: editPagePath }
      })

    await waitFor(() => expect(mockedGetReq).toBeCalled())
    const poolsRow = await screen.findAllByRole('row', { name: /PoolTest/i })
    expect(poolsRow.length).toBe(1)
    const serviceNameInput = await screen.findByRole('textbox', { name: 'Service Name' })
    const fqdnNameInput = await screen.findByRole('textbox', { name: 'FQDN Name or IP Address' })
    expect(serviceNameInput).toHaveValue(mockEdgeDhcpData.serviceName)
    expect(fqdnNameInput).toHaveValue(mockEdgeDhcpData.externalDhcpServerFqdnIp)
    expect(screen.queryAllByRole('alert').length).toBe(0)
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
  })

  it('should correctly render `use for PIN` when relay is on', async () => {
    const mockedReqFn = jest.fn()
    const mockedData = { ...mockEdgeDhcpData, dhcpPools: [] }

    mockServer.use(
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (req, res, ctx) => {
          mockedReqFn()
          return res(ctx.json(mockedData))
        }
      ))

    render(
      <Provider>
        <EditDhcp />
      </Provider>, {
        route: { params, path: editPagePath }
      })

    await waitFor(() => expect(mockedReqFn).toBeCalled())
    await screen.findByRole('textbox', { name: 'FQDN Name or IP Address' })
    // eslint-disable-next-line max-len
    const usedForPin = await screen.findByRole('switch', { name: 'Use for Personal Identity Network' })
    const poolsRow = screen.queryAllByRole('row')
    expect(usedForPin).not.toBeChecked()
    expect(poolsRow.length).toBe(0)
    expect(screen.queryAllByRole('alert').length).toBe(0)
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <EditDhcp />
      </Provider>, {
        route: { params, path: editPagePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await waitFor(() => expect(mockedGetReq).toBeCalled())
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'DHCP for RUCKUS Edge'
    })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
  })

  it('should be blcoked when required field is empty', async () => {
    const mockEdgeDhcpData2 = _.cloneDeep(mockEdgeDhcpData)
    mockEdgeDhcpData2.leaseTime = -1
    mockEdgeDhcpData2.dhcpRelay = false
    mockEdgeDhcpData2.serviceName = 'noRelay'
    const mockFn = jest.fn()

    mockServer.use(
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (_req, res, ctx) => {
          mockFn()
          return res(ctx.json(mockEdgeDhcpData2))
        }
      )
    )

    render(
      <Provider>
        <EditDhcp />
      </Provider>, {
        route: { params, path: editPagePath }
      })

    await waitFor(() => expect(mockFn).toBeCalled())
    await screen.findByRole('row', { name: /PoolTest1/ })
    const serviceNameInput = screen.getByRole('textbox', { name: 'Service Name' })
    await waitFor(() => expect(serviceNameInput).toHaveValue(mockEdgeDhcpData2.serviceName))
    await userEvent.clear(serviceNameInput)
    expect(screen.getByRole('radio', { name: 'Infinite' })).toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await screen.findByText('Please enter Service Name')
  })

  it('cancel and go back to my service', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditDhcp />
      </Provider>, {
        route: { params, path: editPagePath }
      })
    await waitFor(() => expect(mockedGetReq).toBeCalled())
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith(`/${params.tenantId}/t/` + getServiceRoutePath({
      type: ServiceType.EDGE_DHCP,
      oper: ServiceOperation.LIST
    }), { replace: true })
  })
})

describe('EditEdgeDhcp api fail', () => {
  let params: { tenantId: string, serviceId: string }
  const mockedErrorFn = jest.fn()
  jest.spyOn(console, 'log').mockImplementation(mockedErrorFn)

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'test'
    }

    mockServer.use(
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpData))
      ),
      rest.put(
        EdgeDhcpUrls.updateDhcpService.url,
        (req, res, ctx) => res(ctx.status(400), ctx.json(null))
      )
    )
  })

  it('should add edge dhcp successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditDhcp />
      </Provider>, {
        route: { params, path: editPagePath }
      })
    await screen.findAllByRole('row', { name: /PoolTest/i })
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedErrorFn).toBeCalled())
  })
})
