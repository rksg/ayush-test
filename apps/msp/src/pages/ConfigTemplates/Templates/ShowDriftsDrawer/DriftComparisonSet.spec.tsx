import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { DriftComparisonData }                        from './DriftComparison'
import { DriftComparisonSet, DriftComparisonSetData } from './DriftComparisonSet'

jest.mock('./DriftComparison', () => ({
  DriftComparison: ({ name }: DriftComparisonData) => <div>{name}</div>
}))

describe('DriftComparisonSet', () => {
  const mockData: DriftComparisonSetData = {
    category: 'Test Category',
    driftItems: [
      { name: 'Item 1', values: { template: 'template1', instance: 'instance1' } },
      { name: 'Item 2', values: { template: 'template2', instance: 'instance2' } }
    ]
  }

  it('renders the category as the collapse panel header', () => {
    render(<DriftComparisonSet {...mockData} />)

    expect(screen.getByRole('button', { name: /Test Category/i })).toBeInTheDocument()
  })

  it('renders the correct number of DriftComparison components', async () => {
    render(<DriftComparisonSet {...mockData} />)

    await userEvent.click(screen.getByText('Test Category'))

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })
})
