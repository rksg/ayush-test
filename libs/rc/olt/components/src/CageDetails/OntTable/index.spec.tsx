import userEvent from '@testing-library/user-event'

import { OltOnt, OltFixtures } from '@acx-ui/olt/utils'
import { Provider }            from '@acx-ui/store'
import { render, screen }      from '@acx-ui/test-utils'

import { OntTable } from './index'
const mockOntList = OltFixtures.mockOntList as OltOnt[]

describe('OntTable', () => {
  const defaultProps = {
    data: mockOntList as OltOnt[],
    selectedOnt: mockOntList[0],
    setSelectedOnt: jest.fn()
  }

  it('should render correctly', async () => {
    render(<Provider>
      <OntTable {...defaultProps} />
    </Provider>)
    expect(screen.getByText('ont_1')).toBeInTheDocument()
  })

  it('should handle row click correctly', async () => {
    render(<Provider>
      <OntTable {...defaultProps} />
    </Provider>)
    const row = screen.getByRole('row', { name: /ont_7 0\/1/ })
    await userEvent.click(row)
    expect(defaultProps.setSelectedOnt).toHaveBeenCalledWith(mockOntList[6])
  })

  it('should render without data correctly', async () => {
    render(<Provider>
      <OntTable {...defaultProps} data={[]} />
    </Provider>)
    expect(screen.getByText('ONT Name (0)')).toBeInTheDocument()
  })

  it('should handle pagination correctly', async () => {
    render(<Provider>
      <OntTable {...defaultProps} />
    </Provider>)
    const nextPageButton = screen.getByRole('button', { name: 'right' })
    await userEvent.click(nextPageButton)
    expect(screen.getByText('ont_11')).toBeInTheDocument()
  })

})