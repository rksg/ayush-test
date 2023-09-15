import { waitFor } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'

import {
  NewDpskBaseUrl,
  MacRegListUrlsInfo,
  NewPersonaBaseUrl,
  PersonaUrls
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'


import {
  mockDpskList,
  mockMacRegistrationList,
  mockPersonaGroup,
  mockPersonaGroupTableResult,
  replacePagination
} from '../__tests__/fixtures'

import { PersonaGroupDrawer } from './index'

const updatePersonaSpy = jest.fn()
const createPersonaGroupSpy = jest.fn()
const closeFn = jest.fn()

describe('Persona Group Drawer', () => {
  let params: { tenantId: string }

  beforeEach(async () => {
    closeFn.mockClear()

    mockServer.use(
      rest.post(
        replacePagination(PersonaUrls.searchPersonaGroupList.url),
        (req, res, ctx) => res(ctx.json(mockPersonaGroupTableResult))
      ),
      rest.patch(
        PersonaUrls.updatePersonaGroup.url,
        (req, res, ctx) => {
          updatePersonaSpy()
          return res(ctx.json({}))
        }
      ),
      rest.post(
        NewPersonaBaseUrl,
        (req, res, ctx) => {
          createPersonaGroupSpy()
          return res(ctx.json(mockPersonaGroup))
        }
      ),
      rest.get(
        replacePagination(MacRegListUrlsInfo.getMacRegistrationPools.url),
        (req, res, ctx) => res(ctx.json(mockMacRegistrationList))
      ),
      rest.get(
        NewDpskBaseUrl,
        (req, res, ctx) => res(ctx.json(mockDpskList))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render PersonaGroupDrawer and validate fields correctly', async () => {
    render(
      <Provider>
        <PersonaGroupDrawer
          visible
          isEdit={false}
          onClose={closeFn}
        />
      </Provider>
    )

    await screen.findByRole('dialog')
    const addButtons = await screen.findAllByRole('button', { name: /add/i })
    const dialogAddBtn = addButtons.find(b => !b.hasAttribute('data-testid'))

    expect(dialogAddBtn).not.toBe(undefined)

    // @ts-ignore
    await userEvent.click(dialogAddBtn)

    // Required fields
    await screen.findByText('Please enter Identity Group Name')
    await screen.findByText('Please select a DPSK Service')

    const nameField = await screen.findByRole('textbox', { name: /identity group name/i })
    await userEvent.type(nameField, mockPersonaGroupTableResult.content[0].name)

    // @ts-ignore
    await userEvent.click(dialogAddBtn)

    // Name validator
    await waitFor(async () =>
      await screen.findByText('Identity Group with that name already exists'))
  })

  it('should add a persona group', async () => {
    render(
      <Provider>
        <PersonaGroupDrawer
          visible
          isEdit={false}
          onClose={closeFn}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/identity-management/identity-group' }
      }
    )

    await screen.findByRole('dialog')

    const nameField = await screen.findByRole('textbox', { name: /identity group name/i })
    await userEvent.type(nameField, 'New Identity Group Name')

    // Select a DPSK Service
    const selector = await screen.findAllByRole('combobox')
    const dpskPoolSelector = selector[0]
    await userEvent.click(dpskPoolSelector)
    await userEvent.type(dpskPoolSelector, 'DPSK')
    await userEvent.click(await screen.findByText('DPSK Service 1'))

    // Select a MAC Pool
    const macSelector = selector[1]
    await userEvent.click(macSelector)
    await userEvent.type(macSelector, 'mac')
    await userEvent.click(await screen.findByText('mac-name-1'))

    // Submit
    const addButton = await screen.findAllByRole('button', { name: /Add/i })
    await userEvent.click(addButton[addButton.length - 1])

    await waitFor(() => expect(createPersonaGroupSpy).toHaveBeenCalled())
    await screen.findByText('Identity Group New Identity Group Name was added')
  })

  it('should edit a persona group', async () => {
    render(
      <Provider>
        <PersonaGroupDrawer
          visible
          isEdit
          data={mockPersonaGroup}
          onClose={closeFn}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/identity-management/identity-group' }
      }
    )

    await screen.findByText('Edit Identity Group')

    const nameField = await screen.findByRole('textbox', { name: /identity group name/i })
    expect(nameField).toHaveAttribute('value', mockPersonaGroup.name)

    const descriptionField = await screen.findByLabelText('Description')
    await userEvent.type(descriptionField,'New description')

    const applyButton = await screen.findByRole('button', { name: /Apply/i })
    await userEvent.click(applyButton)

    await waitFor(() => expect(updatePersonaSpy).toHaveBeenCalled())
    await screen.findByText('Identity Group Class A was updated')
  })
})
