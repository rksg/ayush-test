import userEvent from '@testing-library/user-event'

import { OltOnu, OltFixtures } from '@acx-ui/olt/utils'
import { Provider }            from '@acx-ui/store'
import { render, screen }      from '@acx-ui/test-utils'

import { OnuTable } from './index'
const mockOnuList = OltFixtures.mockOnuList as OltOnu[]

describe('OnuTable', () => {
  const defaultProps = {
    data: mockOnuList as OltOnu[],
    cageName: 'cageName',
    onClickRow: jest.fn(),
    onClearSelection: jest.fn()
  }

  it('renders with data', async () => {
    render(<Provider>
      <OnuTable {...defaultProps} />
    </Provider>)
    expect(screen.getByText('ont_9')).toBeInTheDocument()
    screen.getByRole('row', { name: 'ont_9 3 2 (802.3af 7.0 W)' })
  })

  it('should clear selection when cageName is changed', async () => {
    const mockOnClick = jest.fn()
    const mockOnClearSelection = jest.fn()

    const { rerender } = render(<Provider>
      <OnuTable data={mockOnuList}
        cageName={'mock-cage'}
        onClickRow={mockOnClick}
        onClearSelection={mockOnClearSelection}
      />
    </Provider>)

    await userEvent.click(screen.getByRole('row', { name: 'ont_9 3 2 (802.3af 7.0 W)' }))
    expect(mockOnClick).toHaveBeenNthCalledWith(1, mockOnuList.find((onu) => onu.name === 'ont_9'))

    rerender(<Provider>
      <OnuTable data={mockOnuList}
        cageName={'mock-cage-2'}
        onClickRow={mockOnClick}
        onClearSelection={mockOnClearSelection}
      />
    </Provider>)
    expect(mockOnClearSelection).toBeCalledTimes(2)
  })

  it('should call onClick with undefined when selection is cleared', async () => {
    const mockOnClick = jest.fn()
    const mockOnClearSelection = jest.fn()
    render(<Provider>
      <OnuTable data={mockOnuList}
        cageName={'mock-cage'}
        onClickRow={mockOnClick}
        onClearSelection={mockOnClearSelection}
      />
    </Provider>)

    await userEvent.click(screen.getByRole('row', { name: 'ont_9 3 2 (802.3af 7.0 W)' }))
    expect(mockOnClick).toHaveBeenCalledWith(mockOnuList.find((onu) => onu.name === 'ont_9'))

    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(mockOnClearSelection).toBeCalledTimes(1)
  })
})