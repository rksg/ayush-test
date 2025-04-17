import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SwitchUrlsInfo }                     from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { fireEvent, render, screen, waitFor } from '@acx-ui/test-utils'
import { mockServer }                         from '@acx-ui/test-utils'

import { SwitchAccessControlSetForm } from './SwitchAccessControlSetForm'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SwitchAccessControlSetForm', () => {
  const params = { tenantId: 'tenant-id', accessControlId: 'access-control-id' }
  beforeEach(() => {
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

      rest.post(SwitchUrlsInfo.getSwitchAccessControlSet.url, (req, res, ctx) => {
        return res(ctx.json({ id: 'new-id' }))
      }),

      rest.put(SwitchUrlsInfo.updateSwitchAccessControlSet.url, (req, res, ctx) => {
        return res(ctx.json({ id: 'test-id' }))
      })
    )
  })

  it('renders form in create mode', async () => {
    render(
      <Provider>
        <SwitchAccessControlSetForm editMode={false} />
      </Provider>,{
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/add' }
      })

    expect(screen.getByText('Add Switch Access Control')).toBeInTheDocument()
    expect(screen.getByLabelText('MAC ACL Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByText('Layer 2')).toBeInTheDocument()
  })

  it('renders form in edit mode', async () => {
    render(
      <Provider>
        <SwitchAccessControlSetForm editMode={true} />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/:accessControlId/edit' }
      })

    expect(screen.getByText('Edit Switch Access Control')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByLabelText('MAC ACL Name')).toHaveValue('Test Policy')
    })
  })

  it('toggles Layer 2 profile selection', async () => {
    render(
      <Provider>
        <SwitchAccessControlSetForm editMode={false} />
      </Provider>,{
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/add' }
      })

    expect(screen.queryByText('Select profile...')).not.toBeInTheDocument()
    const switchElement = screen.getByRole('switch')
    await userEvent.click(switchElement)

    expect(screen.getByText('Select profile...')).toBeInTheDocument()
    expect(screen.getByText('Add New')).toBeInTheDocument()
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
      </Provider>,{
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/add' }
      })

    const nameInput = screen.getByLabelText('MAC ACL Name')
    await userEvent.type(nameInput, 'Duplicate Name')
    fireEvent.blur(nameInput)

    await waitFor(() => {
      expect(screen.getByText('MAC ACL name is duplicated.')).toBeInTheDocument()
    })
  })

  it('opens Layer 2 drawer when Add New is clicked', async () => {
    render(
      <Provider>
        <SwitchAccessControlSetForm editMode={false} />
      </Provider>,{
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/add' }
      })

    const switchElement = screen.getByRole('switch')
    await userEvent.click(switchElement)
    const addNewButton = screen.getByText('Add New')
    await userEvent.click(addNewButton)

    expect(screen.getByText('Add Layer 2 Settings')).toBeInTheDocument()
  })
})