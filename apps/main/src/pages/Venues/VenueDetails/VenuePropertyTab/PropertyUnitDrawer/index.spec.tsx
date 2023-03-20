import { waitFor } from '@storybook/testing-library'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'

import { CommonUrlsInfo, Persona, PersonaUrls, PropertyUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, render, screen }                             from '@acx-ui/test-utils'

import { mockPersonaGroupWithoutNSG, mockEnabledPropertyConfig, mockPropertyUnit, venueLanPorts } from '../../../__tests__/fixtures'

import { PropertyUnitDrawer } from './index'


const closeFn = jest.fn()
const params = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  venueId: 'f892848466d047798430de7ac234e940'
}
const unitId = 'c59f537f-2257-4fa6-934b-69f787e686fb'

const mockPersona: Persona = {
  id: 'persona-id-1',
  name: 'persona-name-1',
  groupId: 'persona-group-id-1',
  dpskGuid: 'dpsk-guid-1',
  dpskPassphrase: 'dpsk-passphrase'
}


describe('Property Unit Drawer', () => {
  beforeEach(() => {
    closeFn.mockClear()

    mockServer.use(
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (_, res, ctx) => res(ctx.json(mockEnabledPropertyConfig))
      ),
      rest.post(
        PropertyUrlsInfo.addPropertyUnit.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.patch(
        PropertyUrlsInfo.updatePropertyUnit.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        PropertyUrlsInfo.getUnitById.url,
        (_, res, ctx) => res(ctx.json(mockPropertyUnit))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (_, res, ctx) => res(ctx.json(mockPersonaGroupWithoutNSG))
      ),
      rest.get(
        CommonUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))
      ),
      rest.get(
        PersonaUrls.getPersonaById.url,
        (_, res, ctx) => res(ctx.json(mockPersona))
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
          unitId={unitId}
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
