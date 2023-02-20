import { rest } from 'msw'

import { CommonUrlsInfo, getSelectServiceRoutePath } from '@acx-ui/rc/utils'
import { Provider }                                  from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import MyServices from '.'

const mockedServiceList = {
  fields: [
    'scope',
    'name',
    'cog',
    'id',
    'check-all',
    'type'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '1b85a320a58d4ae299e2260e926bb6eb',
      name: 'Jeff-mDNS-for-Jacky',
      type: 'mDNS Proxy',
      technology: 'WI-FI',
      scope: 1
    },
    {
      id: '2411047466e146699a7bb1bff406c180',
      name: 'Test123',
      type: 'Wi-Fi Calling',
      technology: 'WI-FI',
      scope: 2
    }
  ]
}

describe('MyServices', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  const path = '/t/:tenantId'

  mockServer.use(
    rest.post(
      CommonUrlsInfo.getServicesList.url,
      (req, res, ctx) => res(ctx.json({ ...mockedServiceList }))
    )
  )

  it('should render My Services', async () => {
    render(
      <Provider>
        <MyServices />
      </Provider>, {
        route: { params, path }
      }
    )

    const createPageLink = `/t/${params.tenantId}/` + getSelectServiceRoutePath()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Add Service' })).toHaveAttribute('href', createPageLink)
  })
})
