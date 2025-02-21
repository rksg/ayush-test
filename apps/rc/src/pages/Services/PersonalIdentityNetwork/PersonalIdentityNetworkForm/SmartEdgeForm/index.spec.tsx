/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }        from '@acx-ui/components'
import { EdgeDHCPFixtures } from '@acx-ui/rc/utils'
import {
  EdgeDhcpPool,
  EdgeDhcpUrls,
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


import { mockContextData }                    from '../../__tests__/fixtures'
import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

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
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  PoolDrawer: (props: {
    visible: boolean
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
    onAddOrEdit: (item: EdgeDhcpPool) => void
    allPool?: EdgeDhcpPool[]
    isRelayOn: boolean
  }) => {
    const mockedNewPool = {
      id: '_NEW_mocked',
      poolName: 'newPool',
      subnetMask: '255.255.255.0',
      poolStartIp: '1.1.1.1',
      poolEndIp: '1.1.1.5',
      gatewayIp: '1.2.3.4'
    }
    return props.visible && <div data-testid='rc-PoolDrawer'>
      <button onClick={() => {
        props.onAddOrEdit(mockedNewPool)
        props.setVisible(false)
      }}>Add</button>
    </div>
  }
}))

const mockedFinishFn = jest.fn()

const createPinPath = '/:tenantId/t/' + getServiceRoutePath({
  type: ServiceType.PIN,
  oper: ServiceOperation.EDIT
})
const editPinPath = '/:tenantId/t/services/personalIdentityNetwork/:serviceId/edit'

const { mockEdgeDhcpDataList } = EdgeDHCPFixtures

describe('PersonalIdentityNetworkForm - SmartEdgeForm', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList.content[0]))),
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_req, res, ctx) => res(ctx.json({
          data: [],
          totalCount: 0
        }))),
      rest.patch(
        EdgeDhcpUrls.patchDhcpService.url,
        (_req, res, ctx) => res(ctx.status(202)))
    )
  })

  it('Add DHCP service button will show up when edge is not associated with any dhcp', async () => {
    const user = userEvent.setup()

    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm buttonLabel={{ submit: 'mockedAdd' }}>
            <SmartEdgeForm />
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>, {
        route: { params, path: createPinPath }
      })

    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Cluster' }),
      await screen.findByRole('option', { name: 'Edge Cluster 1' })
    )

    expect(await screen.findByRole('button', { name: 'Add' })).toBeVisible()
  })

  it('Add DHCP pool', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm><SmartEdgeForm /></StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>, {
        route: { params, path: createPinPath }
      })

    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Cluster' }),
      await screen.findByRole('option', { name: 'Edge Cluster 1' })
    )
    const dhcpSelect = screen.getByRole('combobox', { name: 'DHCP Service' })
    await waitFor(() => expect(dhcpSelect).not.toBeDisabled())
    await user.selectOptions(
      dhcpSelect,
      await screen.findByRole('option', { name: 'TestDhcp-1' })
    )
    user.click(await screen.findByRole('button', { name: 'Select Pool' }))

    await user.click(await screen.findByRole('button', { name: 'Add DHCP Pool' }))
    const drawer = await screen.findByTestId('rc-PoolDrawer')
    await user.click(within(drawer).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(drawer).not.toBeVisible())
  })

  it('Step2 - Smart edge success', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm onFinish={mockedFinishFn}>
            <StepsForm.StepForm>
              <SmartEdgeForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createPinPath } })
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Cluster' }),
      await screen.findByRole('option', { name: 'Edge Cluster 1' })
    )

    const segmentsInput = screen.getByRole('spinbutton', { name: 'Number of Segments' })
    await user.type(segmentsInput, '10')
    const dhcpSelect = screen.getByRole('combobox', { name: 'DHCP Service' })
    await waitFor(() => expect(dhcpSelect).not.toBeDisabled())
    await user.selectOptions(
      dhcpSelect,
      await screen.findByRole('option', { name: 'TestDhcp-1' })
    )
    await user.click(await screen.findByRole('button', { name: 'Select Pool' }))
    await user.click(await screen.findByText('PoolTest1'))
    await user.click(await screen.findByRole('button', { name: 'Select' }))
    const addButtons = await screen.findAllByRole('button', { name: 'Add' })
    await user.click(addButtons[1])
  })

  it('Step2 - Smart edge will be block by mandatory validation', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm onFinish={mockedFinishFn}>
            <StepsForm.StepForm>
              <SmartEdgeForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createPinPath } })
    await user.click((await screen.findAllByRole('button', { name: 'Add' }))[1])
    await screen.findByText('Please select Cluster')
    await screen.findByText('Please enter Number of Segments')
    await screen.findByText('Please enter DHCP Service')
  })

  it('Step2 - Smart edge will be blocked by segment validation', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm onFinish={mockedFinishFn}>
            <StepsForm.StepForm>
              <SmartEdgeForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createPinPath } })

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Cluster' }),
      await screen.findByRole('option', { name: 'Edge Cluster 1' })
    )
    const segmentsInput = screen.getByRole('spinbutton', { name: 'Number of Segments' })
    await user.type(segmentsInput, '10001')
    const dhcpSelect = screen.getByRole('combobox', { name: 'DHCP Service' })
    await waitFor(() => expect(dhcpSelect).not.toBeDisabled())
    await user.selectOptions(
      dhcpSelect,
      await screen.findByRole('option', { name: 'TestDhcp-1' })
    )
    await user.click(await screen.findByRole('button', { name: 'Select Pool' }))
    await user.click(screen.getByText('PoolTest1'))
    await user.click(screen.getByRole('button', { name: 'Select' }))

    await user.click((await screen.findAllByRole('button', { name: 'Add' }))[1])
    const alerts = await screen.findAllByRole('alert')
    expect(alerts[0]).toHaveTextContent('Number of Segments must be an integer between 1 and 10000')
  })

  it('Step2 - Should navigate to detail page when in edit mode and click "service details page"', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm onFinish={mockedFinishFn} editMode>
            <StepsForm.StepForm>
              <SmartEdgeForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: editPinPath } })

    const clusterDropdown = await screen.findByRole('combobox', { name: 'Cluster' })
    expect(clusterDropdown).toBeDisabled()
    await user.selectOptions(
      clusterDropdown,
      await screen.findByRole('option', { name: 'Edge Cluster 1' })
    )
    const dhcpSelect = screen.getByRole('combobox', { name: 'DHCP Service' })
    await waitFor(() => expect(dhcpSelect).not.toBeDisabled())
    await user.selectOptions(
      dhcpSelect,
      await screen.findByRole('option', { name: 'TestDhcp-1' })
    )
    await user.click(await screen.findByRole('button', { name: 'service details page' }))
    await waitFor(() => expect(mockedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/${getServiceDetailsLink({
        type: ServiceType.PIN,
        oper: ServiceOperation.DETAIL,
        serviceId: params.serviceId!
      })}`,
      search: ''
    }))
  })
})