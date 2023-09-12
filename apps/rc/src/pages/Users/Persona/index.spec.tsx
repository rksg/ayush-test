import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import PersonaPortal from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe.skip('Persona Portal', () => {
  let params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  it('should render persona group tab', async () => {
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
