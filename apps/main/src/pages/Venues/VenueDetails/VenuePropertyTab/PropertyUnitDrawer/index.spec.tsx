import { waitFor } from '@storybook/testing-library'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'

import { CommonUrlsInfo, PropertyUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                         from '@acx-ui/store'
import { mockServer, render, screen }       from '@acx-ui/test-utils'

import { venueLanPorts } from '../../../__tests__/fixtures'

import { PropertyUnitDrawer } from './index'


const closeFn = jest.fn()
const params = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  venueId: 'f892848466d047798430de7ac234e940'
}


describe('Property Unit Drawer', () => {
  beforeEach(() => {
    closeFn.mockClear()

    mockServer.use(
      rest.post(
        PropertyUrlsInfo.addPropertyUnit.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        CommonUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))
      )
    )
  })

  it('should render add drawer without NSG', async () => {
    render(
      <Provider>
        <PropertyUnitDrawer visible isEdit={false} onClose={closeFn} venueId={params.venueId}/>
      </Provider>, { route: { params } }
    )

    // Type unit name
    const nameField = await screen.findByLabelText(/Unit Name/i)
    await userEvent.type(nameField, 'New Unit Name')

    // Trigger creation
    const addBtn = await screen.findByRole('button', { name: /add/i })
    await userEvent.click(addBtn)

    await waitFor(() => expect(closeFn).toHaveBeenCalled())
  })

  it('should render add drawer with NSG', async () => {
    render(
      <Provider>
        <PropertyUnitDrawer visible isEdit={false} onClose={closeFn} venueId={params.venueId}/>
      </Provider>, { route: { params } }
    )
    // Type unit name
    const nameField = await screen.findByLabelText(/Unit Name/i)
    await userEvent.type(nameField, 'New Unit Name')

    // TODO: add more action to cover code
    // const apSelector = await screen.findByRole('combobox', { name: /select ap/i })

    // await userEvent.click(apSelector)
    // const h320 = await screen.findByRole('option', { name: 'H320' })
    // await userEvent.click(h320)

    // Trigger creation
    const addBtn = await screen.findByRole('button', { name: /add/i })
    await userEvent.click(addBtn)

    await waitFor(() => expect(closeFn).toHaveBeenCalled())
  })

  it('should render edit drawer without NSG', async () => {
    render(
      <Provider>
        <PropertyUnitDrawer
          venueId={params.venueId}
          visible
          isEdit
          onClose={closeFn}
        />
      </Provider>, { route: { params } })
    // TODO: expect data

    const saveBtn = await screen.findByRole('button', { name: /save/i })
    await userEvent.click(saveBtn)

    await waitFor(() => expect(closeFn).toHaveBeenCalled())
  })

  it('should change vlan value', async () => {
    render(
      <Provider>
        <PropertyUnitDrawer visible isEdit={false} onClose={closeFn} venueId={params.venueId}/>
      </Provider>, { route: { params } }
    )

    // Open the guest vlan field
    const guestSwitch = await screen.findByRole('switch')
    await userEvent.click(guestSwitch)

    const changeVlanBtn = await screen.findAllByRole('button', { name: /change/i })
    for (const btn of changeVlanBtn) {
      await userEvent.click(btn)
    }

    const resetVlanBtn = await screen.findAllByRole('button', { name: /reset to default/i })
    for (const btn of resetVlanBtn) {
      await userEvent.click(btn)
    }

    const cancelVlanBtn = await screen.findAllByRole('button', { name: /cancel/i })
    for (const btn of cancelVlanBtn) {
      await userEvent.click(btn)
    }

    // Trigger change vlan field
    for (const btn of changeVlanBtn) {
      await userEvent.click(btn)
    }

    const saveVlanBtn = await screen.findAllByRole('button', { name: /save/i })
    for (const btn of saveVlanBtn) {
      await userEvent.click(btn)
    }
  })

  // FIXME: not sure is it correct test case
  it('should render clean drawer while closing', async () => {
    render(
      <Provider>
        <PropertyUnitDrawer
          visible={false}
          isEdit={false}
          onClose={closeFn}
          venueId={params.venueId}
        />
      </Provider>, { route: { params } })
  })
})
