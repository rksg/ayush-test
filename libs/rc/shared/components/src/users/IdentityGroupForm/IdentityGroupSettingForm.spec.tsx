import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { PersonaUrls, RulesManagementUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                             from '@acx-ui/store'
import { mockServer, render, screen, waitFor }  from '@acx-ui/test-utils'

import { mockedPolicySet, mockPersonaGroupTableResult } from './__tests__/fixtures'
import { IdentityGroupSettingForm }                     from './IdentityGroupSettingForm'

describe('IdentityGroupSettingForm', () => {
  const setup = () => {
    render(<Provider><Form><IdentityGroupSettingForm /></Form></Provider>)
  }

  beforeEach(() => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedPolicySet }))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(mockPersonaGroupTableResult))
      )
    )
  })

  it('should show error for empty Identity Group Name', async () => {
    setup()
    const nameInput = screen.getByLabelText('Identity Group Name')
    await userEvent.clear(nameInput)
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      expect(screen.getByText('Please enter Identity Group Name')).toBeInTheDocument()
    })
  })

  it('should show error for Identity Group Name exceeding max length', async () => {
    setup()
    const nameInput = screen.getByLabelText('Identity Group Name')
    await userEvent.type(nameInput, 'a'.repeat(256))
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      // eslint-disable-next-line max-len
      expect(screen.getByText('Identity Group Name must be up to 255 characters')).toBeInTheDocument()
    })
  })

  it('should show error for Identity Group Name with leading or trailing spaces', async () => {
    setup()
    const nameInput = screen.getByLabelText('Identity Group Name')
    await userEvent.type(nameInput, '  Invalid Name  ')
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      expect(screen.getByText('No leading or trailing spaces allowed')).toBeInTheDocument()
    })
  })

  it('should show error for duplicate Identity Group Name', async () => {
    setup()
    const nameInput = screen.getByLabelText('Identity Group Name')
    await userEvent.type(nameInput, 'Class A')
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      expect(screen.getByText('Identity Group with that name already exists')).toBeInTheDocument()
    })
  })
})
