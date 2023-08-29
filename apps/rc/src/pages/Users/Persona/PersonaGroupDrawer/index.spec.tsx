import { waitFor }       from '@testing-library/react'
import userEvent         from '@testing-library/user-event'
import { rest }          from 'msw'
import { BrowserRouter } from 'react-router-dom'

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
  mockPersonaGroup, mockPersonaGroupList,
  mockPersonaGroupTableResult,
  replacePagination
} from '../__tests__/fixtures'

import { PersonaGroupDrawer } from './index'

const closeFn = jest.fn()

describe.skip('Persona Group Drawer', () => {

  beforeEach(async () => {
    closeFn.mockClear()

    // mock: addPersonaGroup, updatePersonaGroup, getMacRegistrationPoolList
    mockServer.use(
      rest.get(
        NewPersonaBaseUrl,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.post(
        replacePagination(PersonaUrls.searchPersonaGroupList.url),
        (req, res, ctx) => res(ctx.json(mockPersonaGroupTableResult))
      ),
      rest.patch(
        PersonaUrls.updatePersonaGroup.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        NewPersonaBaseUrl,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
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
  })

  it('should add a persona group', async () => {
    render(
      <Provider>
        <PersonaGroupDrawer
          visible
          isEdit={false}
          onClose={closeFn}
        />
      </Provider>
    )
    await screen.findByText('Create Persona Group')
    const nameField = await screen.findByLabelText('Persona Group Name')
    await userEvent.type(nameField, 'New Persona Group Name')

    // Select a DPSK Service
    const selector = await screen.findAllByRole('combobox')
    const dpskPoolSelector = selector[0]
    await userEvent.click(dpskPoolSelector)
    await userEvent.click(await screen.findByText('DPSK Service 1'))

    const addButton = await screen.findAllByRole('button', { name: /Add/i })

    await userEvent.click(addButton[addButton.length-1])
    await waitFor(() => expect(closeFn).toHaveBeenCalled())
  })

  it('should edit a persona group', async () => {
    render(
      <Provider>
        <BrowserRouter>
          <PersonaGroupDrawer
            isEdit
            visible
            data={mockPersonaGroup}
            onClose={closeFn}
          />
        </BrowserRouter>
      </Provider>
    )

    await screen.findByText('Edit Persona Group')
    const groupField = await screen.findByLabelText('Persona Group Name') as HTMLInputElement
    expect(groupField.value).toBe(mockPersonaGroup.name)

    const descriptionField = await screen.findByLabelText('Description')
    await userEvent.type(descriptionField,'New description')

    const applyButton = await screen.findByRole('button', { name: /Apply/i })
    await userEvent.click(applyButton)
    await waitFor(() => expect(closeFn).toHaveBeenCalled())
  })
})
