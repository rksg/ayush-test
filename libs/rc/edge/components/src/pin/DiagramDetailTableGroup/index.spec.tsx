
import userEvent from '@testing-library/user-event'

import { useGetEdgePinByIdQuery }          from '@acx-ui/rc/services'
import { useTableQuery }                   from '@acx-ui/rc/utils'
import { render, screen, waitFor, within } from '@acx-ui/test-utils'

import { usePersonaListQuery }                          from '../../identityGroup'
import { PersonalIdentityNetworkDetailTableGroupProps } from '../PersonalIdentityNetworkDetailTableGroup'
import { TopologyDiagramProps }                         from '../TopologyDiagram'
import { PinDetailTableGroupTabType }                   from '../type'

import { DiagramDetailTableGroup } from './'

const mockSetCurrentTab = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  useGetEdgePinByIdQuery: jest.fn()
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useTableQuery: jest.fn().mockReturnValue({
    data: {},
    payload: {}
  })
}))

jest.mock('../../identityGroup', () => ({
  usePersonaListQuery: jest.fn()
}))

jest.mock('../PersonalIdentityNetworkDetailTableGroup', () => {
  const { forwardRef } = jest.requireActual('react')
  return {
    // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
    PersonalIdentityNetworkDetailTableGroup: forwardRef((props: PersonalIdentityNetworkDetailTableGroupProps, ref: { current: { setCurrentTab: jest.Mock<any, any> } }) => {
      ref.current = { setCurrentTab: mockSetCurrentTab }
      return <div data-testid='PersonalIdentityNetworkDetailTableGroup'>
        <div data-testid='pinData'>{JSON.stringify(props.pinData)}</div>
      </div>
    })
  }
})

jest.mock('../TopologyDiagram', () => ({
  __esModule: true,
  default: (props: TopologyDiagramProps) =>
    // eslint-disable-next-line max-len
    <div data-testid='TopologyDiagram' onClick={() => props.onClick('AS' as PinDetailTableGroupTabType)}>
      <div data-testid='pinData'>{props.pinData && JSON.stringify(props.pinData)}</div>
      <div data-testid='apCount'>{props.apCount}</div>
      <div data-testid='identityCount'>{props.identityCount}</div>
    </div>
}))

