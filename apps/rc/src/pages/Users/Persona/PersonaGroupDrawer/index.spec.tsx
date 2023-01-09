import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  DpskBaseUrl,
  MacRegListUrlsInfo,
  PersonaBaseUrl,
  PersonaUrls
} from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'


import {
  mockDpskList,
  mockMacRegistrationList,
  mockPersonaGroup, mockPersonaGroupList,
  mockPersonaGroupTableResult
} from '../__tests__/fixtures'

import { PersonaGroupDrawer } from './index'


describe('Persona Group Drawer', () => {

  beforeEach(async () => {
    // mock: addPersonaGroup, updatePersonaGroup, getMacRegistrationPoolList
    mockServer.use(
      rest.get(
        PersonaBaseUrl,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupTableResult))
      ),
      rest.patch(
        PersonaUrls.updatePersonaGroup.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        PersonaBaseUrl,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPools.url,
        (req, res, ctx) => res(ctx.json(mockMacRegistrationList))
      ),
      rest.get(
        DpskBaseUrl,
        (req, res, ctx) => res(ctx.json(mockDpskList))
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
    const nameField = await screen.findByLabelText('Persona Group Name')
    await userEvent.type(nameField, 'New Persona Group Name')

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
    await userEvent.click(applyButton)
  })
})
