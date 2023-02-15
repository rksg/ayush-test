import '@testing-library/jest-dom'
import { rest } from 'msw'

import { MspUrlsInfo }                                                              from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { ManageAdminsDrawer } from '.'

const list =
        [
          {
            id: 'a22618b0701048c9820dfbeb87818252',
            email: 'myreadonly@my.com',
            lastName: 'Chou',
            name: 'Kenny',
            role: 'READ_ONLY'
          },
          {
            id: '9b85c591260542c188f6a12c62bb3912',
            email: 'msp.eleu1658@rwbigdog.com',
            lastName: 'eleu1658',
            name: 'msp',
            role: 'PRIME_ADMIN'
          }
        ]

describe('ManageAdminsDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        MspUrlsInfo.getAdministrators.url,
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
        <ManageAdminsDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}/>
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('msp.eleu1658@rwbigdog.com')

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.length)

  })
  it('should search correctly', async () => {
    render(
      <Provider>
        <ManageAdminsDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}/>
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('myreadonly@my.com')

    const input =
      await screen.findByPlaceholderText('Search Email')

    fireEvent.change(input, { target: { value: 'm' } })
    expect(await screen.findByText('myreadonly@my.com')).toBeVisible()
    expect(await screen.findByText('msp.eleu1658@rwbigdog.com')).toBeVisible()

    fireEvent.change(input, { target: { value: 'com' } })
    expect(await screen.findByText('myreadonly@my.')).toBeVisible()
    expect(await screen.findByText('msp.eleu1658@rwbigdog.')).toBeVisible()
    expect(await screen.findAllByText('com')).toHaveLength(2)

    fireEvent.change(input, { target: { value: 'mm' } })
    expect(screen.queryByText('mm')).toBeNull()
  })

})