describe('DiagramDetailTableGroup', () => {
  const mockedTableSetPayload = jest.fn()
  const pinId = 'test-pin-id'
  const pinData = { personaGroupId: 'test-persona-group-id', venueId: 'test-venue-id' }
  const apListTableQueryResult = {
    data: [
      { serialNumber: 'test-ap-serial-number-1', name: 'test-ap-name-1' },
      { serialNumber: 'test-ap-serial-number-2', name: 'test-ap-name-2' }
    ],
    totalCount: 2
  }
  const personaListTableQueryResult = { totalCount: 1 }

  beforeEach(() => {
    mockedTableSetPayload.mockReset()

    jest.mocked(useGetEdgePinByIdQuery).mockImplementation(() => {
      return { data: pinData, isLoading: false, refetch: jest.fn() }
    })
    jest.mocked(useTableQuery).mockImplementation(() => {
      // eslint-disable-next-line max-len
      return { data: apListTableQueryResult, payload: {}, setPayload: (params: unknown) => mockedTableSetPayload(params) }
    })
    jest.mocked(usePersonaListQuery).mockImplementation(() => {
      return { data: personaListTableQueryResult, refetch: jest.fn() }
    })
  })

  it('renders correctly with valid props', () => {
    render(<DiagramDetailTableGroup pinId={pinId} />)
    expect(screen.getByText('Network Topology')).toBeInTheDocument()

    // expects TopologyDiagram to be rendered with correct props
    const topologyDiagram = screen.getByTestId('TopologyDiagram')
    expect(within(topologyDiagram).getByTestId('pinData'))
      .toHaveTextContent(JSON.stringify(pinData))
    expect(within(topologyDiagram).getByTestId('apCount')).toHaveTextContent('2')
    expect(within(topologyDiagram).getByTestId('identityCount')).toHaveTextContent('1')

    // expects PersonalIdentityNetworkDetailTableGroup to be rendered with correct props
    // eslint-disable-next-line max-len
    const personalIdentityNetworkDetailTableGroup = screen.getByTestId('PersonalIdentityNetworkDetailTableGroup')
    expect(within(personalIdentityNetworkDetailTableGroup).getByTestId('pinData'))
      .toHaveTextContent(JSON.stringify(pinData))
  })

  it('renders 0 when apCount or identityCount is not ready', () => {
    jest.mocked(useTableQuery).mockImplementation(() => {
      return { data: undefined, setPayload: jest.fn() }
    })
    jest.mocked(usePersonaListQuery).mockImplementation(() => {
      return { data: undefined, refetch: jest.fn() }
    })

    render(<DiagramDetailTableGroup pinId={pinId} />)
    expect(screen.getByText('Network Topology')).toBeInTheDocument()

    const topologyDiagram = screen.getByTestId('TopologyDiagram')
    expect(within(topologyDiagram).getByTestId('apCount')).toHaveTextContent('')
    expect(within(topologyDiagram).getByTestId('identityCount')).toHaveTextContent('')
  })

  it('updates apListTableQuery payload when pinData changes', () => {
    jest.mocked(useGetEdgePinByIdQuery).mockImplementation(() => {
      return { data: undefined, isLoading: true, refetch: jest.fn() }
    })

    const newPinData = { personaGroupId: 'new-test-persona-group-id', venueId: 'new-test-venue-id' }
    jest.mocked(useGetEdgePinByIdQuery).mockImplementation(() => {
      return { data: newPinData, isLoading: false, refetch: jest.fn() }
    })


    const { rerender } = render(<DiagramDetailTableGroup pinId={pinId} />)
    rerender(<DiagramDetailTableGroup pinId={pinId} />)
    expect(mockedTableSetPayload).toHaveBeenNthCalledWith(1, {
      // eslint-disable-next-line max-len
      fields: ['name','model','apMac', 'apStatusData.lanPortStatus','apStatusData.vxlanStatus.vxlanMtu'],
      filters: { venueId: [newPinData.venueId] },
      pageSize: 10000
    })
  })

  it('calls handleDiagramOnClick when TopologyDiagram is clicked', async () => {
    render(<DiagramDetailTableGroup pinId={pinId} />)
    const topologyDiagram = screen.getByTestId('TopologyDiagram')
    await userEvent.click(topologyDiagram)
    await waitFor(() => expect(mockSetCurrentTab).toHaveBeenCalledWith('AS'))
  })

  it('should set ap list table query to empty when pin data is not ready', () => {
    const pinId = 'test-pin-id'
    jest.mocked(useGetEdgePinByIdQuery).mockImplementation(() => {
      return { data: undefined, isLoading: true, refetch: jest.fn() }
    })

    const { rerender } = render(<DiagramDetailTableGroup pinId={pinId} />)
    rerender(<DiagramDetailTableGroup pinId={pinId} />)

    expect(mockedTableSetPayload).toHaveBeenCalledTimes(0)
  })

  it('should trigger ap list table query when pin venueId is ready in table query payload', () => {
    const tableQueryPropsFn = jest.fn()
    jest.mocked(useTableQuery).mockImplementation((props: unknown) => {
      tableQueryPropsFn((props as Record<string, unknown>).option)
      return {
        data: apListTableQueryResult,
        payload: { filters: { venueId: [pinData?.venueId] } },
        setPayload: (params: unknown) => mockedTableSetPayload(params) }
    })

    render(<DiagramDetailTableGroup pinId={pinId} />)
    expect(tableQueryPropsFn).toHaveBeenCalledWith({ skip: false })
  })
})