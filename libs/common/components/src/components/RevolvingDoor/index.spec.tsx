import React from 'react'

import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { IntlProvider }                       from 'react-intl'

import * as helpers from './helpers'

import { RevolvingDoor, Node } from '.'

// Mock searchTree and findMatchingNode
jest.mock('./helpers', () => ({
  ...jest.requireActual('./helpers'),
  searchTree: jest.fn(),
  findMatchingNode: jest.fn()
}))

describe('RevolvingDoor', () => {
  const mockSetNetworkPath = jest.fn()
  const mockData: Node = {
    id: '1',
    name: 'root',
    children: [
      { id: '2', name: 'child1', children: [{ id: '4', name: 'child3' }] },
      { id: '3', name: 'child2' }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks();
    (helpers.searchTree as jest.Mock).mockReturnValue([]);
    (helpers.findMatchingNode as jest.Mock).mockReturnValue(null)
  })

  it('should render without errors', () => {
    render(
      <IntlProvider locale='en'>
        <RevolvingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    expect(screen.getByPlaceholderText('Entire Organization')).toBeInTheDocument()
  })

  it('should open dropdown on input click', async () => {
    render(
      <IntlProvider locale='en'>
        <RevolvingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    expect(await screen.findByText('Root')).toBeInTheDocument()
  })

  it('should call onCancel correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <RevolvingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Cancel'))
    expect(screen.getByPlaceholderText('Entire Organization')).toHaveValue('root')
  })

  it('should call onApply correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <RevolvingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Apply'))
    expect(mockSetNetworkPath).toBeCalledWith(
      [{ name: 'root', type: undefined }],
      [{ name: 'root', type: undefined }]
    )
  })

  it('should search nodes correctly', async () => {
    (helpers.searchTree as jest.Mock).mockReturnValue([
      { id: '2', name: 'child1' },
      { id: '3', name: 'child2' }
    ])
    render(
      <IntlProvider locale='en'>
        <RevolvingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    const input = screen.getByPlaceholderText('Entire Organization')
    fireEvent.change(input, { target: { value: 'child' } })
    await waitFor(() => {
      expect(helpers.searchTree).toHaveBeenCalledWith(mockData, 'child')
    })
  })

  it('should handle onSelect correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <RevolvingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('child1'))

    expect(await screen.findByText('child3')).toBeInTheDocument()
  })

  it('should handle onBreadcrumbClick correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <RevolvingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Root'))
    fireEvent.click(await screen.findByText('child1'))
    fireEvent.click(await screen.findByText('Root'))
    expect(screen.getByPlaceholderText('Entire Organization')).toHaveValue('root')
  })

  it('should handle onBack correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <RevolvingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('child1'))
    fireEvent.click(await screen.findByText('Child1'))
    expect(screen.getByPlaceholderText('Entire Organization')).toHaveValue('root')
  })
})
