import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import {
  findTBody, render, renderHook, screen, within
} from '@acx-ui/test-utils'

import { mockedHostData } from '../__tests__/fixtures'

import HostTable from '.'

describe('Host table(Edge)', () => {
  it('should render data succefully', async () => {
    render(<HostTable value={mockedHostData} />)

    const tableRow = await screen.findAllByRole('row', { name: /TestHost-/i })
    expect(tableRow.length).toBe(2)
  })

  it('should show no data', async () => {
    render(<HostTable />)

    const tbody = await findTBody()
    const noDataElement = within(tbody).getByRole('row')
    expect(noDataElement.className).toBe('ant-table-placeholder')
  })

  it('should open drawer', async () => {
    const user = userEvent.setup()
    render(<HostTable value={mockedHostData} />)

    await user.click(screen.getByRole('button', { name: 'Add Host' }))
    expect(await screen.findByRole('textbox', { name: 'Host Name' })).toBeVisible()
  })

  it('should show edit button', async () => {
    render(<HostTable value={mockedHostData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const row = await screen.findByRole('row', { name: /TestHost-1/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

  it('should hidden edit button', async () => {
    render(<HostTable value={mockedHostData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const rows = await screen.findAllByRole('row', { name: /TestHost-/i })
    await userEvent.click(within(rows[0]).getByRole('checkbox'))
    await userEvent.click(within(rows[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('should add host', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Form form={formRef.current}>
      <Form.Item
        name='hosts'
        children={<HostTable />}
      />
    </Form>)

    await userEvent.click(screen.getByRole('button', { name: 'Add Host' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Host Name' }), 'host1')
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66'
    )
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Fixed Address' }), '1.2.3.4')

    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
  })

  it('should show alert for duplicate host name', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Form form={formRef.current}>
      <Form.Item
        name='hosts'
        children={<HostTable />}
      />
    </Form>)

    const addNewHostButton = screen.getByRole('button', { name: 'Add Host' })
    await userEvent.click(addNewHostButton)
    const drawer1 = await screen.findByRole('dialog')
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Host Name' }), 'host1')
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66'
    )
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Fixed Address' }), '1.2.3.4')

    await userEvent.click(within(drawer1).getByRole('button', { name: 'Add' }))

    await userEvent.click(addNewHostButton)
    const drawer2 = await screen.findByRole('dialog')
    await userEvent.type(within(drawer2).getByRole('textbox', { name: 'Host Name' }), 'host1')
    const alertElement = await screen.findByRole('alert')
    expect(alertElement).toBeVisible()
  })

  it('should update host', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Form form={formRef.current}>
      <Form.Item
        name='hosts'
        children={<HostTable />}
      />
    </Form>)

    await userEvent.click(screen.getByRole('button', { name: 'Add Host' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Host Name' }), 'host1')
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66'
    )
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Fixed Address' }), '1.2.3.4')

    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await userEvent.click(within(drawer).getByRole('button', { name: 'Cancel' }))

    userEvent.click(screen.getByText('host1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
  })

  it('should delete host', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Form form={formRef.current}>
      <Form.Item
        name='hosts'
        children={<HostTable />}
      />
    </Form>)

    await userEvent.click(screen.getByRole('button', { name: 'Add Host' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Host Name' }), 'host1')
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66'
    )
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Fixed Address' }), '1.2.3.4')

    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await userEvent.click(within(drawer).getByRole('button', { name: 'Cancel' }))

    userEvent.click(screen.getByText('host1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })
})