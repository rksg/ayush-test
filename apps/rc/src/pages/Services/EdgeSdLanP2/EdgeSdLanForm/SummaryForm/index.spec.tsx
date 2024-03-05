import { Form } from 'antd'

import { StepsForm } from '@acx-ui/components'
import {
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { EdgeSdLanFormModelP2 } from '..'

import { SummaryForm } from '.'

describe('Summary form', () => {
  it('should correctly display', async () => {
    const mockedData = {
      id: '',
      name: 'testSdLanData',
      venueId: 'venue_00002',
      venueName: 'airport',
      edgeClusterId: '0000000002',
      edgeClusterName: 'Smart Edge 2',
      networkIds: ['network_1'],
      tunnelProfileId: 'tunnelProfileId2',
      tunnelProfileName: 'tunnelProfile2',
      activatedNetworks: [{
        name: 'MockedNetwork 1',
        id: 'network_1'
      }]
    } as EdgeSdLanFormModelP2

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
    await screen.findByText('Off')
    expect(screen.getByText('Networks (1)')).not.toBeNull()
  })

  it('should correctly display when activatedNetworks not defined.', async () => {
    const mockedData_noNetworks = {
      id: '',
      name: 'testSdLanData2',
      venueId: 'venue_00002',
      venueName: 'airport',
      edgeClusterId: '0000000002',
      edgeClusterName: 'Smart Edge 2',
      networkIds: ['network_1'],
      tunnelProfileId: 'tunnelProfileId1',
      tunnelProfileName: 'tunnelProfile1',
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
    await screen.findByText('Off')
    expect(screen.getByText('Networks (0)')).not.toBeNull()
  })

  it('should correctly display when DMZ enabled', async () => {
    const mockedDMZData = {
      name: 'testSdLanDmzData',
      venueId: 'venue_00003',
      venueName: 'campus',
      edgeClusterId: '0000000003',
      edgeClusterName: 'Smart Edge 3',
      tunnelProfileId: 'tunnelProfileId2',
      tunnelProfileName: 'tunnelProfile2',
      activatedNetworks: [{
        name: 'MockedNetwork 2',
        id: 'network_2'
      }, {
        name: 'MockedNetwork 4',
        id: 'network_4'
      }],
      isGuestTunnelEnabled: true,
      guestEdgeClusterId: '0000000005',
      guestEdgeClusterName: 'Smart Edge 5',
      guestTunnelProfileId: 'tunnelProfileId1',
      guestTunnelProfileName: 'tunnelProfile1',
      activatedGuestNetworks: [{
        name: 'MockedNetwork 4',
        id: 'network_4'
      }]
    }

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockedDMZData)
      return form
    })

    render(<StepsForm form={stepFormRef.current}>
      <SummaryForm />
    </StepsForm>)

    await screen.findByRole('cell', { name: /testSdLanDmzData/i })
    await screen.findByRole('cell', { name: /campus/i })
    await screen.findByRole('cell', { name: /Smart Edge 3/i })
    await screen.findByRole('cell', { name: /tunnelProfile2/i })
    await screen.findByText('On')
    await screen.findByText('DMZ Cluster')
    await screen.findByRole('cell', { name: /Smart Edge 5/i })
    await screen.findByText('Tunnel Profile (Cluster- DMZ Cluster tunnel)')
    await screen.findByRole('cell', { name: /tunnelProfile1/i })
    expect(screen.getByText('Networks (2)')).not.toBeNull()
  })
})
