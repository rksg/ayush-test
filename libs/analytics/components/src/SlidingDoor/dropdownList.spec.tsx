import { render }       from '@testing-library/react'
import { IntlProvider } from 'react-intl'

import { DropdownList } from './dropdownList'

import { Node } from '.'

const mockNodesToShow: Node[] = [
  { name: 'Node1', type: 'Type1' },
  { name: 'Node2', type: 'Type2' }
]

const mockBreadcrumb: Node[] = [
  { name: 'Root', type: 'RootType' }
]

const mockCurrentNode: Node = { name: 'Root', type: 'RootType' }

const mockSearchText = 'Node'

const mockOnSelect = jest.fn()
const mockOnCancel = jest.fn()
const mockOnApply = jest.fn()
const mockOnBack = jest.fn()
const mockOnBreadcrumbClick = jest.fn()

describe('DropdownList', () => {
  it('renders without crashing', () => {
    render(
      <IntlProvider locale='en'>
        <DropdownList
          nodesToShow={mockNodesToShow}
          breadcrumb={mockBreadcrumb}
          searchText={mockSearchText}
          currentNode={mockCurrentNode}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
          onApply={mockOnApply}
          onBack={mockOnBack}
          onBreadcrumbClick={mockOnBreadcrumbClick}
        />
      </IntlProvider>
    )
  })
})