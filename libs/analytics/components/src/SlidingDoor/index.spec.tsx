import { IntlProvider } from 'react-intl'

import { render, fireEvent, screen } from '@acx-ui/test-utils'

import * as helpers from './helpers'

import { SlidingDoor, Node } from '.'

jest.mock('./helpers', () => ({
  ...jest.requireActual('./helpers'),
  findMatchingNode: jest.fn()
}))

describe('SlidingDoor', () => {
  const selected = [{
    name: 'Network',
    type: 'network'
  }]
  const setNetwork = jest.fn()
  const mockData: Node = {
    id: '1',
    name: 'network',
    type: 'network',
    children: [
      {
        id: '2', name: 'child1', type: 'system',
        children: [{ id: '4', name: 'child3', type: 'domain' },
          { id: '4', name: 'child5', type: 'domain' }]
      },
      {
        id: '3', name: 'child2', type: 'system',
        children: [{ id: '5', name: 'child4', type: 'domain' }]
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks();
    (helpers.findMatchingNode as jest.Mock).mockReturnValue(null)
  })

  it('should render without errors', () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    expect(screen.getByPlaceholderText('Entire Organization')).toBeInTheDocument()
  })

  it('should open dropdown on input click', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    expect(await screen.findByText('Entire Organization')).toBeInTheDocument()
  })

  it('should call onCancel correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Cancel'))
    expect(screen.getByPlaceholderText('Entire Organization')).toHaveValue('')
  })

  it('should call onApply correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Apply'))
    expect(setNetwork).toBeCalledWith(
      [{ name: 'network', type: 'network' }],
      [{ name: 'network', type: 'network' }]
    )
  })
  it('should call onApply correctly for ap', async () => {
    const mock: Node = {
      id: '1',
      name: 'network',
      type: 'network',
      children: [
        { id: '2', name: 'ap', type: 'ap', mac: '1' },
        { id: '3', name: 'switch', type: 'switch', mac: '2' }
      ]
    }
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mock} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText(`Ap (${mock.children?.[0].mac}) (Access Point)`))
    fireEvent.click(await screen.findByText('Apply'))
    expect(setNetwork).toBeCalledWith(
      [{ name: 'network', type: 'network' }, { name: '1', type: 'AP' }],
      [{ name: 'network', type: 'network' }, { name: '1', type: 'AP' }]
    )
  })
  it('should call onApply correctly for switch', async () => {
    const mock: Node = {
      id: '1',
      name: 'network',
      type: 'network',
      children: [
        { id: '2', name: 'ap', type: 'ap', mac: '1' },
        { id: '3', name: 'switch', type: 'switch', mac: '2' }
      ]
    }
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mock} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText(`Switch (${mock.children?.[1].mac}) (Switch)`))
    fireEvent.click(await screen.findByText('Apply'))
    expect(setNetwork).toBeCalledWith(
      [{ name: 'network', type: 'network' }, { name: '2', type: 'switch' }],
      [{ name: 'network', type: 'network' }, { name: '2', type: 'switch' }]
    )
  })
  it('should search nodes correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    const input = await screen.findByPlaceholderText('Entire Organization')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'Child5' } })
    fireEvent.click((await screen.findAllByText('Child5 (Domain)'))[0])
  })

  it('renders empty search', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    const input = screen.getByPlaceholderText('Entire Organization')
    fireEvent.change(input, { target: { value: 'not in' } })
    fireEvent.click(input)
    expect(await screen.findByText('No Data')).toBeInTheDocument()
  })

  it('should handle onSelect correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Child1 (SZ Cluster)'))
    fireEvent.click(await screen.findByText('Child3 (Domain)'))
    fireEvent.click(await screen.findByText('Child5 (Domain)'))
    expect(await screen.findByText('Child3 (Domain)')).toBeInTheDocument()
  })

  it('should handle onBreadcrumbClick correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Entire Organization'))
    fireEvent.click(await screen.findByText('Child1 (SZ Cluster)'))
    fireEvent.click(await screen.findByText('Entire Organization'))
    expect(screen.getByPlaceholderText('Entire Organization')).toBeVisible()
  })

  it('should handle onBack correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Child1 (SZ Cluster)'))
    fireEvent.click(await screen.findByText('Child3 (Domain)'))
    fireEvent.click(await screen.findByTestId('ArrowChevronLeft'))
    expect(screen.getByPlaceholderText('Entire Organization')).toBeVisible()
  })
  it('should handle onClose correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Child1 (SZ Cluster)'))
    fireEvent.click(await screen.findByText('Apply'))
    fireEvent.mouseEnter(await screen.findByPlaceholderText('child1'))
    await screen.findByTestId('Close')
    fireEvent.mouseLeave(await screen.findByPlaceholderText('child1'))
    await screen.findByTestId('CaretDownSolid')
    fireEvent.mouseEnter(await screen.findByPlaceholderText('child1'))
    fireEvent.click(await screen.findByTestId('Close'))
    expect(await screen.findByPlaceholderText('Entire Organization')).toBeVisible()
  })
  it('should show no data', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={{ name: 'network', type: 'network' }}
          setNetworkPath={setNetwork}
          defaultSelectedNode={selected}
        />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    expect(await screen.findByText('No Data')).toBeInTheDocument()
  })
  it('should close the filter on clicking outside the filter', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Child1 (SZ Cluster)'))
    fireEvent.mouseDown(document.body)
    expect(screen.queryByText('Child1 (SZ Cluster)')).toBeNull()
  })
  it('should not close the filter on clicking inside the filter', async () => {
    render(
      <IntlProvider locale='en'>
        <SlidingDoor data={mockData} setNetworkPath={setNetwork} defaultSelectedNode={selected} />
      </IntlProvider>
    )
    fireEvent.click(await screen.findByPlaceholderText('Entire Organization'))
    fireEvent.click(await screen.findByText('Child1 (SZ Cluster)'))
    fireEvent.mouseDown(await screen.findByText('Child1 (SZ Cluster)'))
    expect(screen.getByText('Child1 (SZ Cluster)')).not.toBeVisible()
  })
})
