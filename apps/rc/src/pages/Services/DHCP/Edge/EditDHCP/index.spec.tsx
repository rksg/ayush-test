import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeDhcpUrls } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { mockEdgeDhcpData } from '../__tests__/fixtures'

import EditDhcp from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const mockedUpdateEdgeDhcp = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useUpdateEdgeDhcpServiceMutation: () => [mockedUpdateEdgeDhcp]
}))

const editPagePath = '/:tenantId/services/edgeDhcp/:serviceId/edit'

describe('EditEdgeDhcp', () => {
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
      rest.post(
        EdgeDhcpUrls.updateDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
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
    const serviceNameInput = screen.getByRole('textbox', { name: /service name/i })
    const fqdnNameInput = await screen.findByRole('textbox', { name: 'FQDN Name or IP Address' })
    const domainNameInput = screen.getByRole('textbox', { name: 'Domain Name' })
    const primaryDnsInput = screen.getByRole('textbox', { name: 'Primary DNS Server' })
    await waitFor(() => expect(serviceNameInput).toHaveValue(mockEdgeDhcpData.serviceName))
    expect(fqdnNameInput).toHaveValue(mockEdgeDhcpData.externalDhcpServerFqdnIp)
    expect(domainNameInput).toHaveValue(mockEdgeDhcpData.domainName)
    expect(primaryDnsInput).toHaveValue(mockEdgeDhcpData.primaryDnsIp)
  })

  it('should be blcoked when required field is empty', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditDhcp />
      </Provider>, {
        route: { params, path: editPagePath }
      })
    const serviceNameInput = screen.getByRole('textbox', { name: /service name/i })
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
    const serviceNameInput = screen.getByRole('textbox', { name: /service name/i })
    await waitFor(() => expect(serviceNameInput).toHaveValue(mockEdgeDhcpData.serviceName))
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    expect(mockedUpdateEdgeDhcp).toBeCalledTimes(1)
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
      rest.post(
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
    const serviceNameInput = screen.getByRole('textbox', { name: /service name/i })
    await waitFor(() => expect(serviceNameInput).toHaveValue(mockEdgeDhcpData.serviceName))
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await screen.findByText('An error occurred')
  })
})