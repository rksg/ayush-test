import { waitFor } from '@testing-library/react'
import { rest }    from 'msw'

import { ClientUrlsInfo, PersonaUrls }                   from '@acx-ui/rc/utils'
import { Provider }                                      from '@acx-ui/store'
import { render, screen, fireEvent, within, mockServer } from '@acx-ui/test-utils'

import { mockPersona } from '../__tests__/fixtures'

import { PersonaDevicesForm }         from './PersonaDevicesForm'
import { PersonaDevicesImportDialog } from './PersonaDevicesImportDialog'


const mockPersonaGroup = {
  id: 'testPersonaId',
  name: 'TestPersona',
  personaCount: 2,
  dpskPoolId: 'testDpskId',
  personas: [
    {
      id: 'c677cbb0-8520-421c-99b6-59b3cef5ebc1',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      name: 'mock-persona1'
    },
    {
      id: '1e7f81ab-9bb7-4db7-ae20-315743f83183',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      name: 'mock-persona2'
    }
  ]
}

describe('Persona Form', () => {
  it('should add devices', async () => {
    mockServer.use(
      rest.post(
        ClientUrlsInfo.getClientList.url,
        (_, res, ctx) => res(ctx.json({ data: [{
          osType: 'Windows',
          clientMac: '28:B3:71:28:78:50',
          ipAddress: '10.206.1.93',
          Username: '24418cc316df',
          hostname: 'LP-XXXXX',
          venueName: 'UI-TEST-VENUE',
          apName: 'UI team ONLY'
        }] }))
      )
    )
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

    // FIXME:
    // fireEvent.change(macFields[0], { target: { value: '11:11:11:11:11:11' } })
    // const addButton = await screen.findByRole('button', { name: 'Add' })
    // fireEvent.click(addButton)

  })

  it('should delete selected device in PersonaDevicesForm', async () => {
    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      )
    )
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
