import userEvent from '@testing-library/user-event'
import moment    from 'moment-timezone'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                                           from '@acx-ui/feature-toggle'
import { apApi, venueApi }                                                                                  from '@acx-ui/rc/services'
import { CommonUrlsInfo, ConnectionMeteringUrls, Persona, PersonaUrls, PropertyUrlsInfo, WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                  from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved }                                            from '@acx-ui/test-utils'
import { EdgeScopes, RolesEnum, WifiScopes }                                                                from '@acx-ui/types'
import {
  UserProfile as UserProfileInterface,
  UserProfileContext,
  UserProfileContextProps
} from '@acx-ui/user'

import {
  mockPersonaGroupWithoutPin,
  mockPropertyUnit,
  venueLanPorts,
  mockEnabledNoPinPropertyConfig,
  mockEnabledPinPropertyConfig,
  mockPersonaGroupWithPin,
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
  pinVenueId: 'has-nsg-venue-id',
  noPinVenueId: 'no-nsg-venue-id'
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
  detailLevel: 'su',
  scopes: [WifiScopes.CREATE, WifiScopes.UPDATE, EdgeScopes.CREATE, EdgeScopes.UPDATE]
} as unknown as UserProfileInterface


jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_RBAC_API)

jest.mock('@acx-ui/rc/components', () => ({
  ConnectionMeteringForm: () => <div data-testid='ConnectionMeteringForm' />,
  ConnectionMeteringFormMode: {},
  PhoneInput: ({ name, callback }: {
    name: string,
    callback?: (value: string) => void
  }) => <input data-testid='PhoneInput'
    name={name}
    onChange={e => callback && callback(e.target.value)} />
}))

describe('Property Unit Drawer', () => {
  beforeEach(() => {
    closeFn.mockClear()
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())
    mockServer.use(
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => {
          return res(ctx.json(req.params.venueId === params.noPinVenueId
            ? mockEnabledNoPinPropertyConfig
            : mockEnabledPinPropertyConfig))
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
            ? mockPersonaGroupWithoutPin
            : mockPersonaGroupWithPin))
        }
      ),
      rest.get(
        CommonUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))
      ),
      rest.get(
        WifiRbacUrlsInfo.getVenueLanPorts.url,
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
      ),
      rest.post(
        PropertyUrlsInfo.getPropertyUnitList.url,
        (_, res, ctx) => res(ctx.json(mockPropertyUnitList))
      )
    )
  })

  it('should render simple drawer', async () => {
    window.HTMLElement.prototype.scrollIntoView = function () { }
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      ></UserProfileContext.Provider>
      <PropertyUnitDrawer isEdit={false} visible onClose={closeFn} venueId={params.noPinVenueId} />
    </Provider>)

    await screen.findByText('Unit Name')
    await screen.findByText('VLAN')
    await screen.findByText('Resident Name')
    await screen.findByLabelText('Data Usage Metering')
    const buttons = await screen.findAllByRole('button', { name: 'Add' })
    expect(buttons.length).toEqual(2)
    await userEvent.click(buttons[0]) //click to add Data Usage Metering
  })

  it('should add no PIN drawer', async () => {
    mockServer.use(
      rest.post(
        PropertyUrlsInfo.getPropertyUnitList.url,
        (_, res, ctx) => res(ctx.json(mockPropertyUnitList)))
    )
    window.HTMLElement.prototype.scrollIntoView = function () { }

    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      ></UserProfileContext.Provider>
      <PropertyUnitDrawer isEdit={false} visible onClose={closeFn} venueId={params.noPinVenueId} />
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

  it('should edit no PIN drawer', async () => {
    window.HTMLElement.prototype.scrollIntoView = function () { }
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      ></UserProfileContext.Provider>
      <PropertyUnitDrawer
        isEdit
        visible
        unitId={unitId}
        onClose={closeFn}
        venueId={params.noPinVenueId}
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

  it('should edit PIN drawer', async () => {
    window.HTMLElement.prototype.scrollIntoView = function () { }
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      ></UserProfileContext.Provider>
      <PropertyUnitDrawer
        isEdit
        visible
        unitId={unitId}
        onClose={closeFn}
        venueId={params.pinVenueId}
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
