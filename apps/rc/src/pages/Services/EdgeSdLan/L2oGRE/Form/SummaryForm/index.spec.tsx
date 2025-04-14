import { Form } from 'antd'
import { rest } from 'msw'

import { StepsForm }                                            from '@acx-ui/components'
import {  CommonUrlsInfo, EdgeMvSdLanFormModel, VenueFixtures } from '@acx-ui/rc/utils'
import { Provider }                                             from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { SummaryForm } from '.'

const { mockVenueList } = VenueFixtures

describe('Summary form', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockVenueList)))
    )
  })

  it('should correctly display', async () => {
    const mockedData = {
      id: '',
      name: 'testSdLanData',
      edgeClusterName: 'Smart Edge 2',
      tunnelProfileId: 'tunnelProfileId2',
      tunnelProfileName: 'tunnelProfile2',
      activatedNetworks: {
        a307d7077410456f8f1a4fc41d861567: [{
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
    await screen.findByText('Mocked-Venue-1 (1 network)')
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
    expect(screen.getByText('Venues & Networks (0)')).not.toBeNull()
  })
})
