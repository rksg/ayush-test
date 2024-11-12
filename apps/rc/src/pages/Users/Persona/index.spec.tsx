import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { NewPersonaBaseUrl, PersonaUrls } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import { mockServer, render, screen }     from '@acx-ui/test-utils'

import { mockPersonaGroupList } from './__tests__/fixtures'

import PersonaPortal from './index'


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Persona Portal', () => {
  let params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  it.skip('should render persona group tab', async () => {
    render(
      <Provider>
        <PersonaPortal/>
      </Provider>, {
        route: {
          params: { ...params, activeTab: 'identity-group' },
          path: '/:tenantId/t/users/identity-management/:activeTab'
        }
      }
    )

    await screen.findByText(/Identity Management/i)

    await userEvent.click(await screen.findByRole('tab', { name: 'Identity' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/users/identity-management/identity`,
      hash: '',
      search: ''
    })
  })

  it('should render persona tab', async () => {
    mockServer.use(
      rest.get(
        NewPersonaBaseUrl,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.post(
        PersonaUrls.searchPersonaList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([]))
      )
    )

    render(
      <Provider>
        <PersonaPortal/>
      </Provider>, {
        route: {
          params: { ...params, activeTab: 'identity' },
          path: '/:tenantId/t/users/identity-management/:activeTab' }
      }
    )

    await screen.findByText(/Identity Management/i)
  })
})
