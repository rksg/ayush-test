import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  MacRegListUrlsInfo,
  NewPersonaBaseUrl,
  PersonaUrls,
  DpskUrls,
  RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'


import { mockedPolicySet } from '../../services/DpskForm/__tests__/fixtures'

import {
  mockDpskList,
  mockMacRegistrationList,
  mockPersonaGroup,
  mockPersonaGroupTableResult,
  mockAdaptivePolicySetTableResult,
  replacePagination
} from './__tests__/fixtures'

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
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedPolicySet }))
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
      rest.post(
        replacePagination(MacRegListUrlsInfo.searchMacRegistrationPools.url),
        (req, res, ctx) => res(ctx.json(mockMacRegistrationList))
      ),
      rest.post(
        DpskUrls.getEnhancedDpskList.url,
        (req, res, ctx) => res(ctx.json(mockDpskList))
      ),
      rest.get(
        replacePagination(RulesManagementUrlsInfo.getPolicySets.url),
        (_, res, ctx) => {
          return res(ctx.json(mockAdaptivePolicySetTableResult))
        }
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

    expect(dialogAddBtn).toBeTruthy()

    if (!dialogAddBtn) {
      throw new Error('can not find add btn in PersonaGroupDrawer')
    }

    await userEvent.click(dialogAddBtn)

    // Required fields
    await screen.findByText('Please enter Identity Group Name')

    const nameField = await screen.findByRole('textbox', { name: /identity group name/i })
    await userEvent.type(nameField, mockPersonaGroupTableResult.content[0].name)

    await userEvent.click(dialogAddBtn)

    // Name validator
    await screen.findByText('Identity Group with that name already exists')
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

    const selector = await screen.findAllByRole('combobox')
    expect(selector.length).toBe(2)

    // Select a DPSK Service
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
  })

  it('should render PersonaGroupDrawer without identityGroup', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.DPSK_REQUIRE_IDENTITY_GROUP)
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
    expect(screen.queryByText('DPSK Service')).toBeNull()
  })
})
