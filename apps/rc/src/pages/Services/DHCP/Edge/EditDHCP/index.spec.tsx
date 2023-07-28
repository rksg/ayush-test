import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeDhcpUrls } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
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
        (req, res, ctx) => {
          mockedUpdateReq(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it.skip('should render edit edge dhcp successfully', async () => {
    render(
      <Provider>
        <EditDhcp />
      </Provider>, {
        route: { params, path: editPagePath }
      })
    let serviceNameInput = await screen.findByRole('textbox', { name: 'Service Name' })
    const fqdnNameInput = await screen.findByRole('textbox', { name: 'FQDN Name or IP Address' })
    const domainNameInput = screen.getByRole('textbox', { name: 'Domain Name' })
    const primaryDnsInput = screen.getByRole('textbox', { name: 'Primary DNS Server' })
    serviceNameInput = await screen.findByRole('textbox', { name: 'Service Name' })
    expect(serviceNameInput).toHaveValue(mockEdgeDhcpData.serviceName)
    expect(fqdnNameInput).toHaveValue(mockEdgeDhcpData.externalDhcpServerFqdnIp)
    expect(domainNameInput).toHaveValue(mockEdgeDhcpData.domainName)
    expect(primaryDnsInput).toHaveValue(mockEdgeDhcpData.primaryDnsIp)
    const poolsRow = await screen.findAllByRole('row', { name: /PoolTest/i })
    const hostsRow = await screen.findAllByRole('row', { name: /HostTest/i })
    expect(poolsRow.length).toBe(1)
    expect(hostsRow.length).toBe(1)
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <EditDhcp />
      </Provider>, {
        route: { params, path: editPagePath }
      })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'DHCP for SmartEdge'
    })).toBeVisible()
  })

  it.skip('should be blcoked when required field is empty', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditDhcp />
      </Provider>, {
        route: { params, path: editPagePath }
      })
    const serviceNameInput = screen.getByRole('textbox', { name: 'Service Name' })
    await waitFor(() => expect(serviceNameInput).toHaveValue(mockEdgeDhcpData.serviceName))
    fireEvent.change(serviceNameInput, { target: { value: '' } })
    await user.click(screen.getByRole('button', { name: 'Apply' }))
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
    await screen.findAllByRole('row', { name: /PoolTest/i })
    fireEvent.click(screen.getByRole('switch', { name: 'DHCP Relay:' }))
    fireEvent.click(await screen.findByRole('radio', { name: 'Infinite' }))
    const optRow = await screen.findByRole('row', { name: /Option 1/i })
    await user.click(within(optRow).getByRole('checkbox'))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(optRow).not.toBeVisible())
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
      dhcpPools: [
        {
          id: '1',
          poolName: 'PoolTest1',
          subnetMask: '255.255.255.0',
          poolStartIp: '1.1.1.1',
          poolEndIp: '1.1.1.10',
          gatewayIp: '1.1.1.1',
          activated: true
        }
      ],
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
    // TODO
    // await screen.findByText('Server Error')
  })
})
