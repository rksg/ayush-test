import { waitFor } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'

import { useIsSplitOn }                                                             from '@acx-ui/feature-toggle'
import { PersonaUrls, PropertyUrlsInfo }                                            from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, fireEvent, within } from '@acx-ui/test-utils'

import {
  mockEnabledPropertyConfig,
  mockPersonaGroup,
  mockPersonaGroupList,
  mockPersonaTableResult,
  replacePagination
} from '../__tests__/fixtures'

import { PersonaTable } from '.'



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
      personaGroupId: 'persona-group-id'
    }
  })

  it('should render persona table', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <PersonaTable />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId'
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

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

  it('should create persona', async () => {
    render(
      <Provider>
        <PersonaTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/identity-management/identity-group' }
      })

    const createButton = await screen.findByRole('button', { name: /Add Identity/i })
    fireEvent.click(createButton)

    const nameField = await screen.findByLabelText('Identity Name') as HTMLInputElement
    expect(nameField.value).toBe('')

    const cancelButton = await screen.findByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)
  })

  it('should show error message when import CSV file failed', async () => {
    mockServer.use(
      rest.post(
        PersonaUrls.importPersonas.url,
        (req, res, ctx) => {
          return res(ctx.status(400), ctx.json({
            message: 'An error occurred'
          }))
        }
      )
    )

    render(
      <Provider><PersonaTable /></Provider>,
      { route: {
        params: { ...params, personaGroupId: mockPersonaGroupList.content[0].id },
        path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId'
      } }
    )
    await userEvent.click(await screen.findByRole('button', { name: /Import From File/ }))

    const dialog = await screen.findByRole('dialog')

    const csvFile = new File([''], 'identity_import_template.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(await within(dialog).findByRole('button', { name: /Import/ }))

    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })

  it('should export persona to CSV', async () => {
    const exportFn = jest.fn()

    mockServer.use(
      rest.post(
        replacePagination(PersonaUrls.exportPersona.url
          .replace('&timezone=:timezone&date-format=:dateFormat', '')),
        (req, res, ctx) => {
          const headers = req['headers']

          if (headers.get('accept') === 'application/json') {
            return res(ctx.json(mockPersonaTableResult))
          } else {
            exportFn()

            return res(ctx.set({
              'content-disposition': 'attachment; filename=Identities_20230118100829.csv',
              'content-type': 'text/csv;charset=ISO-8859-1'
            }), ctx.text('Identity'))
          }
        }
      )
    )

    render(
      <Provider><PersonaTable /></Provider>,
      {
        route: {
          params,
          path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId'
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await userEvent.click(await screen.findByTestId('export-persona'))

    await waitFor(() => expect(exportFn).toHaveBeenCalled())
  })
})
