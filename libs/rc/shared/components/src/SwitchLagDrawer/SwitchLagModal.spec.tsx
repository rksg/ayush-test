import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { switchApi }                  from '@acx-ui/rc/services'
import { LAG_TYPE, SwitchUrlsInfo }   from '@acx-ui/rc/utils'
import { Provider, store  }           from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  defaultVlan,
  lagList,
  portlist,
  successResponse,
  switchDetailHeader,
  switchVlans,
  switchVlanUnion,
  vlansByVenue
} from './__tests__/fixtures'
import { SwitchLagModal } from './SwitchLagModal'

const params = {
  tenantId: 'tenant-id',
  switchId: 'switch-id',
  venueId: 'a98653366d2240b9ae370e48fab3a9a1',
  serialNumber: 'serialNumber-id'
}
const mockServerQuery = () => {
  store.dispatch(switchApi.util.resetApiState())
  mockServer.use(
    rest.get(
      SwitchUrlsInfo.getLagList.url,
      (req, res, ctx) => res(ctx.json(lagList))
    ),
    rest.post(
      SwitchUrlsInfo.addLag.url,
      (_, res, ctx) => { return res(ctx.json(successResponse)) }
    ),
    rest.put(
      SwitchUrlsInfo.updateLag.url,
      (_, res, ctx) => { return res(ctx.json(successResponse)) }
    ),
    rest.post(SwitchUrlsInfo.getDefaultVlan.url,
      (_, res, ctx) => res(ctx.json(defaultVlan))
    ),
    rest.get(SwitchUrlsInfo.getSwitchVlans.url,
      (_, res, ctx) => res(ctx.json(switchVlans))
    ),
    rest.get(SwitchUrlsInfo.getSwitchVlanUnion.url,
      (_, res, ctx) => res(ctx.json(switchVlanUnion))
    ),
    rest.get(SwitchUrlsInfo.getVlansByVenue.url,
      (_, res, ctx) => res(ctx.json(vlansByVenue))
    ),
    rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
      (_, res, ctx) => res(ctx.json(switchDetailHeader))
    ),
    rest.post(
      SwitchUrlsInfo.getSwitchPortlist.url,
      (req, res, ctx) => res(ctx.json(portlist))
    ),
    rest.get(SwitchUrlsInfo.getSwitchConfigurationProfileByVenue.url,
      (_, res, ctx) => res(ctx.json({}))
    )
  )}

describe('SwitchLagModal', () => {
  const mockedSetVisible = jest.fn()
  afterEach(() => {
    Modal.destroyAll()
  })


  it('should render lag list correctly', async () => {
    mockServerQuery()
    const user = userEvent.setup()
    render(<Provider>
      <SwitchLagModal
        visible={true}
        setVisible={mockedSetVisible}
        isEditMode={false}
        editData={[]} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber'
      }
    })
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('should render lag drawer correctly', async () => {
    mockServerQuery()
    const user = userEvent.setup()
    render(<Provider>
      <SwitchLagModal
        visible={true}
        setVisible={mockedSetVisible}
        isEditMode={false}
        type='drawer'
        editData={[]} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber'
      }
    })
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeVisible()
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('should render correctly with cancel', async () => {
    mockServerQuery()
    const lag = {
      id: '75145abea1e74f5e8019725444a0ef9f',
      lagId: 2,
      name: 'lag-static',
      type: LAG_TYPE.STATIC,
      ports: [
        '1/1/6'
      ],
      taggedVlans: [
        ''
      ],
      untaggedVlan: '1',
      switchId: 'c0:c5:20:aa:32:79',
      realRemove: true
    }

    render(<Provider>
      <SwitchLagModal
        visible={true}
        setVisible={mockedSetVisible}
        isEditMode={true}
        editData={[lag]} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber'
      }
    })
    await screen.findByText(/edit lag/i)
    await screen.findByText(/1 item/i)
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })


  it.skip('should edit lag correctly', async () => {
    mockServerQuery()
    const lag = {
      id: '75145abea1e74f5e8019725444a0ef9f',
      lagId: 2,
      name: 'lag-static',
      type: LAG_TYPE.STATIC,
      ports: [
        '1/1/6'
      ],
      taggedVlans: [
        ''
      ],
      untaggedVlan: '1',
      switchId: 'c0:c5:20:aa:32:79',
      realRemove: true
    }

    render(<Provider>
      <SwitchLagModal
        visible={true}
        setVisible={mockedSetVisible}
        isEditMode={true}
        editData={[lag]} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber'
      }
    })
    await screen.findByText(/edit lag/i)
    await screen.findByText(/1 item/i)
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
  })

  it.skip('should edit lag change port type correctly', async () => {
    mockServerQuery()
    const user = userEvent.setup()
    const lag = {
      id: '75145abea1e74f5e8019725444a0ef9f',
      lagId: 2,
      name: 'lag-static',
      type: LAG_TYPE.STATIC,
      ports: [
        '1/1/6'
      ],
      taggedVlans: [
        ''
      ],
      untaggedVlan: '1',
      switchId: 'c0:c5:20:aa:32:79',
      realRemove: true
    }

    render(<Provider>
      <SwitchLagModal
        visible={true}
        setVisible={mockedSetVisible}
        isEditMode={true}
        editData={[lag]} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber'
      }
    })
    await screen.findByText(/edit lag/i)
    await screen.findByText(/1 item/i)

    await user.click(await screen.findByText('1 Gbits per second copper'))
    await user.click(await screen.findByText('10 Gbits per second fiber'))
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
  })
})
