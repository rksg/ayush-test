import userEvent              from '@testing-library/user-event'
import { Form, FormInstance } from 'antd'
import { cloneDeep }          from 'lodash'
import { rest }               from 'msw'

import { StepsForm }                      from '@acx-ui/components'
import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import { edgeApi, firmwareApi, venueApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  EdgeGeneralFixtures,
  EdgeUrlsInfo,
  FirmwareUrlsInfo,
  VenueFixtures,
  ClusterHighAvailabilityModeEnum
} from '@acx-ui/rc/utils'
import { Provider, store }                                 from '@acx-ui/store'
import { mockServer, render, screen, waitFor, renderHook } from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { EdgeSettingForm } from './index'

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
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

jest.mock('../useEdgeActions', () => ({
  ...jest.requireActual('../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn()
}))
jest.mock('../EdgeFormItem/EdgeClusterSettingForm/HaModeRadioGroupFormItem', () => ({
  ...jest.requireActual('../EdgeFormItem/EdgeClusterSettingForm/HaModeRadioGroupFormItem'),
  HaModeRadioGroupFormItem: (props: { disabled: boolean }) =>
    <div data-testid='HaModeRadioGroupFormItem'>{''+props.disabled}</div>
}))
jest.mock('../Compatibility/Edge/EdgeCompatibilityDrawer', () => ({
  ...jest.requireActual('../Compatibility/Edge/EdgeCompatibilityDrawer'),
  EdgeCompatibilityDrawer: (props: { featureName: string, onClose: () => void }) =>
    <div data-testid='EdgeCompatibilityDrawer'>
      <span>Feature:{props.featureName}</span>
      <button onClick={props.onClose}>Close</button>
    </div>
}))

const { mockVenueOptions } = VenueFixtures
const { mockHaAaFeatureRequirement } = EdgeGeneralFixtures
const { mockedVenueFirmwareList } = EdgeGeneralFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures

describe('EdgeSettingForm', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(firmwareApi.util.resetApiState())
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
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      )
    )
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
  })

  it('should create EdgeSettingForm successfully', async () => {
    renderEdgeSettingForm()

    expect(await screen.findByRole('combobox', { name: 'Venue' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'RUCKUS Edge Name' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Serial Number' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeVisible()
  })

  it('should create EdgeSettingForm with edit mode successfully', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeSettingForm isEdit />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )

    expect(await screen.findByRole('combobox', { name: 'Venue' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Serial Number' })).toBeDisabled()
  })

  it('should render init data correctly', async () => {
    renderEdgeSettingForm()

    const venueDropdown = await screen.findByRole('combobox', { name: 'Venue' })
    await userEvent.click(venueDropdown)
    expect((await screen.findAllByRole('option', { name: /Mock Venue/i })).length).toBe(3)
  })

  it('should show OTP message correctly', async () => {
    renderEdgeSettingForm()

    const serialNumberInput = await screen.findByRole('textbox',
      { name: 'Serial Number' })
    await userEvent.type(serialNumberInput, '96_serial_number_test')
    expect(await screen.findByRole('alert')).toBeVisible()
  })

  it('should show error when serial number is not for v-edge', async () => {
    renderEdgeSettingForm()

    const serialNumberInput = await screen.findByRole('textbox',
      { name: 'Serial Number' })
    await userEvent.type(serialNumberInput, '12345')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('This field is invalid')).toBeVisible()
  })

  it('should show error when v-edge sn contains invalid characters', async () => {
    renderEdgeSettingForm()

    const serialNumberInput = await screen.findByRole('textbox',
      { name: 'Serial Number' })
    await userEvent.type(serialNumberInput, '96bacs;;aaaaaabbbbbbbbbbcccccccccc')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('This field is invalid')).toBeVisible()
  })

  it('should show error when length of v-edge sn is less then 34', async () => {
    renderEdgeSettingForm()

    const serialNumberInput = await screen.findByRole('textbox',
      { name: 'Serial Number' })
    await userEvent.type(serialNumberInput, '96ABCDE')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('This field is invalid')).toBeVisible()
  })

  it('should show error when length of v-edge sn is more then 34', async () => {
    renderEdgeSettingForm()

    const serialNumberInput = await screen.findByRole('textbox',
      { name: 'Serial Number' })
    await userEvent.type(serialNumberInput, '967107237F423711EE948762BC9B5F795AB')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('This field is invalid')).toBeVisible()
  })

  it ('should show active-standby message when venue is too low for AA', async () => {
    mockHaAaEnabled()
    renderEdgeSettingForm()

    const venueSelect = await screen.findByRole('combobox', { name: 'Venue' })
    await waitFor(() => {
      expect(screen.getByText(mockVenueOptions.data[0].name)).toBeVisible()
    })

    await userEvent.selectOptions(venueSelect, mockVenueOptions.data[0].name)

    await waitFor(() => {
      expect(screen.getByText('1.0.0.1709')).toBeInTheDocument()
    })

    expect(screen.getByText('active-standby')).toBeInTheDocument()
  })

  it ('should show active-active message when venue supports AA', async () => {
    mockHaAaEnabled()
    renderEdgeSettingForm()

    const venueSelect = await screen.findByRole('combobox', { name: 'Venue' })
    await waitFor(() => {
      expect(screen.getByText(mockVenueOptions.data[1].name)).toBeVisible()
    })

    await userEvent.selectOptions(venueSelect, mockVenueOptions.data[1].name)

    await waitFor(() => {
      expect(screen.getByText('2.1.0.600')).toBeInTheDocument()
    })

    expect(screen.getByText('active-active')).toBeInTheDocument()
  })

  it ('should filter venue clusters after venue selected', async () => {
    mockHaAaEnabled()
    renderEdgeSettingForm()

    const venueSelect = await screen.findByRole('combobox', { name: 'Venue' })
    expect(await screen.findByText(mockVenueOptions.data[0].name)).toBeVisible()
    await userEvent.selectOptions(venueSelect, mockVenueOptions.data[0].name)
    expect(screen.queryByRole('option', { name: mockEdgeClusterList.data[0].name })).toBeValid()
    expect(screen.queryByRole('option', { name: mockEdgeClusterList.data[1].name })).toBeNull()
  })

  // eslint-disable-next-line max-len
  it ('should default select cluster venue when venue is not selected', async () => {
    mockHaAaEnabled()
    renderEdgeSettingForm()

    const clusterSelect = await screen.findByRole('combobox', { name: 'Cluster' })
    expect(await screen.findByText(mockEdgeClusterList.data[0].name)).toBeVisible()
    await userEvent.selectOptions(clusterSelect, mockEdgeClusterList.data[0].name)
    screen.getByRole('combobox', { name: 'Venue' })

    await waitFor(() => {
      expect(screen.getByText(mockVenueOptions.data[0].name)).toBeVisible()
    })
  })

  describe('HA mode radio selector', () => {
    beforeEach(() => {
      mockHaAaEnabled()
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_PIN_ENHANCE_TOGGLE)
    })

    it('should render radio selector when PIN enhance is enabled and default greyout', async () => {
      renderEdgeSettingForm()
      const haModeRadioGroup = await screen.findByTestId('HaModeRadioGroupFormItem')
      expect(haModeRadioGroup).toBeVisible()
      expect(haModeRadioGroup).toHaveTextContent('true')
    })

    it('should be able to select HA mode when cluster is not selected', async () => {
      renderEdgeSettingForm()
      const venueSelect = await screen.findByRole('combobox', { name: 'Venue' })
      expect(await screen.findByText(mockVenueOptions.data[1].name)).toBeVisible()
      await userEvent.selectOptions(venueSelect, mockVenueOptions.data[1].name)
      const haModeRadioGroup = screen.getByTestId('HaModeRadioGroupFormItem')
      expect(haModeRadioGroup).toBeVisible()
      expect(haModeRadioGroup).toHaveTextContent('false')
    })

    it('should be ACTIVE-STANDBY mode when venue is not AA not supported', async () => {
      const { result: { current: [formRef] } } = renderHook(() => Form.useForm())
      jest.spyOn(formRef, 'setFieldValue').mockImplementation(jest.fn())

      renderEdgeSettingForm(formRef)
      const venueSelect = await screen.findByRole('combobox', { name: 'Venue' })
      expect(await screen.findByText(mockVenueOptions.data[0].name)).toBeVisible()
      await userEvent.selectOptions(venueSelect, mockVenueOptions.data[0].name)

      expect(formRef.setFieldValue).toBeCalledWith('clusterId', undefined)
      expect(formRef.setFieldValue).toBeCalledWith('highAvailabilityMode', 'ACTIVE_STANDBY' )
      const haModeRadioGroup = screen.getByTestId('HaModeRadioGroupFormItem')
      expect(haModeRadioGroup).toBeVisible()
      expect(haModeRadioGroup).toHaveTextContent('true')
    })

    // eslint-disable-next-line max-len
    it('should be venue HA mode when cluster HA mode is missing from data or cluster is not selected', async () => {
      const mockEdgeClusterListNoHaMode = cloneDeep(mockEdgeClusterList)
      mockEdgeClusterListNoHaMode.data[1].venueId = mockVenueOptions.data[0].id
      mockEdgeClusterListNoHaMode.data[1].highAvailabilityMode = undefined

      mockServer.use(
        rest.post(
          EdgeUrlsInfo.getEdgeClusterStatusList.url,
          (req, res, ctx) => res(ctx.json(mockEdgeClusterListNoHaMode))
        ))

      const { result: { current: [formRef] } } = renderHook(() => Form.useForm())
      jest.spyOn(formRef, 'setFieldValue').mockImplementation(jest.fn())
      renderEdgeSettingForm(formRef)

      const venueSelect = await screen.findByRole('combobox', { name: 'Venue' })
      // eslint-disable-next-line max-len
      await userEvent.selectOptions(venueSelect, await screen.findByText(mockVenueOptions.data[0].name))

      const clusterSelect = screen.getByRole('combobox', { name: 'Cluster' })
      // eslint-disable-next-line max-len
      await userEvent.selectOptions(clusterSelect, await screen.findByText(mockEdgeClusterListNoHaMode.data[1].name))
      expect(formRef.setFieldValue).toBeCalledWith('highAvailabilityMode', 'ACTIVE_STANDBY' )
      // eslint-disable-next-line max-len
      expect(formRef.setFieldValue).not.toBeCalledWith('venueId', mockEdgeClusterListNoHaMode.data[1].venueId)

      expect(screen.getByTestId('HaModeRadioGroupFormItem')).toHaveTextContent('true')
    })

    it('should be venue HA mode when selected cluster is cleared', async () => {
      const mockEdgeClusterList2 = cloneDeep(mockEdgeClusterList)
      mockEdgeClusterList2.data[1].name = 'test-cluster-venue-aa'
      mockEdgeClusterList2.data[1].venueId = mockVenueOptions.data[1].id
      // eslint-disable-next-line max-len
      mockEdgeClusterList2.data[1].highAvailabilityMode = ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY

      mockServer.use(
        rest.post(
          EdgeUrlsInfo.getEdgeClusterStatusList.url,
          (req, res, ctx) => res(ctx.json(mockEdgeClusterList2))
        ))


      const { result: { current: [formRef] } } = renderHook(() => Form.useForm())
      jest.spyOn(formRef, 'setFieldValue').mockImplementation(jest.fn())
      renderEdgeSettingForm(formRef)
      const venueSelect = await screen.findByRole('combobox', { name: 'Venue' })
      // eslint-disable-next-line max-len
      await userEvent.selectOptions(venueSelect, await screen.findByText(mockVenueOptions.data[1].name))

      const clusterSelect = screen.getByRole('combobox', { name: 'Cluster' })
      // eslint-disable-next-line max-len
      await userEvent.selectOptions(clusterSelect, await screen.findByText(mockEdgeClusterList2.data[1].name))
      // clear selection
      // eslint-disable-next-line max-len
      await userEvent.selectOptions(clusterSelect, await screen.findByRole('option', { name: 'Select...' }))
      expect(formRef.setFieldValue).toBeCalledWith('highAvailabilityMode', 'ACTIVE_ACTIVE' )
      await waitFor(() => {
        expect(screen.getByTestId('HaModeRadioGroupFormItem')).toHaveTextContent('false')
      })

    })

    it('should greyout HA mode radio when cluster is selected', async () => {
      renderEdgeSettingForm()

      const clusterSelect = await screen.findByRole('combobox', { name: 'Cluster' })
      await waitFor(() => {
        expect(screen.getByText(mockEdgeClusterList.data[1].name)).toBeInTheDocument()
      })

      await userEvent.selectOptions(clusterSelect, mockEdgeClusterList.data[1].name)
      const haModeRadioGroup = screen.getByTestId('HaModeRadioGroupFormItem')
      expect(haModeRadioGroup).toBeVisible()
      await waitFor(() => expect(haModeRadioGroup).toHaveTextContent('true'))
    })

    it('should not render radio selector when PIN enhance is disabled', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      renderEdgeSettingForm()
      expect(screen.queryByTestId('HaModeRadioGroupFormItem')).toBeNull()
    })
  })

  function mockHaAaEnabled () {
    jest.mocked(useIsEdgeFeatureReady).mockImplementation((feature) =>
      feature === Features.EDGE_HA_AA_TOGGLE || feature === Features.EDGE_HA_TOGGLE)
  }

  function renderEdgeSettingForm (formRef: FormInstance) {
    render(
      <Provider>
        <StepsForm form={formRef}>
          <StepsForm.StepForm>
            <EdgeSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/add' }
      })
  }
})