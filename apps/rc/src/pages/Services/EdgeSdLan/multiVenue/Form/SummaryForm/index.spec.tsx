import { Form } from 'antd'
import { rest } from 'msw'

import { StepsForm }                             from '@acx-ui/components'
import {  CommonUrlsInfo, EdgeMvSdLanFormModel } from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { mockedVenueList } from '../../__tests__/fixtures'

import { SummaryForm } from '.'

describe('Summary form', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockedVenueList)))
    )
  })

  it('should correctly display', async () => {
    const mockedData = {
      id: '',
      name: 'testSdLanData',
      venueId: 'venue_00002',
      edgeClusterId: '0000000002',
      edgeClusterName: 'Smart Edge 2',
      networks: { venue_00002: ['network_1'] },
      tunnelProfileId: 'tunnelProfileId2',
      tunnelProfileName: 'tunnelProfile2',
      activatedNetworks: {
        venue_00002: [{
          name: 'MockedNetwork 1',
          id: 'network_1'
        }]
      }
    } as unknown as EdgeMvSdLanFormModel

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockedData)
      return form
    })

    render(<Provider>
      <StepsForm form={stepFormRef.current}>
        <SummaryForm />
      </StepsForm>
    </Provider>)
    await screen.findByRole('cell', { name: /testSdLanData/i })
    await screen.findByRole('cell', { name: /Smart Edge 2/i })
    await screen.findByRole('cell', { name: /tunnelProfile2/i })
    await screen.findByText('Off')
    await screen.findByText('airport (1 network)')
    expect(screen.getByText('Venues & Networks (1)')).not.toBeNull()
  })

  it('should correctly display when activatedNetworks not defined.', async () => {
    const mockedData_noNetworks = {
      id: '',
      name: 'testSdLanData2',
      venueId: 'venue_00002',
      edgeClusterId: '0000000002',
      edgeClusterName: 'Smart Edge 2',
      networks: { venue_00002: ['network_1'] },
      tunnelProfileId: 'tunnelProfileId1',
      tunnelProfileName: 'tunnelProfile1',
      activatedNetworks: undefined
    }

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockedData_noNetworks)
      return form
    })

    render(<Provider>
      <StepsForm form={stepFormRef.current}>
        <SummaryForm />
      </StepsForm>
    </Provider>)
    await screen.findByRole('cell', { name: /testSdLanData2/i })
    await screen.findByRole('cell', { name: /Smart Edge 2/i })
    await screen.findByRole('cell', { name: /tunnelProfile1/i })
    await screen.findByText('Off')
    expect(screen.getByText('Venues & Networks (0)')).not.toBeNull()
  })

  it('should correctly display when DMZ enabled', async () => {
    const mockedDMZData = {
      name: 'testSdLanDmzData',
      venueId: 'venue_00003',
      edgeClusterId: '0000000003',
      edgeClusterName: 'Smart Edge 3',
      tunnelProfileId: 'tunnelProfileId2',
      tunnelProfileName: 'tunnelProfile2',
      activatedNetworks: {
        venue_00003: [{
          name: 'MockedNetwork 2',
          id: 'network_2'
        }, {
          name: 'MockedNetwork 4',
          id: 'network_4'
        }]
      },
      isGuestTunnelEnabled: true,
      guestEdgeClusterId: '0000000005',
      guestEdgeClusterName: 'Smart Edge 5',
      guestTunnelProfileId: 'tunnelProfileId1',
      guestTunnelProfileName: 'tunnelProfile1',
      activatedGuestNetworks: {
        venue_00003: [{
          name: 'MockedNetwork 4',
          id: 'network_4'
        }]
      }
    }

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockedDMZData)
      return form
    })

    render(<Provider>
      <StepsForm form={stepFormRef.current}>
        <SummaryForm />
      </StepsForm>
    </Provider>)

    await screen.findByRole('cell', { name: /testSdLanDmzData/i })
    await screen.findByRole('cell', { name: /Smart Edge 3/i })
    await screen.findByRole('cell', { name: /tunnelProfile2/i })
    await screen.findByText('On')
    await screen.findByText('DMZ Cluster')
    await screen.findByRole('cell', { name: /Smart Edge 5/i })
    await screen.findByText('Tunnel Profile (Cluster- DMZ Cluster tunnel)')
    await screen.findByRole('cell', { name: /tunnelProfile1/i })
    await screen.findByText('MockedVenue 1 (2 networks)')
    expect(screen.getByText('Venues & Networks (1)')).not.toBeNull()
  })
})
