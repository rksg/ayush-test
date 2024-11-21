import userEvent from '@testing-library/user-event'

import { ConfigTemplateDriftRecord, ConfigTemplateDriftSet } from '@acx-ui/rc/utils'
import { render, screen }                                    from '@acx-ui/test-utils'

import { DriftComparisonSet } from './DriftComparisonSet'

jest.mock('./DriftComparison', () => ({
  DriftComparison: ({ path }: ConfigTemplateDriftRecord) => <div>{path}</div>
}))

describe('DriftComparisonSet', () => {
  const mockData: ConfigTemplateDriftSet = {
    diffName: 'Test Category',
    diffData: [
      { path: 'Item 1', data: { template: 'template1', instance: 'instance1' } },
      { path: 'Item 2', data: { template: 'template2', instance: 'instance2' } }
    ]
  }

  it('renders the correct number of DriftComparison components', async () => {
    render(<DriftComparisonSet {...mockData} />)

    expect(screen.getByText('Test Category')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Test Category'))

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })
})
