/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm }        from '@acx-ui/components'
import {
  EdgeNSGFixtures,
  NetworkSegmentationUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import {
  mockContextData,
  webAuthList
} from '../../__tests__/fixtures'
import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { SummaryForm } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

const mockedFinishFn = jest.fn()
const mockedGetVenueName = jest.fn()
mockedGetVenueName.mockReturnValue('venueName')
const mockedGetEdgeName = jest.fn()
mockedGetEdgeName.mockReturnValue('edgeName')
const mockedGetDhcpName = jest.fn()
mockedGetDhcpName.mockReturnValue('dhcpName')
const mockedGetDhcpPoolName = jest.fn()
mockedGetDhcpPoolName.mockReturnValue('dhcpPoolName')
const mockedGetTunnelProfileName = jest.fn()
mockedGetTunnelProfileName.mockReturnValue('tunnelProfileName')
const mockedGetNetworksName = jest.fn()
mockedGetNetworksName.mockReturnValue(['network 1', 'network 2'])
const createNsgPath = '/:tenantId/services/personalIdentityNetwork/create'
const { mockNsgSwitchInfoData } = EdgeNSGFixtures

describe('PersonalIdentityNetworkForm - SummaryForm', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({ data: webAuthList }))
      )
    )
  })

  it('should render correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue({
        name: 'testNsgName',
        venueId: 'venueId',
        edgeId: 'edgeId',
        segments: 10,
        devices: 10,
        dhcpId: 'dhcpId',
        poolId: 'poolId',
        vxlanTunnelProfileId: 'vxlanTunnelProfileId',
        networkIds: ['testDpsk1', 'testDpsk2'],
        distributionSwitchInfos: mockNsgSwitchInfoData.distributionSwitches,
        accessSwitchInfos: mockNsgSwitchInfoData.accessSwitches
      })
      return form
    })
    const user = userEvent.setup()
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={{
            ...mockContextData,
            getVenueName: mockedGetVenueName,
            getEdgeName: mockedGetEdgeName,
            getDhcpName: mockedGetDhcpName,
            getDhcpPoolName: mockedGetDhcpPoolName,
            getTunnelProfileName: mockedGetTunnelProfileName,
            getNetworksName: mockedGetNetworksName
          }}
        >
          <StepsForm form={formRef.current} onFinish={mockedFinishFn}>
            <StepsForm.StepForm>
              <SummaryForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createNsgPath } })
    expect(await screen.findByText('testNsgName')).toBeVisible()
    expect(mockedGetVenueName).toBeCalledWith('venueId')
    expect(mockedGetEdgeName).toBeCalledWith('edgeId')
    expect(mockedGetDhcpName).toBeCalledWith('dhcpId')
    expect(mockedGetDhcpPoolName).toBeCalledWith('dhcpId', 'poolId')
    expect(mockedGetTunnelProfileName).toBeCalledWith('vxlanTunnelProfileId')
    expect(await screen.findByText('venueName')).toBeVisible()
    expect(await screen.findByText('edgeName')).toBeVisible()
    expect(await screen.findByText('dhcpName')).toBeVisible()
    expect(await screen.findByText('dhcpPoolName')).toBeVisible()
    expect(await screen.findByText('tunnelProfileName')).toBeVisible()
    expect(await screen.findByText('network 1')).toBeVisible()
    expect(await screen.findByText('network 2')).toBeVisible()
    expect(mockedGetNetworksName).toBeCalledWith(['testDpsk1', 'testDpsk2'])
    await user.click(await screen.findByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(mockedFinishFn).toBeCalled()
    })
  })
})
