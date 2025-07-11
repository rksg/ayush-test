import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { pinApi }                                           from '@acx-ui/rc/services'
import { EdgePinFixtures, EdgePinUrls, SwitchRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                  from '@acx-ui/store'
import { mockServer, render, screen, waitFor }              from '@acx-ui/test-utils'

import { switchPortList, switchVlanUnion, switchLagList, webAuthList } from '../../__tests__/fixtures'

import { AccessSwitchDrawer } from './AccessSwitchDrawer'

const { mockPinSwitchInfoData, mockPinData } = EdgePinFixtures

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

jest.mock('./NetworkSegAuthModal', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  NetworkSegAuthModal: (props: {
    setWebAuthTemplateId: (id: string) => void
  }) => <div data-testid={'NetworkSegAuthModal'}></div>
}))

describe('AccessSwitchDrawer', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    serviceId: 'testServiceId'
  }
  const path = '/:tenantId/t/services/personalIdentityNetwork/:serviceId/edit'
  beforeEach(async () => {
    store.dispatch(pinApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchRbacUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json({ data: switchPortList }))
      ),
      rest.get(
        SwitchRbacUrlsInfo.getSwitchVlanUnion.url,
        (req, res, ctx) => res(ctx.json(switchVlanUnion))
      ),
      rest.get(
        SwitchRbacUrlsInfo.getLagList.url,
        (req, res, ctx) => res(ctx.json(switchLagList))
      ),
      rest.get(
        EdgePinUrls.getWebAuthTemplate.url,
        (req, res, ctx) => res(ctx.json({ ...webAuthList[0] }))
      ),
      rest.post(
        EdgePinUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({ data: webAuthList }))
      ),
      rest.post(
        EdgePinUrls.validateAccessSwitchInfo.url,
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
          editRecords={mockPinSwitchInfoData.accessSwitches}
          venueId={mockPinData.venueId} />
      </Provider>, {
        route: { params, path }
      })

    await screen.findByText(/top-Ken-0209/i)

    await user.click(screen.getByText(/LAG/))
    await user.selectOptions(
      screen.getByTestId('LAG'),
      screen.getByRole('option', { name: /1/ })
    )

    await user.click(screen.getByRole('button', { name: 'Customize' }))

    const templateSelectBtn = await screen.findByRole('button', { name: 'Select Auth Template' })
    await user.click(templateSelectBtn)
    await user.click(screen.getByRole('button', { name: 'Customize' }))

    await user.click(screen.getByText(/Save/))

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
            ...mockPinSwitchInfoData.accessSwitches,
            { id: 'c0:c5:20:aa:35:ff', name: 'mockAS', distributionSwitchId: 'c8:03:f5:3a:95:c6' }
          ]}
          venueId={mockPinData.venueId} />
      </Provider>, {
        route: { params, path }
      })

    await screen.findByText(/Edit Access Switch: FEK3224R09N---AS---3, mockAS/i)

    await user.click(screen.getByText(/Uplink Port/))
    await user.click(screen.getByText('LAG'))

    await user.click(screen.getByText(/VLAN ID/))
    await user.click(screen.getByText(/VLAN ID/)) //to deselect

    await user.click(screen.getByText('LAG'))
    await user.type(screen.getByTestId('LAG'), '1')

    await user.click(screen.getByText(/Save/))

    await waitFor(() => expect(saveSpy).toHaveBeenCalledTimes(1))
  })
})
