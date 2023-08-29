import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { switchApi }                                   from '@acx-ui/rc/services'
import { LAG_TYPE, SwitchUrlsInfo }                    from '@acx-ui/rc/utils'
import { Provider, store  }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import {
  defaultVlan,
  lagList,
  portlist,
  successResponse,
  switchDetailHeader,
  switchVlans,
  switchVlanUnion,
  vlansByVenue
} from './__tests__/fixtures'
import { SwitchLagModal } from './SwitchLagModal'


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

const params = {
  tenantId: 'tenant-id',
  switchId: 'switch-id',
  venueId: 'a98653366d2240b9ae370e48fab3a9a1',
  serialNumber: 'serialNumber-id'
}
const requestSpy = jest.fn()
const requestAddLagSpy = jest.fn()
const mockServerQuery = () => {
  store.dispatch(switchApi.util.resetApiState())
  mockServer.use(
    rest.get(
      SwitchUrlsInfo.getLagList.url,
      (req, res, ctx) => res(ctx.json(lagList))
    ),
    rest.post(
      SwitchUrlsInfo.addLag.url,
      (_, res, ctx) => {
        requestAddLagSpy()
        return res(ctx.json(successResponse))
      }
    ),
    rest.put(
      SwitchUrlsInfo.updateLag.url,
      (_, res, ctx) => { return res(ctx.json(successResponse)) }
    ),
    rest.post(SwitchUrlsInfo.getDefaultVlan.url,
      (_, res, ctx) => res(ctx.json(defaultVlan))
    ),
    rest.get(SwitchUrlsInfo.getSwitchVlans.url,
      (_, res, ctx) => res(ctx.json(switchVlans))
    ),
    rest.get(SwitchUrlsInfo.getSwitchVlanUnion.url,
      (_, res, ctx) => res(ctx.json(switchVlanUnion))
    ),
    rest.get(SwitchUrlsInfo.getVlansByVenue.url,
      (_, res, ctx) => res(ctx.json(vlansByVenue))
    ),
    rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
      (_, res, ctx) => res(ctx.json(switchDetailHeader))
    ),
    rest.post(
      SwitchUrlsInfo.getSwitchPortlist.url,
      (req, res, ctx) => res(ctx.json(portlist))
    ),
    rest.get(SwitchUrlsInfo.getSwitchConfigurationProfileByVenue.url,
      (_, res, ctx) => {
        requestSpy()
        return res(ctx.json({}))
      }
    )
  )}

describe('SwitchLagModal', () => {
  const mockedSetVisible = jest.fn()
  afterEach(() => {
    Modal.destroyAll()
  })
  beforeEach(() => {
    requestSpy.mockClear()
    requestAddLagSpy.mockClear()
  })

  it('should render lag list correctly', async () => {
    mockServerQuery()
    const user = userEvent.setup()
    render(<Provider>
      <SwitchLagModal
        visible={true}
        setVisible={mockedSetVisible}
        isEditMode={false}
        editData={[]} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber'
      }
    })
    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))

    await screen.findByText(/Add LAG/i)
    await screen.findByText(/VLAN-ID: 1/i)

    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('should render lag drawer correctly', async () => {
    mockServerQuery()
    const user = userEvent.setup()
    render(<Provider>
      <SwitchLagModal
        visible={true}
        setVisible={mockedSetVisible}
        isEditMode={false}
        type='drawer'
        editData={[]} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber'
      }
    })
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeVisible()
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('should add lag correctly', async () => {
    mockServerQuery()
    render(<Provider>
      <SwitchLagModal
        visible={true}
        setVisible={mockedSetVisible}
        isEditMode={false}
        editData={[]} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber'
      }
    })

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))

    await screen.findByText(/Add LAG/i)
    await screen.findByText(/VLAN-ID: 1/i)

    await userEvent.type(await screen.findByLabelText(/LAG Name/i), 'test lag')

    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)
    await userEvent.selectOptions(selector, '1 Gbits per second copper')

    await userEvent.click(await screen.findByText('1/1/3'))

    const transfer = await screen.findByTestId('targetKeysFormItem')
    await userEvent.click(await within(transfer).findByRole('button', { name: /Add/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await waitFor(() => expect(requestAddLagSpy).toHaveBeenCalledTimes(1))
  })

  it('should render correctly with cancel', async () => {
    mockServerQuery()
    const lag = {
      id: '75145abea1e74f5e8019725444a0ef9f',
      lagId: 2,
      name: 'lag-static',
      type: LAG_TYPE.STATIC,
      ports: [
        '1/1/6'
      ],
      taggedVlans: [
        ''
      ],
      untaggedVlan: '1',
      switchId: 'c0:c5:20:aa:32:79',
      realRemove: true
    }

    render(<Provider>
      <SwitchLagModal
        visible={true}
        setVisible={mockedSetVisible}
        isEditMode={true}
        editData={[lag]} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber'
      }
    })
    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))
    await screen.findByText(/edit lag/i)
    await screen.findByText(/1 selected/i)
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })


  it('should edit lag correctly', async () => {
    mockServerQuery()
    const lag = {
      id: '75145abea1e74f5e8019725444a0ef9f',
      lagId: 2,
      name: 'lag-static',
      type: LAG_TYPE.STATIC,
      ports: [
        '1/1/6'
      ],
      taggedVlans: [
        ''
      ],
      untaggedVlan: '1',
      switchId: 'c0:c5:20:aa:32:79',
      realRemove: true
    }

    render(<Provider>
      <SwitchLagModal
        visible={true}
        setVisible={mockedSetVisible}
        isEditMode={true}
        editData={[lag]} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber'
      }
    })
    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))
    await screen.findByText(/edit lag/i)
    await screen.findByText(/1 selected/i)

    const editButtons = await screen.findAllByRole('button', { name: 'Edit' })
    await userEvent.click(editButtons[2])
  })

  it('should edit lag change port type correctly', async () => {
    mockServerQuery()
    const user = userEvent.setup()
    const lag = {
      id: '75145abea1e74f5e8019725444a0ef9f',
      lagId: 2,
      name: 'lag-static',
      type: LAG_TYPE.STATIC,
      ports: [
        '1/1/6'
      ],
      taggedVlans: [
        ''
      ],
      untaggedVlan: '1',
      switchId: 'c0:c5:20:aa:32:79',
      realRemove: true
    }

    render(<Provider>
      <SwitchLagModal
        visible={true}
        setVisible={mockedSetVisible}
        isEditMode={true}
        editData={[lag]} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber'
      }
    })
    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))
    await screen.findByText(/edit lag/i)
    await screen.findByText(/1 selected/i)

    await user.click(await screen.findByText('1 Gbits per second copper'))
    await user.click(await screen.findByText('10 Gbits per second fiber'))

    const editButtons = await screen.findAllByRole('button', { name: 'Edit' })
    await userEvent.click(editButtons[2])
  })
})
