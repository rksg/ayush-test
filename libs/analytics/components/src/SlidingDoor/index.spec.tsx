import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { IntlProvider }                       from 'react-intl'

import * as helpers from './helpers'

import { SlidingDoor, Node } from '.'

jest.mock('./helpers', () => ({
  ...jest.requireActual('./helpers'),
  searchTree: jest.fn(),
  findMatchingNode: jest.fn()
}))

describe('SlidingDoor', () => {
  const mockSetNetworkPath = jest.fn()
  const mockData: Node = {
    id: '1',
    name: 'network',
    type: 'network',
    children: [
      {
        id: '2', name: 'child1', type: 'child1',
        children: [{ id: '4', name: 'child3', type: 'child3' },
          { id: '4', name: 'child5', type: 'child3' }]
      },
      {
        id: '3', name: 'child2', type: 'child2',
        children: [{ id: '5', name: 'child4', type: 'child3' }]
      }
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
        <SlidingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    expect(screen.getByPlaceholderText('Entire Organization')).toBeInTheDocument()
  })

  it('should open dropdown on input click', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    expect(await screen.findByText('Entire Organization')).toBeInTheDocument()
  })

  it('should call onCancel correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Cancel'))
    expect(screen.getByPlaceholderText('Entire Organization')).toHaveValue('')
  })

  it('should call onApply correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Apply'))
    expect(mockSetNetworkPath).toBeCalledWith(
      [{ name: 'network', type: 'network' }],
      [{ name: 'network', type: 'network' }]
    )
  })

  it('should search nodes correctly', async () => {
    (helpers.searchTree as jest.Mock).mockReturnValue([
      { id: '2', name: 'child1' },
      { id: '3', name: 'child2' }
    ])
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
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
        <SlidingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Child1 (child1)'))
    fireEvent.click(await screen.findByText('Child3 (child3)'))
    fireEvent.click(await screen.findByText('Child5 (child3)'))
    expect(await screen.findByText('Child3 (child3)')).toBeInTheDocument()
  })

  it('should handle onBreadcrumbClick correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Entire Organization'))
    fireEvent.click(await screen.findByText('Child1 (child1)'))
    fireEvent.click(await screen.findByText('Entire Organization'))
    expect(screen.getByPlaceholderText('Entire Organization')).toBeVisible()
  })

  it('should handle onBack correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Child1 (child1)'))
    fireEvent.click(await screen.findByText('Child3 (child3)'))
    fireEvent.click(await screen.findByTestId('ArrowChevronLeft'))
    expect(screen.getByPlaceholderText('Entire Organization')).toBeVisible()
  })
  it('should handle onClear correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByTestId('CloseSymbol'))
    expect(screen.getByPlaceholderText('Entire Organization')).toBeVisible()
  })
  it('should show no data', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={{ name: 'network',
          type: 'network' }}
        setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    expect(screen.getByText('No Data')).toBeInTheDocument()
  })
  it('should close the filter on clicking outside the filter', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData}
          setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Child1 (child1)'))
    fireEvent.mouseDown(document.body)
    expect(screen.getByText('Child1 (child1)')).toBeVisible()
  })
  it('should not close the filter on clicking inside the filter', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData}
          setNetworkPath={mockSetNetworkPath} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Child1 (child1)'))
    fireEvent.mouseDown(await screen.findByText('Child1 (child1)'))
    expect(screen.getByText('Child1 (child1)')).not.toBeVisible()
  })
})
