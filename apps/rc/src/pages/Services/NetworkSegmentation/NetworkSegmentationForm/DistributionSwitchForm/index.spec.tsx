/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsFormNew }                     from '@acx-ui/components'
import {
  NetworkSegmentationUrls, SwitchUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  prettyDOM,
  render,
  renderHook,
  screen,
  within
} from '@acx-ui/test-utils'

import {
  mockNsgSwitchInfoData,
  switchLagList,
  switchPortList,
  switchVlanUnion
} from '../../__tests__/fixtures'

import { DistributionSwitchForm } from './'

const createNsgPath = '/:tenantId/services/networkSegmentation/create'
const updateNsgPath = '/:tenantId/services/networkSegmentation/:serviceId/edit'

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)}>
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

describe('DistributionSwitchForm', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

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
      )
    )
  })

  it('should edit correctly', async () => {
    const user = userEvent.setup()
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    formRef.current.setFieldsValue({
      venueId: 'venueId',
      edgeId: 'edgeId',
      distributionSwitchInfos: mockNsgSwitchInfoData.distributionSwitches,
      accessSwitchInfos: mockNsgSwitchInfoData.accessSwitches
    })

    render(
      <Provider>
        <StepsFormNew form={formRef.current}><DistributionSwitchForm /></StepsFormNew>
      </Provider>, {
        route: { params, path: updateNsgPath }
      })
    const row = await screen.findByRole('row', { name: /FMN4221R00H---DS---3/i })
    await user.click(await within(row).findByRole('radio'))
    const alert = await screen.findByRole('alert')
    await user.click(await within(alert).findByRole('button', { name: 'Edit' }))

    console.log(prettyDOM(alert))

    const dialog = await screen.findByRole('dialog')
    // await user.click(await within(dialog).findByRole('button', { name: 'Save' }))
    // await user.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should add DS correctly', async () => {
    const user = userEvent.setup()
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    formRef.current.setFieldsValue({
      // name: mockNsgData.name,
      venueId: 'venueId',
      edgeId: 'edgeId'
      // segments: '',
      // devices: '',
      // dhcpName: '',
      // poolName: '',
      // tunnelProfileName: '',
      // networkNames: [''],
      // distributionSwitchInfos: mockNsgSwitchInfoData.distributionSwitches,
      // accessSwitchInfos: mockNsgSwitchInfoData.accessSwitches
    })

    render(
      <Provider>
        <StepsFormNew form={formRef.current}><DistributionSwitchForm /></StepsFormNew>
      </Provider>, {
        route: { params, path: createNsgPath }
      })

    await user.click(await screen.findByRole('button', { name: 'Add Distribution Switch' }))
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Distribution Switch' }),
      await screen.findByRole('option', { name: 'FMN4221R00H---DS---3' })
    )
    await user.type(await screen.findByRole('textbox', { name: 'VLAN Range' }), '10')
    await user.type(await screen.findByRole('textbox', { name: 'Lookback Interface ID' }), '12')
    await user.type(await screen.findByRole('textbox', { name: 'Lookback Interface IP Address' }), '1.2.3.4')
    await user.type(await screen.findByRole('textbox', { name: 'Lookback Interface Subnet Mask' }), '255.255.255.0')

    await user.click(await screen.findByRole('button', { name: 'Select' }))
    const asTransfer = await screen.findByRole('dialog', { name: /Select Access Switches/i })
    await user.click(await within(asTransfer).findByText(/FEK3224R09N---AS---3/i))
    await user.click(await within(asTransfer).findByRole('button', { name: /Add/i }))

    await user.click(await within(asTransfer).findByRole('button', { name: 'Apply' }))

    await user.click(await screen.findByRole('button', { name: 'Save' }))

    await screen.findByRole('row', { name: /FMN4221R00H---DS---3/i })
  })
})
