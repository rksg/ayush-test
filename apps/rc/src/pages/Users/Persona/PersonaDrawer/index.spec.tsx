import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { PersonaBaseUrl, PersonaUrls }                from '@acx-ui/rc/utils'
import { Provider }                                   from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, act } from '@acx-ui/test-utils'

import { mockPersonaTableResult, mockPersonaGroupList, mockPersona } from '../__tests__/fixtures'

import { PersonaDrawer } from './index'

describe('Persona Drawer', () => {

  beforeEach( async () => {
    mockServer.use(
      rest.get(
        PersonaBaseUrl,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.post(
        PersonaUrls.searchPersonaList.url,
        (req, res, ctx) => res(ctx.json(mockPersonaTableResult))
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
      const nameField = await screen.findByLabelText('Persona Name')
      await userEvent.type(nameField , 'New Persona Group Name')

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
