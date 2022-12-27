
import { rest } from 'msw'

import { PersonaGroup, PersonaUrls }             from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { render, screen, fireEvent, mockServer } from '@acx-ui/test-utils'



import { PersonaGroupDrawer } from './index'

const mockPersonaGroup: PersonaGroup = {
  id: 'aaaaaaaa',
  name: 'Class A',
  description: '',
  macRegistrationPoolId: 'mac-id-1',
  dpskPoolId: 'dpsk-pool-2',
  nsgId: 'nsgId-700',
  propertyId: 'propertyId-100'
}

const mockPersonaGroupTableResult = {
  totalCount: 3,
  page: 1,
  content: [{
    id: 'aaaaaaaa',
    name: 'Class A',
    description: '',
    macRegistrationPoolId: 'mac-id-1',
    dpskPoolId: 'dpsk-pool-2',
    nsgId: 'nsgId-700',
    propertyId: 'propertyId-100'
  },
  {
    id: 'cccccccc',
    name: 'Class B',
    description: '',
    macRegistrationPoolId: 'mac-id-1',
    dpskPoolId: 'dpsk-pool-1',
    nsgId: 'nsgId-300',
    propertyId: 'propertyId-400'
  },
  {
    id: 'bbbbbbbb',
    name: 'Class C',
    description: '',
    macRegistrationPoolId: 'mac-id-1',
    dpskPoolId: 'dpsk-pool-1',
    nsgId: 'nsgId-100',
    propertyId: 'propertyId-600'
  }]
}

describe('Persona Group Drawer', () => {

  beforeEach(async () => {
    // mock: addPersonaGroup, updatePersonaGroup, getMacRegistrationPoolList
    mockServer.use(
      rest.post(
        PersonaUrls.searchPersonaGroupList.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupTableResult))
      )
    )
  })

  it('should add a persona group', async () => {
    render(
      <Provider>
        <PersonaGroupDrawer
          visible
          isEdit={false}
          onClose={jest.fn}
        />
      </Provider>
    )
    await screen.findByText('Create Persona Group')
    const nameField = await screen.findByLabelText('Persona Group Name') as HTMLInputElement
    fireEvent.change(nameField, { target: { value: 'New Persona Group Name' } })

    const addButton = await screen.findAllByRole('button', { name: /Add/i })
    fireEvent.click(addButton[addButton.length-1])
  })

  it('should edit a persona group', async () => {
    render(
      <Provider>
        <PersonaGroupDrawer
          isEdit
          visible
          data={mockPersonaGroup}
          onClose={jest.fn}
        />
      </Provider>
    )

    await screen.findByText('Edit Persona Group')
    const groupField = await screen.findByLabelText('Persona Group Name') as HTMLInputElement
    expect(groupField.value).toBe(mockPersonaGroup.name)

    const descriptionField = await screen.findByLabelText('Description') as HTMLTextAreaElement
    fireEvent.change(descriptionField, { target: { value: 'New description' } })

    const applyButton = await screen.findByRole('button', { name: /Apply/i })
    fireEvent.click(applyButton)
  })
})
