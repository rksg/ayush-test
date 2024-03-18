import userEvent from '@testing-library/user-event'

import { EdgeGeneralFixtures }     from '@acx-ui/rc/utils'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { StaticRoutesDrawer } from './StaticRoutesDrawer'

const { mockStaticRoutes } = EdgeGeneralFixtures

describe('EdgeStaticRouteTable - StaticRoutesDrawer', () => {
  it('should show add route successfully', async () => {
    const setVisibleSpy = jest.fn()
    const addRouteSpy = jest.fn()
    render(
      <StaticRoutesDrawer
        visible
        setVisible={setVisibleSpy}
        addRoute={addRouteSpy}
        editRoute={jest.fn()}
        allRoutes={[]}
      />
    )
    expect(screen.getByText('Add Static Route')).toBeVisible()
    const ipField = screen.getByRole('textbox', { name: 'Network Address' })
    const subnetField = screen.getByRole('textbox', { name: 'Subnet Mask' })
    const gatewayField = screen.getByRole('textbox', { name: 'Gateway' })
    await userEvent.type(ipField, '1.1.1.0')
    await userEvent.type(subnetField, '255.255.255.0')
    await userEvent.type(gatewayField, '1.1.1.1')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(addRouteSpy).toHaveBeenCalledWith({
      id: '1.1.1.0255.255.255.0',
      destIp: '1.1.1.0',
      destSubnet: '255.255.255.0',
      nextHop: '1.1.1.1'
    }))
    await waitFor(() => expect(setVisibleSpy).toHaveBeenCalledWith(false))
  })

  it('should show edit modal successfully', async () => {
    const setVisibleSpy = jest.fn()
    const editRouteSpy = jest.fn()
    render(
      <StaticRoutesDrawer
        visible
        setVisible={setVisibleSpy}
        addRoute={jest.fn()}
        editRoute={editRouteSpy}
        data={mockStaticRoutes.routes[0]}
        allRoutes={mockStaticRoutes.routes}
      />
    )
    expect(screen.getByText('Edit Static Route')).toBeVisible()
    const ipField = screen.getByRole('textbox', { name: 'Network Address' })
    await userEvent.clear(ipField)
    await userEvent.type(ipField, '9.9.9.0')
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(editRouteSpy).toHaveBeenCalledWith({
      ...mockStaticRoutes.routes[0],
      destIp: '9.9.9.0'
    }))
    await waitFor(() => expect(setVisibleSpy).toHaveBeenCalledWith(false))
  })

  it('should be blocked by invalid ip + subnet mask', async () => {
    render(
      <StaticRoutesDrawer
        visible
        setVisible={jest.fn()}
        addRoute={jest.fn()}
        editRoute={jest.fn()}
        allRoutes={[]}
      />
    )
    const ipField = screen.getByRole('textbox', { name: 'Network Address' })
    const subnetField = screen.getByRole('textbox', { name: 'Subnet Mask' })
    await userEvent.type(ipField, '1.1.1.1')
    await userEvent.type(subnetField, '255.255.255.0')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Please enter a valid Network Address + Subnet Mask')).toBeVisible()
  })

  it('should be blocked by duplicate data', async () => {
    render(
      <StaticRoutesDrawer
        visible
        setVisible={jest.fn()}
        addRoute={jest.fn()}
        editRoute={jest.fn()}
        allRoutes={mockStaticRoutes.routes}
      />
    )
    const ipField = screen.getByRole('textbox', { name: 'Network Address' })
    const subnetField = screen.getByRole('textbox', { name: 'Subnet Mask' })
    await userEvent.type(ipField, '10.100.120.0')
    await userEvent.type(subnetField, '255.255.255.0')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    // eslint-disable-next-line max-len
    expect((await screen.findAllByText('Each route should have unique Network Address + Subnet Mask'))[0]).toBeVisible()
  })
})