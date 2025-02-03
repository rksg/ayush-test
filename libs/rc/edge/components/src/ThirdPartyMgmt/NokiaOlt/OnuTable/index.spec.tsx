import { useGetEdgeOnuListQuery } from '@acx-ui/rc/services'
import { render, screen }         from '@acx-ui/test-utils'

import { EdgeNokiaOnuTable } from './index'

jest.mock('@acx-ui/rc/services', () => ({
  useGetEdgeOnuListQuery: jest.fn()
}))


describe('EdgeNokiaOnuTable', () => {
  it('renders with loading state', () => {
    (useGetEdgeOnuListQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true
    })

    render(<EdgeNokiaOnuTable onClick={jest.fn()} />)
    expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
  })

  it('renders with data', () => {
    const data = [{ id: 1, name: 'ONU 1' }];
    (useGetEdgeOnuListQuery as jest.Mock).mockReturnValue({
      data,
      isLoading: false
    })

    render(<EdgeNokiaOnuTable onClick={jest.fn()} />)
    expect(screen.getByText('ONU 1')).toBeInTheDocument()
  })
})