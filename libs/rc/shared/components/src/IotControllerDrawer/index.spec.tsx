import '@testing-library/jest-dom'
import { rest } from 'msw'

import { iotApi }                              from '@acx-ui/rc/services'
import { IotUrlsInfo }                         from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  iotControllerList
} from './__tests__/fixtures'

import { IotControllerDrawer } from '.'

const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id'
}

describe('Iot Controller Drawer', () => {
  const mockedSetVisible = jest.fn()
  const mockGetIotControllerList = jest.fn()
  beforeEach(() => {
    store.dispatch(iotApi.util.resetApiState())
    mockServer.use(
      rest.post(
        IotUrlsInfo.getIotControllerList.url,
        (_, res, ctx) => {
          mockGetIotControllerList()
          return res(ctx.json(iotControllerList))
        })
    )
  })

  it('should render iot controller list correctly', async () => {
    render(<Provider>
      <IotControllerDrawer
        visible={true}
        setVisible={mockedSetVisible} />
    </Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/edit/wifi/servers' }
    })

    await waitFor(() => expect(mockGetIotControllerList).toBeCalled())

    expect(await screen.findByText('Add IoT Controller')).toBeVisible()
  })
})
