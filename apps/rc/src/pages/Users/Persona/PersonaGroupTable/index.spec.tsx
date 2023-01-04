import { rest } from 'msw'

import { MacRegistrationPool, PersonaUrls, MacRegListUrlsInfo }                     from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { fireEvent, within, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { PersonaGroupTable } from '.'

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
    policyId: 'string',
    expirationOffset: 1,
    expirationDate: 'string'
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
    policyId: 'string',
    expirationOffset: 1,
    expirationDate: 'string'
  }]
}


describe('Persona Group Table', () => {
  let params: { tenantId: string }

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        PersonaUrls.searchPersonaGroupList.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupTableResult))
      ),
      rest.delete(
        PersonaUrls.deletePersonaGroup.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json(mockMacRegistration))
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPools.url,
        (req, res, ctx) => res(ctx.json(mockMacRegistrationList))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-management/persona-group' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const targetPersonaGroup = mockPersonaGroupTableResult.content[0]
    const macLinkName = mockMacRegistrationList.content
      .find(pool => pool.id === targetPersonaGroup.macRegistrationPoolId)?.name

    // assert link in Table view
    await screen.findByRole('link', { name: targetPersonaGroup.name })
    await screen.findAllByRole('link', { name: macLinkName })

    // await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // const targetPersonaGroupName = mockTableResult.content[0].name
    // await screen.findByRole('button', { name: /Add Persona Group/i })

    // TODO: need to integrate the API result
    // await screen.findByRole('row', { name: new RegExp(targetPersonaGroupName) })

    // 77.77 |       70 |   61.11 |   78.57 | 99,147-171
    // const addPersonaGroupButton = await screen.findByText('Add Persona Group')
    // fireEvent.click(addPersonaGroupButton)
  })

  it('should delete selected persona group', async () => {
    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-management/persona-group' }
      })

    //   80 |       70 |   66.66 |   80.95
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /Class A/i })
    fireEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    const personaGroupName = mockPersonaGroupTableResult.content[0].name
    await screen.findByText(`Delete "${personaGroupName}"?`)
    const deletePersonaGroupButton = await screen.findByText('Delete Persona Group')
    fireEvent.click(deletePersonaGroupButton)
  })

  it('should edit selected persona group', async () => {
    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-management/persona-group' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /Class A/i })
    fireEvent.click(within(row).getByRole('radio'))

    const editButton = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)

    // TODO: assert edit data props into drawer
    // const nameDisplay = screen.getByLabelText(/Persona Group Name/i) as HTMLInputElement
    // expect(nameDisplay.value).toBe(/Class A/i)
  })

  it('should create persona group', async () => {
    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-management/persona-group' }
      })

    await screen.findByText('Create Persona Group')


    const createButton = await screen.findByRole('button', { name: /Add Persona Group/i })
    fireEvent.click(createButton)

    await screen.findByText('Create Persona Group')

    // const addPersonaGroupButton = await screen.findAllByRole('button', { name: /Add/i })
    // fireEvent.click(addPersonaGroupButton)
    // TODO: assert drawer without data

    const cancelButton = await screen.findByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

  })
})
