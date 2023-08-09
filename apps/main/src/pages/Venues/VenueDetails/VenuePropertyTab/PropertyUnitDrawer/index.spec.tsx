import userEvent from '@testing-library/user-event'
import moment    from 'moment-timezone'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                   from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, ConnectionMeteringUrls, Persona, PersonaUrls, PropertyUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                       from '@acx-ui/store'
import {  mockServer, render, screen,  waitForElementToBeRemoved }                        from '@acx-ui/test-utils'
import { RolesEnum }                                                                      from '@acx-ui/types'
import {
  UserProfile as UserProfileInterface,
  UserProfileContext,
  UserProfileContextProps,
  setUserProfile
}         from '@acx-ui/user'

import {
  mockPersonaGroupWithoutNSG,
  mockPropertyUnit,
  venueLanPorts,
  mockEnabledNoNSGPropertyConfig,
  mockEnabledNSGPropertyConfig,
  mockPersonaGroupWithNSG,
  mockConnectionMeteringTableResult,
  replacePagination,
  mockConnectionMeterings,
  mockPropertyUnitList
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
  revoked: false,
  ethernetPorts: [{
    portIndex: 1,
    personaId: 'persona-id-1',
    macAddress: 'ap-mac-address'
  }],
  meteringProfileId: mockConnectionMeterings[0].id,
  expirationDate: moment().toISOString()
}

const userProfile = {
  initials: 'FL',
  fullName: 'First Last',
  role: RolesEnum.ADMINISTRATOR,
  email: 'dog12@email.com',
  dateFormat: 'yyyy/mm/dd',
  detailLevel: 'su'
} as UserProfileInterface


jest.mocked(useIsSplitOn).mockReturnValue(true)
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
      ),
      rest.get(
        replacePagination(ConnectionMeteringUrls.getConnectionMeteringList.url),
        (_, res, ctx) => res(ctx.json(mockConnectionMeteringTableResult))
      ),
      rest.patch(
        PersonaUrls.updatePersona.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render simple drawer', async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {}
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      ></UserProfileContext.Provider>
      <PropertyUnitDrawer isEdit={false} visible onClose={closeFn} venueId={params.noNsgVenueId}/>
    </Provider>)

    await screen.findByText('Unit Name')
    await screen.findByText('VLAN')
    await screen.findByText('Resident Name')
    await screen.findByLabelText('Data Usage Metering')
    const buttons = await screen.findAllByRole('button', { name: 'Add' })
    expect(buttons.length).toEqual(2)
    await userEvent.click(buttons[0]) //click to add Data Usage Metering
  })

  it('should add no nsg drawer', async () => {
    setUserProfile({ profile: userProfile, allowedOperations: [] })
    mockServer.use(
      rest.post(
        PropertyUrlsInfo.getPropertyUnitList.url,
        (_, res, ctx) => res(ctx.json(mockPropertyUnitList)))
    )
    window.HTMLElement.prototype.scrollIntoView = function () {}

    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      ></UserProfileContext.Provider>
      <PropertyUnitDrawer isEdit={false} visible onClose={closeFn} venueId={params.noNsgVenueId}/>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('VLAN')

    const nameField = await screen.findByLabelText(/unit name/i)
    await userEvent.type(nameField, 'new unit name test')

    const residentField = await screen.findByLabelText(/resident name/i)
    await userEvent.type(residentField, 'new resident name test')

    await screen.findByLabelText('Data Usage Metering')

    const buttons = await screen.findAllByRole('button', { name: 'Add' })
    expect(buttons.length).toEqual(2)
    await userEvent.click(buttons[1])
  })

  it('should edit no nsg drawer', async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {}
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      ></UserProfileContext.Provider>
      <PropertyUnitDrawer
        isEdit
        visible
        unitId={unitId}
        onClose={closeFn}
        venueId={params.noNsgVenueId}
      />
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByLabelText(/unit name/i)
    await screen.findByText('Separate VLAN for guests')

    await userEvent.click(await screen.findByText(mockConnectionMeterings[0].name))
    await userEvent.click(await screen.findByText(mockConnectionMeterings[3].name))

    const saveBtn = await screen.findByRole('button', { name: /Apply/i })
    await screen.findByText('Rate limiting')
    await screen.findByText('Data consumption')
    await screen.findByText('Expiration Date of Data Consumption')
    await userEvent.click(saveBtn)
  })

  it('should edit nsg drawer', async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {}
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      ></UserProfileContext.Provider>
      <PropertyUnitDrawer
        isEdit
        visible
        unitId={unitId}
        onClose={closeFn}
        venueId={params.nsgVenueId}
      />
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Select AP')
    await screen.findByLabelText(/vxlan/i)
    await screen.findByText('Rate limiting')
    await screen.findByText('Data consumption')
    await screen.findByText('Expiration Date of Data Consumption')

    await userEvent.click(await screen.findByText(mockConnectionMeterings[0].name))
    await userEvent.click(await screen.findByText(mockConnectionMeterings[1].name))
    const saveBtn = await screen.findByRole('button', { name: /Apply/i })
    await userEvent.click(saveBtn)
  })
})
