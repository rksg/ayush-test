import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen,
  within
} from '@acx-ui/test-utils'

import { mockStaticRoutes } from '../../../__tests__/fixtures'

import StaticRoutes from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('EditEdge static routes', () => {
  let params: { tenantId: string, serialNumber: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000'
    }

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getStaticRoutes.url,
        (req, res, ctx) => res(ctx.json(mockStaticRoutes))
      ),
      rest.patch(
        EdgeUrlsInfo.updateStaticRoutes.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should create StaticRoutes successfully', async () => {
    render(
      <Provider>
        <StaticRoutes />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    expect((await screen.findAllByRole('row')).length).toBe(2)
  })

  it('Add a route setting validation failed', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StaticRoutes />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    await user.click(await screen.findByRole('button', { name: 'Add Route' }))
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Please enter Network Address')).toBeVisible()
    expect(await screen.findByText('Please enter Subnet Mask')).toBeVisible()
    expect(await screen.findByText('Please enter Gateway')).toBeVisible()

    const ipInput = await screen.findByRole('textbox', { name: 'Network Address' })
    const subnetInput = screen.getByRole('textbox', { name: 'Subnet Mask' })
    const gatewayInput = screen.getByRole('textbox', { name: 'Gateway' })
    fireEvent.change(ipInput, { target: { value: '1' } })
    fireEvent.change(subnetInput, { target: { value: '255' } })
    fireEvent.change(gatewayInput, { target: { value: '1' } })
    expect((await screen.findAllByText('Please enter a valid IP address')).length).toBe(2)
    expect(await screen.findByText('Please enter a valid subnet mask')).toBeVisible()

    fireEvent.change(ipInput, { target: { value: '10.100.2.0' } })
    fireEvent.change(subnetInput, { target: { value: '255.255.255.0' } })
    expect(
      (await screen.findAllByText(
        'Each route should have unique Network Address + Subnet Mask'
      )).length
    ).toBe(2)
  })

  it('Add a route setting will be blocked by invalid ip + subnet', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StaticRoutes />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    await user.click(await screen.findByRole('button', { name: 'Add Route' }))
    const ipInput = await screen.findByRole('textbox', { name: 'Network Address' })
    const subnetInput = screen.getByRole('textbox', { name: 'Subnet Mask' })
    fireEvent.change(ipInput, { target: { value: '10.100.2.1' } })
    fireEvent.change(subnetInput, { target: { value: '255.255.255.0' } })
    expect(
      (await screen.findAllByText(
        'Please enter a valid Network Address + Subnet Mask'
      )).length
    ).toBe(2)
  })

  it('Add a route setting', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StaticRoutes />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    await user.click(await screen.findByRole('button', { name: 'Add Route' }))
    const ipInput = await screen.findByRole('textbox', { name: 'Network Address' })
    fireEvent.change(ipInput, { target: { value: '1.1.1.0' } })
    const subnetInput = screen.getByRole('textbox', { name: 'Subnet Mask' })
    fireEvent.change(subnetInput, { target: { value: '255.255.255.0' } })
    const gatewayInput = screen.getByRole('textbox', { name: 'Gateway' })
    fireEvent.change(gatewayInput, { target: { value: '1.1.1.1' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByRole('row', { name: /1.1.1.0/i })).toBeVisible()
  })

  it('Add a route setting with "Add another route" checked', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StaticRoutes />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    await user.click(await screen.findByRole('button', { name: 'Add Route' }))
    await user.click(await screen.findByRole('checkbox', { name: 'Add another route' }))
    const ipInput = screen.getByRole('textbox', { name: 'Network Address' })
    fireEvent.change(ipInput, { target: { value: '1.1.1.0' } })
    const subnetInput = screen.getByRole('textbox', { name: 'Subnet Mask' })
    fireEvent.change(subnetInput, { target: { value: '255.255.255.0' } })
    const gatewayInput = screen.getByRole('textbox', { name: 'Gateway' })
    fireEvent.change(gatewayInput, { target: { value: '1.1.1.1' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByRole('row', { name: /1.1.1.0/i })).toBeVisible()
    expect(screen.getByText('Add Static Route')).toBeVisible()
  })

  it('Edit a route setting', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StaticRoutes />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    const row = await screen.findByRole('row', { name: /10.100.120.0/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    const ipInput = await screen.findByRole('textbox', { name: 'Network Address' })
    fireEvent.change(ipInput, { target: { value: '1.1.1.0' } })
    const subnetInput = screen.getByRole('textbox', { name: 'Subnet Mask' })
    fireEvent.change(subnetInput, { target: { value: '255.255.255.0' } })
    const gatewayInput = screen.getByRole('textbox', { name: 'Gateway' })
    fireEvent.change(gatewayInput, { target: { value: '1.1.1.1' } })
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    expect(await screen.findByRole('row', { name: /1.1.1.0/i })).toBeVisible()
  })

  it('delete existing route setting', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StaticRoutes />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    const row = await screen.findByRole('row', { name: /10.100.120.0/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(row).not.toBeVisible()
  })

  it('delete new route setting', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StaticRoutes />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    await user.click(await screen.findByRole('button', { name: 'Add Route' }))
    const ipInput = await screen.findByRole('textbox', { name: 'Network Address' })
    fireEvent.change(ipInput, { target: { value: '1.1.1.0' } })
    const subnetInput = screen.getByRole('textbox', { name: 'Subnet Mask' })
    fireEvent.change(subnetInput, { target: { value: '255.255.255.0' } })
    const gatewayInput = screen.getByRole('textbox', { name: 'Gateway' })
    fireEvent.change(gatewayInput, { target: { value: '1.1.1.1' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))

    const row = await screen.findByRole('row', { name: /1.1.1.0/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(row).not.toBeVisible()
  })

  it('apply static routes setting', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StaticRoutes />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    await user.click(await screen.findByRole('button', { name: 'Apply Static Routes' }))
  })

  it('cancel and go back to edge list', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StaticRoutes />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    })
  })
})

describe('EditEdge static routes api fail', () => {
  let params: { tenantId: string, serialNumber: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000'
    }

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getStaticRoutes.url,
        (req, res, ctx) => res(ctx.json(mockStaticRoutes))
      ),
      rest.patch(
        EdgeUrlsInfo.updateStaticRoutes.url,
        (req, res, ctx) => res(ctx.status(500))
      )
    )
  })

  it('apply api fail handle', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StaticRoutes />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    await user.click(await screen.findByRole('button', { name: 'Apply Static Routes' }))
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })
})