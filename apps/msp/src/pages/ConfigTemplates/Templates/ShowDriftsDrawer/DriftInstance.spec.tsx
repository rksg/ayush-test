import userEvent from '@testing-library/user-event'

import { render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { DriftComparisonSetData }            from './DriftComparisonSet'
import { DriftInstance, DriftInstanceProps } from './DriftInstance'


jest.mock('./DriftComparisonSet', () => ({
  DriftComparisonSet: ({ category }: DriftComparisonSetData) => <div>{category}</div>
}))

describe('DriftInstance Component', () => {
  const mockUpdateSelection = jest.fn()
  const defaultProps: DriftInstanceProps = {
    instanceName: 'Test Instance',
    instanceId: '12345',
    updateSelection: mockUpdateSelection,
    selected: false,
    disalbed: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the checkbox with the correct initial checked state', () => {
    const { rerender } = render(<DriftInstance {...defaultProps} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    // Re-render with selected = true
    rerender(<DriftInstance {...defaultProps} selected={true} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('calls updateSelection when checkbox is clicked', async () => {
    render(<DriftInstance {...defaultProps} />)

    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)

    expect(mockUpdateSelection).toHaveBeenCalledWith('12345', true)

    // Uncheck the checkbox
    await userEvent.click(checkbox)
    expect(mockUpdateSelection).toHaveBeenCalledWith('12345', false)
  })

  it('triggers data loading when collapse is expanded', async () => {
    render(<DriftInstance {...defaultProps} />)

    await userEvent.click(screen.getByText(/Configurations in Template/i))

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(screen.getByText('WifiNetwork')).toBeInTheDocument()
  })

  it('disables the checkbox when disabled prop is true', () => {
    render(<DriftInstance {...defaultProps} disalbed={true} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('should not disable the checkbox when disabled and selected prop are true', () => {
    render(<DriftInstance {...defaultProps} selected={true} disalbed={true} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeDisabled()
  })
})
