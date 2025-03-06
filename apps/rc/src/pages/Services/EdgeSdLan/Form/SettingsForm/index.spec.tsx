import userEvent          from '@testing-library/user-event'
import { Form }           from 'antd'
import { cloneDeep, get } from 'lodash'
import { rest }           from 'msw'

import { StepsForm, StepsFormProps } from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }     from '@acx-ui/rc/components'
import { edgeApi }                   from '@acx-ui/rc/services'
import {
  ClusterHighAvailabilityModeEnum,
  EdgeGeneralFixtures,
  EdgeSdLanFixtures,
  EdgeCompatibilityFixtures,
  EdgeUrlsInfo,
  EdgePinFixtures } from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { EdgeSdLanContext, EdgeSdLanContextType } from '../EdgeSdLanContextProvider'

import { SettingsForm } from '.'

const { mockEdgeFeatureCompatibilities } = EdgeCompatibilityFixtures
const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockPinListForMutullyExclusive } = EdgePinFixtures
const { mockEdgeList } = EdgeGeneralFixtures
const mockEdgeClusterList = cloneDeep(EdgeGeneralFixtures.mockEdgeClusterList)
mockEdgeClusterList.data[4].highAvailabilityMode = ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    options,
    loading,
    ...props
  }: React.PropsWithChildren<{
    options: Array<{ label: string, value: unknown }>,
    loading: boolean,
    onChange?: (value: string) => void }>) => {
    return (loading
      ? <div role='img' data-testid='loadingIcon'>Loading</div>
      : <select {...props}
        onChange={(e) => {
          props.onChange?.(e.target.value)}
        }>
        {/* Additional <option> to ensure it is possible to reset value to empty */}
        <option value={undefined}></option>
        {children}
        {options?.map((option, index) => (
          <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
        ))}
      </select>)
  }
  Select.Option = 'option'
  return { ...components, Select }
})

const edgeMvSdlanContextValues = {
  allSdLans: mockedMvSdLanDataList,
  allPins: []
} as EdgeSdLanContextType

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useHelpPageLink: () => ''
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

// eslint-disable-next-line max-len
type MockedTargetComponentType = Pick<StepsFormProps, 'form' | 'editMode'> & {
  ctxValues?: EdgeSdLanContextType
}
const MockedTargetComponent = (props: MockedTargetComponentType) => {
  const { form, editMode, ctxValues } = props
  return <Provider>
    <EdgeSdLanContext.Provider value={ctxValues ?? edgeMvSdlanContextValues}>
      <StepsForm form={form} editMode={editMode}>
        <SettingsForm />
      </StepsForm>
    </EdgeSdLanContext.Provider>
  </Provider>
}

const useMockedFrom = () => {
  const [ form ] = Form.useForm()
  jest.spyOn(form, 'setFieldsValue').mockImplementation(mockedSetFieldsValue)
  return form
}

const mockedSetFieldsValue = jest.fn()
const mockedReqClusterList = jest.fn()

