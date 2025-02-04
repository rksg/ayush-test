import  userEvent from '@testing-library/user-event'
import { rest }   from 'msw'

import {
  useVenuesListQuery,
  useGetEdgeClusterListQuery
} from '@acx-ui/rc/services'
import  { EdgeTnmServiceUrls, VenueFixtures, EdgeGeneralFixtures, EdgeOltFixtures } from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { mockServer, screen, render, waitFor }                                      from '@acx-ui/test-utils'

import { NokiaOltFormDrawer } from './OltFormDrawer'

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={''}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

jest.mock('@acx-ui/rc/services', () => {
  const actual = jest.requireActual('@acx-ui/rc/services')
  return {
    useVenuesListQuery: jest.fn(),
    useGetEdgeClusterListQuery: jest.fn(),
    useAddEdgeOltMutation: actual.useAddEdgeOltMutation,
    useUpdateEdgeOltMutation: actual.useUpdateEdgeOltMutation
  }
})

const { mockOlt } = EdgeOltFixtures
// eslint-disable-next-line max-len
const mockVenueOptions = VenueFixtures.mockVenueOptions.data.map((v) => ({ label: v.name, value: v.id }))
// eslint-disable-next-line max-len
const mockEdgeClusterList = EdgeGeneralFixtures.mockEdgeClusterList.data.map((c) => ({ label: c.name, value: c.clusterId }))
describe('NokiaOltFormDrawer', () => {
  const params = { tenantId: 'mock-tenant-id' }
  const mockPath = '/:tenantId/devices/optical/olt'
  const mockedAddReq = jest.fn()

  beforeEach(() => {
    mockedAddReq.mockClear();

    (useVenuesListQuery as jest.Mock).mockReturnValue({
      venueOptions: mockVenueOptions,
      isVenueOptsLoading: false
    });

    (useGetEdgeClusterListQuery as jest.Mock).mockReturnValue({
      clusterOptions: mockEdgeClusterList,
      isClusterOptsLoading: false
    })

    mockServer.use(
      rest.post(
        EdgeTnmServiceUrls.addEdgeOlt.url,
        (_, res, ctx) => {
          mockedAddReq()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('renders component with default props', () => {
    const props = {
      visible: true,
      setVisible: jest.fn(),
      editData: undefined
    }
    render(<Provider>
      <NokiaOltFormDrawer {...props} />
    </Provider>, { route: { params, path: mockPath } })
    expect(screen.getByText('Add Device')).toBeInTheDocument()
  })

  it('edit mode submits form', async () => {
    const mockedUpdateReq = jest.fn()

    mockServer.use(
      rest.put(
        EdgeTnmServiceUrls.updateEdgeOlt.url,
        (_, res, ctx) => {
          mockedUpdateReq()
          return res(ctx.status(202))
        }
      )
    )

    const props = {
      visible: true,
      setVisible: jest.fn(),
      editData: mockOlt
    }
    render(<Provider>
      <NokiaOltFormDrawer {...props} />
    </Provider>, { route: { params, path: mockPath } })

    screen.getByText('Edit Device')
    const nameInput = screen.getByLabelText('Device Name')
    const venueIdInput = screen.getByRole('combobox', { name: 'Venue' })
    const edgeClusterIdInput = screen.getByRole('combobox', { name: 'RUCKUS Edge' })
    const ipInput = screen.getByLabelText('IP Address')
    await screen.findByText(mockOlt.venueName)
    expect(nameInput).toHaveValue(mockOlt.name)
    expect(venueIdInput).toHaveValue(mockOlt.venueId)
    expect(edgeClusterIdInput).toHaveValue(mockOlt.edgeClusterId)
    expect(ipInput).toHaveValue(mockOlt.ip)

    // edit: change name
    await userEvent.type(nameInput, ' Testing')
    const submitButton = screen.getByText('Save')
    await userEvent.click(submitButton)
    await waitFor(() => expect(props.setVisible).toHaveBeenCalledTimes(1))
    expect(mockedUpdateReq).toHaveBeenCalledTimes(1)
  })

  it('create mode submits form', async () => {
    const props = {
      visible: true,
      setVisible: jest.fn(),
      editData: undefined
    }
    render(<Provider>
      <NokiaOltFormDrawer {...props} />
    </Provider>, { route: { params, path: mockPath } })
    const nameInput = screen.getByLabelText('Device Name')
    const venueIdInput = screen.getByRole('combobox', { name: 'Venue' })
    const edgeClusterIdInput = screen.getByRole('combobox', { name: 'RUCKUS Edge' })
    const ipInput = screen.getByLabelText('IP Address')

    await userEvent.type(nameInput, 'Test Device')
    await userEvent.selectOptions(venueIdInput, 'Mock Venue 3')
    await userEvent.selectOptions(edgeClusterIdInput, 'Edge Cluster 2')
    await userEvent.type(ipInput, '192.168.1.1')

    const submitButton = screen.getByText('Add')
    await userEvent.click(submitButton)
    await waitFor(() => expect(props.setVisible).toHaveBeenCalledTimes(1))
    expect(mockedAddReq).toHaveBeenCalledTimes(1)
  })

  it('submits form with invalid data', async () => {
    const props = {
      visible: true,
      setVisible: jest.fn(),
      editData: undefined
    }
    render(<Provider>
      <NokiaOltFormDrawer {...props} />
    </Provider>, { route: { params, path: mockPath } })
    const ipInput = screen.getByLabelText('IP Address')

    await userEvent.type(ipInput, 'invalid.ip')

    const submitButton = screen.getByText('Add')
    await userEvent.click(submitButton)
    await waitFor(() => expect(props.setVisible).not.toHaveBeenCalled())
    expect(mockedAddReq).toHaveBeenCalledTimes(0)
  })

  it('submits form with error', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})

    mockServer.use(
      rest.post(
        EdgeTnmServiceUrls.addEdgeOlt.url,
        (_, res, ctx) => {
          return res(ctx.status(422))
        }
      )
    )

    render(<Provider>
      <NokiaOltFormDrawer
        visible
        setVisible={jest.fn()}
      />
    </Provider>, { route: { params, path: mockPath } })
    const nameInput = screen.getByLabelText('Device Name')
    const venueIdInput = screen.getByRole('combobox', { name: 'Venue' })
    const edgeClusterIdInput = screen.getByRole('combobox', { name: 'RUCKUS Edge' })
    const ipInput = screen.getByLabelText('IP Address')

    await userEvent.type(nameInput, 'Test Device')
    await userEvent.selectOptions(venueIdInput, 'Mock Venue 1')
    await userEvent.selectOptions(edgeClusterIdInput, 'Edge Cluster 1')
    await userEvent.type(ipInput, '192.168.1.1')

    const submitButton = screen.getByText('Add')
    await userEvent.click(submitButton)
    // eslint-disable-next-line no-console
    expect(console.log).toHaveBeenCalled()
  })
})