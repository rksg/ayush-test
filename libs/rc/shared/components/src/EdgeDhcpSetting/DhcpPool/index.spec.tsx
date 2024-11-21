import userEvent     from '@testing-library/user-event'
import { Form }      from 'antd'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { StepsForm }                    from '@acx-ui/components'
import { Features }                     from '@acx-ui/feature-toggle'
import { EdgePinUrls, EdgePinFixtures } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {
  findTBody,
  render,
  renderHook,
  screen,
  waitFor,
  within,
  mockServer
} from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'
import { mockedPoolData }        from '../__tests__/fixtures'

import DhcpPoolTable from '.'

const { mockPinStatsList } = EdgePinFixtures

jest.mock('../../useEdgeActions', () => ({
  ...jest.requireActual('../../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

const WrapperComponent = ({ children, values }:
  React.PropsWithChildren<{ values?: Record<string, unknown> }>) => {
  const [ form ] = Form.useForm()
  if (values) {
    for (let i in values) {
      form.setFieldValue(i, values[i])
    }
  }

  return <Provider>
    <StepsForm form={form}>
      <StepsForm.StepForm>
        <Form.Item
          name='dhcpPools'
          children={children}
        />
      </StepsForm.StepForm>
    </StepsForm>
  </Provider>
}
describe('DHCP Pool table(Edge)', () => {
  it('should render data successfully', async () => {
    render(<WrapperComponent values={{ dhcpPools: mockedPoolData }}>
      <DhcpPoolTable />
    </WrapperComponent>)

    const tableRow = await screen.findAllByRole('row', { name: /TestPool-/i })
    expect(tableRow.length).toBe(2)
  })

  it('should show no data', async () => {
    render(<WrapperComponent>
      <DhcpPoolTable />
    </WrapperComponent>)

    const tbody = await findTBody()
    const noDataElement = within(tbody).getByRole('row')
    expect(noDataElement.className).toBe('ant-table-placeholder')
  })

  it('should show edit button', async () => {
    render(<WrapperComponent values={{ dhcpPools: mockedPoolData }}>
      <DhcpPoolTable />
    </WrapperComponent>)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const row = await screen.findByRole('row', { name: /TestPool-1/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

  it('should hidden edit button', async () => {
    render(<WrapperComponent values={{ dhcpPools: mockedPoolData }}>
      <DhcpPoolTable />
    </WrapperComponent>)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const rows = await screen.findAllByRole('row', { name: /TestPool-/i })
    await userEvent.click(within(rows[0]).getByRole('checkbox'))
    await userEvent.click(within(rows[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('should update pool', async () => {
    render(<WrapperComponent>
      <DhcpPoolTable />
    </WrapperComponent>)

    await userEvent.click(screen.getByRole('button', { name: 'Add DHCP Pool' }))
    const drawer1 = await screen.findByRole('dialog')
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    const textBoxs = within(drawer1).getAllByRole('textbox')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolStartIp')[0], '1.2.3.4')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolEndIp')[0], '1.2.3.5')
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')
    await userEvent.click(within(drawer1).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(drawer1).not.toBeVisible())

    await userEvent.click(await screen.findByText('pool1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    const drawer2 = await screen.findByRole('dialog')
    await userEvent.click(await within(drawer2).findByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(drawer2).not.toBeVisible())
  })

  it('should show alert for duplicate pool name', async () => {
    render(<WrapperComponent>
      <DhcpPoolTable />
    </WrapperComponent>)

    const addNewPoolButton = screen.getByRole('button', { name: 'Add DHCP Pool' })
    await userEvent.click(addNewPoolButton)
    const drawer1 = await screen.findByRole('dialog')
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    const textBoxs = within(drawer1).getAllByRole('textbox')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolStartIp')[0], '1.2.3.4')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolEndIp')[0], '1.2.3.5')
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')

    await userEvent.click(within(drawer1).getByRole('button', { name: 'Add' }))

    await screen.findByRole('row', { name: 'pool1 255.255.255.0 1.2.3.4 - 1.2.3.5 1.2.3.10' })
    await waitFor(() => expect(drawer1).not.toBeVisible())

    await userEvent.click(addNewPoolButton)
    const drawer2 = await screen.findByRole('dialog')
    await userEvent.type(within(drawer2).getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    const alertElement = await screen.findByRole('alert')
    expect(alertElement).toBeVisible()
    await userEvent.click(within(drawer2).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(drawer2).not.toBeVisible())
  })

  it('should delete pool', async () => {
    render(<WrapperComponent>
      <DhcpPoolTable />
    </WrapperComponent>)

    await userEvent.click(screen.getByRole('button', { name: 'Add DHCP Pool' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    const textBoxs = within(drawer).getAllByRole('textbox')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolStartIp')[0], '1.2.3.4')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolEndIp')[0], '1.2.3.5')

    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')

    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(drawer).not.toBeVisible())

    await userEvent.click(await screen.findByText('pool1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

  it('gateway should be empty when DHCP relay enabled', async () => {
    render(<WrapperComponent values={{ dhcpRelay: true }}>
      <DhcpPoolTable/>
    </WrapperComponent>)

    await userEvent.click(screen.getByRole('button', { name: 'Add DHCP Pool' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'Pool Name' }), 'pool_test_relay')
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    const textBoxs = within(drawer).getAllByRole('textbox')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolStartIp')[0], '1.2.3.4')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolEndIp')[0], '1.2.3.5')

    const gw = within(drawer).queryByRole('textbox', { name: 'Gateway' })
    // eslint-disable-next-line testing-library/no-node-access
    expect(gw?.closest('.ant-form-item')).toHaveClass('ant-form-item-hidden')

    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(drawer).not.toBeVisible())
  })

  describe('CSV import enabled', () => {
    beforeEach(() => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGES_DHCP_CSV_TOGGLE)
    })

    it.skip('should import pools by CSV', async () => {
      const mockedCSVData = [
        'Pool Name,Subnet Mask,Pool Start IP,Pool End IP,Gateway\r\n',
        'mockPool1,255.255.255.0,1.2.3.4,1.2.3.12,1.2.3.125\r\n'
      ]

      const mockedChangeHandler = jest.fn()
      render(<WrapperComponent>
        <DhcpPoolTable onChange={mockedChangeHandler}/>
      </WrapperComponent>)

      await userEvent.click(screen.getByRole('button', { name: 'Import from file' }))
      const drawer = await screen.findByRole('dialog')
      await userEvent.click(within(drawer).getByRole('button', { name: 'Browse' }))
      const csvFile = new File(mockedCSVData, 'edge_dhcp_pool.csv', { type: 'text/csv' })

      // eslint-disable-next-line testing-library/no-node-access
      await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

      await userEvent.click(within(drawer).getByRole('button', { name: 'Import' }))

      await waitFor(() => {
        expect(mockedChangeHandler).toBeCalledTimes(1)
      })
      await screen.findByRole('row', { name: /mockPool1/ })
    })

    it('should check duplicate pool name when import by CSV', async () => {
      const mockedDuplicatedNameData = [
        'Pool Name,Subnet Mask,Pool Start IP,Pool End IP,Gateway\r\n',
        'mockPool1,255.255.255.0,1.2.3.4,1.2.3.12,1.2.3.125\r\n',
        'mockPool1,255.255.255.0,1.1.1.1,1.12.10.120,1.12.10.125\r\n'
      ]

      render(<WrapperComponent>
        <DhcpPoolTable />
      </WrapperComponent>)

      await userEvent.click(screen.getByRole('button', { name: 'Import from file' }))
      const drawer = await screen.findByRole('dialog')
      await userEvent.click(within(drawer).getByRole('button', { name: 'Browse' }))
      const csvFile = new File(mockedDuplicatedNameData, 'edge_dhcp_pool.csv', { type: 'text/csv' })

      // eslint-disable-next-line testing-library/no-node-access
      await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

      await within(drawer).findByRole('img', { name: 'warning' })
      // eslint-disable-next-line max-len
      expect(await within(drawer).findByText('Pool Name with that name already exists')).toBeVisible()
      expect(within(drawer).getByRole('button', { name: 'Import' })).toBeDisabled()
    })

    it('should do field value validation when import by CSV', async () => {
      const mockedDuplicatedNameData = [
        'Pool Name,Subnet Mask,Pool Start IP,Pool End IP,Gateway\r\n',
        'mockPool1,255.255.255.0,1.2.3.4,1.2.3.12,1.2.3.125\r\n',
        'mockPool2,255.255.255.0,1.1.1.1,2.2.2.2,1.12.10.125\r\n'
      ]

      render(<WrapperComponent>
        <DhcpPoolTable />
      </WrapperComponent>)

      await userEvent.click(screen.getByRole('button', { name: 'Import from file' }))
      const drawer = await screen.findByRole('dialog')
      await userEvent.click(within(drawer).getByRole('button', { name: 'Browse' }))
      const csvFile = new File(mockedDuplicatedNameData, 'edge_dhcp_pool.csv', { type: 'text/csv' })

      // eslint-disable-next-line testing-library/no-node-access
      await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

      await within(drawer).findByRole('img', { name: 'warning' })
      expect(await within(drawer).findByText('IP address is not in the subnet pool')).toBeVisible()
      expect(within(drawer).getByRole('button', { name: 'Import' })).toBeDisabled()
    })

    it('should check max entries when import by CSV', async () => {
      let mockedData = [
        'Pool Name,Subnet Mask,Pool Start IP,Pool End IP,Gateway\r\n'
      ]
      for(let i = 0; i <= 128; i++) {
        mockedData.push(`mockPool${i},255.255.255.0,1.1.1.1,2.2.2.2,1.12.10.125\r\n`)
      }

      render(<WrapperComponent>
        <DhcpPoolTable />
      </WrapperComponent>)

      await userEvent.click(screen.getByRole('button', { name: 'Import from file' }))
      const drawer = await screen.findByRole('dialog')
      await userEvent.click(within(drawer).getByRole('button', { name: 'Browse' }))
      const csvFile = new File(mockedData, 'edge_dhcp_pool.csv', { type: 'text/csv' })

      // eslint-disable-next-line testing-library/no-node-access
      await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

      await within(drawer).findByRole('img', { name: 'warning' })
      expect(await within(drawer).findByText('Exceed maximum entries.')).toBeVisible()
      expect(within(drawer).getByRole('button', { name: 'Import' })).toBeDisabled()
    })

    it('should not display import from file when FF is disabled', async () => {
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)

      const { result: formRef } = renderHook(() => {
        const [ form ] = Form.useForm()
        return form
      })

      render(<Provider>
        <Form form={formRef.current}>
          <Form.Item
            name='dhcpPools'
            children={<DhcpPoolTable />}
          />
        </Form></Provider>)

      const btn = screen.queryByRole('button', { name: 'Import from file' })
      expect(btn).toBeNull()
      jest.mocked(useIsEdgeFeatureReady).mockReset()
    })
  })

  describe('PIN enabled', () => {
    const mockPinList = cloneDeep(mockPinStatsList)
    mockPinList.data[0].edgeClusterInfo.dhcpPoolId = mockedPoolData[0].id

    it('should grey out edit & delete button', async () => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_PIN_HA_TOGGLE)

      mockServer.use(
        rest.post(
          EdgePinUrls.getEdgePinStatsList.url,
          (_req, res, ctx) => res(ctx.json(mockPinList)))
      )

      render(<WrapperComponent values={{ dhcpPools: mockedPoolData }}>
        <DhcpPoolTable />
      </WrapperComponent>)

      const row = await screen.findByRole('row', { name: /TestPool-1/i })
      await userEvent.click(within(row).getByRole('checkbox'))
      // eslint-disable-next-line max-len
      await waitFor(async () => expect(await screen.findByRole('button', { name: 'Edit' })).toBeDisabled())
      expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()

      jest.mocked(useIsEdgeFeatureReady).mockReset()
    })
  })
})
