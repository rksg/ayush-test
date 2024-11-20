import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi }     from '@acx-ui/rc/services'
import {
  EdgeTnmServiceFixtures,
  EdgeTnmServiceUrls
} from '@acx-ui/rc/utils'
import { Provider, store }                                               from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { EdgeTnmServiceTable } from '.'

const { mockTnmServiceDataList } = EdgeTnmServiceFixtures
const mockPath = '/:tenantId/services/edgeTnmServices'

const mockTnm1 = mockTnmServiceDataList[0]
const mockTnm2 = mockTnmServiceDataList[1]

const mockedDeleteReq = jest.fn()
jest.mock('./EdgeTnmCreateFormModal', () => ({
  ...jest.requireActual('./EdgeTnmCreateFormModal'),
  EdgeTnmCreateFormModal: () => <div data-testid='rc-EdgeTnmCreateFormModal'></div>
}))

const { click } = userEvent

describe('Edge TNM Service Table', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    store.dispatch(edgeApi.util.resetApiState())

    mockedDeleteReq.mockReset()

    mockServer.use(
      rest.get(
        EdgeTnmServiceUrls.getEdgeTnmServiceList.url,
        (_, res, ctx) => res(ctx.json(mockTnmServiceDataList))
      ),
      rest.delete(
        EdgeTnmServiceUrls.deactivateEdgeTnmServiceAppCluster.url,
        (_, res, ctx) => {
          mockedDeleteReq()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should create table successfully', async () => {
    render(
      <Provider>
        <EdgeTnmServiceTable />
      </Provider>, {
        route: { params, path: mockPath }
      }
    )
    const rows = await basicCheck()
    expect(rows.length).toBe(2)
    screen.getByRole('row', { name: /Mocked_TNMService_1/i })
    // eslint-disable-next-line max-len
    expect(rows[0]).toHaveTextContent(new RegExp(`${mockTnm1.name}\\s*\\d+\\.\\d+\\.\\d+\\s*Up`))
    const servic1Link = screen.getByRole('link', { name: 'Mocked_TNMService_1' })
    // eslint-disable-next-line max-len
    expect(servic1Link).toHaveAttribute('href', `/${params.tenantId}/t/services/edgeTnmService/mocked-tnm-service-1/detail`)
    const servic2Link = screen.queryByRole('link', { name: 'Mocked_TNMService_2' })
    expect(servic2Link).toBeNull()
    expect(screen.queryByRole('cell', { name: 'Mocked_TNMService_2' })).toBeValid()
  })

  it('should delete selected row', async () => {
    render(
      <Provider>
        <EdgeTnmServiceTable />
      </Provider>, {
        route: { params, path: mockPath }
      }
    )

    await basicCheck()
    const row = screen.getByRole('row', { name: new RegExp(`${mockTnm1.name}`) })
    await click(within(row).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText(`Delete "${mockTnm1.name}"?`)
    await click(
      screen.getByRole('button', { name: 'Delete Edge Thirdparty Network Management Service' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mockedDeleteReq).toBeCalledTimes(1)
  })

  it('should delete multiple selected rows', async () => {
    render(
      <Provider>
        <EdgeTnmServiceTable />
      </Provider>, {
        route: { params, path: mockPath }
      }
    )

    const rows = await basicCheck()
    // eslint-disable-next-line max-len
    expect(within(rows[0]).getByRole('cell', { name: new RegExp(`${mockTnm1.name}`) })).toBeVisible()
    await click(within(rows[0]).getByRole('checkbox'))
    // eslint-disable-next-line max-len
    expect(within(rows[1]).getByRole('cell', { name: new RegExp(`${mockTnm2.name}`) })).toBeVisible()
    await click(within(rows[1]).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await
    screen.findByText('Delete "2 Edge Thirdparty Network Management Service"?')
    await click(
      screen.getByRole('button', { name: 'Delete Edge Thirdparty Network Management Service' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mockedDeleteReq).toBeCalledTimes(2)
  })
})

const basicCheck= async () => {
  await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
  const rows = await screen.findAllByRole('row', { name: /Mocked_TNMService_/i })
  // eslint-disable-next-line max-len
  expect(within(rows[0]).getByRole('cell', { name: new RegExp(`${mockTnm1.name}`) })).toBeVisible()
  return rows
}