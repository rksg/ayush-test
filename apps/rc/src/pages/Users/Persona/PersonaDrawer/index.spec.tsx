import { rest } from 'msw'

import { NewTableResult, Persona, PersonaGroup, PersonaUrls } from '@acx-ui/rc/utils'
import { Provider }                                           from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, act }         from '@acx-ui/test-utils'

import { PersonaDrawer } from './index'

const mockPersonaGroupList: NewTableResult<PersonaGroup> = {
  totalElements: 1,
  size: 10,
  number: 0,
  content: [
    {
      id: 'persona-group-id-1',
      name: 'persona-group-name-1'
    }
  ]
}


const mockPersona: Persona = {
  id: 'persona-id-1',
  name: 'persona-name-1',
  description: 'description',
  groupId: 'persona-group-id-1',
  dpskGuid: 'dpsk-guid-1',
  dpskPassphrase: 'dpsk-passphrase',
  devices: [
    {
      macAddress: '11:11:11:11:11:11',
      personaId: 'persona-id-1'
    },
    {
      macAddress: '11:11:11:11:11:12',
      personaId: 'persona-id-1'
    },
    {
      macAddress: '11:11:11:11:11:13',
      personaId: 'persona-id-1'
    }
  ]
}


describe('Persona Drawer', () => {

  beforeEach( async () => {
    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupList.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      )
      // patch persona
    )
  })

  it('should add a persona', async () => {
    render(
      <Provider>
        <PersonaDrawer
          visible
          isEdit={false}
          onClose={jest.fn}
        />
      </Provider>
    )
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await screen.findByText('Create Persona')
      const nameField = await screen.findByLabelText('Persona Name') as HTMLInputElement
      fireEvent.change(nameField, { target: { value: 'New Persona Name' } })

      const addButton = await screen.findByRole('button', { name: 'Add' })
      fireEvent.click(addButton)
    })
  })

  it('should edit a persona', async () => {
    render(
      <Provider>
        <PersonaDrawer
          isEdit
          visible
          data={mockPersona}
          onClose={jest.fn}
        />
      </Provider>
    )

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await screen.findByText('Edit Persona')
      const groupField = await screen.findByLabelText('Persona Name') as HTMLInputElement
      expect(groupField.value).toBe(mockPersona.name)

      const descriptionField = await screen.findByLabelText('Description') as HTMLTextAreaElement
      fireEvent.change(descriptionField, { target: { value: 'New description' } })

      const applyButton = await screen.findByRole('button', { name: /Apply/i })
      fireEvent.click(applyButton)
    })
  })
})
