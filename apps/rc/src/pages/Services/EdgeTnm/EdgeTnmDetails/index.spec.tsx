import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  EdgeTnmServiceFixtures,
  EdgeTnmServiceUrls
} from '@acx-ui/rc/utils'
import { Provider }                                                      from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { EdgeTnmDetails } from '.'

const { mockTnmServiceDataList, mockTnmHostList, mockTnmHostGroups } = EdgeTnmServiceFixtures
const mockPath = '/:tenantId/services/edgeTnmServices/:serviceId'

const mockTnm1 = mockTnmServiceDataList[0]

jest.mock('./EdgeTnmGraphTable', () => ({
  ...jest.requireActual('./EdgeTnmGraphTable'),
  EdgeTnmHostGraphTable: (props: { hostId: string }) =>
    <div data-testid='rc-EdgeTnmHostGraphTable'>{props.hostId}</div>
}))

jest.mock('./TnmHostModal', () => ({
  ...jest.requireActual('./TnmHostModal'),
  TnmHostModal: (props: { visible: boolean }) =>
    props.visible && <div data-testid='rc-TnmHostModal' />
}))

const mockAddReq = jest.fn()
const mockedDeleteReq = jest.fn()
describe('Edge TNM Service Details', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: mockTnm1.id!
    }

    mockAddReq.mockClear()
    mockedDeleteReq.mockClear()

    mockServer.use(
      rest.get(
        EdgeTnmServiceUrls.getEdgeTnmServiceList.url,
        (_, res, ctx) => res(ctx.json(mockTnmServiceDataList))
      ),
      rest.get(
        EdgeTnmServiceUrls.getEdgeTnmHostList.url,
        (_, res, ctx) => res(ctx.json(mockTnmHostList))
      ),
      rest.get(
        EdgeTnmServiceUrls.getEdgeTnmHostGroupList.url,
        (_, res, ctx) => res(ctx.json(mockTnmHostGroups))
      ),
      rest.post(
        EdgeTnmServiceUrls.createEdgeTnmHost.url,
        (req, res, ctx) => {
          mockAddReq(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeTnmServiceUrls.deleteEdgeTnmHost.url,
        (req, res, ctx) => {
          mockedDeleteReq()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should create table successfully', async () => {
    render(<Provider>
      <EdgeTnmDetails />
    </Provider>, {
      route: { params, path: mockPath }
    })

    await basicCheck()
    const rows = screen.getAllByRole('row', { name: /example-host8/i })
    expect(rows.length).toBe(1)
  })

  it('should show modal after click edit', async () => {
    render(<Provider>
      <EdgeTnmDetails />
    </Provider>, {
      route: { params, path: mockPath }
    })

    const row = await basicCheck()
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await screen.findByTestId('rc-TnmHostModal')
    expect(screen.getByTestId('rc-EdgeTnmHostGraphTable')).toHaveTextContent('10640')
  })

  it('should delete selected row', async () => {
    render(<Provider>
      <EdgeTnmDetails />
    </Provider>, {
      route: { params, path: mockPath }
    })

    const row = await basicCheck()
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "example-host8"?')
    await userEvent.click(screen.getByRole('button', { name: 'Delete Host' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mockedDeleteReq).toBeCalledTimes(1)
  })

  it('should show host modal', async () => {
    render(<Provider>
      <EdgeTnmDetails />
    </Provider>, {
      route: { params, path: mockPath }
    })

    await basicCheck()
    await userEvent.click(screen.getByRole('button', { name: 'Add Host' }))
    await screen.findByTestId('rc-TnmHostModal')
  })
})

const basicCheck= async () => {
  await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
  expect(await screen.findByText('Mocked_TNMService_1')).toBeVisible()
  const row = screen.getByRole('row', { name: /example-host8/i })
  return row
}