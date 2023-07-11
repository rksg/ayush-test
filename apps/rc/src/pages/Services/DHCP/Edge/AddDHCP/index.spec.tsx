import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { EdgeDhcpUrls } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen
} from '@acx-ui/test-utils'

import AddDhcp from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('AddEdgeDhcp', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.addDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should be blcoked when required field is empty', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddDhcp/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/create' }
      })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await screen.findByText('Please enter Service Name')
    await screen.findByText('Please create DHCP pools')
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AddDhcp/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/create' }
      })
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('My Services')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Services'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <AddDhcp/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/create' }
      })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'DHCP for SmartEdge'
    })).toBeVisible()
  })

  it('should add edge dhcp successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddDhcp />
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/create' }
      })
    const serviceNameInput = screen.getByRole('textbox', { name: /service name/i })
    fireEvent.change(serviceNameInput, { target: { value: 'myTest' } })
    await user.click(await screen.findByRole('button', { name: 'Add DHCP Pool' }))
    const poolNameInput = await screen.findByRole('textbox', { name: 'Pool Name' })
    const subnetMaskInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    const startIpInput = await screen.findByRole('textbox', { name: 'Start IP Address' })
    const endIpInput = await screen.findByRole('textbox', { name: 'End IP Address' })
    const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
    fireEvent.change(poolNameInput, { target: { value: 'Pool1' } })
    fireEvent.change(subnetMaskInput, { target: { value: '255.255.255.0' } })
    fireEvent.change(startIpInput, { target: { value: '1.1.1.1' } })
    fireEvent.change(endIpInput, { target: { value: '1.1.1.5' } })
    fireEvent.change(gatewayInput, { target: { value: '1.2.3.4' } })
    await user.click(screen.getAllByRole('button', { name: 'Add' })[1])
    fireEvent.click(screen.getByRole('radio', { name: 'Infinite' }))
    await user.click(screen.getByRole('button', { name: 'Add' }))
  })


  it('should show show external server setting successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddDhcp />
      </Provider>, { route: { params } }
    )

    const toggle = screen.getByRole('switch')
    await user.click(toggle)
    expect(toggle).toBeChecked()

    await screen.findByText('FQDN Name or IP Address')
  })

  it('cancel and go back to my service', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddDhcp />
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/create' }
      })
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/services`,
      hash: '',
      search: ''
    })
  })
})

describe('AddEdgeDhcp api fail', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.addDhcpService.url,
        (req, res, ctx) => res(ctx.status(400), ctx.json(null))
      )
    )
  })

  it('should add edge dhcp successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddDhcp />
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/create' }
      })
    const serviceNameInput = screen.getByRole('textbox', { name: /service name/i })
    fireEvent.change(serviceNameInput, { target: { value: 'myTest' } })
    await user.click(await screen.findByRole('button', { name: 'Add DHCP Pool' }))
    const poolNameInput = await screen.findByRole('textbox', { name: 'Pool Name' })
    const subnetMaskInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    const startIpInput = await screen.findByRole('textbox', { name: 'Start IP Address' })
    const endIpInput = await screen.findByRole('textbox', { name: 'End IP Address' })
    const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
    fireEvent.change(poolNameInput, { target: { value: 'Pool1' } })
    fireEvent.change(subnetMaskInput, { target: { value: '255.255.255.0' } })
    fireEvent.change(startIpInput, { target: { value: '1.1.1.1' } })
    fireEvent.change(endIpInput, { target: { value: '1.1.1.5' } })
    fireEvent.change(gatewayInput, { target: { value: '1.2.3.4' } })
    await user.click(screen.getAllByRole('button', { name: 'Add' })[1])
    await user.click(screen.getByRole('button', { name: 'Add' }))
    // TODO
    // await screen.findByText('Server Error')
  })
})