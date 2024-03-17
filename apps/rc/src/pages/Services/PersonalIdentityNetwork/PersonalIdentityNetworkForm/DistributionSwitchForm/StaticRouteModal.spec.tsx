import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi }                             from '@acx-ui/rc/services'
import { EdgeGeneralFixtures, EdgeUrlsInfo }   from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { StaticRouteModal } from './StaticRouteModal'

const { mockStaticRoutes } = EdgeGeneralFixtures

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeStaticRouteTable: () => <div data-testid='edge-static-route-table' />
}))

const requestSpy = jest.fn()

describe('StaticRouteModal', () => {
  beforeEach(() => {
    store.dispatch(edgeApi.util.resetApiState())

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getStaticRoutes.url,
        (req, res, ctx) => res(ctx.json(mockStaticRoutes))
      ),
      rest.patch(
        EdgeUrlsInfo.updateStaticRoutes.url,
        (req, res, ctx) => {
          requestSpy()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('Should render successfully', async () => {
    render(
      <Provider>
        <StaticRouteModal edgeId='0000000001' edgeName='Smart Edge 1' />
      </Provider>
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Static Route' }))
    const table = await screen.findByTestId('edge-static-route-table')
    await waitFor(() => expect(table).toBeVisible())
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(table).not.toBeVisible()
  })

  it('Should submit successfully', async () => {
    render(
      <Provider>
        <StaticRouteModal edgeId='0000000001' edgeName='Smart Edge 1' />
      </Provider>
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Static Route' }))
    const table = await screen.findByTestId('edge-static-route-table')
    await waitFor(() => expect(table).toBeVisible())
    await userEvent.click(await screen.findByRole('button', { name: 'Apply Static Routes' }))
    await waitFor(() => expect(requestSpy).toHaveBeenCalled())
    await waitFor(() => expect(table).not.toBeVisible())
  })
})