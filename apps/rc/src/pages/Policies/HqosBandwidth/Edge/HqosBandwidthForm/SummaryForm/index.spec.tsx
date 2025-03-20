import { Form } from 'antd'

import { StepsForm }         from '@acx-ui/components'
import {
  EdgeHqosProfileFixtures
} from '@acx-ui/rc/utils'
import {
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { HqosBandwidthFormModel } from '..'

import { SummaryForm } from '.'

const { mockEdgeHqosProfileStatusList } = EdgeHqosProfileFixtures

describe('HQoS Summary form', () => {
  it('should correctly display', async () => {
    const mockQos = mockEdgeHqosProfileStatusList.data[1]
    const mockedData = {
      id: '',
      name: mockQos.name,
      description: mockQos.description,
      trafficClassSettings: mockQos.trafficClassSettings
    } as HqosBandwidthFormModel

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockedData)
      return form
    })

    render(<StepsForm form={stepFormRef.current}>
      <SummaryForm />
    </StepsForm>)
    await screen.findByRole('cell', { name: /Test-QoS-/i })
    await screen.findByRole('cell', { name: mockQos.description })
    await screen.findAllByRole('cell', { name: /Best effort/i })
    expect(screen.getByText('Clusters (0)')).not.toBeNull()
  })

  it('should correctly display and activate edge cluster', async () => {
    const mockQos = mockEdgeHqosProfileStatusList.data[0]
    const mockedData = {
      id: '',
      name: mockQos.name,
      description: mockQos.description,
      trafficClassSettings: mockQos.trafficClassSettings,
      activateChangedClusters: { [mockQos.edgeClusterIds[0]]: true },
      activateChangedClustersInfo: { [mockQos.edgeClusterIds[0]]:
        { clusterName: 'cluster', venueId: 'venue', venueName: 'venue' } }
    } as HqosBandwidthFormModel

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockedData)
      return form
    })

    render(<StepsForm form={stepFormRef.current}>
      <SummaryForm />
    </StepsForm>)
    await screen.findByRole('cell', { name: /Test-QoS-/i })
    await screen.findByRole('cell', { name: mockQos.description })
    await screen.findAllByRole('cell', { name: /VIDEO/i })
    expect(screen.getByText('Clusters (1)')).not.toBeNull()
  })
})
