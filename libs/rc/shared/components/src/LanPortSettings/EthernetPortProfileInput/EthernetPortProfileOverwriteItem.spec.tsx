import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { render, screen } from '@acx-ui/test-utils'

import EthernetPortProfileOverwriteItem from './EthernetPortProfileOverwriteItem'


describe('EthernetPortProfileOverwriteItem', () => {

  const resetTooltip = 'Reset to the default value specified by the selected port profile'

  it('should able to see VLAN Untag ID tooltips when hover buttons', async () => {
    render(
      <Form>
        <EthernetPortProfileOverwriteItem
          title={'VLAN Untag ID'}
          defaultValue={'1'}
          isEditable={true}
          fieldName={['lan', 1, 'untagId']} />
      </Form>
    )

    expect(screen.getByText('VLAN Untag ID')).toBeInTheDocument()
    const untagIdReloadBtn = screen.getByRole('button',
      { name: 'VLAN Untag ID (Custom) reload' })
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
          defaultValue={'1-4094'}
          isEditable={true}
          fieldName={['lan', 1, 'vlanMembers']} />
      </Form>
    )

    expect(screen.getByText('VLAN Members')).toBeInTheDocument()
    const untagIdReloadBtn = screen.getByRole('button',
      { name: 'VLAN Members (Custom) reload' })
    expect(untagIdReloadBtn).toBeVisible()
    userEvent.hover(untagIdReloadBtn)
    expect(await screen.findByText('Override the VLAN Members')).toBeInTheDocument()

    const reloadBtn = screen.getByRole('button', { name: 'reload' })
    expect(reloadBtn).toBeVisible()
    userEvent.hover(reloadBtn)
    expect(await screen.findByText(resetTooltip)).toBeInTheDocument()
  })
})