import { waitFor } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'

import {
  MacRegListUrlsInfo,
  NewPersonaBaseUrl,
  PersonaUrls
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  mockPersonaTableResult,
  mockPersonaGroupList,
  mockPersona,
  mockPersonaGroup,
  mockMacRegistration,
  replacePagination
} from '../__tests__/fixtures'

import { PersonaDrawer } from './index'

const closeFn = jest.fn()

describe('Persona Drawer', () => {
  beforeEach( async () => {
    closeFn.mockClear()

    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        NewPersonaBaseUrl,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.post(
        replacePagination(PersonaUrls.searchPersonaList.url),
        (req, res, ctx) => res(ctx.json(mockPersonaTableResult))
      ),
      // rest.put(
      //   PersonaUrls.updatePersona.url,
      //   (req, res, ctx) => res(ctx.json({}))
      // ),
      rest.post(
        PersonaUrls.addPersona.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json(mockMacRegistration))
      ),
      rest.patch(
        PersonaUrls.updatePersona.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should add a persona', async () => {
    render(
      <Provider>
        <PersonaDrawer
          visible
          isEdit={false}
          onClose={closeFn}
        />
      </Provider>
    )

    // Type Identity Group Name field
    const nameField = await screen.findByLabelText('Identity Name')
    await userEvent.type(nameField , 'New Identity Name')

    const groupSelector = await screen.findByRole('combobox', { name: /identity group/i })

    // Expend PersonaGroupSelector and select one option
    await userEvent.click(groupSelector)
    await userEvent.click(await screen.findByText(mockPersonaGroupList.content[0].name))

    const addButton = await screen.findByRole('button', { name: 'Add' })

    // Trigger create and wait for api completed to make sure close function be called.
    await userEvent.click(addButton)
    await waitFor(() => expect(closeFn).toHaveBeenCalled())
  })

  it('should edit a persona', async () => {
    render(
      <Provider>
        <PersonaDrawer
          isEdit
          visible
          data={mockPersona}
          onClose={closeFn}
        />
      </Provider>
    )

    // Check title is edit mode
    await screen.findByText('Edit Identity')
    const groupField = await screen.findByLabelText('Identity Name') as HTMLInputElement
    expect(groupField.value).toBe(mockPersona.name)

    // Change description field
    const descriptionField = await screen.findByLabelText('Description') as HTMLTextAreaElement
    await userEvent.type(descriptionField, 'New description')

    const applyButton = await screen.findByRole('button', { name: /Apply/i })

    // Trigger update and wait for api completed to make sure close function be called.
    await userEvent.click(applyButton)
    await waitFor(() => expect(closeFn).toHaveBeenCalled())
  })
})
