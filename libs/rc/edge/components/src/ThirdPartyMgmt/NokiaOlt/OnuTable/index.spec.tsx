import { rest } from 'msw'

import { edgeTnmServiceApi }                                     from '@acx-ui/rc/services'
import { EdgeOltFixtures, EdgeTnmServiceUrls }                   from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { EdgeNokiaOnuTable } from './index'
const { mockOlt, mockOnuList } = EdgeOltFixtures

describe('EdgeNokiaOnuTable', () => {
  const defaultProps = {
    oltData: mockOlt,
    cageName: 'cageName'
  }

  const mockGetOnuList = jest.fn()
  beforeEach(() => {
    store.dispatch(edgeTnmServiceApi.util.resetApiState())
    mockGetOnuList.mockClear()

    mockServer.use(
      rest.post(
        EdgeTnmServiceUrls.getEdgeOnuList.url,
        (_, res, ctx) => {
          mockGetOnuList()
          return res(ctx.json(mockOnuList))
        }))
  })

  it('renders with data', async () => {
    render(<Provider>
      <EdgeNokiaOnuTable {...defaultProps} onClick={jest.fn()} />
    </Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByText('ont_9')).toBeInTheDocument()
  })

  it('renders with loading state', () => {
    render(<Provider>
      <EdgeNokiaOnuTable {...defaultProps} onClick={jest.fn()} />
    </Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
  })

  it('should not trigger API when oltId or cageName is not provided', () => {
    render(<Provider>
      <EdgeNokiaOnuTable oltId={undefined} cageName={undefined} onClick={jest.fn()} />
    </Provider>)
    expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    expect(mockGetOnuList).not.toHaveBeenCalled()
  })
})