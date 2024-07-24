import { render, screen } from '@acx-ui/test-utils'

import '@testing-library/jest-dom/extend-expect'
import { TimeDropdown } from '.'

describe('TimeDropdown', () => {
  it('renders Daily dropdown correctly', async () => {
    render(<TimeDropdown timeType='Daily' name='daily' />)

    expect(screen.getByText('Select hour')).toBeInTheDocument()
  })

  it('renders Weekly dropdown correctly', () => {
    render(<TimeDropdown timeType='Weekly' name='weekly' />)

    expect(screen.getByText('Select day')).toBeInTheDocument()
    expect(screen.getByText('Select hour')).toBeInTheDocument()
  })

  it('renders Month dropdown correctly', () => {
    render(<TimeDropdown timeType='Monthly' name='weekly' />)

    expect(screen.getByText('Select day')).toBeInTheDocument()
    expect(screen.getByText('Select hour')).toBeInTheDocument()
  })
})