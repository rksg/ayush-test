import { rest } from 'msw'

import { MacRegistrationPool, NewTableResult, Persona, PersonaGroup, PersonaUrls, RadiusUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, fireEvent, within }                from '@acx-ui/test-utils'

import PersonaGroupDetails from '.'

const mockPersonaGroupTableResult = {
  totalCount: 3,
  page: 1,
  content: [{
    id: 'aaaaaaaa',
    name: 'Class A',
    description: '',
    macRegistrationPoolId: 'mac-id-1',
    dpskPoolId: 'dpsk-pool-2',
    nsgId: 'nsgId-700',
    propertyId: 'propertyId-100'
  },
  {
    id: 'cccccccc',
    name: 'Class B',
    description: '',
    macRegistrationPoolId: 'mac-id-1',
    dpskPoolId: 'dpsk-pool-1',
    nsgId: 'nsgId-300',
    propertyId: 'propertyId-400'
  },
  {
    id: 'bbbbbbbb',
    name: 'Class C',
    description: '',
    macRegistrationPoolId: 'mac-id-1',
    dpskPoolId: 'dpsk-pool-1',
    nsgId: 'nsgId-100',
    propertyId: 'propertyId-600'
  }]
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

const mockPersonaGroup: PersonaGroup = {
  id: 'aaaaaaaa',
  name: 'Class A',
  description: '',
  macRegistrationPoolId: 'mac-id-1',
  dpskPoolId: 'dpsk-pool-2',
  nsgId: 'nsgId-700',
  propertyId: 'propertyId-100'
}

const mockPersonaTableResult: NewTableResult<Persona> = {
  totalElements: 3,
  size: 10,
  number: 0,
  content: [
    {
      id: 'persona-id-1',
      name: 'persona-name-1',
      groupId: 'persona-group-id-1'
    },
    {
      id: 'persona-id-2',
      name: 'persona-name-2',
      groupId: 'persona-group-id-1'
    },
    {
      id: 'persona-id-3',
      name: 'persona-name-3',
      groupId: 'persona-group-id-1'
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

describe('Persona Group Details', () => {
  let params: { tenantId: string, personaGroupId: string }

  beforeEach( async () => {
    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupList.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.get(
        RadiusUrlsInfo.getMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json(mockMacRegistration))
      ),
      rest.delete(
        PersonaUrls.deletePersona.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupTableResult))
      ),
      rest.get(
        RadiusUrlsInfo.getMacRegistrationPools.url,
        (req, res, ctx) => res(ctx.json(mockMacRegistrationList))
      ),
      rest.post(
        PersonaUrls.searchPersonaList.url,
        (req, res, ctx) => res(ctx.json(mockPersonaTableResult))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      personaGroupId: mockPersonaGroup.id
    }
  })

  it('should render persona group details', async () => {
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-group/:personaGroupId' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    await screen.findByRole('heading', { level: 1, name: mockPersonaGroup.name })
    await screen.findByRole('heading', { level: 4, name: /Personas/i })
  })

  it('should delete selected persona', async () => {
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-group/:personaGroupId' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const targetPersona = mockPersonaTableResult.content[0]
    const row = await screen.findByRole('row', { name: targetPersona.name })

    fireEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText(`Delete "${targetPersona.name}"?`)
    const deletePersonaButton = await screen.findByText(/Delete Persona/i)
    fireEvent.click(deletePersonaButton)
  })

  it('should edit selected persona', async () => {
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-group/:personaGroupId' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const targetPersona = mockPersonaTableResult.content[1]
    const row = await screen.findByRole('row', { name: targetPersona.name })
    fireEvent.click(within(row).getByRole('radio'))

    const editButton = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)

    const personaName = await screen.findByLabelText(/Persona Name/i) as HTMLInputElement
    expect(personaName.value).toBe(targetPersona.name)
  })

  it('should config persona group details', async () => {
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-group/:personaGroupId' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const configButton = await screen.findByRole('button', { name: /Configure/i })
    fireEvent.click(configButton)

    const groupName = screen.getByLabelText(/Persona Group Name/i) as HTMLInputElement
    expect(groupName.value).toBe(mockPersonaGroup.name)

    const cancelButton = await screen.findByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    fireEvent.click(configButton)
    fireEvent.change(groupName, { target: { value: 'New persona group name' } })

    const applyButton = await screen.findByRole('button', { name: /Apply/i })
    fireEvent.click(applyButton)
  })
})
