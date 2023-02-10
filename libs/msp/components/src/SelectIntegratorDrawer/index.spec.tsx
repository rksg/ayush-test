import '@testing-library/jest-dom'
import { rest } from 'msw'

import { MspUrlsInfo }                                                              from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { SelectIntegratorDrawer } from '.'

const list = {
  totalCount: 1,
  page: 1,
  data: [
    {
      assignedMspEcList: [],
      id: 'b1c3860e3cb644c5913b75d5a391e914',
      name: 'another int',
      status: 'Active',
      tenantType: 'MSP_INTEGRATOR'
    }
  ]
}

describe('SelectIntegratorDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.post(
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
        <SelectIntegratorDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}/>
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('another int')

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)

  })

  it('should search correctly', async () => {
    render(
      <Provider>
        <SelectIntegratorDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}/>
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('another int')

    const input =
      await screen.findByPlaceholderText('Search Name')

    fireEvent.change(input, { target: { value: 'a' } })
    expect(await screen.findByText('another int')).toBeVisible()

    fireEvent.change(input, { target: { value: 'an' } })
    expect(await screen.findByText('an')).toBeVisible()
    expect(await screen.findByText('other int')).toBeVisible()

    fireEvent.change(input, { target: { value: 'aa' } })
    expect(screen.queryByText('aa')).toBeNull()
  })
})