const tenantId = 'mock_tenantId'
describe('Edge SD-LAN form: settings', () => {
  beforeEach(() => {
    mockedSetFieldsValue.mockClear()
    mockedReqClusterList.mockClear()

    store.dispatch(edgeApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => {
          mockedReqClusterList(req.body)
          return res(ctx.json(mockEdgeClusterList))
        }
      )
    )
  })

  it('should render correctly without DMZ enabled', async () => {
    const featureSetsReq = jest.fn()
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_, res, ctx) => {
          featureSetsReq()
          return res(ctx.json({}))
        })
    )

    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent form={stepFormRef.current} />)

    const formBody = await checkBasicSettings()

    // default DMZ is not enabled
    expect(await within(formBody).findByRole('switch')).not.toBeChecked()
    expect(featureSetsReq).toBeCalledTimes(0)
  })

  it('should render correctly with DMZ enabled', async () => {
    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent form={stepFormRef.current} />)

    const formBody = await checkBasicSettings()

    // turn on DMZ
    await userEvent.click(await within(formBody).findByRole('switch'))
    // select DMZ edge
    await userEvent.selectOptions(
      await within(formBody).findByRole('combobox', { name: 'DMZ Cluster' }),
      'clusterId_5')
    expect(mockedSetFieldsValue).toBeCalledWith({
      guestEdgeClusterName: 'Edge Cluster 5',
      guestEdgeClusterVenueId: '0000000005'
    })
  })

  it('Input invalid service name should show error message', async () => {
    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent form={stepFormRef.current} />)

    const formBody = await checkBasicSettings()

    // default DMZ is not enabled
    expect(await within(formBody).findByRole('switch')).not.toBeChecked()

    const nameField = screen.getByRole('textbox', { name: 'Service Name' })
    await userEvent.type(nameField, '``')
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Avoid spaces at the beginning/end, and do not use "`" or "$(" characters.'))
      .toBeVisible()
  })

  // eslint-disable-next-line max-len
  it('should filter out edges which is already bound with a SD-LAN service in create mode', async () => {
    const mockedSdLanDuplicateEdge = [{ ...mockedMvSdLanDataList[0] }]
    mockedSdLanDuplicateEdge[0].edgeClusterId = mockEdgeClusterList.data[4].clusterId

    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent
      form={stepFormRef.current}
      ctxValues={{ allSdLans: mockedSdLanDuplicateEdge, allPins: [] }}
    />)

    const formBody = await screen.findByTestId('steps-form-body')
    await waitForElementToBeRemoved(await within(formBody).findAllByTestId('loadingIcon'))

    await screen.findByText('Cluster')
    await waitFor(() => {
      expect(mockedReqClusterList).toBeCalled()
    })
    expect(screen.queryByRole('option', { name: 'Edge Cluster 5' })).toBeNull()
  })

  it('should filter out edges which is already bound with a PIN in create mode', async () => {
    const mockedPinAlreadyUsedEdge = [{ ...mockPinListForMutullyExclusive.data[0] }]
    // eslint-disable-next-line max-len
    mockedPinAlreadyUsedEdge[0].edgeClusterInfo.edgeClusterId = mockEdgeClusterList.data[4].clusterId

    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent
      form={stepFormRef.current}
      ctxValues={{ allSdLans: [], allPins: mockedPinAlreadyUsedEdge }}
    />)

    const formBody = await screen.findByTestId('steps-form-body')
    await waitForElementToBeRemoved(await within(formBody).findAllByTestId('loadingIcon'))

    await screen.findByText('Cluster')
    await waitFor(() => {
      expect(mockedReqClusterList).toBeCalled()
    })
    expect(screen.queryByRole('option', { name: 'Edge Cluster 5' })).toBeNull()
  })

  it('should be able to configure/change guest cluster', async () => {
    const expectedClusterId = 'clusterId_5'
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue({
        id: 'mocked-sd-lan-2',
        edgeClusterId: expectedClusterId,
        isGuestTunnelEnabled: false
      })
      jest.spyOn(form, 'setFieldsValue').mockImplementation(mockedSetFieldsValue)
      return form
    })

    render(<MockedTargetComponent
      form={stepFormRef.current}
    />)

    const formBody = await screen.findByTestId('steps-form-body')
    const icons = await within(formBody).findAllByTestId('loadingIcon')
    await waitForElementToBeRemoved(icons)
    const dmzToggleBtn = await within(formBody).findByRole('switch')
    // default DMZ is not enabled
    expect(dmzToggleBtn).not.toBeChecked()
    // turn on DMZ
    await userEvent.click(dmzToggleBtn)
    const dmzSelector = await within(formBody).findByRole('combobox', { name: 'DMZ Cluster' })
    expect(dmzSelector).not.toBeDisabled()
    expect(dmzSelector).toBeVisible()
    expect(within(dmzSelector)
      .queryByRole('option', { name: 'Edge Cluster 5' })).toBeNull()
    expect(within(dmzSelector)
      .getByRole('option', { name: 'Edge Cluster 3' })).toBeValid()
  })

  it('should filter cluster used as DC/DMZ cluster', async () => {
    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent form={stepFormRef.current} />)

    const formBody = await checkBasicSettings()

    // turn on DMZ
    await userEvent.click(await within(formBody).findByRole('switch'))
    // select DMZ edge
    await userEvent.selectOptions(
      await within(formBody).findByRole('combobox', { name: 'DMZ Cluster' }),
      'clusterId_5')

    // DMZ cluster won;t be an option for DC cluster
    const dcSelector = await within(formBody).findByRole('combobox', { name: 'Cluster' })
    expect(dcSelector).not.toBeDisabled()
    expect(dcSelector).toBeVisible()
    expect(within(dcSelector)
      .queryByRole('option', { name: 'Edge Cluster 5' })).toBeNull()

    expect(mockedSetFieldsValue).toBeCalledTimes(2)
  })

  it('should filter out AA mode cluster as DMZ options', async () => {
    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent form={stepFormRef.current} />)

    const formBody = await checkBasicSettings()
    const dcSelector = await within(formBody).findByRole('combobox', { name: 'Cluster' })
    // AA mode cluster can be DC cluster
    expect(within(dcSelector)
      .queryByRole('option', { name: 'Edge Cluster 1' })).toBeValid()

    // turn on DMZ
    await userEvent.click(await within(formBody).findByRole('switch'))

    const dmzSelector = await within(formBody).findByRole('combobox', { name: 'DMZ Cluster' })
    // AA mode cluster should not be DMZ cluster
    expect(within(dmzSelector)
      .queryByRole('option', { name: 'Edge Cluster 1' })).toBeNull()

    // select DMZ edge
    await userEvent.selectOptions(dmzSelector, 'clusterId_5')
    expect(mockedSetFieldsValue).toBeCalledWith({
      guestEdgeClusterName: 'Edge Cluster 5',
      guestEdgeClusterVenueId: '0000000005'
    })
  })

  it('should block submit when HA AA mode cluster used to be DMZ cluster', async () => {
    const expectedClusterId = 'clusterId_1'
    const expectedSdLan = mockedMvSdLanDataList[0]
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue({
        ...expectedSdLan,
        id: 'mocked-sd-lan-2',
        edgeClusterId: 'clusterId_2',
        guestEdgeClusterId: expectedClusterId
      })
      jest.spyOn(form, 'setFieldsValue').mockImplementation(mockedSetFieldsValue)
      return form
    })

    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode
    />)

    const formBody = await screen.findByTestId('steps-form-body')
    await waitForElementToBeRemoved(await within(formBody)
      .findAllByTestId('loadingIcon'))
    const dmzCluster = await within(formBody).findByRole('combobox', { name: 'DMZ Cluster' })
    expect(dmzCluster).not.toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    const alerts = await within(formBody).findAllByRole('alert')
    expect(alerts.length).toBe(1)
    expect(alerts[0]).toHaveTextContent('DMZ cluster cannot be active-active mode.')
  })

  it('should be able to use HA AA mode cluster as DMZ cluster when FF on', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_HA_AA_DMZ_TOGGLE)

    const expectedClusterId = 'clusterId_1'
    const expectedSdLan = mockedMvSdLanDataList[0]
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue({
        ...expectedSdLan,
        id: 'mocked-sd-lan-2',
        edgeClusterId: 'clusterId_2',
        guestEdgeClusterId: expectedClusterId
      })
      jest.spyOn(form, 'setFieldsValue').mockImplementation(mockedSetFieldsValue)
      return form
    })

    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode
    />)

    const formBody = await screen.findByTestId('steps-form-body')
    await waitForElementToBeRemoved(await within(formBody)
      .findAllByTestId('loadingIcon'))
    await within(formBody).findByRole('combobox', { name: 'DMZ Cluster' })
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    const alerts = within(formBody).queryAllByRole('alert')
    expect(alerts.length).toBe(0)
  })

  it('should display compatible warning', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_, res, ctx) => res(ctx.json(mockEdgeFeatureCompatibilities))),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => {
          const clusterid = get(req.body, 'filters.clusterId.0')
          const singleNode = {
            data: mockEdgeList.data.slice(0, 1),
            totalCount: 1
          }
          const multiNodes = {
            data: mockEdgeList.data.slice(1, 3),
            totalCount: 2
          }
          return res(ctx.json(clusterid === 'clusterId_2' ? multiNodes : singleNode))
        })
    )

    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent form={stepFormRef.current} />, {
      route: { params: { tenantId }, path: '/:tenantId' }
    })

    const formBody = await checkBasicSettings()

    // show fw info
    await screen.findByText('Cluster Firmware Version: 1.9.0.200')
    const fwWarningIcon = await screen.findByTestId('WarningTriangleSolid')
    await userEvent.hover(fwWarningIcon)
    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('2.1.0.600')

    // turn on DMZ
    await userEvent.click(await within(formBody).findByRole('switch'))

    // select DMZ edge
    await userEvent.selectOptions(
      await within(formBody).findByRole('combobox', { name: 'DMZ Cluster' }),
      'clusterId_5')

    await screen.findByText('Cluster Firmware Version: 1.9.0.100')
    const fwWarningIcons = await screen.findAllByTestId('WarningTriangleSolid')
    expect(fwWarningIcons.length).toBe(2)
    await userEvent.hover(fwWarningIcons[1])
    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('2.1.0.600')
  })

})

const checkBasicSettings = async () => {
  const formBody = await screen.findByTestId('steps-form-body')

  // wait edge options loaded
  await waitForElementToBeRemoved(await within(formBody)
    .findAllByTestId('loadingIcon'))

  // select edge
  await userEvent.selectOptions(
    await within(formBody).findByRole('combobox', { name: 'Cluster' }),
    'clusterId_2')

  // ensure related data to set into form
  expect(mockedSetFieldsValue).toBeCalledWith({
    edgeClusterName: 'Edge Cluster 2',
    venueId: '0000000002'
  })

  return formBody
}