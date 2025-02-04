import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeNokiaOltData, EdgeOltFixtures, EdgeTnmServiceUrls }         from '@acx-ui/rc/utils'
import { Provider }                                                      from '@acx-ui/store'
import { render, screen, mockServer, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { EdgeNokiaOltTable } from './index'

jest.mock( './OltFormDrawer', () => ({
  // eslint-disable-next-line max-len
  NokiaOltFormDrawer: (props: { visible: boolean, setVisible: () => void, editData: EdgeNokiaOltData }) =>
    props.visible && <div data-testid='NokiaOltFormDrawer'>{JSON.stringify(props.editData)}</div>
}))
const { click } = userEvent
describe('EdgeNokiaOltTable', () => {
  const params = { tenantId: 'mock-tenant-id' }
  const mockPath = '/:tenantId/devices/optical/olt'

  it('renders with loading state', () => {
    render(<Provider>
      <EdgeNokiaOltTable data={EdgeOltFixtures.mockOltList} isFetching />
    </Provider>, { route: { params, path: mockPath } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
  })

  it('renders with data', () => {
    render(<Provider>
      <EdgeNokiaOltTable data={EdgeOltFixtures.mockOltList} />
    </Provider>, { route: { params, path: mockPath } })
    expect(screen.getByText('TestOlt')).toBeInTheDocument()
  })

  it('should open OLT form when edit', async () => {
    render(<Provider>
      <EdgeNokiaOltTable data={EdgeOltFixtures.mockOltList} />
    </Provider>, { route: { params, path: mockPath } })

    const row = await screen.findByRole('row', { name: /TestOlt/i })
    await click(within(row).getByRole('radio'))
    await click(screen.getByRole('button', { name: 'Edit' }))
    const drawer = await screen.findByTestId('NokiaOltFormDrawer')
    expect(drawer).toBeVisible()
    expect(drawer).toHaveTextContent(JSON.stringify(EdgeOltFixtures.mockOltList[0]))
  })

  it('should delete OLT', async () => {
    const mockedDeleteReq = jest.fn()
    mockServer.use(
      rest.delete(
        EdgeTnmServiceUrls.deleteEdgeOlt.url,
        (_, res, ctx) => {
          mockedDeleteReq()
          return res(ctx.status(202))
        }))

    render(<Provider>
      <EdgeNokiaOltTable data={EdgeOltFixtures.mockOltList} />
    </Provider>, { route: { params, path: mockPath } })

    const row = await screen.findByRole('row', { name: /TestOlt/i })
    await click(within(row).getByRole('radio'))
    await click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "TestOlt"?')
    await click(screen.getByRole('button', { name: 'Delete OLT Device' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mockedDeleteReq).toBeCalledTimes(1)
  })
})