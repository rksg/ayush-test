import { rest } from 'msw'

import { switchApi, venueApi } from '@acx-ui/rc/services'
import { Provider, store }     from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { staticRoutes } from '../../__tests__/fixtures'

import StaticRoutes from '.'
import { SwitchRbacUrlsInfo, SwitchViewModel } from '@acx-ui/rc/utils'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const mockedSwitchDetail = {
  id: 'switch-id',
  venueId: 'venue-id',
  name: 'switch-name'
} as SwitchViewModel

describe('edit switch/stack form', () => {
  const params = { tenantId: 'tenant-id', switchId: 'switch-id', 
  serialNumber: 'serial-number', venueId: 'venue-id' }
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(SwitchRbacUrlsInfo.getStaticRoutes.url,
        (_, res, ctx) => res(ctx.json(staticRoutes))),
      rest.delete(SwitchRbacUrlsInfo.deleteStaticRoutes.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><StaticRoutes readOnly={false} switchDetail={mockedSwitchDetail} /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/devices/switch/:switchId/:serialNumber/edit' }
    })
    expect(await screen.findByText(/static routes/i)).toBeVisible()
  })

  it('should render readonly is true correctly', async () => {
    render(<Provider><StaticRoutes readOnly={true} switchDetail={mockedSwitchDetail} /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/devices/switch/:switchId/:serialNumber/edit' }
    })
    expect(await screen.findByText(/static routes/i)).toBeVisible()
  })


  it('should render add static route page correctly', async () => {
    render(<Provider><StaticRoutes readOnly={false} switchDetail={mockedSwitchDetail} /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/devices/switch/:switchId/:serialNumber/edit' }
    })

    const addButton = await screen.findAllByRole('button', { name: /add route/i })
    fireEvent.click(addButton[0])
    const drawer = await screen.findByRole('dialog')
    expect(await within(drawer).findByText(/add route/i)).toBeVisible()
  })

  it('should render edit static route page correctly', async () => {
    render(<Provider><StaticRoutes readOnly={false} switchDetail={mockedSwitchDetail} /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/devices/switch/:switchId/:serialNumber/edit' }
    })

    const row1 = await screen.findByRole('row', { name: /0.0.0.0/ })
    fireEvent.click(await within(row1).findByRole('checkbox'))
    const editButton = await screen.findByRole('button', { name: /edit/i })
    fireEvent.click(editButton)
    expect(await screen.findByText(/edit route/i)).toBeVisible()
  })

  it('should delete static route correctly', async () => {
    render(<Provider><StaticRoutes readOnly={false} switchDetail={mockedSwitchDetail} /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/devices/switch/:switchId/:serialNumber/edit' }
    })

    const row1 = await screen.findByRole('row', { name: /0.0.0.0/ })
    fireEvent.click(await within(row1).findByRole('checkbox'))
    const deleteButton = await screen.findByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)
  })
})