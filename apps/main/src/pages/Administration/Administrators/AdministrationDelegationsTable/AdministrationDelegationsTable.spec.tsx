/* eslint-disable max-len */
import { rest } from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { fakeDelegationList } from '../__tests__/fixtures'

import { AdministrationDelegationsTable } from './AdministrationDelegationsTable'


describe('MSP Administrators List', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getDelegations.url.split('?type=')[0],
        (req, res, ctx) => res(ctx.json(fakeDelegationList))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={false}/>
      </Provider>, {
        route: { params }
      })
    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(2)
    expect(await screen.findByRole('row', { name: /Invitation Sent/i })).toBeValid()
  })
})