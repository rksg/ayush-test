import '@testing-library/jest-dom'
import { rest } from 'msw'

import { MspUrlsInfo }                                                   from '@acx-ui/rc/utils'
import { Provider }                                                      from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { InvitationList } from './invitationList'

const list = {
  totalCount: 1,
  page: 1,
  data: [
    {
      alarmCount: 0,
      delegationType: 'DELEGATION_TYPE_VAR',
      entitlements: [
        {
          consumed: '0',
          entitlementDeviceType: 'DVCNWTYPE_WIFI',
          expirationDate: '2023-09-09T00:00:00Z',
          expirationDateTs: '1694217600000',
          quantity: '1040',
          tenantId: '79cae97ce39343c99632600b30be5465',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '2ea8eaabc07840caa5fed7a80913a83a',
      status: 'DELEGATION_STATUS_ACCEPTED',
      switchLicenses: 80,
      tenantEmail: 'dog151@email.com',
      tenantId: '79cae97ce39343c99632600b30be5465',
      tenantName: 'Dog Company 151',
      wifiLicenses: 1040
    }
  ]
}

describe('InvitationList', () => {
  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        MspUrlsInfo.getVarDelegations.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    const { asFragment } = render(<Provider><InvitationList /></Provider>, {
      route: { params, path: '/:tenantId/dashboard/varCustomers' }
    })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.tenantName)).toBeVisible()
    })

    expect(asFragment()).toMatchSnapshot()
  })
})
