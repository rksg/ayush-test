import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { NetworkSegmentationUrls, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor }     from '@acx-ui/test-utils'

import { mockNsgData, mockNsgSwitchInfoData, switchPortList, switchVlanUnion, switchLagList, webAuthList } from '../../__tests__/fixtures'

import { AccessSwitchDrawer }  from './AccessSwitchDrawer'
import { NetworkSegAuthModel } from './NetworkSegAuthModel'

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, onChange, options, ...props }: MockSelectProps) => (
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

jest.mock('../../../NetworkSegWebAuth/NetworkSegAuthForm', () => ({
  ...jest.requireActual('../../../NetworkSegWebAuth/NetworkSegAuthForm'),
  default: () => <div data-testid={'NetworkSegAuthForm'}></div>
}))

describe('AccessSwitchDrawer', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    serviceId: 'testServiceId'
  }
  const path = '/:tenantId/t/services/networkSegmentation/:serviceId/edit'
  beforeEach(async () => {
    mockServer.use(
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
      rest.post(
        NetworkSegmentationUrls.validateAccessSwitchInfo.url,
        (req, res, ctx) => res(ctx.json({ response: { valid: true } }))
      )
    )
  })

  it('Should render successfully', async () => {
    const user = userEvent.setup()
    const saveSpy = jest.fn()
    render(
      <Provider>
        <AccessSwitchDrawer open={true}
          onSave={saveSpy}
          editRecords={mockNsgSwitchInfoData.accessSwitches}
          venueId={mockNsgData.venueInfos[0].venueId} />
      </Provider>, {
        route: { params, path }
      })

    await screen.findByText(/Edit Access Switch: FEK3224R09N---AS---3/i)

    await screen.findByText(/top-Ken-0209/i)

    await user.click(await screen.findByText(/LAG/))
    await user.selectOptions(
      await screen.findByTestId('LAG'),
      await screen.findByRole('option', { name: /1/ })
    )

    await user.click(await screen.findByRole('button', { name: 'Customize' }))

    const templateSelectBtn = await screen.findByRole('button', { name: 'Select Auth Template' })
    await user.click(templateSelectBtn)
    await user.click(await screen.findByRole('button', { name: 'Customize' }))

    await user.click(await screen.findByText(/Save/))

    await waitFor(() => expect(saveSpy).toHaveBeenCalledTimes(1))
  })

  it('Should edit multi-record successfully', async () => {
    const user = userEvent.setup()
    const saveSpy = jest.fn()
    render(
      <Provider>
        <AccessSwitchDrawer open={true}
          onSave={saveSpy}
          editRecords={[
            ...mockNsgSwitchInfoData.accessSwitches,
            { id: 'c0:c5:20:aa:35:ff', name: 'mockAS', distributionSwitchId: 'c8:03:f5:3a:95:c6' }
          ]}
          venueId={mockNsgData.venueInfos[0].venueId} />
      </Provider>, {
        route: { params, path }
      })

    await screen.findByText(/Edit Access Switch: FEK3224R09N---AS---3, mockAS/i)

    await user.click(await screen.findByText(/Uplink Port/))
    await user.click(await screen.findByText('LAG'))

    await user.click(await screen.findByText(/VLAN ID/))
    await user.click(await screen.findByText(/VLAN ID/)) //to deselect

    await user.click(await screen.findByText('LAG'))
    await user.type(await screen.findByTestId('LAG'), '1')

    await user.click(await screen.findByText(/Save/))

    await waitFor(() => expect(saveSpy).toHaveBeenCalledTimes(1))
  })
})

describe('NetworkSegAuthModel', () => {
  const setWebAuthTemplateId = jest.fn()
  it('Should render successfully', async () => {
    render(<NetworkSegAuthModel setWebAuthTemplateId={setWebAuthTemplateId} />)

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    expect(await screen.findByTestId('NetworkSegAuthForm')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(await screen.findByTestId('NetworkSegAuthForm')).not.toBeVisible()
  })
})
