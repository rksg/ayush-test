import { render, screen } from '@acx-ui/test-utils'

import '@testing-library/jest-dom/extend-expect'
import { TimeDropdown } from '.'

describe('TimeDropdown', () => {
  it('renders Daily dropdown correctly', async () => {
    render(<TimeDropdown type='daily' name='daily' />)

    expect(screen.getByText('Select hour')).toBeInTheDocument()
  })

  it('renders Weekly dropdown correctly', () => {
    render(<TimeDropdown type='weekly' name='weekly' />)

    expect(screen.getByText('Select day')).toBeInTheDocument()
    expect(screen.getByText('Select hour')).toBeInTheDocument()
  })

  it('renders Month dropdown correctly', () => {
    render(<TimeDropdown type='monthly' name='weekly' />)

    expect(screen.getByText('Select day')).toBeInTheDocument()
    expect(screen.getByText('Select hour')).toBeInTheDocument()
  })
})