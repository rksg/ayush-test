import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { PersonaUrls }                from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  mockIdentityGroupQuery
} from '../../../__tests__/fixtures'
import NetworkFormContext from '../../../NetworkFormContext'

import { IdentityGroup } from './IdentityGroup'


describe('IdentityGroup', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(PersonaUrls.searchPersonaGroupList.url
        .replace(':pageSize', '10000')
        .replace(':page', '0')
        .replace(':sort', 'name,asc'),
      (_, res, ctx) => res(ctx.json(mockIdentityGroupQuery)))
    )
  })

  it('should render IdentityGroup correctly', async () => {
    render (<Provider>
      <Form>
        <NetworkFormContext.Provider
          value={{
            editMode: false,
            cloneMode: false
          }}
        >
          <IdentityGroup />
        </NetworkFormContext.Provider>
      </Form>
    </Provider>)
    const identityDropdown = await screen.findByRole('combobox')
    expect(identityDropdown).toBeInTheDocument()
    await userEvent.click(identityDropdown)
    await userEvent.click(await screen.findByText('IG-1'))
    const associatiionSwitch = await screen.findByTestId('identity-associate-switch')
    expect(associatiionSwitch).toBeInTheDocument()
    await userEvent.click(associatiionSwitch)
    const addIdentityButton = await screen.findByTestId('add-identity-button')
    expect(addIdentityButton).toBeInTheDocument()

  })

})
