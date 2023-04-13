import { waitFor } from '@storybook/testing-library'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'

import { CommonUrlsInfo, Persona, PersonaUrls, PropertyUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, render, screen }                             from '@acx-ui/test-utils'

import {
  mockPersonaGroupWithoutNSG,
  mockPropertyUnit,
  venueLanPorts,
  mockEnabledNoNSGPropertyConfig,
  mockEnabledNSGPropertyConfig,
  mockPersonaGroupWithNSG
} from '../../../__tests__/fixtures'

import { PropertyUnitDrawer } from './index'


const closeFn = jest.fn()
const params = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  venueId: 'has-nsg-venue-id',
  nsgVenueId: 'has-nsg-venue-id',
  noNsgVenueId: 'no-nsg-venue-id'
}
const unitId = 'c59f537f-2257-4fa6-934b-69f787e686fb'

const mockPersona: Persona = {
  id: 'persona-id-1',
  name: 'persona-name-1',
  groupId: 'persona-group-id-1',
  dpskGuid: 'dpsk-guid-1',
  dpskPassphrase: 'dpsk-passphrase',
  ethernetPorts: [{
    portIndex: 1,
    personaId: 'persona-id-1',
    macAddress: 'ap-mac-address'
  }]
}


describe('Property Unit Drawer', () => {
  beforeEach(() => {
    closeFn.mockClear()

    mockServer.use(
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => {
          return res(ctx.json(req.params.venueId === params.noNsgVenueId
            ? mockEnabledNoNSGPropertyConfig
            : mockEnabledNSGPropertyConfig))
        }
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
        (req, res, ctx) => {
          return res(ctx.json(req.params.groupId === 'persona-group-id-noNSG'
            ? mockPersonaGroupWithoutNSG
            : mockPersonaGroupWithNSG))
        }
      ),
      rest.get(
        CommonUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))
      ),
      rest.get(
        PersonaUrls.getPersonaById.url,
        (_, res, ctx) => res(ctx.json(mockPersona))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
  })

  it('should render simple drawer', async () => {
    render(<Provider>
      <PropertyUnitDrawer isEdit={false} visible onClose={closeFn} venueId={params.noNsgVenueId}/>
    </Provider>)

    await screen.findByText('Unit Name')
    await screen.findByText('VLAN')
    await screen.findByText('Resident Name')
  })

  it('should add no nsg drawer', async () => {
    render(<Provider>
      <PropertyUnitDrawer isEdit={false} visible onClose={closeFn} venueId={params.noNsgVenueId}/>
    </Provider>)

    await screen.findByText('VLAN')

    const nameField = await screen.findByLabelText(/unit name/i)
    await userEvent.type(nameField, 'new unit name test')

    const residentField = await screen.findByLabelText(/resident name/i)
    await userEvent.type(residentField, 'new resident name test')

    const addBtn = await screen.findByRole('button', { name: /add/i })
    await userEvent.click(addBtn)

    await waitFor(expect(closeFn).toHaveBeenCalled)
  })

  it('should edit no nsg drawer', async () => {
    render(<Provider>
      <PropertyUnitDrawer
        isEdit
        visible
        unitId={unitId}
        onClose={closeFn}
        venueId={params.noNsgVenueId}
      />
    </Provider>)

    await screen.findByLabelText(/unit name/i)
    await screen.findByText('Separate VLAN for guests')

    const saveBtn = await screen.findByRole('button', { name: /save/i })
    await userEvent.click(saveBtn)

    await waitFor(expect(closeFn).toHaveBeenCalled)
  })

  it('should edit nsg drawer', async () => {
    render(<Provider>
      <PropertyUnitDrawer
        isEdit
        visible
        unitId={unitId}
        onClose={closeFn}
        venueId={params.nsgVenueId}
      />
    </Provider>)

    await screen.findByText('Select AP')
    await screen.findByLabelText(/vxlan/i)

    const saveBtn = await screen.findByRole('button', { name: /save/i })
    await userEvent.click(saveBtn)
  })
})
