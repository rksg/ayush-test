import userEvent from '@testing-library/user-event'

import { screen } from '@acx-ui/test-utils'

import { renderForm } from '../../__tests__/fixtures'
import { ClientType } from '../../types'

import { ClientType as Input } from './ClientType'

const { click } = userEvent

describe('ClientType', () => {
  it('render field', async () => {
    const selected = ClientType.VirtualClient
    renderForm(<Input />, {
      initialValues: { clientType: selected }
    })

    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.getByRole('radio', { checked: true })).toHaveAttribute('value', selected)

    await click(screen.getByRole('radio', { checked: false }))

    expect(screen.getByRole('radio', { checked: true }))
      .toHaveAttribute('value', ClientType.VirtualWirelessClient)
  })

  it('render as field summary in edit mode', async () => {
    const selected = ClientType.VirtualWirelessClient
    renderForm(<Input />, {
      editMode: true,
      initialValues: { clientType: selected }
    })

    expect(screen.getByText('Virtual Wireless Client')).toBeVisible()
  })
})
