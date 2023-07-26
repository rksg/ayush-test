import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { rest }       from 'msw'
import { act }        from 'react-dom/test-utils'

import { venueApi }        from '@acx-ui/rc/services'
import { SwitchUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { staticRoutes } from '../../__tests__/fixtures'

import StaticRoutesDrawer from './StaticRoutesDrawer'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('edit static routes form', () => {
  const params = { tenantId: 'tenant-id', switchId: 'switch-id', serialNumber: 'serial-number' }
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    initialize()
    mockServer.use(
      rest.get(SwitchUrlsInfo.getStaticRoutes.url,
        (_, res, ctx) => res(ctx.json(staticRoutes))),
      rest.post(SwitchUrlsInfo.addStaticRoute.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))
      ),
      rest.put(SwitchUrlsInfo.updateStaticRoute.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><StaticRoutesDrawer
      visible={true}
      setVisible={jest.fn()}
      data={staticRoutes[0]} /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/edit' }
    })
    expect(await screen.findByText(/edit route/i)).toBeVisible()
  })

  it('should trigger destination ip validation correctly', async () => {
    render(<Provider><StaticRoutesDrawer
      visible={true}
      setVisible={jest.fn()}
      data={staticRoutes[0]} /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/edit' }
    })

    const destIp = await screen.findByLabelText('Destination IP')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(destIp, { target: { value: '0.0.0.0/0' } })
    })
    // userEvent.type(destIp, '0.0.0.0/0')
    // fireEvent.focus(destIp)
    // fireEvent.blur(destIp)
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      destIp.focus()
      destIp.blur()
    })
    await userEvent.tab()
    const applyButton = await screen.findByRole('button', { name: /apply/i })
    await userEvent.click(applyButton)
  })


  it('should trigger saving form correctly', async () => {
    render(<Provider><StaticRoutesDrawer
      visible={true}
      setVisible={jest.fn()}
      data={staticRoutes[0]} /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/edit' }
    })

    const destIp = screen.getByLabelText('Destination IP')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(destIp, { target: { value: '0.0.0.0/1' } })
    })
    // userEvent.type(destIp, '0.0.0.0/0')
    // fireEvent.focus(destIp)
    // fireEvent.blur(destIp)

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      destIp.focus()
      destIp.blur()
    })
    await userEvent.tab()
    const applyButton = await screen.findByRole('button', { name: /apply/i })
    await userEvent.click(applyButton)
  })
})