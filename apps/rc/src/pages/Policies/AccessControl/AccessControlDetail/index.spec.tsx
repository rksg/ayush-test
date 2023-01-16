import { rest } from 'msw'

import { AccessControlUrls } from '@acx-ui/rc/utils'
import { Provider }          from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import AccessControlDetail from '.'

const aclDetail = {
  l3AclPolicy: {
    id: '233d3182a1aa49ee9f50aeb039347021',
    enabled: true
  },
  name: 'acl-test',
  id: 'c9c0667abfe74ab7803999a793fd2bbe'
}


describe('Access Control Detail Page', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(AccessControlUrls.getAccessControlProfile.url,
        (_, res, ctx) => res(ctx.json(aclDetail)))
    )
  })

  it('should render detail page', async () => {
    render(
      <Provider>
        <AccessControlDetail />
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1', policyId: 'policyId1' }
        }
      })

    await screen.findByText('acl-test')

    expect(screen.getByText('Layer 2')).toBeInTheDocument()
    expect(screen.getByText('Layer 3')).toBeInTheDocument()
    expect(screen.getByText('Device & OS')).toBeInTheDocument()
    expect(screen.getByText('Applications')).toBeInTheDocument()
    expect(screen.getByText('Client Rate Limit')).toBeInTheDocument()
  })
})
