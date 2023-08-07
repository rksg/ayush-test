import { waitFor } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'

import { useIsTierAllowed }                                              from '@acx-ui/feature-toggle'
import { PersonaUrls, PropertyUrlsInfo }                                 from '@acx-ui/rc/utils'
import { Provider }                                                      from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import {
  mockEnabledPropertyConfig,
  mockPersonaGroup,
  mockPersonaGroupList,
  mockPersonaTableResult,
  replacePagination
} from '../__tests__/fixtures'

import { BasePersonaTable } from './BasePersonaTable'

import { PersonaTable } from '.'

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  downloadFile: jest.fn()
}))

const mockDownloadCsv = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useLazyDownloadPersonasQuery: () => ([ mockDownloadCsv ])
}))

describe('Persona Table', () => {
  const searchPersonaApi = jest.fn()
  let params: { tenantId: string, personaGroupId?: string }

  beforeEach( () => {
    mockServer.use(
      rest.post(
        replacePagination(PersonaUrls.searchPersonaList.url),
        (req, res, ctx) => {
          searchPersonaApi()
          return res(ctx.json(mockPersonaTableResult))
        }
      ),
      rest.get(
        replacePagination(PersonaUrls.getPersonaGroupList.url),
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
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
      personaGroupId: 'persona-group-id-1'
    }
  })

  it('should render PersonaTable', async () => {
    render(
      <Provider>
        <PersonaTable />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/persona-management/persona'
        }
      })

    const targetPersona = mockPersonaTableResult.content[0]
    const personaGroupLinkName = mockPersonaGroupList.content
      .find(group => group.id === targetPersona.groupId)?.name

    // assert link in Table view
    await screen.findByRole('link', { name: targetPersona.name })
    await screen.findAllByRole('link', { name: personaGroupLinkName })

    // change search bar and trigger re-fetching mechanism
    const searchBar = await screen.findByRole('textbox')
    await userEvent.type(searchBar, 'search text')

    // first: table query + second: search bar changed query
    await waitFor(() => expect(searchPersonaApi).toHaveBeenCalledTimes(2))
  })

  it('should render PersonaTable under PersonaGroupDetails', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <BasePersonaTable personaGroupId={params.personaGroupId} colProps={{}}/>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId'
        }
      })

    const targetPersona = mockPersonaTableResult.content[0]
    const personaGroupLinkName = mockPersonaGroupList.content
      .find(group => group.id === targetPersona.groupId)?.name

    // assert link in Table view
    await screen.findByRole('link', { name: targetPersona.name })
    await screen.findAllByRole('link', { name: personaGroupLinkName })

    // // change search bar and trigger re-fetching mechanism
    // const searchBar = await screen.findByRole('textbox')
    // await userEvent.type(searchBar, 'search text')
    //
    // // first: table query + second: search bar changed query
    // await waitFor(() => expect(searchPersonaApi).toHaveBeenCalledTimes(2))
  })

  it('should create persona', async () => {
    render(
      <Provider>
        <PersonaTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/persona-management/persona-group' }
      })

    const createButton = await screen.findByRole('button', { name: /Add Persona/i })
    await userEvent.click(createButton)

    const nameField = await screen.findByLabelText('Persona Name') as HTMLInputElement
    expect(nameField.value).toBe('')

    const cancelButton = await screen.findByRole('button', { name: /Cancel/i })
    await userEvent.click(cancelButton)
  })

  it('should show error message when import CSV file failed', async () => {
    const importPersonasSpy = jest.fn()
    mockServer.use(
      rest.post(
        PersonaUrls.importPersonas.url,
        (req, res, ctx) => {
          importPersonasSpy()
          return res(ctx.status(400), ctx.json({
            message: 'An error occurred',
            subErrors: [ // to render Technical Details
              { object: 'Persona', message: 'validation failed' }
            ]
          }))
        }
      )
    )

    render(
      <Provider>
        <BasePersonaTable personaGroupId={params.personaGroupId} colProps={{}} />
      </Provider>,
      { route: {
        params,
        path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId'
      } }
    )
    await userEvent.click(await screen.findByRole('button', { name: /Import From File/ }))

    const dialog = await screen.findByRole('dialog')

    const csvFile = new File([''], 'persona_import_template.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(await within(dialog).findByRole('button', { name: /Import/ }))

    await waitFor(() => expect(importPersonasSpy).toHaveBeenCalled())
    expect(await screen.findByText('An error occurred')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /technical details/i }))
    // eslint-disable-next-line max-len
    expect(await screen.findByText('The following information was reported for the error you encountered')).toBeVisible()

    // Teardown all dialogs
    await userEvent.click(await screen.findByRole('button', { name: /ok/i }))
    await userEvent.click(await within(dialog).findByRole('button', { name: /cancel/i }))
  })

  it('should edit a persona', async () => {
    const deletePersonaSpy = jest.fn()

    mockServer.use(
      rest.delete(
        PersonaUrls.deletePersonas.url,
        (_, res, ctx) => {
          deletePersonaSpy()
          return res(ctx.json({}))
        }
      )
    )
    render(
      <Provider>
        <BasePersonaTable personaGroupId={params.personaGroupId} colProps={{}} />
      </Provider>,
      { route: {
        params,
        path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId'
      } }
    )

    const targetPersona = mockPersonaTableResult.content[0]
    const row = await screen.findByRole('row', { name: new RegExp(targetPersona.name) })

    await userEvent.click(row)
    await userEvent.click(await screen.findByRole('button', { name: /edit/i }))

    const editDialog = await screen.findByRole('dialog')
    expect(await within(editDialog).findByText(new RegExp(/edit persona/i))).toBeVisible()

    await userEvent.click(await within(editDialog).findByRole('button', { name: /cancel/i }))
    expect(editDialog).not.toBeVisible()

    await userEvent.click(row)
    await userEvent.click(await screen.findByRole('button', { name: /delete/i }))
    await userEvent.click(await screen.findByRole('button', { name: /delete persona/i }))

    await waitFor(() => expect(deletePersonaSpy).toHaveBeenCalled())
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Delete/i })).toBeNull()
    })
  })

  it('should export persona to CSV', async () => {
    mockDownloadCsv.mockImplementation(() => ({
      unwrap: () => Promise.resolve()
    }))

    mockServer.use(
      rest.post(
        replacePagination(PersonaUrls.exportPersona.url
          .replace('&timezone=:timezone&date-format=:dateFormat', '')),
        (req, res, ctx) => {
          const headers = req['headers']

          if (headers.get('accept') === 'application/json') {
            return res(ctx.json(mockPersonaTableResult))
          } else {
            mockDownloadCsv()

            return res(ctx.set({
              'content-disposition': 'attachment; filename=Personas_20230118100829.csv',
              'content-type': 'text/csv;charset=ISO-8859-1'
            }), ctx.text('Persona'))
          }
        }
      )
    )

    render(
      <Provider><PersonaTable /></Provider>,
      {
        route: {
          params,
          path: '/:tenantId/t/users/persona-management/persona'
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await userEvent.click(await screen.findByTestId('export-persona'))

    await waitFor(() => expect(mockDownloadCsv).toHaveBeenCalled())
  })

  it('should import from file', async () => {
    const importRequestSpy = jest.fn()
    mockServer.use(
      rest.post(
        PersonaUrls.importPersonas.url,
        (_, res, ctx) => {
          importRequestSpy()
          return res(ctx.json({}))
        }
      )
    )
    render(
      <Provider>
        <BasePersonaTable personaGroupId={params.personaGroupId} colProps={{}}/>
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId'
        }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: /Import From File/ }))

    const importTextElement = await screen.findByText('Import from file')
    // eslint-disable-next-line testing-library/no-node-access
    const importDialog = importTextElement.closest('.ant-drawer-content') as HTMLDivElement

    const csvFile = new File([''], 'Persona_import_template.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(await within(importDialog).findByRole('button', { name: /Import/ }))

    await waitFor(() => expect(importRequestSpy).toHaveBeenCalled())
    await waitFor(() => { // teardown the component
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
