import { rest } from 'msw'

import { NewTableResult, Persona, PersonaGroup, PersonaUrls }               from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, fireEvent } from '@acx-ui/test-utils'

import { PersonaTable } from '.'


const mockPersonaTableResult: NewTableResult<Persona> = {
  totalPages: 1,
  sort: [],
  page: 0,
  totalElements: 3,
  size: 10,
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
  totalPages: 1,
  sort: [],
  page: 0,
  totalElements: 1,
  size: 10,
  content: [
    {
      id: 'persona-group-id-1',
      name: 'persona-group-name-1'
    }
  ]
}


describe('Persona Table', () => {
  let params: { tenantId: string }

  beforeEach( () => {
    mockServer.use(
      rest.post(
        PersonaUrls.searchPersonaList.url,
        (req, res, ctx) => res(ctx.json(mockPersonaTableResult))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupList.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render persona table', async () => {
    render(
      <Provider>
        <PersonaTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-management/persona-group' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const targetPersona = mockPersonaTableResult.content[0]
    const personaGroupLinkName = mockPersonaGroupList.content
      .find(group => group.id === targetPersona.groupId)?.name

    // assert link in Table view
    await screen.findByRole('link', { name: targetPersona.name })
    await screen.findAllByRole('link', { name: personaGroupLinkName })
  })

  it('should create persona', async () => {
    render(
      <Provider>
        <PersonaTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-management/persona-group' }
      })

    const createButton = await screen.findByRole('button', { name: /Add Persona/i })
    fireEvent.click(createButton)

    const nameField = await screen.findByLabelText('Persona Name') as HTMLInputElement
    expect(nameField.value).toBe('')

    const cancelButton = await screen.findByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)
  })
})
