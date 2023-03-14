import { waitFor } from '@testing-library/react'

import { Provider }                          from '@acx-ui/store'
import { render, screen, fireEvent, within } from '@acx-ui/test-utils'

import { mockPersona } from '../__tests__/fixtures'

import { PersonaDevicesForm }         from './PersonaDevicesForm'
import { PersonaDevicesImportDialog } from './PersonaDevicesImportDialog'



describe('Persona Form', () => {

  it('should add devices', async () => {
    render(
      <Provider>
        <PersonaDevicesImportDialog
          visible
          onCancel={jest.fn}
          onSubmit={jest.fn}
          selectedMacAddress={[]}
        />
      </Provider>
    )

    const mode = await screen.findByRole('radio', { name: /Add manually/i })
    fireEvent.click(mode)


    let macFields = await screen.findAllByRole('textbox')
    expect(macFields.length).toBe(1)

    const addItemButton = await screen.findByRole('button', { name: /Add another device/i })
    fireEvent.click(addItemButton)
    macFields = await screen.findAllByRole('textbox')
    expect(macFields.length).toBe(2)

    const deleteItemButton = await screen.findAllByRole('button', { name: /delete-/i })
    fireEvent.click(deleteItemButton[0])

    macFields = await screen.findAllByRole('textbox')
    expect(macFields.length).toBe(1)

    fireEvent.change(macFields[0], { target: { value: '11:11:11:11:11:11' } })

    const addButton = await screen.findByRole('button', { name: 'Add' })
    fireEvent.click(addButton)
  })

  it('should delete selected device in PersonaDevicesForm', async () => {
    render(
      <Provider>
        <PersonaDevicesForm
          groupId={mockPersona.groupId}
          value={mockPersona.devices}
          onChange={jest.fn}
        />
      </Provider>
    )

    const targetDevice = mockPersona.devices
    if (!targetDevice) return

    const deviceItem = await screen.findByRole('row', { name: targetDevice[0].macAddress ?? '' })
    fireEvent.click(within(deviceItem).getByRole('checkbox'))

    const deleteButton = await screen.findByRole('button', { name: /Delete/i })
    fireEvent.click(deleteButton)
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Delete/i })).toBeNull()
    })
  })
})
