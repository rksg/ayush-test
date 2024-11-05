import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm, StepsFormProps } from '@acx-ui/components'
import {
  CommonUrlsInfo,
  EdgeGeneralFixtures,
  EdgeMdnsFixtures,
  EdgeMdnsProxyViewData,
  EdgeUrlsInfo,
  VenueFixtures
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  within
} from '@acx-ui/test-utils'

import { ScopeForm } from '.'

const { mockVenueOptions } = VenueFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockEdgeMdnsViewDataList } = EdgeMdnsFixtures
const originData = mockEdgeMdnsViewDataList[0]

// eslint-disable-next-line max-len
type MockedTargetComponentType = Pick<StepsFormProps, 'form'>
const MockedTargetComponent = (props: MockedTargetComponentType) => {
  const { form } = props
  return <Provider>
    <StepsForm form={form}>
      <ScopeForm />
    </StepsForm>
  </Provider>
}

const useMockedFrom = (data?: EdgeMdnsProxyViewData) => {
  const [ form ] = Form.useForm()
  form.setFieldsValue(data ?? originData)
  return form
}

describe('EdgeMdnsProxyForm: scope', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockVenueOptions))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ))
  })

  it('should render correctly', async () => {
    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent form={stepFormRef.current} />)

    const formBody = await checkBasicSettings()
    const row1 = within(formBody).getByRole('row', { name: /Mock Venue 1/ })
    within(formBody).getByRole('row', { name: /Mock Venue 2 TestCountry2, TestCity2 0/ })
    within(formBody).getByRole('row', { name: /Mock Venue 3 TestCountry3, TestCity3 1/ })

    await userEvent.click(within(row1).getByRole('radio'))
    // eslint-disable-next-line max-len
    await userEvent.click(await within(formBody).findByRole('button', { name: 'Select RUCKUS Edge clusters' }))
    const dialog = await screen.findByRole('dialog')

    const clusterRow = await within(dialog).findByRole('row', { name: /Edge Cluster 1/ })
    expect(within(clusterRow).getByRole('switch')).toBeChecked()
  })

  it('should correctly deactivate into empty', async () => {
    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent form={stepFormRef.current} />)

    const formBody = await checkBasicSettings()
    const row = within(formBody).getByRole('row', { name: /Mock Venue 1/ })
    await userEvent.click(within(row).getByRole('radio'))
    // eslint-disable-next-line max-len
    await userEvent.click(await within(formBody).findByRole('button', { name: 'Select RUCKUS Edge clusters' }))
    const dialog = await screen.findByRole('dialog')

    const clusterRow = await within(dialog).findByRole('row', { name: /Edge Cluster 1/ })
    const switchBtn = await within(clusterRow).findByRole('switch')
    expect(switchBtn).toBeChecked()
    await userEvent.click(switchBtn)

    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }))

    expect(stepFormRef.current.getFieldValue('activations')).toStrictEqual([{
      venueId: 'mock_venue_3',
      venueName: 'Mock Venue 3',
      edgeClusterId: 'clusterId_3',
      edgeClusterName: 'Edge Cluster 3'
    }])
  })

  it('should correctly deactivate and activate', async () => {
    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent form={stepFormRef.current} />)

    const formBody = await checkBasicSettings()
    const row = within(formBody).getByRole('row', { name: /Mock Venue 1/ })
    await userEvent.click(within(row).getByRole('radio'))
    // eslint-disable-next-line max-len
    await userEvent.click(await within(formBody).findByRole('button', { name: 'Select RUCKUS Edge clusters' }))
    const dialog = await screen.findByRole('dialog')

    const cluster1Row = await within(dialog).findByRole('row', { name: /Edge Cluster 1/ })
    const switchBtn1 = within(cluster1Row).getByRole('switch')
    expect(switchBtn1).toBeChecked()
    // deactivate
    await userEvent.click(switchBtn1)

    const cluster2Row = await within(dialog).findByRole('row', { name: /Edge Cluster 2/ })
    const switchBtn2 = within(cluster2Row).getByRole('switch')
    expect(switchBtn2).not.toBeChecked()
    // activate
    await userEvent.click(switchBtn2)

    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }))

    expect(stepFormRef.current.getFieldValue('activations')).toStrictEqual([{
      venueId: 'mock_venue_3',
      venueName: 'Mock Venue 3',
      edgeClusterId: 'clusterId_3',
      edgeClusterName: 'Edge Cluster 3'
    }, {
      venueId: 'mock_venue_1',
      venueName: 'Mock Venue 1',
      edgeClusterId: 'clusterId_2',
      edgeClusterName: 'Edge Cluster 2'
    }])
  })

  it('should do nothing when no cluster selected', async () => {
    const { result: stepFormRef } = renderHook(() => useMockedFrom({}))
    render(<MockedTargetComponent form={stepFormRef.current} />)

    const formBody = await screen.findByTestId('steps-form-body')
    // eslint-disable-next-line max-len
    const row = await within(formBody).findByRole('row', { name: /Mock Venue 1 TestCountry1, TestCity1 0/ })
    await userEvent.click(within(row).getByRole('radio'))
    // eslint-disable-next-line max-len
    await userEvent.click(await within(formBody).findByRole('button', { name: 'Select RUCKUS Edge clusters' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }))

    expect(stepFormRef.current.getFieldValue('activations')).toStrictEqual(undefined)
  })
})

const checkBasicSettings = async () => {
  const formBody = await screen.findByTestId('steps-form-body')
  await within(formBody).findByRole('row', { name: /Mock Venue 1 TestCountry1, TestCity1 1/ })
  return formBody
}