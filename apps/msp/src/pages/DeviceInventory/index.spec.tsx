import '@testing-library/jest-dom'
import { rest } from 'msw'

import { MspUrlsInfo }                                                   from '@acx-ui/rc/utils'
import { Provider }                                                      from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { DeviceInventory } from '.'

const list = {
  totalCount: 1,
  page: 1,
  data: [
    {
      apMac: '892838227723',
      customerName: 'EC 111',
      deviceStatus: '1_01_NeverContactedCloud',
      deviceType: 'DVCNWTYPE_WIFI',
      managedAs: 'MSP',
      name: "EC 111's AP",
      serialNumber: '892838227723',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82',
      venueName: 'My-Venue'
    }
  ]
}

describe('DeviceInventory', () => {
  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        MspUrlsInfo.getMspDeviceInventory.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    const { asFragment } = render(<Provider><DeviceInventory /></Provider>, {
      route: { params, path: '/:tenantId/deviceinventory' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })

    expect(asFragment()).toMatchSnapshot()
  })
})
