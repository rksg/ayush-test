import { render, screen } from '@acx-ui/test-utils'

import { PoeUtilizationBox } from './PoeUtilizationBox'

describe('PoeUtilizationBox', () => {
  it('renders loader when isLoading is true', () => {
    const props = { isLoading: true, title: 'Test Title', isOnline: false }
    render(<PoeUtilizationBox {...props} />)
    expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
  })

  it('renders statistic when isLoading is false and isOnline is true', () => {
    // eslint-disable-next-line max-len
    const props = { isLoading: false, title: 'Test Title', isOnline: true, value: 10, totalVal: 100 }
    render(<PoeUtilizationBox {...props} />)
    expect(screen.getByText('(10%)')).toBeInTheDocument()
  })

  it('renders title with dashes when isLoading is false and isOnline is false', () => {
    const props = { isLoading: false, title: 'Test Title', isOnline: false }
    render(<PoeUtilizationBox {...props} />)
    expect(screen.getByText('--')).toBeInTheDocument()
  })

  it('renders 0% when value and totalVal are 0', () => {
    const props = { isLoading: false, title: 'Test Title', isOnline: true, value: 0, totalVal: 0 }
    render(<PoeUtilizationBox {...props} />)
    expect(screen.getByText('(0%)')).toBeInTheDocument()
  })
})