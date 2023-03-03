import '@testing-library/jest-dom'
import { rest } from 'msw'

import { MspUrlsInfo }                                                      from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { AssignEcDrawer } from '.'

const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '2242a683a7594d7896385cfef1fe4442',
      name: 'Din Tai Fung',
      wifiLicenses: '2',
      switchLicenses: '3',
      status: 'Active'
    },
    {
      id: '350f3089a8e34509a2913c550faffa7e',
      name: 'Eva Airways',
      wifiLicenses: '5',
      switchLicenses: '10',
      status: 'Active'
    }
  ]
}

describe('AssignEcDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
  })
  it('should render table correctly', async () => {
    render(
      <Provider>
        <AssignEcDrawer visible={true}
          setVisible={jest.fn()}/>
      </Provider>, {
        route: { params,
          path: '/:tenantId/integrators/edit/MSP_INSTALLER/3061bd56e37445a8993ac834c01e2710' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Manage Customers Assigned')

    //eslint-disable-next-line testing-library/no-node-access
    // const tbody = screen.getByRole('table').querySelector('tbody')!
    // expect(tbody).toBeVisible()

    // const rows = await within(tbody).findAllByRole('row')
    // expect(rows).toHaveLength(list.data.length)

  })
  xit('should search correctly', async () => {
    render(
      <Provider>
        <AssignEcDrawer visible={true}
          setVisible={jest.fn()}/>
      </Provider>, {
        route: { params,
          path: '/:tenantId/integrators/edit/MSP_INSTALLER/3061bd56e37445a8993ac834c01e2710' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Select customer accounts to assign to this integrator:')

    const input =
      await screen.findByPlaceholderText('Search Customer')

    fireEvent.change(input, { target: { value: 'd' } })
    expect(await screen.findByText('Din Tai Fung')).toBeVisible()

    // fireEvent.change(input, { target: { value: 'com' } })
    // expect(await screen.findByText('myreadonly@my.')).toBeVisible()
    // expect(await screen.findByText('msp.eleu1658@rwbigdog.')).toBeVisible()
    // expect(await screen.findAllByText('com')).toHaveLength(2)

    fireEvent.change(input, { target: { value: 'dd' } })
    expect(screen.queryByText('dd')).toBeNull()
  })

})
