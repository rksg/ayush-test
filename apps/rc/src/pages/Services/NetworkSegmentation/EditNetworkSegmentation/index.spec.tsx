/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CatchErrorResponse,
  CommonUrlsInfo,
  DpskUrls,
  EdgeDhcpUrls,
  EdgeUrlsInfo,
  NetworkSegmentationUrls,
  PersonaUrls,
  PropertyUrlsInfo,
  SwitchUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import {
  mockDpsk,
  mockEdgeData,
  mockEdgeDhcpDataList,
  mockNetworkGroup,
  mockNsgData,
  mockNsgSwitchInfoData,
  mockPersonaGroup,
  mockPropertyConfigs,
  mockVenueData,
  mockVenueNetworkData,
  switchLagList,
  switchPortList,
  switchVlanUnion,
  webAuthList
} from '../__tests__/fixtures'
import { afterSubmitMessage } from '../NetworkSegmentationForm'

import EditNetworkSegmentation from '.'

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

const updateNsgPath = '/:tenantId/t/services/networkSegmentation/:serviceId/edit'

describe('Update NetworkSegmentation', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.get(
        NetworkSegmentationUrls.getNetworkSegmentationGroupById.url,
        (req, res, ctx) => res(ctx.json(mockNsgData))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeData))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpByEdgeId.url,
        (req, res, ctx) => res(ctx.status(404))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList))
      ),
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (req, res, ctx) => res(ctx.json(mockVenueNetworkData))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(mockNetworkGroup))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.status(200))
      ),
      rest.post(
        SwitchUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json({ data: switchPortList }))
      ),
      rest.get(
        SwitchUrlsInfo.getSwitchVlanUnion.url,
        (req, res, ctx) => res(ctx.json(switchVlanUnion))
      ),
      rest.get(
        SwitchUrlsInfo.getLagList.url,
        (req, res, ctx) => res(ctx.json(switchLagList))
      ),
      rest.get(
        NetworkSegmentationUrls.getWebAuthTemplate.url,
        (req, res, ctx) => res(ctx.json({ ...webAuthList[0] }))
      ),
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({ data: webAuthList }))
      ),
      rest.put(
        NetworkSegmentationUrls.updateNetworkSegmentationGroup.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        NetworkSegmentationUrls.getAvailableSwitches.url,
        (req, res, ctx) => res(ctx.json({ switchViewList: mockNsgSwitchInfoData.distributionSwitches }))
      ),
      rest.get(
        NetworkSegmentationUrls.getAccessSwitchesByDS.url,
        (req, res, ctx) => res(ctx.json({ switchViewList: mockNsgSwitchInfoData.accessSwitches }))
      ),
      rest.post(
        NetworkSegmentationUrls.validateDistributionSwitchInfo.url,
        (req, res, ctx) => res(ctx.json({ response: { valid: true } }))
      ),
      rest.post(
        NetworkSegmentationUrls.validateAccessSwitchInfo.url,
        (req, res, ctx) => res(ctx.json({ response: { valid: true } }))
      ),
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => res(ctx.json(mockPropertyConfigs))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockDpsk))
      ),
      rest.get(
        NetworkSegmentationUrls.getSwitchInfoByNSGId.url,
        (req, res, ctx) => res(ctx.json(mockNsgSwitchInfoData))
      )
    )
  })

  it('should update networkSegmentation successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditNetworkSegmentation />
      </Provider>, {
        route: { params, path: updateNsgPath }
      })
    // step 1
    expect(await screen.findByRole('table')).toBeVisible()
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 2
    expect(await screen.findByRole('table')).toBeVisible()
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 3
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 4
    await screen.findByRole('row', { name: /FMN4221R00H---DS---3/i })
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 5
    await screen.findByRole('row', { name: /FEK3224R09N---AS---3/i })
    await user.click(await screen.findByRole('button', { name: 'Finish' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/services/list`,
      search: ''
    }))
  })


  it('cancel and go back to device list', async () => {
    const user = userEvent.setup()
    render(<EditNetworkSegmentation />, {
      wrapper: Provider,
      route: { params, path: updateNsgPath }
    })
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/services/list`,
      hash: '',
      search: ''
    })
  })

  it('afterSubmitMessage', async () => {
    const resError = [
      { message: `
      Distribution Switch [c8:03:f5:3a:95:c6, c8:03:f5:3a:95:c7] already has VXLAN config,
      Distribution Switch [c8:03:f5:3a:95:c6] will reboot after set up forwarding profile,
      [forceOverwriteReboot] set true to overwrite config and reboot.` },
      { message: `
      Distribution Switch [c8:03:f5:3a:95:c6] already has VXLAN config,
      [forceOverwriteReboot] set true to overwrite config.` },
      { message: `
      Distribution Switch [c8:03:f5:3a:95:c6] will reboot after set up forwarding profile,
      [forceOverwriteReboot] set true to reboot.` },
      { message: `The Access Switch [c0:c5:20:aa:35:fd] web auth VLAN not exist or uplink port not exist at VLAN,
      please create [WebAuth VLAN] and add uplink port or lag first.` },
      { message: '' }
    ]
    const switches = [
      ...mockNsgSwitchInfoData.distributionSwitches,
      ...mockNsgSwitchInfoData.accessSwitches,
      { id: 'c8:03:f5:3a:95:c8' }
    ]

    const expectMessage= [
      ['Distribution Switch [FMN4221R00H---DS---3, c8:03:f5:3a:95:c7] already has VXLAN config.',
        'Distribution Switch [FMN4221R00H---DS---3] will reboot after set up forwarding profile.',
        'Click Yes to proceed, No to cancel.'],
      ['Distribution Switch [FMN4221R00H---DS---3] already has VXLAN config.',
        'Click Yes to proceed, No to cancel.'],
      ['Distribution Switch [FMN4221R00H---DS---3] will reboot after set up forwarding profile.',
        'Click Yes to proceed, No to cancel.'],
      [`The Access Switch [FEK3224R09N---AS---3] web auth VLAN not exist or uplink port not exist at VLAN,
      please create [WebAuth VLAN] and add uplink port or lag first.`],
      []
    ]

    expect(afterSubmitMessage(
      { data: { errors: [resError[0]] } } as CatchErrorResponse, switches
    )).toStrictEqual(expectMessage[0].map(m=><p>{m}</p>))
    expect(afterSubmitMessage(
      { data: { errors: [resError[1]] } } as CatchErrorResponse, switches
    )).toStrictEqual(expectMessage[1].map(m=><p>{m}</p>))
    expect(afterSubmitMessage(
      { data: { errors: [resError[2]] } } as CatchErrorResponse, switches
    )).toStrictEqual(expectMessage[2].map(m=><p>{m}</p>))
    expect(afterSubmitMessage(
      { data: { errors: [resError[3]] } } as CatchErrorResponse, switches
    )).toStrictEqual(expectMessage[3].map(m=><p>{m}</p>))
    expect(afterSubmitMessage(
      { data: { errors: [resError[4]] } } as CatchErrorResponse, switches
    )).toStrictEqual(expectMessage[4].map(m=><p>{m}</p>))

  })
})
