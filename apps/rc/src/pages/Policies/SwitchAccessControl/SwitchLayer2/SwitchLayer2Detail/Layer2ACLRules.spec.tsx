import { rest } from 'msw'

import { SwitchUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import Layer2ACLRules from './Layer2ACLRules'

const mockRulesData = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '1',
      action: 'permit',
      sourceAddress: 'any',
      sourceMask: '',
      destinationAddress: '00:11:22:33:44:55',
      destinationMask: 'FF:FF:FF:FF:FF:FF',
      macAclId: 'acl-123'
    },
    {
      id: '2',
      action: 'deny',
      sourceAddress: '11:22:33:44:55:66',
      sourceMask: 'FF:FF:FF:FF:FF:FF',
      destinationAddress: 'any',
      destinationMask: '',
      macAclId: 'acl-123'
    }
  ]
}

describe('Layer2ACLRules', () => {
  const params = { tenantId: 'tenant-id', accessControlId: 'access-control-id' }
  beforeEach(() => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getLayer2AclRules.url,
        (req, res, ctx) => res(ctx.json(mockRulesData))
      )
    )
  })

  it('should render rules table correctly', async () => {
    render(
      <Provider>
        <Layer2ACLRules />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/policies/accessControl/switch/layer2/:accessControlId/rules' }
      })

    // Wait for loading to complete
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // Check if column headers are rendered
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Source MAC Address')).toBeInTheDocument()
    expect(screen.getByText('Mask')).toBeInTheDocument()
    expect(screen.getByText('Dest. MAC Address')).toBeInTheDocument()
    expect(screen.getByText('Dest. Mask')).toBeInTheDocument()

    // Check if data is rendered correctly
    expect(screen.getByText('Permit')).toBeInTheDocument()
    expect(screen.getByText('Deny')).toBeInTheDocument()
    expect(screen.getAllByText('Any').length).toBe(2) // One for source, one for destination
    expect(screen.getByText('00:11:22:33:44:55')).toBeInTheDocument()
    expect(screen.getByText('11:22:33:44:55:66')).toBeInTheDocument()
    expect(screen.getAllByText('FF:FF:FF:FF:FF:FF').length).toBe(2)
  })
})