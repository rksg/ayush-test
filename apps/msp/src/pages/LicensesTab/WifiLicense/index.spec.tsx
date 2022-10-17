import '@testing-library/jest-dom'
import { rest } from 'msw'

import { MspUrlsInfo }                                           from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { WifiLicense } from '.'

const list = {
  totalCount: 1,
  page: 1,
  data: [
    {
      deviceSubType: 'ICX76',
      deviceType: 'MSP_SWITCH',
      effectiveDate: 'Mon Dec 06 00:00:00 UTC 2021',
      expirationDate: 'Tue Dec 06 23:59:59 UTC 2022',
      id: '358889502-1',
      isTrial: false,
      lastNotificationDate: null,
      quantity: 100,
      sku: 'CLD-MS76-1001',
      status: 'VALID'
    }
  ]
}

describe('WifiLicense', () => {
  it('should render correctly', async () => {
    mockServer.use(
      rest.get(
        MspUrlsInfo.getMspEntitlement.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    const { asFragment } = render(<Provider><WifiLicense /></Provider>, {
      route: { params, path: '/:tenantId/msplicenses' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    // const tbody = screen.getByRole('table').querySelector('tbody')!
    // expect(tbody).toBeVisible()

    // const rows = await within(tbody).findAllByRole('row')
    // expect(rows).toHaveLength(list.data.length)
    // list.data.forEach((item, index) => {
    //   expect(within(rows[index]).getByText(item.deviceType)).toBeVisible()
    // })

    expect(asFragment()).toMatchSnapshot()
  })
})
