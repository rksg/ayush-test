import { rest } from 'msw'

import { MacRegistrationPool, NewTableResult, Persona, PersonaGroup, PersonaUrls, RadiusUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, fireEvent }                        from '@acx-ui/test-utils'

import { PersonaDevicesTable } from './PersonaDevicesTable'

import PersonaDetails from './index'

const mockPersonaGroup: PersonaGroup = {
  id: 'persona-group-id-1',
  name: 'Class A',
  description: '',
  macRegistrationPoolId: 'mac-id-1',
  dpskPoolId: 'dpsk-pool-2',
  nsgId: 'nsgId-700',
  propertyId: 'propertyId-100'
}

const mockMacRegistrationList = {
  content: [{
    id: 'mac-id-1',
    name: 'mac-name-1',
    autoCleanup: true,
    description: 'string',
    enabled: true,
    expirationEnabled: true,
    priority: 1,
    ssidRegex: 'string',
    macAddresses: 1,
    policyId: 'string',
    expirationType: 'string',
    expirationOffset: 1,
    expirationDate: 'string'
  }]
}

const mockPersona: Persona = {
  id: 'persona-id-1',
  name: 'persona-name-1',
  groupId: 'persona-group-id-1',
  dpskGuid: 'dpsk-guid-1',
  dpskPassphrase: 'dpsk-passphrase',
  devices: [
    {
      macAddress: '11:11:11:11:11:11',
      personaId: 'persona-id-1'
    },
    {
      macAddress: '11:11:11:11:11:12',
      personaId: 'persona-id-1'
    },
    {
      macAddress: '11:11:11:11:11:13',
      personaId: 'persona-id-1'
    }
  ]
}

const mockPersonaGroupList: NewTableResult<PersonaGroup> = {
  totalElements: 1,
  size: 10,
  number: 0,
  content: [
    {
      id: 'persona-group-id-1',
      name: 'persona-group-name-1'
    }
  ]
}

const mockMacRegistration: MacRegistrationPool =
  {
    id: 'mac-id-1',
    name: 'mac-name-1',
    autoCleanup: true,
    description: 'string',
    enabled: true,
    expirationEnabled: true,
    priority: 1,
    ssidRegex: 'string',
    macAddresses: 1,
    policyId: 'string',
    expirationType: 'string',
    expirationOffset: 1,
    expirationDate: 'string'
  }


describe('Persona Details', () => {
  let params: { tenantId: string, personaGroupId: string, personaId: string }

  beforeEach( async () => {
    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        PersonaUrls.getPersonaById.url,
        (req, res, ctx) => res(ctx.json(mockPersona))
      ),
      rest.delete(
        PersonaUrls.deletePersonaDevices.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupList.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.get(
        RadiusUrlsInfo.getMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json(mockMacRegistration))
      ),
      rest.get(
        RadiusUrlsInfo.getMacRegistrationPools.url,
        (req, res, ctx) => res(ctx.json(mockMacRegistrationList))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      personaGroupId: mockPersona.groupId,
      personaId: mockPersona.id
    }
  })


  it('should render persona details', async () => {
    render(
      <Provider>
        <PersonaDetails />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-group/:personaGroupId/persona/:personaId' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    await screen.findByRole('heading', { level: 1, name: mockPersona.name })
    await screen.findByRole('heading', { level: 4, name: /Devices/i })
    await screen.findByRole('link', { name: mockPersonaGroup.name })
  })

  it('should add devices', async () => {
    render(
      <Provider>
        <PersonaDetails />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-group/:personaGroupId/persona/:personaId' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const addButton = await screen.findByRole('button', { name: /Add Device/i })
    fireEvent.click(addButton)
  })

  it('should config persona details', async () => {
    render(
      <Provider>
        <PersonaDetails />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-group/:personaGroupId/persona/:personaId' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const configButton = await screen.findByRole('button', { name: /Configure/i })
    fireEvent.click(configButton)

    const personaName = screen.getByLabelText(/Persona Name/i) as HTMLInputElement
    expect(personaName.value).toBe(mockPersona.name)

    const cancelButton = await screen.findByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    fireEvent.click(configButton)
    fireEvent.change(personaName, { target: { value: 'New persona name' } })

    const applyButton = await screen.findByRole('button', { name: /Apply/i })
    fireEvent.click(applyButton)
  })

  it('should delete selected devices', async () => {
    render(
      <Provider>
        <PersonaDevicesTable persona={mockPersona} title={'Devices'}/>
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-group/:personaGroupId/persona/:personaId' }
      }
    )

    const targetDevice = mockPersona?.devices
      ? mockPersona.devices[0]
      : { macAddress: 'mock-mac-address', personaId: mockPersona.id }
    const row = await screen.findByRole('cell', { name: targetDevice.macAddress })
    fireEvent.click(row)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    const deleteDeviceButton = await screen.findAllByRole('button', { name: /Delete/i })
    deleteDeviceButton.forEach(item => {
      fireEvent.click(item)
    })
  })
})
