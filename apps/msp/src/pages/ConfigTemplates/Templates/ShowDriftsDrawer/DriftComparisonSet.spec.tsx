import userEvent from '@testing-library/user-event'

import { ConfigTemplateDriftRecord, ConfigTemplateDriftSet } from '@acx-ui/rc/utils'
import { render, screen }                                    from '@acx-ui/test-utils'

import { DriftComparisonSet, filterDriftRecordIdByName } from './DriftComparisonSet'

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

  describe('filterDriftRecordIdByName', () => {
    // eslint-disable-next-line max-len
    it('filters out records with paths ending with "Id" if a corresponding "Name" record exists', () => {
      const input: ConfigTemplateDriftRecord[] = [
        { path: 'fooId', data: { template: '', instance: '' } },
        { path: 'fooIdName', data: { template: '', instance: '' } },
        { path: 'barId', data: { template: '', instance: '' } }
      ]
      const expectedOutput: ConfigTemplateDriftRecord[] = [
        { path: 'fooIdName', data: { template: '', instance: '' } },
        { path: 'barId', data: { template: '', instance: '' } }
      ]
      expect(filterDriftRecordIdByName(input)).toEqual(expectedOutput)
    })

    // eslint-disable-next-line max-len
    it('filters out records with paths matching the "Id/\\d+$" pattern if a corresponding "IdName/\\d+" record exists', () => {
      const input: ConfigTemplateDriftRecord[] = [
        { path: 'fooId/1', data: { template: '', instance: '' } },
        { path: 'fooIdName/1', data: { template: '', instance: '' } },
        { path: 'barId/2', data: { template: '', instance: '' } }
      ]
      const expectedOutput: ConfigTemplateDriftRecord[] = [
        { path: 'fooIdName/1', data: { template: '', instance: '' } },
        { path: 'barId/2', data: { template: '', instance: '' } }
      ]
      expect(filterDriftRecordIdByName(input)).toEqual(expectedOutput)
    })

    it('does not filter out records with paths not matching the above patterns', () => {
      const input: ConfigTemplateDriftRecord[] = [
        { path: 'foo', data: { template: '', instance: '' } },
        { path: 'bar/baz', data: { template: '', instance: '' } },
        { path: 'barId', data: { template: '', instance: '' } },
        { path: 'fooIds/1', data: { template: '', instance: '' } }
      ]
      const expectedOutput: ConfigTemplateDriftRecord[] = [
        { path: 'foo', data: { template: '', instance: '' } },
        { path: 'bar/baz', data: { template: '', instance: '' } },
        { path: 'barId', data: { template: '', instance: '' } },
        { path: 'fooIds/1', data: { template: '', instance: '' } }
      ]
      expect(filterDriftRecordIdByName(input)).toEqual(expectedOutput)
    })

    it('returns an empty array for an empty input array', () => {
      const input: ConfigTemplateDriftRecord[] = []
      const expectedOutput: ConfigTemplateDriftRecord[] = []
      expect(filterDriftRecordIdByName(input)).toEqual(expectedOutput)
    })
  })
})
