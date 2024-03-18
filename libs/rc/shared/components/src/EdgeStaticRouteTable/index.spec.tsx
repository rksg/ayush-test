import userEvent from '@testing-library/user-event'

import { EdgeGeneralFixtures, EdgeStaticRoute } from '@acx-ui/rc/utils'
import { render, screen, within }               from '@acx-ui/test-utils'

import { EdgeStaticRouteTable } from '.'

const { mockStaticRoutes } = EdgeGeneralFixtures
const mockNewRoute = {
  id: '3',
  destIp: '10.2.3.0',
  destSubnet: '255.255.255.0',
  nextHop: '10.2.3.1'
}

jest.mock('./StaticRoutesDrawer', () => ({
  ...jest.requireActual('./StaticRoutesDrawer'),
  StaticRoutesDrawer: (
    { addRoute, editRoute }: {
      addRoute: (data: EdgeStaticRoute) => void,
      editRoute: (data: EdgeStaticRoute) => void
    }
  ) => <div data-testid='StaticRoutesDrawer'>
    <button onClick={() => addRoute(mockNewRoute)}>Add</button>
    <button onClick={() => editRoute({
      ...mockStaticRoutes.routes[0],
      destIp: '2.2.2.2'
    })}>Edit</button>
  </div>
}))

describe('EdgeStaticRouteTable', () => {
  it('should render EdgeStaticRouteTable successfully', async () => {
    render(<EdgeStaticRouteTable value={mockStaticRoutes.routes} />)

    expect((await screen.findAllByRole('row', { name: /10.100/i })).length).toBe(2)
    expect(screen.getByTestId('StaticRoutesDrawer')).toBeVisible()
  })

  it('should add route successfully', async () => {
    const onChangeSpy = jest.fn()
    render(
      <EdgeStaticRouteTable
        value={mockStaticRoutes.routes}
        onChange={onChangeSpy}
      />
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    expect(onChangeSpy).toHaveBeenCalledWith([...mockStaticRoutes.routes, mockNewRoute])
  })

  it('should edit route successfully', async () => {
    const onChangeSpy = jest.fn()
    render(
      <EdgeStaticRouteTable
        value={mockStaticRoutes.routes}
        onChange={onChangeSpy}
      />
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(onChangeSpy).toHaveBeenCalledWith([{
      ...mockStaticRoutes.routes[0],
      destIp: '2.2.2.2'
    }, mockStaticRoutes.routes[1]])
  })

  it('should delete route successfully', async () => {
    const onChangeSpy = jest.fn()
    render(
      <EdgeStaticRouteTable
        value={mockStaticRoutes.routes}
        onChange={onChangeSpy}
      />
    )
    const row = await screen.findByRole('row', { name: /10.100.120.0/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(onChangeSpy).toHaveBeenCalledWith([mockStaticRoutes.routes[1]])
  })
})