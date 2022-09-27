import '@testing-library/jest-dom'
import { rest } from 'msw'

import { MspUrlsInfo }                                                   from '@acx-ui/rc/utils'
import { Provider }                                                      from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { Integrators } from '.'

const list = {
  totalCount: 1,
  page: 1,
  data: [
    {
      assignedMspEcList: [],
      creationDate: '1659589676020',
      id: '701fe9df5f6b4c17928a29851c07cc04',
      integrator: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'ec 111',
      status: 'Active',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC',
      wifiLicenses: 2        
    }
  ]
}
  
describe('Integrators', () => {
  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  
    const { asFragment } = render(<Provider><Integrators /></Provider>, {
      route: { params, path: '/:tenantId/integrators' }
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
  