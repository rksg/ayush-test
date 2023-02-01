import { rest } from 'msw'

import { PersonaUrls, MacRegListUrlsInfo, DpskUrls }                                from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { fireEvent, within, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  mockDpskPool,
  mockMacRegistration,
  mockMacRegistrationList,
  mockPersonaGroupTableResult
} from '../__tests__/fixtures'

import { PersonaGroupTable } from '.'


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
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockDpskPool))
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
