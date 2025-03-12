/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import _         from 'lodash'
import { rest }  from 'msw'

import { StepsForm, StepsFormProps } from '@acx-ui/components'
import { useIsSplitOn }              from '@acx-ui/feature-toggle'
import {
  EdgeCompatibilityFixtures,
  EdgeGeneralFixtures,
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  renderHook,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { ScopeForm } from '.'

const { mockEdgeClusterList, mockEdgeList } = EdgeGeneralFixtures
const { mockEdgeFeatureCompatibilities } = EdgeCompatibilityFixtures

const mockedSetFieldValue = jest.fn()
const { click } = userEvent

const useMockedFormHook = (initData: Record<string, unknown>) => {
  const [ form ] = Form.useForm()
  form.setFieldsValue({
    ...initData
  })
  return form
}

const MockedTargetComponent = (props: Partial<StepsFormProps>) => {
  return <Provider>
    <StepsForm form={props.form} editMode={props.editMode} >
      <ScopeForm />
    </StepsForm>
  </Provider>
}

const modifiedMockEdgeList = {
  ...mockEdgeList,
  data: mockEdgeList.data.map(edge => ({ ...edge, clusterId: edge.clusterId.replace('cluster-', 'clusterId_') }))
}

describe('HQoS Scope Form', () => {

  const mockEdgeClusterListForHqos = _.cloneDeep(mockEdgeClusterList)
  mockEdgeClusterListForHqos.data[0].edgeList.forEach(e => e.cpuCores = 4)
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockedSetFieldValue.mockReset()
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeClusterListForHqos))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(modifiedMockEdgeList))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_, res, ctx) => res(ctx.json(mockEdgeFeatureCompatibilities)))
    )
  })

  it('should correctly render', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={false}
    />, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    await screen.findByText(/Activate clusters that the HQoS bandwidth profile will be applied/i)

    expect(screen.getByRole('columnheader', { name: /Cluster/i })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: /Venue/i })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: /APs/i })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: /Activate/i })).toBeTruthy()

    const rows = await screen.findAllByRole('row', { name: /Edge Cluster/i })

    await waitFor(()=>{
      expect(rows.length).toBe(mockEdgeClusterListForHqos.data.length)
    })

    expect(within(rows[1]).getByRole('cell', { name: /Edge Cluster /i })).toBeVisible()
    const switchBtn = within(rows[1]).getByRole('switch')
    expect(switchBtn).toBeDisabled()
  })


  it('should correctly render in edit mode', async () => {
    const mockActivateChangedClusters = { clusterId_1: true, clusterId_2: true }
    const { result: stepFormRef } = renderHook(() => useMockedFormHook({
      activateChangedClusters: mockActivateChangedClusters }))

    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={true}
    />, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    await screen.findByText(/Activate clusters that the HQoS bandwidth profile will be applied/i)

    const rows = await screen.findAllByRole('row', { name: /Edge Cluster/i })
    await waitFor(()=>{
      expect(rows.length).toBe(mockEdgeClusterListForHqos.data.length)
    })

    expect(within(rows[0]).getByRole('cell', { name: /Edge Cluster 1/i })).toBeVisible()
    const switchBtn = within(rows[0]).getByRole('switch')
    expect(switchBtn).not.toBeDisabled()
    expect(switchBtn).toBeChecked()
    expect(within(rows[0]).getByText('1000')).toBeVisible()

    expect(within(rows[0]).getByRole('cell', { name: /Edge Cluster 1/i })).toBeVisible()
    const switchBtn2 = within(rows[0]).getByRole('switch')
    expect(switchBtn2).toBeChecked()
  })

  it('should correctly activate by switcher', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue = mockedSetFieldValue
      return form
    })
    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={false}
    />, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    await screen.findByText(/Activate clusters that the HQoS bandwidth profile will be applied/i)

    const rows = await screen.findAllByRole('row', { name: /Edge Cluster/i })
    await waitFor(()=>{
      expect(rows.length).toBe(mockEdgeClusterListForHqos.data.length)
    })

    expect(within(rows[0]).getByRole('cell', { name: /Edge Cluster 1/i })).toBeVisible()
    await click(within(rows[0]).getByRole('switch'))

    expect(mockedSetFieldValue).toBeCalledWith('activateChangedClustersInfo',
      { clusterId_1: { venueId: 'mock_venue_1', clusterName: 'Edge Cluster 1' } })
  })

  it('should show incompatible warning', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue = mockedSetFieldValue
      return form
    })
    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={false}
    />, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    await screen.findByText(/Activate clusters that the HQoS bandwidth profile will be applied/i)

    const rows = await screen.findAllByRole('row', { name: /Edge Cluster/i })
    expect(rows.length).toBe(mockEdgeClusterListForHqos.data.length)

    const warningTooltip = await within(rows[0]).findByTestId('WarningTriangleSolid')
    await userEvent.hover(warningTooltip)
    expect(await screen.findByText(/HQoS feature requires your RUCKUS Edge cluster/i)).toBeInTheDocument()
  })
})
