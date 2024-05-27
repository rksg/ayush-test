import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }                                                                    from '@acx-ui/components'
import { venueApi }                                                                     from '@acx-ui/rc/services'
import { CommonUrlsInfo, EdgeClusterTableDataType, EdgeGeneralFixtures, VenueFixtures } from '@acx-ui/rc/utils'
import { Provider, store }                                                              from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                          from '@acx-ui/test-utils'

import { EdgeClusterSettingForm } from '.'

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
  dropdownClassName?: string
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    loading, children, onChange, options, dropdownClassName, ...props
  }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})
const mockShowDeleteModalFn = jest.fn()
jest.mock('../../useEdgeActions', () => ({
  ...jest.requireActual('../../useEdgeActions'),
  showDeleteModal: () => mockShowDeleteModalFn()
}))

const { mockVenueOptions } = VenueFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures
describe('EdgeClusterSettingForm', () => {
  let params: { tenantId: string, clusterId: string, activeTab: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: 'testClusterId',
      activeTab: 'cluster-details'
    }
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueOptions))
      )
    )
  })

  it('should render EdgeClusterSettingForm successfully', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeClusterSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    expect(screen.getByRole('combobox', { name: 'Venue' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Cluster Name' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeVisible()
    expect(screen.getByText('SmartEdges (0)')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add another SmartEdge' })).toBeVisible()
    expect(screen.getByText(/The cluster function will operate/i)).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'SmartEdge Name' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Serial Number' })).toBeVisible()
  })

  it('should add and delete edge correctly', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeClusterSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    const addBtn = screen.getByRole('button', { name: 'Add another SmartEdge' })
    await userEvent.click(addBtn)
    await waitFor(async () =>
      expect((await screen.findAllByRole('textbox', { name: 'SmartEdge Name' })).length).toBe(2)
    )
    await waitFor(async () =>
      expect((await screen.findAllByRole('textbox', { name: 'Serial Number' })).length).toBe(2)
    )
    await waitFor(() => expect(addBtn).toBeDisabled())
    const deleteBtns = screen.getAllByRole('button', { name: 'delete' })
    await userEvent.click(deleteBtns[0])
    await waitFor(async () =>
      expect((await screen.findAllByRole('textbox', { name: 'SmartEdge Name' })).length).toBe(1)
    )
    await waitFor(async () =>
      expect((await screen.findAllByRole('textbox', { name: 'Serial Number' })).length).toBe(1)
    )
    expect(screen.getByRole('button', { name: 'delete' })).toBeDisabled()
  })

  it('should show edit data correctly', async () => {
    let mockData = mockEdgeClusterList.data[0]
    mockData.edgeList[0].serialNumber = '968E1BDBCED13611EE9078AE968A3B9E8B'
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeClusterSettingForm
              editData={mockData as unknown as EdgeClusterTableDataType}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Venue' })).toHaveValue('mock_venue_1')
    )
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Cluster Name' })).toHaveValue('Edge Cluster 1')
    )
    await waitFor(() =>
      expect(screen.getByText('SmartEdges (2)')).toBeVisible()
    )
    const edgeNames = await screen.findAllByRole('textbox', { name: 'SmartEdge Name' })
    expect(edgeNames[0]).toHaveValue('Smart Edge 1')
    expect(edgeNames[1]).toHaveValue('Smart Edge 2')
    const serialNumbers = await screen.findAllByRole('textbox', { name: 'Serial Number' })
    expect(serialNumbers[0]).toHaveValue('968E1BDBCED13611EE9078AE968A3B9E8B')
    expect(serialNumbers[1]).toHaveValue('serialNumber-2')
    expect(serialNumbers[0]).toBeDisabled()
    expect(serialNumbers[1]).toBeDisabled()
    expect((await screen.findAllByText('-')).length).toBe(1)
    expect((await screen.findAllByText('vSmartEdge')).length).toBe(1)
    expect(screen.queryByText(/The cluster function will operate/i)).not.toBeInTheDocument()
  })

  it('should show otp message correctly', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeClusterSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Serial Number' }),
      '9612345678901234567890123456789012'
    )
    expect(await screen.findByText(/The one-time-password \(OTP\) will be/i)).toBeVisible()
  })

  it('should show confirm delete dialog when deleting existed edge', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeClusterSettingForm
              editData={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'delete' }).length).toBe(2)
    )
    const deleteBtns = screen.getAllByRole('button', { name: 'delete' })
    await userEvent.click(deleteBtns[0])
    expect(mockShowDeleteModalFn).toBeCalled()
  })
})