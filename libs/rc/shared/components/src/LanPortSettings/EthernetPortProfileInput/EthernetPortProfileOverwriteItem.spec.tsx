import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { render, renderHook, screen } from '@acx-ui/test-utils'

import EthernetPortProfileOverwriteItem from './EthernetPortProfileOverwriteItem'


describe('EthernetPortProfileOverwriteItem', () => {

  const resetTooltip = 'Reset to the default value specified by the selected port profile'

  it('should able to see VLAN Untag ID tooltips when hover buttons', async () => {
    render(
      <Form>
        <EthernetPortProfileOverwriteItem
          title={'VLAN Untag ID'}
          initialData={'2'}
          defaultValue={'1'}
          isEditable={true}
          fieldName={['lan', 1, 'untagId']} />
      </Form>
    )

    expect(screen.getByText('VLAN Untag ID')).toBeInTheDocument()
    const untagIdReloadBtn = screen.getByRole('button',
      { name: 'VLAN Untag ID 2 (Custom) reload' })
    expect(untagIdReloadBtn).toBeVisible()
    userEvent.hover(untagIdReloadBtn)
    expect(await screen.findByText('Override the VLAN Untag ID')).toBeInTheDocument()

    const reloadBtn = screen.getByRole('button', { name: 'reload' })
    expect(reloadBtn).toBeVisible()
    userEvent.hover(reloadBtn)
    expect(await screen.findByText(resetTooltip)).toBeInTheDocument()
  })

  it('should able to see VLAN Members tooltips when hover buttons', async () => {
    render(
      <Form>
        <EthernetPortProfileOverwriteItem
          title={'VLAN Members'}
          initialData={'9'}
          defaultValue={'1-4094'}
          isEditable={true}
          fieldName={['lan', 1, 'vlanMembers']} />
      </Form>
    )

    expect(screen.getByText('VLAN Members')).toBeInTheDocument()
    const untagIdReloadBtn = screen.getByRole('button',
      { name: 'VLAN Members 9 (Custom) reload' })
    expect(untagIdReloadBtn).toBeVisible()
    userEvent.hover(untagIdReloadBtn)
    expect(await screen.findByText('Override the VLAN Members')).toBeInTheDocument()

    const reloadBtn = screen.getByRole('button', { name: 'reload' })
    expect(reloadBtn).toBeVisible()
    userEvent.hover(reloadBtn)
    expect(await screen.findByText(resetTooltip)).toBeInTheDocument()
  })

  it('should not able to modify vlan untag id when has vni', async () => {
    const { result: { current: formRef } } = renderHook(() => Form.useForm()[0])
    formRef.setFieldsValue({ lan: [{ vni: 0 }, { vni: 8196 }] })
    render(
      <Form form={formRef}>
        <EthernetPortProfileOverwriteItem
          title={'VLAN Members'}
          initialData={'9'}
          defaultValue={'1-4094'}
          currentIndex={1}
          isEditable={true}
          fieldName={['lan', 1, 'vlanMembers']} />
      </Form>
    )

    const buttons = await screen.findAllByRole('button', { hidden: true })
    expect(buttons.length).toBe(2)
  })
})