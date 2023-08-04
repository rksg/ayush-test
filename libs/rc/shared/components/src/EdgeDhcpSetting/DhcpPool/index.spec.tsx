import '@testing-library/jest-dom'
import { renderHook } from '@testing-library/react'
import userEvent      from '@testing-library/user-event'
import { Form }       from 'antd'

import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import {
  findTBody,
  render, screen, within
} from '@acx-ui/test-utils'

import { mockedPoolData } from '../__tests__/fixtures'

import DhcpPoolTable from '.'

describe('DHCP Pool table(Edge)', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should render data succefully', async () => {
    render(<DhcpPoolTable value={mockedPoolData} />)

    const tableRow = await screen.findAllByRole('row', { name: /TestPool-/i })
    expect(tableRow.length).toBe(2)
  })

  it('should show no data', async () => {
    render(<DhcpPoolTable />)

    const tbody = await findTBody()
    const noDataElement = within(tbody).getByRole('row')
    expect(noDataElement.className).toBe('ant-table-placeholder')
  })

  it('should open drawer', async () => {
    const user = userEvent.setup()
    render(<DhcpPoolTable value={mockedPoolData} />)

    await user.click(screen.getByRole('button', { name: 'Add DHCP Pool' }))
    expect(await screen.findByRole('textbox', { name: 'Pool Name' })).toBeVisible()
  })

  it('should show edit button', async () => {
    render(<DhcpPoolTable value={mockedPoolData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const row = await screen.findByRole('row', { name: /TestPool-1/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

  it('should hidden edit button', async () => {
    render(<DhcpPoolTable value={mockedPoolData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const rows = await screen.findAllByRole('row', { name: /TestPool-/i })
    await userEvent.click(within(rows[0]).getByRole('checkbox'))
    await userEvent.click(within(rows[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('should update pool', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Form form={formRef.current}>
      <Form.Item
        name='dhcpPools'
        children={<DhcpPoolTable />}
      />
    </Form>)

    await userEvent.click(screen.getByRole('button', { name: 'Add DHCP Pool' }))
    const drawer1 = await screen.findByRole('dialog')
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0'
    )
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'Start IP Address' }), '1.2.3.4'
    )
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'End IP Address' }), '1.2.3.5'
    )
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')

    await userEvent.click(within(drawer1).getByRole('button', { name: 'Add' }))

    await userEvent.click(await screen.findByText('pool1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    const drawer2 = await screen.findByRole('dialog')
    await userEvent.click(await within(drawer2).findByRole('button', { name: 'Apply' }))
  })

  it('should show alert for duplicate pool name', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Form form={formRef.current}>
      <Form.Item
        name='dhcpPools'
        children={<DhcpPoolTable />}
      />
    </Form>)

    const addNewPoolButton = screen.getByRole('button', { name: 'Add DHCP Pool' })
    await userEvent.click(addNewPoolButton)
    const drawer1 = await screen.findByRole('dialog')
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0'
    )
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'Start IP Address' }), '1.2.3.4'
    )
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'End IP Address' }), '1.2.3.5'
    )
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')

    await userEvent.click(within(drawer1).getByRole('button', { name: 'Add' }))

    await screen.findByRole('row', { name: 'pool1 255.255.255.0 1.2.3.4 1.2.3.5 1.2.3.10' })

    await userEvent.click(addNewPoolButton)
    const drawer2 = await screen.findByRole('dialog')
    await userEvent.type(within(drawer2).getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    const alertElement = await screen.findByRole('alert')
    expect(alertElement).toBeVisible()
  })

  it('should delete pool', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Form form={formRef.current}>
      <Form.Item
        name='dhcpPools'
        children={<DhcpPoolTable />}
      />
    </Form>)

    await userEvent.click(screen.getByRole('button', { name: 'Add DHCP Pool' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0'
    )
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'Start IP Address' }), '1.2.3.4'
    )
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'End IP Address' }), '1.2.3.5')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')

    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await userEvent.click(within(drawer).getByRole('button', { name: 'Cancel' }))

    userEvent.click(await screen.findByText('pool1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

  it('should import pools by CSV', async () => {
    const mockedCSVData = [
      'Pool Name,Subnet Mask,Pool Start IP,Pool End IP,Gateway\r\n',
      'mockPool1,255.255.255.0,1.2.3.4,1.2.3.12,1.2.3.125\r\n'
    ]
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Form form={formRef.current}>
      <Form.Item
        name='dhcpPools'
        children={<DhcpPoolTable />}
      />
    </Form>)

    await userEvent.click(screen.getByRole('button', { name: 'Import from file' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.click(within(drawer).getByRole('button', { name: 'Browse' }))
    const csvFile = new File(mockedCSVData, 'edge_dhcp_pool.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(within(drawer).getByRole('button', { name: 'Import' }))

    await screen.findByRole('row', { name: /mockPool1/ })
  })

  it('should check duplicate pool name when import by CSV', async () => {
    const mockedDuplicatedNameData = [
      'Pool Name,Subnet Mask,Pool Start IP,Pool End IP,Gateway\r\n',
      'mockPool1,255.255.255.0,1.2.3.4,1.2.3.12,1.2.3.125\r\n',
      'mockPool1,255.255.255.0,1.1.1.1,1.12.10.120,1.12.10.125\r\n'
    ]
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Form form={formRef.current}>
      <Form.Item
        name='dhcpPools'
        children={<DhcpPoolTable />}
      />
    </Form>)

    await userEvent.click(screen.getByRole('button', { name: 'Import from file' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.click(within(drawer).getByRole('button', { name: 'Browse' }))
    const csvFile = new File(mockedDuplicatedNameData, 'edge_dhcp_pool.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(within(drawer).getByRole('button', { name: 'Import' }))
    await screen.findByText('Invalid Validation')
    await screen.findByText('Pool Name with that name already exists')
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    await userEvent.click(within(drawer).getByRole('button', { name: 'Cancel' }))
  })

  it('should do field value validation when import by CSV', async () => {
    const mockedDuplicatedNameData = [
      'Pool Name,Subnet Mask,Pool Start IP,Pool End IP,Gateway\r\n',
      'mockPool1,255.255.255.0,1.2.3.4,1.2.3.12,1.2.3.125\r\n',
      'mockPool2,255.255.255.0,1.1.1.1,2.2.2.2,1.12.10.125\r\n'
    ]
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Form form={formRef.current}>
      <Form.Item
        name='dhcpPools'
        children={<DhcpPoolTable />}
      />
    </Form>)

    await userEvent.click(screen.getByRole('button', { name: 'Import from file' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.click(within(drawer).getByRole('button', { name: 'Browse' }))
    const csvFile = new File(mockedDuplicatedNameData, 'edge_dhcp_pool.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(within(drawer).getByRole('button', { name: 'Import' }))
    await screen.findByText('Invalid Validation')
    await screen.findByText('IP address is not in the subnet pool')
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    await userEvent.click(within(drawer).getByRole('button', { name: 'Cancel' }))
  })

  it('should check max entries when import by CSV', async () => {
    let mockedData = [
      'Pool Name,Subnet Mask,Pool Start IP,Pool End IP,Gateway\r\n'
    ]
    for(let i = 0; i <= 128; i++) {
      mockedData.push(`mockPool${i},255.255.255.0,1.1.1.1,2.2.2.2,1.12.10.125\r\n`)
    }

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Form form={formRef.current}>
      <Form.Item
        name='dhcpPools'
        children={<DhcpPoolTable />}
      />
    </Form>)

    await userEvent.click(screen.getByRole('button', { name: 'Import from file' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.click(within(drawer).getByRole('button', { name: 'Browse' }))
    const csvFile = new File(mockedData, 'edge_dhcp_pool.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(within(drawer).getByRole('button', { name: 'Import' }))
    await screen.findByText('Invalid Validation')
    await screen.findByText('Exceed maximum entries.')
  })

  it('should not display import from file when FF is disabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Form form={formRef.current}>
      <Form.Item
        name='dhcpPools'
        children={<DhcpPoolTable />}
      />
    </Form>)

    const btn = screen.queryByRole('button', { name: 'Import from file' })
    expect(btn).toBeNull()
  })
})