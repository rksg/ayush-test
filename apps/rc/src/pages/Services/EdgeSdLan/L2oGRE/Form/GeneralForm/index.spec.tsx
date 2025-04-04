import userEvent          from '@testing-library/user-event'
import { Form }           from 'antd'
import { cloneDeep, get } from 'lodash'
import { rest }           from 'msw'

import { StepsForm, StepsFormProps } from '@acx-ui/components'
import { edgeApi }                   from '@acx-ui/rc/services'
import {
  ClusterHighAvailabilityModeEnum,
  EdgeCompatibilityFixtures,
  EdgeGeneralFixtures,
  EdgeSdLanFixtures,
  EdgeTunnelProfileFixtures,
  EdgeUrlsInfo,
  TunnelProfileViewData
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { EdgeSdLanContext, EdgeSdLanContextType } from '../EdgeSdLanContextProvider'

import { GeneralForm } from '.'

const { mockEdgeFeatureCompatibilities } = EdgeCompatibilityFixtures
const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockEdgeList } = EdgeGeneralFixtures
const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures
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
  allPins: [],
  availableTunnelProfiles: mockedTunnelProfileViewData.data as unknown as TunnelProfileViewData[]
} as EdgeSdLanContextType

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useHelpPageLink: () => ''
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
        <GeneralForm />
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

const tenantId = 'mock_tenantId'
describe('Edge SD-LAN form: General', () => {
  beforeEach(() => {
    mockedSetFieldsValue.mockClear()

    store.dispatch(edgeApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => {
          return res(ctx.json(mockEdgeClusterList))
        }
      ),
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
  })

  it('should render correctly', async () => {
    render(<MockedTargetComponent />)

    expect(screen.getByRole('textbox', { name: 'Service Name' })).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByRole('combobox', { name: 'Tunnel Profile (AP to Cluster)' })).toBeInTheDocument()
  })

  // eslint-disable-next-line max-len
  it('should show cluster name and compatible warning when selecting a tunnel profile', async () => {
    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent form={stepFormRef.current} />, {
      route: { params: { tenantId }, path: '/:tenantId' }
    })

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Tunnel Profile (AP to Cluster)' }),
      'tunnelProfileId1'
    )
    expect(await screen.findByText('Destination RUCKUS Edge cluster')).toBeVisible()
    expect(await screen.findByText('EdgeCluster1')).toBeVisible()
    expect(mockedSetFieldsValue).toBeCalledWith({
      edgeClusterName: 'EdgeCluster1',
      tunnelProfileName: 'tunnelProfile1'
    })

    await screen.findByText('Cluster Firmware Version: 1.9.0.100')
    const fwWarningIcon = await screen.findByTestId('WarningTriangleSolid')
    await userEvent.hover(fwWarningIcon)
    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('2.1.0.600')
  })
})
