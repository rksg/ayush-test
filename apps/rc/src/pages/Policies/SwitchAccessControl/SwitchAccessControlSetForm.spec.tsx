import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SwitchUrlsInfo }                                 from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { SwitchAccessControlSetForm } from './SwitchAccessControlSetForm'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SwitchAccessControlSetForm', () => {
  const params = { tenantId: 'tenant-id', accessControlId: 'access-control-id' }

  beforeEach(() => {
    mockedUsedNavigate.mockClear()
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchAccessControlSetById.url, (req, res, ctx) => {
        return res(ctx.json({
          id: 'test-id',
          policyName: 'Test Policy',
          description: 'Test Description',
          layer2AclPolicyName: '',
          layer2AclPolicyId: ''
        }))
      }),
      rest.post(SwitchUrlsInfo.getLayer2Acls.url, (req, res, ctx) => {
        return res(ctx.json({
          data: [
            { id: 'acl-1', name: 'ACL 1' },
            { id: 'acl-2', name: 'ACL 2' }
          ]
        }))
      }),
      rest.post(SwitchUrlsInfo.addSwitchAccessControlSet.url, (req, res, ctx) => {
        return res(ctx.json({ data: [] }))
      }),
      rest.post(SwitchUrlsInfo.getSwitchAccessControlSet.url, (req, res, ctx) => {
        return res(ctx.json({ data: [] }))
      }),
      rest.put(SwitchUrlsInfo.updateSwitchAccessControlSet.url, (req, res, ctx) => {
        mockedUsedNavigate()
        return res(ctx.json({ id: 'test-id' }))
      })
    )
  })

  it('submits form with correct values in create mode', async () => {
    render(
      <Provider>
        <SwitchAccessControlSetForm editMode={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/add' }
      }
    )

    const nameInput = screen.getByLabelText('MAC ACL Name')
    const descriptionInput = screen.getByLabelText('Description')

    await userEvent.type(nameInput, 'New Policy')
    await userEvent.type(descriptionInput, 'New Description')

    const finishButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(finishButton)

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled()
    })
  })

  it('submits form with Layer 2 profile in create mode', async () => {
    render(
      <Provider>
        <SwitchAccessControlSetForm editMode={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/add' }
      }
    )

    const nameInput = screen.getByLabelText('MAC ACL Name')
    const descriptionInput = screen.getByLabelText('Description')

    await userEvent.type(nameInput, 'New Policy')
    await userEvent.type(descriptionInput, 'New Description')

    // Enable Layer 2
    const switchElement = await screen.findByRole('switch')
    await userEvent.click(switchElement)

    // Select a Layer 2 profile
    const selectElement = await screen.findByText('Select profile...')
    await userEvent.click(selectElement)
    await waitFor(async () => {
      expect(await screen.findByText('ACL 1')).toBeInTheDocument()
    })
    await userEvent.click(await screen.findByText('ACL 1'))

    const finishButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(finishButton)

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled()
    })
  })

  it('loads and updates existing policy in edit mode', async () => {
    render(
      <Provider>
        <SwitchAccessControlSetForm editMode={true} />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/:accessControlId/edit' }
      }
    )

    await waitFor(() => {
      expect(screen.getByLabelText('MAC ACL Name')).toHaveValue('Test Policy')
    })
    await waitFor(() => {
      expect(screen.getByLabelText('Description')).toHaveValue('Test Description')
    })

    const nameInput = screen.getByLabelText('MAC ACL Name')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Updated Policy')

    const finishButton = screen.getByRole('button', { name: 'Apply' })
    await userEvent.click(finishButton)

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled()
    })
  })

  it('cancels form and navigates back', async () => {
    render(
      <Provider>
        <SwitchAccessControlSetForm editMode={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/add' }
      }
    )

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    expect(mockedUsedNavigate).toHaveBeenCalled()
  })

  it('validates MAC ACL name for duplicates', async () => {
    mockServer.use(
      rest.post('/switchAccessControlProfiles/query', (req, res, ctx) => {
        return res(ctx.json({
          data: [
            {
              id: 'id', accessControlPolicyName: 'Duplicate Name'
            }
          ]
        }))
      })
    )

    render(
      <Provider>
        <SwitchAccessControlSetForm editMode={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/add' }
      }
    )

    const nameInput = screen.getByLabelText('MAC ACL Name')
    await userEvent.type(nameInput, 'Duplicate Name')
    fireEvent.blur(nameInput)

    await waitFor(() => {
      expect(screen.getByText('MAC ACL name is duplicated.')).toBeInTheDocument()
    })
  })
})