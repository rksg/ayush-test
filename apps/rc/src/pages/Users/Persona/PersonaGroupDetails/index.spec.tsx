import { rest } from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  PersonaUrls,
  MacRegListUrlsInfo,
  PersonaBaseUrl,
  DpskUrls,
  PropertyUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, fireEvent, within } from '@acx-ui/test-utils'

import {
  mockDpskPool,
  mockEnabledPropertyConfig,
  mockMacRegistration,
  mockMacRegistrationList,
  mockPersonaGroup,
  mockPersonaGroupList,
  mockPersonaGroupTableResult,
  mockPersonaTableResult,
  replacePagination
} from '../__tests__/fixtures'

import PersonaGroupDetails from '.'

jest.mocked(useIsSplitOn).mockReturnValue(true)

describe('Persona Group Details', () => {
  let params: { tenantId: string, personaGroupId: string }

  beforeEach( async () => {
    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        PersonaBaseUrl,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json(mockMacRegistration))
      ),
      rest.delete(
        PersonaUrls.deletePersonas.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        replacePagination(PersonaUrls.searchPersonaGroupList.url),
        (req, res, ctx) => res(ctx.json(mockPersonaGroupTableResult))
      ),
      rest.get(
        replacePagination(MacRegListUrlsInfo.getMacRegistrationPools.url),
        (req, res, ctx) => res(ctx.json(mockMacRegistrationList))
      ),
      rest.post(
        replacePagination(PersonaUrls.searchPersonaList.url),
        (req, res, ctx) => res(ctx.json(mockPersonaTableResult))
      ),
      rest.get(
        replacePagination(PersonaUrls.getPersonaGroupList.url),
        (req, res, ctx) => res(ctx.json(mockPersonaTableResult))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockDpskPool))
      ),
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => res(ctx.json(mockEnabledPropertyConfig))
      ),
      rest.get(
        PropertyUrlsInfo.getUnitById.url,
        (req, res, ctx) => res(ctx.json({ id: 'unit-id-1', name: 'unit-name-1' }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      personaGroupId: mockPersonaGroup.id
    }
  })

  it.skip('should render persona group details', async () => {
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId'
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    await screen.findByRole('heading', { level: 1, name: mockPersonaGroup.name })
    await screen.findByRole('heading', { level: 4, name: /Personas/i })
  })

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId'
        }
      }
    )

    expect(screen.queryByText('Clients')).toBeNull()
    expect(screen.queryByText('Persona Management')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Persona Group'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId'
        }
      }
    )

    expect(await screen.findByText('Clients')).toBeVisible()
    expect(await screen.findByText('Persona Management')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Persona Groups'
    })).toBeVisible()
  })

  it.skip('should delete selected persona', async () => {
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId'
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const targetPersona = mockPersonaTableResult.content[0]
    const row = await screen.findByRole('row', { name: targetPersona.name })

    fireEvent.click(within(row).getByRole('checkbox'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText(`Delete "${targetPersona.name}"?`)
    const deletePersonaButton = await screen.findByText(/Delete Persona/i)
    fireEvent.click(deletePersonaButton)
  })

  it.skip('should edit selected persona', async () => {
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId'
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const targetPersona = mockPersonaTableResult.content[1]
    const row = await screen.findByRole('row', { name: targetPersona.name })
    fireEvent.click(within(row).getByRole('checkbox'))

    const editButton = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)

    const personaName = await screen.findByLabelText(/Persona Name/i) as HTMLInputElement
    expect(personaName.value).toBe(targetPersona.name)
  })

  it.skip('should config persona group details', async () => {
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId'
        }
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
