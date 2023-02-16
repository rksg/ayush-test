import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { LAG_TYPE, SwitchUrlsInfo }              from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

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
  serialNumber: 'serialNumber-id'
}

describe('SwitchLagModal', () => {
  const mockedSetVisible = jest.fn()

  beforeEach(() => {
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
      )
    )
  })

  it('should render lag list correctly', async () => {
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

  it('should add lag correctly', async () => {
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
    await screen.findByText(/add lag/i)
    fireEvent.change(screen.getByLabelText(/LAG Name/i), { target: { value: 'lag1' } })
    await user.click(await screen.findByText(/select ports type.../i))
    const portsTypeOption = await screen.findAllByText('1 Gbits per second copper')
    await user.click(portsTypeOption[portsTypeOption.length-1])
    await screen.findByText('1/1/10')
    await user.click(screen.getByText('1/1/10'))
    await user.click(screen.getByText('1/1/11'))
    await user.click(screen.getByRole('button', {
      name: /right add/i
    }))
    await user.click(await screen.findByRole('button', { name: 'Ok' }))

  })


  it('should edit lag correctly', async () => {
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
    await userEvent.click(await screen.findByRole('button', { name: 'Ok' }))
  })

  it('should edit lag change port type correctly', async () => {
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

  it('should edit lag click cancel correctly', async () => {
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


})
