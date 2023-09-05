import { render, fireEvent, screen } from '@testing-library/react'
import { IntlProvider }              from 'react-intl'

import { DropdownHeader }   from './dropdownHeader'
import { customCapitalize } from './helpers'

describe('DropdownHeader', () => {
  const breadcrumb = [
    { type: 'folder', name: 'Root' },
    { type: 'folder', name: 'SubFolder' }
  ]
  const currentNode = { type: 'folder', name: 'SubFolder' }

  it('renders correctly for given breadcrumb and text', () => {
    render(
      <IntlProvider locale='en'>
        <DropdownHeader
          breadcrumb={breadcrumb}
          searchText=''
          currentNode={currentNode}
          onBack={() => {}}
          onBreadcrumbClick={() => {}}
        />
      </IntlProvider>
    )

    expect(screen.getByText(customCapitalize(currentNode))).toBeInTheDocument()
  })

  it('calls onBack when header is clicked', () => {
    const mockOnBack = jest.fn()
    render(
      <IntlProvider locale='en'>
        <DropdownHeader
          breadcrumb={breadcrumb}
          searchText=''
          currentNode={currentNode}
          onBack={mockOnBack}
          onBreadcrumbClick={() => {}}
        />
      </IntlProvider>
    )

    fireEvent.click(screen.getByText(customCapitalize(currentNode)))
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('calls onBreadcrumbClick with correct index when breadcrumb item is clicked', () => {
    const mockOnBreadcrumbClick = jest.fn()
    render(
      <IntlProvider locale='en'>
        <DropdownHeader
          breadcrumb={breadcrumb}
          searchText=''
          currentNode={currentNode}
          onBack={() => {}}
          onBreadcrumbClick={mockOnBreadcrumbClick}
        />
      </IntlProvider>
    )

    fireEvent.click(screen.getByText(customCapitalize(breadcrumb[0])))
    expect(mockOnBreadcrumbClick).toHaveBeenCalledWith(0)
  })
})