import userEvent        from '@testing-library/user-event'
import { rest }         from 'msw'
import { IntlProvider } from 'react-intl'

import { PersonaUrls }                         from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'


import { mockPersonaList, mockPersonaGroupList } from './__tests__/fixtures'

import { IdentityForm } from './'


const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))


describe('IdentityForm', () => {
  const updatePersonaFn = jest.fn()
  const createPersonaFn = jest.fn()
  const getPersonaByIdFn = jest.fn()
  const callback = jest.fn()

  beforeEach(() => {
    updatePersonaFn.mockClear()
    createPersonaFn.mockClear()
    getPersonaByIdFn.mockClear()
    callback.mockClear()
    mockedUsedNavigate.mockClear()

    mockServer.use(
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (_, res, ctx) => {
          return res(ctx.json(mockPersonaGroupList))
        }
      ),
      rest.post(
        PersonaUrls.searchPersonaList.url.split('?')[0],
        (_, res, ctx) => {
          return res(ctx.json(mockPersonaList))
        }
      ),
      rest.patch(
        PersonaUrls.updatePersona.url,
        (_, res, ctx) => {
          updatePersonaFn()
          return res(ctx.json({}))
        }
      ),
      rest.post(
        PersonaUrls.addPersona.url,
        (_, res, ctx) => {
          createPersonaFn()
          return res(ctx.json({}))
        }
      ),
      rest.get(
        PersonaUrls.getPersonaById.url,
        (_, res, ctx) => {
          getPersonaByIdFn()
          return res(ctx.json(mockPersonaList.content[0]))
        }
      )
    )
  })

  const renderIdentityForm = (editMode?: boolean) => {
    // eslint-disable-next-line max-len
    const editPath = '/:tenantId/t/users/identity-management/identity-group/:personaGroupId/identity/:personaId/edit'
    const createPath = '/:tenantId/t/users/identity-management/identity-group/identity/create'
    let params: { tenantId: string, personaGroupId: string, personaId: string }
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      personaGroupId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      personaId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    render(
      <Provider>
        <IntlProvider locale='en'>
          <IdentityForm editMode={editMode} callback={callback}/>
        </IntlProvider>
      </Provider>
      , {
        route: {
          params,
          path: editMode ? editPath : createPath
        }
      })
  }

  it('should create identity correctly and navigate to previous page', async () => {
    renderIdentityForm(false)

    const groupSelector = screen.getByRole('combobox', { name: /identity group/i })
    await userEvent.click(groupSelector)
    await userEvent.click(await screen.findByText(mockPersonaGroupList.content[0].name))

    const nameInput = screen.getByLabelText('Identity Name')
    await userEvent.type(nameInput, 'New Identity Name')

    expect(getPersonaByIdFn).not.toBeCalled()

    const saveButton = screen.getByRole('button', { name: 'Apply' })
    await userEvent.click(saveButton)

    await waitFor(() => expect(createPersonaFn).toBeCalled())
    await waitFor(() => expect(mockedUsedNavigate).toBeCalled())
  })

  it('should update identity correctly and navigate to previous page', async () => {
    renderIdentityForm(true)

    expect(screen.getByRole('heading', { name: /edit identity/i })).toBeInTheDocument()

    await waitFor(() => expect(getPersonaByIdFn).toBeCalled())

    const nameInput = screen.getByLabelText('Identity Name')
    expect(nameInput).toHaveValue(mockPersonaList.content[0].name)
    await userEvent.type(nameInput, 'Change Name')  // change some fields

    const saveButton = screen.getByRole('button', { name: 'Apply' })
    await userEvent.click(saveButton)

    await waitFor(() => expect(updatePersonaFn).toBeCalled())
    await waitFor(() => expect(mockedUsedNavigate).toBeCalled())
  })
})
