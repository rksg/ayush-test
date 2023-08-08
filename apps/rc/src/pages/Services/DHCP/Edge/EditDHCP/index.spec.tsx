import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { EdgeDhcpUrls } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
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

    mockedGetReq.mockClear()
    mockedUpdateReq.mockClear()

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
    expect(screen.queryAllByRole('alert').length).toBe(1)
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <EditDhcp />
      </Provider>, {
        route: { params, path: editPagePath }
      })
    await waitFor(() => expect(mockedGetReq).toBeCalled())
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'DHCP for SmartEdge'
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
        (req, res, ctx) => {
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
    await screen.findByRole('radio', { name: 'Infinite' })
    const serviceNameInput = await screen.findByRole('textbox', { name: 'Service Name' })
    await waitFor(() => expect(serviceNameInput).toHaveValue(mockEdgeDhcpData2.serviceName))
    await userEvent.clear(serviceNameInput)
    expect(screen.getByRole('radio', { name: 'Infinite' })).toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await screen.findByText('Please enter Service Name')
  })

  it('should edit edge dhcp successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditDhcp />
      </Provider>, {
        route: { params, path: editPagePath }
      })

    await waitFor(() => expect(mockedGetReq).toBeCalled())
    await screen.findAllByRole('row', { name: /PoolTest/i })
    const fqdnNameInput = await screen.findByRole('textbox', { name: 'FQDN Name or IP Address' })
    await userEvent.click(screen.getByRole('switch', { name: 'DHCP Relay:' }))
    await waitFor(() => expect(fqdnNameInput).not.toBeVisible())
    expect(screen.getByRole('switch', { name: 'DHCP Relay:' })).not.toBeChecked()
    await userEvent.click(await screen.findByRole('radio', { name: 'Infinite' }))
    const optRow = await screen.findByRole('row', { name: /Option 1/i })
    await user.click(within(optRow).getByRole('checkbox'))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(optRow).not.toBeVisible())

    await userEvent.click(screen.getByText('PoolTest1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    let drawer = await screen.findByRole('dialog')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Gateway' }), '1.1.1.127')
    await userEvent.click(within(drawer).getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(drawer).not.toBeVisible())

    // create new pool
    await userEvent.click(screen.getByRole('button', { name: 'Add DHCP Pool' }))
    drawer = await screen.findByRole('dialog')
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Pool Name' }), 'Pool2')
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    const textBoxs = within(drawer).getAllByRole('textbox')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolStartIp')[0], '2.2.2.0')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolEndIp')[0], '2.2.2.5')
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Gateway' }), '2.2.3.4')
    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(drawer).not.toBeVisible())

    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedUpdateReq).toBeCalledWith({
      id: '1',
      serviceName: 'test',
      dhcpRelay: false,
      externalDhcpServerFqdnIp: '1.1.1.1',
      domainName: 'test.com.cc',
      primaryDnsIp: '1.1.1.1',
      secondaryDnsIp: '2.2.2.2',
      leaseTime: -1,
      leaseTimeUnit: 'HOURS',
      dhcpPools: [{
        id: '1',
        poolName: 'PoolTest1',
        subnetMask: '255.255.255.0',
        poolStartIp: '1.1.1.1',
        poolEndIp: '1.1.1.10',
        gatewayIp: '1.1.1.127',
        activated: true
      }, {
        id: '',
        poolName: 'Pool2',
        subnetMask: '255.255.255.0',
        poolStartIp: '2.2.2.0',
        poolEndIp: '2.2.2.5',
        gatewayIp: '2.2.3.4'
      }],
      dhcpOptions: [],
      hosts: [
        {
          id: '1',
          hostName: 'HostTest1',
          mac: '00:0c:29:26:dd:fc',
          fixedAddress: '1.1.1.1'
        }
      ]
    }))
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
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/services`,
      hash: '',
      search: ''
    })
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
