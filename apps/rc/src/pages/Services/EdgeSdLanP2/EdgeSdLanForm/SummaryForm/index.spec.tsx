import { Form } from 'antd'

import { StepsForm } from '@acx-ui/components'
import {
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { EdgeSdLanFormModel } from '..'

import { SummaryForm } from '.'

describe('Summary form', () => {
  it('should correctly display', async () => {
    const mockedData = {
      id: '',
      name: 'testSdLanData',
      venueId: 'venue_00002',
      venueName: 'airport',
      edgeId: '0000000002',
      edgeName: 'Smart Edge 2',
      corePortMac: 'p2',
      networkIds: ['network_1'],
      tunnelProfileId: 'tunnelProfileId2',
      tunnelProfileName: 'tunnelProfile2',
      corePortName: 'Port2',
      activatedNetworks: [{
        name: 'MockedNetwork 1',
        id: 'network_1'
      }]
    } as EdgeSdLanFormModel

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockedData)
      return form
    })

    render(<StepsForm form={stepFormRef.current}>
      <SummaryForm />
    </StepsForm>)
    await screen.findByRole('cell', { name: /testSdLanData/i })
    await screen.findByRole('cell', { name: /airport/i })
    await screen.findByRole('cell', { name: /Smart Edge 2/i })
    await screen.findByRole('cell', { name: /tunnelProfile2/i })
    expect(screen.getByText('Networks (1)')).not.toBeNull()
  })

  it('should correctly display when activatedNetworks not defined.', async () => {
    const mockedData_noNetworks = {
      id: '',
      name: 'testSdLanData2',
      venueId: 'venue_00002',
      venueName: 'airport',
      edgeId: '0000000002',
      edgeName: 'Smart Edge 2',
      corePortMac: 'p2',
      networkIds: ['network_1'],
      tunnelProfileId: 'tunnelProfileId1',
      tunnelProfileName: 'tunnelProfile1',
      corePortName: 'Port3',
      activatedNetworks: undefined
    }

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockedData_noNetworks)
      return form
    })

    render(<StepsForm form={stepFormRef.current}>
      <SummaryForm />
    </StepsForm>)
    await screen.findByRole('cell', { name: /testSdLanData2/i })
    await screen.findByRole('cell', { name: /airport/i })
    await screen.findByRole('cell', { name: /Smart Edge 2/i })
    await screen.findByRole('cell', { name: /tunnelProfile1/i })
    expect(screen.getByText('Networks (0)')).not.toBeNull()
  })
})
