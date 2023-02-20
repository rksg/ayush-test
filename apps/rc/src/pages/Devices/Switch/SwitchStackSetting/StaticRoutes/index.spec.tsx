import { initialize } from '@googlemaps/jest-mocks'
import { rest }       from 'msw'

import { venueApi }        from '@acx-ui/rc/services'
import { SwitchUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { staticRoutes } from '../../__tests__/fixtures'

import StaticRoutes from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('edit switch/stack form', () => {
  const params = { tenantId: 'tenant-id', switchId: 'switch-id', serialNumber: 'serial-number' }
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    initialize()
    mockServer.use(
      rest.get(SwitchUrlsInfo.getStaticRoutes.url,
        (_, res, ctx) => res(ctx.json(staticRoutes))),
      rest.delete(SwitchUrlsInfo.deleteStaticRoutes.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><StaticRoutes readOnly={false} /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/edit' }
    })
    expect(await screen.findByText(/static routes/i)).toBeVisible()
  })

  it('should render readonly is true correctly', async () => {
    render(<Provider><StaticRoutes readOnly={true} /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/edit' }
    })
    expect(await screen.findByText(/static routes/i)).toBeVisible()
  })


  it('should render add static route page correctly', async () => {
    render(<Provider><StaticRoutes readOnly={false} /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/edit' }
    })

    const addButton = await screen.findByRole('button', { name: /add rule/i })
    fireEvent.click(addButton)
    expect(await screen.findByText(/add route/i)).toBeVisible()
  })

  it('should render edit static route page correctly', async () => {
    render(<Provider><StaticRoutes readOnly={false} /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/edit' }
    })

    const row1 = await screen.findByRole('row', { name: /0.0.0.0/ })
    fireEvent.click(await within(row1).findByRole('checkbox'))
    const editButton = await screen.findByRole('button', { name: /edit/i })
    fireEvent.click(editButton)
    expect(await screen.findByText(/edit route/i)).toBeVisible()
  })

  it('should delete static route correctly', async () => {
    render(<Provider><StaticRoutes readOnly={false} /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/edit' }
    })

    const row1 = await screen.findByRole('row', { name: /0.0.0.0/ })
    fireEvent.click(await within(row1).findByRole('checkbox'))
    const deleteButton = await screen.findByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)
  })
})