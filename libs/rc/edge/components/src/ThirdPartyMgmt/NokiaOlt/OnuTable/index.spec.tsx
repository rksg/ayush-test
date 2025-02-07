import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

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
    screen.getByRole('row', { name: 'ont_9 3 2 (802.3af 7.0 W)' })
  })

  it('renders with loading state', () => {
    render(<Provider>
      <EdgeNokiaOnuTable {...defaultProps} onClick={jest.fn()} />
    </Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
  })

  it('should not trigger API when oltId or cageName is not provided', () => {
    render(<Provider>
      <EdgeNokiaOnuTable oltData={undefined} cageName={undefined} onClick={jest.fn()} />
    </Provider>)
    expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    expect(mockGetOnuList).not.toHaveBeenCalled()
  })

  it('should clear selection when cageName is changed', async () => {
    const mockOnClick = jest.fn()
    const { rerender } = render(<Provider>
      <EdgeNokiaOnuTable oltData={mockOlt} cageName={'mock-cage'} onClick={mockOnClick} />
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(screen.getByRole('row', { name: 'ont_9 3 2 (802.3af 7.0 W)' }))
    expect(mockOnClick).toHaveBeenNthCalledWith(1, undefined)
    expect(mockOnClick).toHaveBeenNthCalledWith(2, mockOnuList.find((onu) => onu.name === 'ont_9'))

    rerender(<Provider>
      <EdgeNokiaOnuTable oltData={mockOlt} cageName={'mock-cage-2'} onClick={mockOnClick} />
    </Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(mockOnClick).toHaveBeenNthCalledWith(3, undefined)
  })

  it('should call onClick with undefined when selection is cleared', async () => {
    const mockOnClick = jest.fn()
    render(<Provider>
      <EdgeNokiaOnuTable oltData={mockOlt} cageName={'mock-cage'} onClick={mockOnClick} />
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(screen.getByRole('row', { name: 'ont_9 3 2 (802.3af 7.0 W)' }))
    expect(mockOnClick).toHaveBeenCalledWith(mockOnuList.find((onu) => onu.name === 'ont_9'))

    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(mockOnClick).toBeCalledWith(undefined)
  })
})