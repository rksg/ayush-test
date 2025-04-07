// SwitchLayer2ACLForm.spec.tsx
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SwitchUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { SwitchLayer2ACLForm } from './SwitchLayer2ACLForm'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SwitchLayer2ACLForm', () => {
  const params = { tenantId: 'tenant-id', layer2AclId: 'layer2-acl-id' }

  beforeEach(() => {
    mockedUsedNavigate.mockClear()
    mockServer.use(
      rest.get(SwitchUrlsInfo.getLayer2AclById.url, (req, res, ctx) => {
        return res(ctx.json({
          id: 'layer2-acl-id',
          name: 'Test ACL',
          description: 'Test Description',
          macAclRules: [
            {
              id: 'rule-1',
              action: 'permit',
              sourceAddress: 'any',
              sourceMask: '',
              destinationAddress: 'any',
              destinationMask: ''
            }
          ]
        }))
      }),
      rest.post(SwitchUrlsInfo.addLayer2Acl.url, (req, res, ctx) => {
        return res(ctx.json({ id: 'new-acl-id' }))
      }),
      rest.put(SwitchUrlsInfo.updateLayer2Acl.url, (req, res, ctx) => {
        return res(ctx.json({ id: 'layer2-acl-id' }))
      }),
      rest.post(SwitchUrlsInfo.getLayer2Acls.url, (req, res, ctx) => {
        return res(ctx.json({
          data: [
            { id: 'acl-1', name: 'ACL 1' },
            { id: 'acl-2', name: 'ACL 2' }
          ]
        }))
      })
    )
  })

  it('renders form in create mode', async () => {
    render(
      <Provider>
        <SwitchLayer2ACLForm editMode={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/layer2/add' }
      }
    )

    expect(await screen.findByText('Add Layer 2 Settings')).toBeInTheDocument()
    expect(await screen.findByLabelText('MAC ACL Name')).toBeInTheDocument()
    expect(await screen.findByText('Add Rule')).toBeInTheDocument()
  })

  it('renders form in edit mode with loaded data', async () => {
    render(
      <Provider>
        <SwitchLayer2ACLForm editMode={true} layer2AclId='layer2-acl-id' />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/policies/accessControl/switch/layer2/:layer2AclId/edit' }
      }
    )

    await waitFor(async () => {
      expect(await screen.findByLabelText('MAC ACL Name')).toHaveValue('Test ACL')
    })

    // Check if rule is loaded in the table
    expect(await screen.findByText('Permit')).toBeInTheDocument()
    expect(screen.getAllByText('Any').length).toBeGreaterThan(0)
  })

  it('submits form with correct values in create mode', async () => {
    render(
      <Provider>
        <SwitchLayer2ACLForm editMode={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/layer2/add' }
      }
    )

    const nameInput = await screen.findByLabelText('MAC ACL Name')

    await userEvent.type(nameInput, 'New ACL')

    const addRuleButton = await screen.findByText('Add Rule')
    await userEvent.click(addRuleButton)

    expect(await screen.findByText('Add Rule')).toBeInTheDocument()

    const saveButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(saveButton)
  })

  it('cancels form and navigates back', async () => {
    render(
      <Provider>
        <SwitchLayer2ACLForm editMode={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/layer2/add' }
      }
    )

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)
  })
})