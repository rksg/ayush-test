import { render, fireEvent, screen } from '@testing-library/react'

import { ListItemComponent } from './dropdownListItem'

describe('ListItemComponent', () => {
  it('renders correctly for leaf nodes', () => {
    const node = {
      type: 'folder',
      name: 'TestFolder',
      children: []
    }
    const mockOnClick = jest.fn()
    render(
      <ListItemComponent node={node} onClick={mockOnClick} />
    )

    expect(screen.getByText(/TestFolder/)).toBeInTheDocument()
  })
  it('renders correctly for root node', () => {
    const node = {
      name: 'TestFolder',
      children: []
    }
    const mockOnClick = jest.fn()
    render(
      <ListItemComponent node={node} onClick={mockOnClick} isSelected={true}/>
    )
    expect(screen.getByText(/TestFolder/)).toBeInTheDocument()
  })
  it('renders correctly for non-leaf nodes', () => {
    const node = {
      type: 'folder',
      name: 'TestFolder',
      children: [{ name: 'Child1' }]
    }
    const mockOnClick = jest.fn()
    const { container } = render(
      <ListItemComponent node={node} onClick={mockOnClick} />
    )
    // eslint-disable-next-line  testing-library/no-node-access,testing-library/no-container
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const node = {
      type: 'folder',
      name: 'TestFolder',
      children: []
    }
    const mockOnClick = jest.fn()
    render(
      <ListItemComponent node={node} onClick={mockOnClick} />
    )

    fireEvent.click(screen.getByText(/TestFolder/))
    expect(mockOnClick).toHaveBeenCalledWith(node)
  })
})