/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm } from '@acx-ui/components'
import {
  EdgePinFixtures,
  EdgePinUrls
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
const mockedGetClusterName = jest.fn()
mockedGetClusterName.mockReturnValue('edgeClusterName')
const mockedGetDhcpName = jest.fn()
mockedGetDhcpName.mockReturnValue('dhcpName')
const mockedGetTunnelProfileName = jest.fn()
mockedGetTunnelProfileName.mockReturnValue('tunnelProfileName')
const mockedGetNetworksName = jest.fn()
mockedGetNetworksName.mockReturnValue(['network 1', 'network 2'])
const createPinPath = '/:tenantId/services/personalIdentityNetwork/create'
const { mockPinSwitchInfoData } = EdgePinFixtures

describe('PersonalIdentityNetworkForm - SummaryForm', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        EdgePinUrls.getWebAuthTemplateList.url,
        (_req, res, ctx) => res(ctx.json({ data: webAuthList }))
      )
    )
  })

  it('should render correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue({
        name: 'testNsgName',
        venueId: 'venueId',
        edgeClusterId: 'edgeId',
        segments: 10,
        devices: 10,
        dhcpId: 'dhcpId',
        poolId: 'poolId',
        poolName: 'DHCP_Pool',
        vxlanTunnelProfileId: 'vxlanTunnelProfileId',
        networkIds: ['testDpsk1', 'testDpsk2'],
        distributionSwitchInfos: mockPinSwitchInfoData.distributionSwitches,
        accessSwitchInfos: mockPinSwitchInfoData.accessSwitches
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
            getClusterName: mockedGetClusterName,
            getDhcpName: mockedGetDhcpName,
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
      { route: { params, path: createPinPath } })
    expect(await screen.findByText('testNsgName')).toBeVisible()
    expect(mockedGetVenueName).toBeCalledWith('venueId')
    expect(mockedGetClusterName).toBeCalledWith('edgeId')
    expect(mockedGetDhcpName).toBeCalledWith('dhcpId')
    expect(mockedGetTunnelProfileName).toBeCalledWith('vxlanTunnelProfileId')
    expect(await screen.findByText('venueName')).toBeVisible()
    expect(await screen.findByText('edgeClusterName')).toBeVisible()
    expect(await screen.findByText('dhcpName')).toBeVisible()
    expect(await screen.findByText('DHCP_Pool')).toBeVisible()
    expect(await screen.findByText('tunnelProfileName')).toBeVisible()
    expect(await screen.findByText('network 1')).toBeVisible()
    expect(await screen.findByText('network 2')).toBeVisible()
    expect(mockedGetNetworksName).toBeCalledWith(['testDpsk1', 'testDpsk2'])
    await user.click(await screen.findByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(mockedFinishFn).toBeCalled()
    })
  })

  it('should show empty info correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue({
        name: 'testEmptyConfigName',
        venueId: 'venueId',
        edgeClusterId: 'edgeId',
        segments: 6,
        devices: 6,
        dhcpId: 'dhcpId',
        poolId: 'poolId',
        poolName: 'DHCP_Pool',
        vxlanTunnelProfileId: 'vxlanTunnelProfileId'
        // networkIds: ['testDpsk1', 'testDpsk2'],
        // distributionSwitchInfos: mockPinSwitchInfoData.distributionSwitches,
        // accessSwitchInfos: mockPinSwitchInfoData.accessSwitches
      })
      return form
    })
    render(
      <PersonalIdentityNetworkFormContext.Provider
        value={{
          ...mockContextData,
          getVenueName: mockedGetVenueName,
          getClusterName: mockedGetClusterName,
          getDhcpName: mockedGetDhcpName,
          getTunnelProfileName: mockedGetTunnelProfileName,
          getNetworksName: mockedGetNetworksName
        }}
      >
        <StepsForm form={formRef.current} onFinish={mockedFinishFn}>
          <StepsForm.StepForm>
            <SummaryForm />
          </StepsForm.StepForm>
        </StepsForm>
      </PersonalIdentityNetworkFormContext.Provider>,
      { route: { params, path: createPinPath } })

    expect(screen.getByText('General Settings')).toBeVisible()
    expect(screen.getAllByText('RUCKUS Edge')[0]).toBeVisible()
    expect(screen.getByText('Distribution Switch (0)')).toBeInTheDocument()
    expect(screen.getByText('Access Switch (0)')).toBeInTheDocument()
    expect(screen.getByText('Wireless Networks (0)')).toBeVisible()
  })
})