import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }                                                                                                                                     from '@acx-ui/components'
import { Features }                                                                                                                                      from '@acx-ui/feature-toggle'
import { venueApi }                                                                                                                                      from '@acx-ui/rc/services'
import { ClusterHighAvailabilityModeEnum, CommonUrlsInfo, EdgeClusterTableDataType, EdgeGeneralFixtures, EdgeUrlsInfo, FirmwareUrlsInfo, VenueFixtures } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                                               from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                                                                           from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

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
  showDeleteModal: () => mockShowDeleteModalFn(),
  useIsEdgeFeatureReady: jest.fn()
}))

const { mockVenueOptions } = VenueFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockHaAaFeatureRequirement } = EdgeGeneralFixtures
const { mockedVenueFirmwareList } = EdgeGeneralFixtures
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
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (req, res, ctx) => res(ctx.json(mockHaAaFeatureRequirement))
      ),
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (req, res, ctx) => res(ctx.json(mockedVenueFirmwareList))
      )
    )
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
  })

  it('should show HaMode config when AA FF is ON in add mode', () => {
    mockHaAaEnabled()
    renderClusterForm()

    expect(screen.getByText('High-Availability Mode')).toBeInTheDocument()

    const activeActiveRadio = screen.getAllByRole('radio')
      .find((element) => element.id === 'ACTIVE_ACTIVE')
    expect(activeActiveRadio).toBeChecked()
  })

  it('should not show HaMode config when AA FF is OFF in add mode', () => {
    renderClusterForm()
    expect(screen.queryByText('High-Availability Mode')).not.toBeInTheDocument()
  })

  it('should show selected HaMode for AA cluster in edit mode', async () => {
    setupHaModeInEditMode(ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE)
    expect(screen.getByText(/Active-Active/i)).toBeInTheDocument()
    expect(screen.queryByText(/Active-Standby/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('should show selected HaMode for AB cluster in edit mode', async () => {
    setupHaModeInEditMode(ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY)
    expect(screen.queryByText(/Active-Active/)).not.toBeInTheDocument()
    expect(screen.getByText(/Active-Standby/)).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('should disable add-edge button after adding 4 edges uder AA mode', async () => {
    mockHaAaEnabled()
    renderClusterForm()

    // Add to maximum 4 nodes
    const addBtn = screen.getByRole('button', { name: 'Add another RUCKUS Edge' })
    for (let i = 0; i < 3; i++) {
      await userEvent.click(addBtn)
    }
    await waitFor(() =>
      expect(screen.getAllByRole('textbox', { name: 'RUCKUS Edge Name' }).length).toBe(4)
    )
    // Add button is hidden after having 4 nodes
    // eslint-disable-next-line max-len
    expect(screen.queryByRole('button', { name: 'Add another RUCKUS Edge' })).not.toBeInTheDocument()

    // Delete 1 node
    const deleteBtns = screen.getAllByRole('button', { name: 'delete' })
    await userEvent.click(deleteBtns[0])
    await waitFor(async () =>
      expect((await screen.findAllByRole('textbox', { name: 'RUCKUS Edge Name' })).length).toBe(3)
    )
    // Add button becomes enabled again
    expect(screen.getByRole('button', { name: 'Add another RUCKUS Edge' })).toBeInTheDocument()
  })

  it('should disable HaMode when Edge count goes beyond the max AB mode allows', async () => {
    mockHaAaEnabled()
    renderClusterForm()

    // Select AA mode
    const activeActiveRadio = screen.getAllByRole('radio')
      .find((element) =>element.id === 'ACTIVE_ACTIVE')
    expect(activeActiveRadio).toBeInTheDocument()
    await userEvent.click(activeActiveRadio!)

    // Add 3 Edges that goes beyond the maximum allowed count for AB mode
    const addBtn = screen.getByRole('button', { name: 'Add another RUCKUS Edge' })
    for (let i = 0; i < 2; i++) {
      await userEvent.click(addBtn)
    }
    await waitFor(() =>
      expect(screen.getAllByRole('textbox', { name: 'RUCKUS Edge Name' }).length).toBe(3)
    )

    const activeStandbyRadio = screen.getAllByRole('radio')
      .find((element) => element.id === 'ACTIVE_STANDBY')
    expect(activeStandbyRadio).toBeDisabled()
  })

  it('should render EdgeClusterSettingForm successfully', async () => {
    renderClusterForm()
    expect(screen.getByRole('combobox', { name: 'Venue' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Cluster Name' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeVisible()
    expect(screen.getByText('RUCKUS Edges (0)')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add another RUCKUS Edge' })).toBeVisible()
    expect(screen.getByText(/The cluster function will operate/i)).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'RUCKUS Edge Name' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Serial Number' })).toBeVisible()
  })

  it('should add and delete edge correctly', async () => {
    renderClusterForm()

    const addBtn = screen.getByRole('button', { name: 'Add another RUCKUS Edge' })
    await userEvent.click(addBtn)
    await waitFor(async () =>
      expect((await screen.findAllByRole('textbox', { name: 'RUCKUS Edge Name' })).length).toBe(2)
    )
    await waitFor(async () =>
      expect((await screen.findAllByRole('textbox', { name: 'Serial Number' })).length).toBe(2)
    )
    // eslint-disable-next-line max-len
    expect(screen.queryByRole('button', { name: 'Add another RUCKUS Edge' })).not.toBeInTheDocument()
    const deleteBtns = screen.getAllByRole('button', { name: 'delete' })
    await userEvent.click(deleteBtns[0])
    await waitFor(async () =>
      expect((await screen.findAllByRole('textbox', { name: 'RUCKUS Edge Name' })).length).toBe(1)
    )
    await waitFor(async () =>
      expect((await screen.findAllByRole('textbox', { name: 'Serial Number' })).length).toBe(1)
    )
    expect(screen.getByRole('button', { name: 'delete' })).toBeDisabled()
  })

  it('should derive vSmartEdge model correctly', async () => {
    renderClusterForm()

    const addBtn = screen.getByRole('button', { name: 'Add another RUCKUS Edge' })
    await userEvent.click(addBtn)
    await waitFor(async () =>
      expect((await screen.findAllByRole('textbox', { name: 'RUCKUS Edge Name' })).length).toBe(2)
    )
    await waitFor(async () =>
      expect((await screen.findAllByRole('textbox', { name: 'Serial Number' })).length).toBe(2)
    )
    await userEvent.type(
      screen.getAllByRole('textbox', { name: 'Serial Number' })[0],
      '968E1BDBCED13611EE9078AE968A3B9E8B'
    )
    await userEvent.type(
      screen.getAllByRole('textbox', { name: 'Serial Number' })[1],
      '190000000001'
    )
    expect((await screen.findAllByText('vRUCKUS Edge')).length).toBe(1)
    expect((await screen.findAllByText('-')).length).toBe(1)
  })

  it('should show edit data correctly', async () => {
    let mockData = mockEdgeClusterList.data[0]
    mockData.edgeList[0].serialNumber = '968E1BDBCED13611EE9078AE968A3B9E8B'
    renderEditClusterForm(mockData as unknown as EdgeClusterTableDataType)

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Venue' })).toHaveValue('mock_venue_1')
    )
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Cluster Name' })).toHaveValue('Edge Cluster 1')
    )
    await waitFor(() =>
      expect(screen.getByText('RUCKUS Edges (2)')).toBeVisible()
    )
    const edgeNames = await screen.findAllByRole('textbox', { name: 'RUCKUS Edge Name' })
    expect(edgeNames[0]).toHaveValue('Smart Edge 1')
    expect(edgeNames[1]).toHaveValue('Smart Edge 2')
    const serialNumbers = await screen.findAllByRole('textbox', { name: 'Serial Number' })
    expect(serialNumbers[0]).toHaveValue('968E1BDBCED13611EE9078AE968A3B9E8B')
    expect(serialNumbers[1]).toHaveValue('serialNumber-2')
    expect(serialNumbers[0]).toBeDisabled()
    expect(serialNumbers[1]).toBeDisabled()
    expect((await screen.findAllByText('vRUCKUS Edge')).length).toBe(2)
    expect(screen.queryByText(/The cluster function will operate/i)).not.toBeInTheDocument()
  })

  it('should show otp message correctly', async () => {
    renderClusterForm()
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Serial Number' }),
      '9612345678901234567890123456789012'
    )
    expect(await screen.findByText(/The one-time-password \(OTP\) will be/i)).toBeVisible()
  })

  it('should show confirm delete dialog when deleting existed edge', async () => {
    renderEditClusterForm(mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType)

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'delete' }).length).toBe(2)
    )
    const deleteBtns = screen.getAllByRole('button', { name: 'delete' })
    await userEvent.click(deleteBtns[0])
    expect(mockShowDeleteModalFn).toBeCalled()
  })

  it ('should disable ha radio when the fw of the selected venue is too low for AA', async () => {
    mockHaAaEnabled()
    renderClusterForm()

    const venueSelect = screen.getByRole('combobox')
    await waitFor(() => {
      expect(screen.getByText(mockVenueOptions.data[0].name)).toBeVisible()
    })

    userEvent.selectOptions(venueSelect, mockVenueOptions.data[0].name)

    await waitFor(() => {
      expect(screen.getByText('1.0.0.1709')).toBeInTheDocument()
    })

    const activeStandbyRadio = screen.getAllByRole('radio')
      .find((element) => element.id === 'ACTIVE_ACTIVE')
    expect(activeStandbyRadio).toBeDisabled()
  })

  it ('should enable ha radio when the fw of the selected venue supports AA', async () => {
    mockHaAaEnabled()
    renderClusterForm()

    const venueSelect = screen.getByRole('combobox')
    await waitFor(() => {
      expect(screen.getByText(mockVenueOptions.data[1].name)).toBeVisible()
    })

    userEvent.selectOptions(venueSelect, mockVenueOptions.data[1].name)

    await waitFor(() => {
      expect(screen.getByText('2.1.0.600')).toBeInTheDocument()
    })

    const activeStandbyRadio = screen.getAllByRole('radio')
      .find((element) => element.id === 'ACTIVE_ACTIVE')
    expect(activeStandbyRadio).toBeEnabled()
  })

  function setupHaModeInEditMode (haMode: ClusterHighAvailabilityModeEnum) {
    mockHaAaEnabled()
    let mockData = mockEdgeClusterList.data[0]
    mockData.highAvailabilityMode = haMode
    renderEditClusterForm(mockData as unknown as EdgeClusterTableDataType)
  }

  function renderClusterForm () {
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
  }

  function renderEditClusterForm (editData: EdgeClusterTableDataType) {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeClusterSettingForm
              editData={editData}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
  }

  function mockHaAaEnabled () {
    jest.mocked(useIsEdgeFeatureReady).mockImplementation((feature) =>
      feature === Features.EDGE_HA_AA_TOGGLE)
  }
})