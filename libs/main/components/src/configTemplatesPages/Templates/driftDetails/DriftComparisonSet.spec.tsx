import userEvent from '@testing-library/user-event'

import { ConfigTemplateDriftRecord, ConfigTemplateDriftSet } from '@acx-ui/rc/utils'
import { render, screen }                                    from '@acx-ui/test-utils'

import { DriftComparisonSet } from './DriftComparisonSet'

jest.mock('./DriftComparison', () => ({
  DriftComparison: ({ path }: ConfigTemplateDriftRecord) => <div>{path}</div>
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  Tooltip: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <div data-testid='tooltip-title'>{title}</div>
      {children}
    </div>
  )
}))

describe('DriftComparisonSet', () => {
  it('renders the correct number of DriftComparison components', async () => {
    const mockData: ConfigTemplateDriftSet = {
      diffName: 'Test Category',
      diffData: [
        { path: 'Item 1', data: { template: 'template1', instance: 'instance1' } },
        { path: 'Item 2', data: { template: 'template2', instance: 'instance2' } }
      ]
    }
    render(<DriftComparisonSet {...mockData} />)

    expect(screen.getByText('Test Category')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Test Category'))

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('renders the unknown DriftComparisonSet', async () => {
    const mockData: ConfigTemplateDriftSet = {
      diffName: '?TestCategory',
      diffData: []
    }
    render(<DriftComparisonSet {...mockData} />)

    expect(screen.getByText('?TestCategory')).toBeInTheDocument()
    expect(screen.queryAllByText('Drifts are not available')).toHaveLength(2) // 1 for label tooltip, 1 for icon tooltip
  })

  it('renders the failed DriftComparisonSet', async () => {
    const mockData: ConfigTemplateDriftSet = {
      diffName: 'TestCategory',
      diffData: [{ path: 'error', data: { template: 'template1', instance: 'instance1' } }]
    }
    render(<DriftComparisonSet {...mockData} />)

    expect(screen.getByText('TestCategory')).toBeInTheDocument()
    expect(screen.queryAllByText('Failed to handle drift content')).toHaveLength(2) // // 1 for label tooltip, 1 for icon tooltip
  })
})
