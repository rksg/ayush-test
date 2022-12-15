import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import PersonaPortal from './index'


describe('Persona Portal', () => {

  let params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  it('should render persona page', async () => {
    render(
      <Provider>
        <PersonaPortal />
      </Provider>, {
        route: { params, path: '/:tenantId/users/persona-management/persona-group' }
      }
    )

    await screen.findByText(/Persona Management/i)
  })
})
