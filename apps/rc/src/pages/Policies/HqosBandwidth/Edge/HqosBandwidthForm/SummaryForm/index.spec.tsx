import { Form } from 'antd'

import { StepsForm }       from '@acx-ui/components'
import {
  EdgeQosProfileFixtures
} from '@acx-ui/rc/utils'
import {
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { QosBandwidthFormModel } from '..'

import { SummaryForm } from '.'

const { mockEdgeQosProfileStatusList } = EdgeQosProfileFixtures

describe('QoS Summary form', () => {
  it('should correctly display', async () => {
    const mockQos = mockEdgeQosProfileStatusList.data[1]
    const mockedData = {
      id: '',
      name: mockQos.name,
      description: mockQos.description,
      trafficClassSettings: mockQos.trafficClassSettings
    } as QosBandwidthFormModel

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
    const mockQos = mockEdgeQosProfileStatusList.data[0]
    const mockedData = {
      id: '',
      name: mockQos.name,
      description: mockQos.description,
      trafficClassSettings: mockQos.trafficClassSettings,
      activateChangedClusters: { [mockQos.edgeClusterIds[0]]: true },
      activateChangedClustersInfo: { [mockQos.edgeClusterIds[0]]:
        { clusterName: 'cluster', venueId: 'venue', venueName: 'venue' } }
    } as QosBandwidthFormModel

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
