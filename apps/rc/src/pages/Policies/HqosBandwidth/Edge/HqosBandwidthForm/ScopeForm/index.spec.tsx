/* eslint-disable max-len */
import {
  renderHook,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm, StepsFormProps } from '@acx-ui/components'
import {
  EdgeGeneralFixtures,
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { ScopeForm } from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures

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

describe('HQoS Scope Form', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockReset()
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      )
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
      expect(rows.length).toBe(mockEdgeClusterList.data.length)
    })
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
      expect(rows.length).toBe(mockEdgeClusterList.data.length)
    })

    expect(within(rows[0]).getByRole('cell', { name: /Edge Cluster 1/i })).toBeVisible()
    const switchBtn = within(rows[0]).getByRole('switch')
    expect(switchBtn).toBeChecked()

    expect(within(rows[1]).getByRole('cell', { name: /Edge Cluster 2/i })).toBeVisible()
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
      expect(rows.length).toBe(mockEdgeClusterList.data.length)
    })

    expect(within(rows[0]).getByRole('cell', { name: /Edge Cluster 1/i })).toBeVisible()
    await click(within(rows[0]).getByRole('switch'))

    expect(mockedSetFieldValue).toBeCalledWith('activateChangedClustersInfo',
      { clusterId_1: { venueId: 'mock_venue_1', clusterName: 'Edge Cluster 1' } })
  })

})
