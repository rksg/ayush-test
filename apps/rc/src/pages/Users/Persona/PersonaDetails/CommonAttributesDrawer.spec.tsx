import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { mockPersona, mockExternalIdentity } from '../__tests__/fixtures'

import { CommonAttributesDrawer } from './CommonAttributesDrawer'

describe('CommonAttributesDrawer', () => {
  it('should render drawer correctly', async () => {
    render(
      <Provider>
        <CommonAttributesDrawer
          persona={mockPersona}
          externalData={mockExternalIdentity}
          visible
          onClose={()=>{}}
        />
      </Provider>,
      {
        route: {
          params: {
            tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
            personaGroupId: mockPersona.groupId,
            personaId: mockPersona.id
          },
          // eslint-disable-next-line max-len
          path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId/identity/:personaId'
        }
      }
    )

    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByText('First Name')).toBeInTheDocument()
    expect(screen.getByText('Last Name')).toBeInTheDocument()
    expect(screen.getByText('Display Name')).toBeInTheDocument()
    expect(screen.getByText('User Principal Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Groups')).toBeInTheDocument()
    expect(screen.getByText('Organization')).toBeInTheDocument()
    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('Address')).toBeInTheDocument()
  })
})