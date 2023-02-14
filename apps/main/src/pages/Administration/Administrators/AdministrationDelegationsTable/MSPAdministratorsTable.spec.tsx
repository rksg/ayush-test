/* eslint-disable max-len */
import { rest } from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { fakeMSPAdminList } from '../__tests__/fixtures'

import { MSPAdministratorsTable } from './MSPAdministratorsTable'


describe('MSP Administrators List', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getMspEcDelegations.url.split('?type=')[0],
        (req, res, ctx) => res(ctx.json(fakeMSPAdminList))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <MSPAdministratorsTable />
      </Provider>, {
        route: { params }
      })
    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(2)
    expect(await screen.findByRole('row', { name: /FisrtName 1551/i })).toBeValid()
  })
})