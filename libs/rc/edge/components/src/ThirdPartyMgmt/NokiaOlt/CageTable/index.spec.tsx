import userEvent from '@testing-library/user-event'

import { useGetEdgeCageListQuery } from '@acx-ui/rc/services'
import { screen, render }          from '@acx-ui/test-utils'

import { EdgeNokiaCageTable } from './'

jest.mock('@acx-ui/rc/services', () => ({
  useGetEdgeCageListQuery: jest.fn()
}))


describe('EdgeNokiaCageTable', () => {
  it('renders component with props', () => {
    const props = {
      venueId: 'venueId',
      edgeClusterId: 'edgeClusterId',
      oltId: 'oltId'
    }
    render(<EdgeNokiaCageTable {...props} />)
    expect(screen.getByText('Cage')).toBeInTheDocument()
  })

  it('calls handleRowClick function', async () => {
    const props = {
      venueId: 'venueId',
      edgeClusterId: 'edgeClusterId',
      oltId: 'oltId'
    }
    render(<EdgeNokiaCageTable {...props} />)
    const row = screen.getByText('Cage')
    await userEvent.click(row)
    expect(props.handleRowClick).toHaveBeenCalledTimes(1)
  })

  it('displays loading state', () => {
    const props = {
      venueId: 'venueId',
      edgeClusterId: 'edgeClusterId',
      oltId: 'oltId'
    }
    useGetEdgeCageListQuery.mockImplementation(() => ({
      isLoading: true
    }))
    render(<EdgeNokiaCageTable {...props} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays error state', () => {
    const props = {
      venueId: 'venueId',
      edgeClusterId: 'edgeClusterId',
      oltId: 'oltId'
    }
    useGetEdgeCageListQuery.mockImplementation(() => ({
      error: 'Error message'
    }))
    render(<EdgeNokiaCageTable {...props} />)
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('displays CageDetailsDrawer', async () => {
    const props = {
      venueId: 'venueId',
      edgeClusterId: 'edgeClusterId',
      oltId: 'oltId'
    }
    render(<EdgeNokiaCageTable {...props} />)
    const row = screen.getByText('Cage')
    await userEvent.click(row)
    expect(screen.getByText('Cage Details')).toBeInTheDocument()
  })
})