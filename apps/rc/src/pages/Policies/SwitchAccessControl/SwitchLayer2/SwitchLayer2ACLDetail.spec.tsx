// SwitchLayer2ACLDetail.spec.tsx
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SwitchUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { SwitchLayer2ACLDetail } from './SwitchLayer2ACLDetail'

describe('SwitchLayer2ACLDetail', () => {
  const mockSetVisible = jest.fn()
  const props = {
    visible: true,
    setVisible: mockSetVisible,
    aclName: 'Test ACL',
    accessControlId: 'acl-123'
  }

  beforeEach(() => {
    mockSetVisible.mockClear()
    mockServer.use(
      rest.post(SwitchUrlsInfo.getLayer2AclRules.url, (req, res, ctx) => {
        return res(ctx.json({
          data: [
            {
              id: 'rule-1',
              action: 'permit',
              sourceAddress: '00:11:22:33:44:55',
              sourceMask: 'FF:FF:FF:FF:FF:FF',
              destinationAddress: '66:77:88:99:AA:BB',
              destinationMask: 'FF:FF:FF:FF:FF:FF',
              macAclId: 'acl-123'
            },
            {
              id: 'rule-2',
              action: 'deny',
              sourceAddress: 'CC:DD:EE:FF:00:11',
              sourceMask: 'FF:FF:FF:FF:FF:FF',
              destinationAddress: '22:33:44:55:66:77',
              destinationMask: 'FF:FF:FF:FF:FF:FF',
              macAclId: 'acl-123'
            }
          ],
          total: 2
        }))
      })
    )
  })

  it('renders the ACL details drawer with rules', async () => {
    render(
      <Provider>
        <SwitchLayer2ACLDetail {...props} />
      </Provider>
    )

    expect(await screen.findByText('L2 Settings')).toBeInTheDocument()
    expect(await screen.findByText('Test ACL')).toBeInTheDocument()

    // Wait for table to load
    await waitFor(async () => {
      expect(await screen.findByText('Action')).toBeInTheDocument()
    })

    // Verify table columns
    expect(await screen.findByText('Source MAC Address')).toBeInTheDocument()
    expect(await screen.findByText('Mask')).toBeInTheDocument()
    expect(await screen.findByText('Dest. MAC Address')).toBeInTheDocument()
    expect(await screen.findByText('Dest. Mask')).toBeInTheDocument()

    // Verify table data
    expect(await screen.findByText('Permit')).toBeInTheDocument()
    expect(await screen.findByText('00:11:22:33:44:55')).toBeInTheDocument()
    expect(await screen.findByText('66:77:88:99:AA:BB')).toBeInTheDocument()
    expect(await screen.findByText('Deny')).toBeInTheDocument()
  })

  it('closes the drawer when clicking close button', async () => {
    render(
      <Provider>
        <SwitchLayer2ACLDetail {...props} />
      </Provider>
    )

    const closeButton = await screen.findByRole('button', { name: 'Close' })
    await userEvent.click(closeButton)

    expect(mockSetVisible).toHaveBeenCalledWith(false)
  })
})