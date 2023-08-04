/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }    from '@acx-ui/components'
import {
  EdgeDhcpUrls,
  EdgeUrlsInfo,
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  mockEdgeData,
  mockEdgeDhcpDataList
} from '../../__tests__/fixtures'

import { SmartEdgeForm } from './'

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
      {children ? <><option value={''}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

const mockedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const mockedFinishFn = jest.fn()

const createNsgPath = '/:tenantId/t/' + getServiceRoutePath({
  type: ServiceType.NETWORK_SEGMENTATION,
  oper: ServiceOperation.EDIT
})
const editNsgPath = '/:tenantId/t/services/networkSegmentation/:serviceId/edit'

describe('SmartEdgeForm', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeData))
      ),
      rest.post(
        EdgeDhcpUrls.addDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpByEdgeId.url,
        (req, res, ctx) => res(ctx.status(404))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList))
      ),
      rest.patch(
        EdgeDhcpUrls.patchDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('Add DHCP service', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm><SmartEdgeForm /></StepsForm>
      </Provider>, {
        route: { params, path: createNsgPath }
      })

    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'SmartEdge' }),
      await screen.findByRole('option', { name: 'Smart Edge 1' })
    )
    await user.click(await screen.findByRole('button', { name: 'Add' }))

    const dhcpServiceNameInput = await screen.findByRole('textbox', { name: 'Service Name' })
    await user.type(dhcpServiceNameInput, 'myTest')
    await user.click(await screen.findByRole('button', { name: 'Add DHCP Pool' }))
    const addDhcpPoolDrawer = screen.getAllByRole('dialog')[1]
    const poolNameInput = await screen.findByRole('textbox', { name: 'Pool Name' })
    const subnetMaskInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    const textBoxs = within(addDhcpPoolDrawer).getAllByRole('textbox')
    await user.type(
      textBoxs.filter((elem) => elem.id === 'poolStartIp')[0], '1.1.1.0')
    await user.type(
      textBoxs.filter((elem) => elem.id === 'poolEndIp')[0], '1.1.1.5')
    const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
    await user.type(poolNameInput, 'Pool1')
    await user.type(subnetMaskInput, '255.255.255.0')
    await user.type(gatewayInput, '1.2.3.4')
    await user.click(within(addDhcpPoolDrawer).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(addDhcpPoolDrawer).not.toBeVisible())
    const addDhcpModal = screen.getAllByRole('dialog')[0]
    await user.click(within(addDhcpModal).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(addDhcpModal).not.toBeVisible())
  })

  it('Add DHCP pool', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm><SmartEdgeForm /></StepsForm>
      </Provider>, {
        route: { params, path: createNsgPath }
      })

    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'SmartEdge' }),
      await screen.findByRole('option', { name: 'Smart Edge 1' })
    )
    const dhcpSelect = await screen.findByRole('combobox', { name: 'DHCP Service' })
    await waitFor(() => expect(dhcpSelect).not.toBeDisabled())
    await user.selectOptions(
      dhcpSelect,
      await screen.findByRole('option', { name: 'TestDhcp-1' })
    )
    user.click(await screen.findByRole('button', { name: 'Select Pool' }))

    await user.click(await screen.findByRole('button', { name: 'Add DHCP Pool' }))
    const addDhcpPoolDrawer = screen.getAllByRole('dialog')[1]
    const poolNameInput = await screen.findByRole('textbox', { name: 'Pool Name' })
    const subnetMaskInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    const textBoxs = within(addDhcpPoolDrawer).getAllByRole('textbox')
    await user.type(
      textBoxs.filter((elem) => elem.id === 'poolStartIp')[0], '1.1.1.1')
    await user.type(
      textBoxs.filter((elem) => elem.id === 'poolEndIp')[0], '1.1.1.5')
    const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
    await user.type(poolNameInput, 'Pool1')
    await user.type(subnetMaskInput, '255.255.255.0')
    await user.type(gatewayInput, '1.2.3.4')
    await user.click(within(addDhcpPoolDrawer).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(addDhcpPoolDrawer).not.toBeVisible())
  })

  it('Step2 - Smart edge success', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm onFinish={mockedFinishFn}>
          <StepsForm.StepForm>
            <SmartEdgeForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>,
      { route: { params, path: createNsgPath } })
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'SmartEdge' }),
      await screen.findByRole('option', { name: 'Smart Edge 1' })
    )
    const segmentsInput = await screen.findByRole('spinbutton', { name: 'Number of Segments' })
    await user.type(segmentsInput, '10')
    const devicesInput = await screen.findByRole('spinbutton', { name: 'Number of devices per Segment' })
    await user.type(devicesInput, '10')
    const dhcpSelect = await screen.findByRole('combobox', { name: 'DHCP Service' })
    await waitFor(() => expect(dhcpSelect).not.toBeDisabled())
    await user.selectOptions(
      dhcpSelect,
      await screen.findByRole('option', { name: 'TestDhcp-1' })
    )
    await user.click(await screen.findByRole('button', { name: 'Select Pool' }))
    await user.click(await screen.findByText('PoolTest1'))
    await user.click(await screen.findByRole('button', { name: 'Select' }))
    await user.click(await screen.findByRole('button', { name: 'Finish' }))
  })

  it('Step2 - Smart edge will be block by mandatory validation', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm onFinish={mockedFinishFn}>
          <StepsForm.StepForm>
            <SmartEdgeForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>,
      { route: { params, path: createNsgPath } })
    await user.click(await screen.findByRole('button', { name: 'Finish' }))
    await screen.findByText('Please enter SmartEdge')
    await screen.findByText('Please enter Number of Segments')
    await screen.findByText('Please enter Number of devices per Segment')
    await screen.findByText('Please enter DHCP Service')
  })

  it('Step2 - Should navigate to detail page when in edit mode and click "service details page"', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm onFinish={mockedFinishFn}>
          <StepsForm.StepForm>
            <SmartEdgeForm editMode />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>,
      { route: { params, path: editNsgPath } })
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'SmartEdge' }),
      await screen.findByRole('option', { name: 'Smart Edge 1' })
    )
    const dhcpSelect = await screen.findByRole('combobox', { name: 'DHCP Service' })
    await waitFor(() => expect(dhcpSelect).not.toBeDisabled())
    await user.selectOptions(
      dhcpSelect,
      await screen.findByRole('option', { name: 'TestDhcp-1' })
    )
    await user.click(await screen.findByRole('button', { name: 'service details page' }))
    await waitFor(() => expect(mockedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/${getServiceDetailsLink({
        type: ServiceType.NETWORK_SEGMENTATION,
        oper: ServiceOperation.DETAIL,
        serviceId: params.serviceId!
      })}`,
      search: ''
    }))
  })
})
