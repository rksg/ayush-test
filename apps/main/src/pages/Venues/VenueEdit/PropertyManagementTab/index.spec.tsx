
import { waitFor, within } from '@testing-library/react'
import userEvent           from '@testing-library/user-event'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  mockDpskList,
  mockMacRegistrationList,
  mockPersonaGroupList,
  replacePagination
} from 'apps/rc/src/pages/Users/Persona/__tests__/fixtures'
import { rest } from 'msw'

import { useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  MacRegListUrlsInfo,
  MsgTemplateUrls,
  NewDpskBaseUrl,
  NewPersonaBaseUrl,
  PersonaUrls,
  PropertyUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  mockedTemplateScope,
  mockEnabledNoNSGPropertyConfig,
  mockPropertyUnitList,
  mockResidentPortalProfileList
} from '../../__tests__/fixtures'
import { VenueEditContext } from '../index'

import { PropertyManagementTab } from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Property Config Tab', () => {
  const tenantId = '15a04f095a8f4a96acaf17e921e8a6df'

  const enabledParams = { tenantId, venueId: 'f892848466d047798430de7ac234e940' }
  const disabledParams = { tenantId, venueId: '206f35d341834d48a526eed6f3afbf99' }

  const setEditContextDataFn = jest.fn()
  const saveConfigFn = jest.fn()

  beforeEach(async () => {
    setEditContextDataFn.mockClear()
    saveConfigFn.mockClear()

    mockServer.use(
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => {
          if (req.params.venueId === enabledParams.venueId) {
            return res(ctx.json(mockEnabledNoNSGPropertyConfig))
          } else {
            return res(ctx.status(404))
          }
        }
      ),
      rest.put(
        PropertyUrlsInfo.updatePropertyConfigs.url,
        (req, res, ctx) => {
          saveConfigFn()
          return res(ctx.json({}))
        }
      ),
      rest.patch(
        PropertyUrlsInfo.patchPropertyConfigs.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (req, res, ctx) => res(ctx.json({ data: 'venue-id' }))
      ),
      rest.get(
        replacePagination(PropertyUrlsInfo.getResidentPortalList.url),
        (req, res, ctx) => res(ctx.json(mockResidentPortalProfileList))
      ),
      rest.get(
        NewPersonaBaseUrl,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.get(
        replacePagination(MacRegListUrlsInfo.getMacRegistrationPools.url),
        (req, res, ctx) => res(ctx.json(mockMacRegistrationList))
      ),
      rest.get(
        NewDpskBaseUrl,
        (req, res, ctx) => res(ctx.json(mockDpskList))
      ),
      rest.post(
        PropertyUrlsInfo.getPropertyUnitList.url,
        (_, res, ctx) => res(ctx.json(mockPropertyUnitList))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (_, res, ctx) => res(ctx.json(mockPersonaGroupList.content[0]))
      ),
      rest.get(
        MsgTemplateUrls.getTemplateScopeByIdWithRegistration.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockedTemplateScope))
      )
    )
  })

  it('should redirect while cancel form', async () => {
    render(<Provider>
      <VenueEditContext.Provider
        // @ts-ignore
        value={{ editContextData: {}, setEditContextData: setEditContextDataFn }}
      >
        <PropertyManagementTab />
      </VenueEditContext.Provider>
    </Provider>, { route: { params: enabledParams } })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const cancelFormBtn = await screen.findByRole('button', { name: /cancel/i })
    await userEvent.click(cancelFormBtn)

    const { tenantId, venueId } = enabledParams
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${tenantId}/t/venues/${venueId}/venue-details/overview`,
      hash: '',
      search: ''
    })
  })

  it('should render simple Property config tab with 404 api response', async () => {
    render(<Provider>
      <VenueEditContext.Provider
        // @ts-ignore
        value={{ editContextData: {}, setEditContextData: setEditContextDataFn }}
      >
        <PropertyManagementTab />
      </VenueEditContext.Provider>
    </Provider>, { route: { params: disabledParams } })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // check toggle with 'false' value
    const enableSwitch = await screen.findByTestId('property-enable-switch')
    expect(enableSwitch).toHaveAttribute('aria-checked', 'false')

    // other fields should not render(e.g., Identity Group)
    const otherFields = screen.queryByText('Identity Group')
    expect(otherFields).toBeNull()

    const formSaveBtn = await screen.findByRole('button', { name: /save/i })

    await userEvent.click(formSaveBtn)
    expect(setEditContextDataFn).toBeCalled()
  })

  it.skip('should render Property config tab', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider
          // @ts-ignore
          value={{ editContextData: null, setEditContextData: setEditContextDataFn }}
        >
          <PropertyManagementTab />
        </VenueEditContext.Provider>
      </Provider>, { route: { params: enabledParams } }
    )

    // check toggle with 'true' value
    const enableSwitch = await screen.findByTestId('property-enable-switch')
    await waitFor(() => expect(enableSwitch).toHaveAttribute('aria-checked', 'true'))

    // check rending other fields
    await screen.findByText('Identity Group')

    // Open addPersonaGroup drawer and close drawer.
    const addIdentityGroupButton = await screen.findByRole('button', { name: 'Add Identity Group' })
    await userEvent.click(addIdentityGroupButton)

    const personaGroupDrawer = await screen.findByRole('dialog')
    const cancelBtn = await within(personaGroupDrawer).findByRole('button', { name: /cancel/i })

    await userEvent.click(cancelBtn)
    expect(screen.queryByRole('dialog')).toBeNull()

    // Trigger save form
    const formSaveBtn = await screen.findByRole('button', { name: /save/i })
    await userEvent.click(formSaveBtn)

    await waitFor(() => expect(saveConfigFn).toHaveBeenCalled())
  })

  it.skip('should render Property config tab with msg-template', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <VenueEditContext.Provider
          // @ts-ignore
          value={{ editContextData: null, setEditContextData: setEditContextDataFn }}
        >
          <PropertyManagementTab />
        </VenueEditContext.Provider>
      </Provider>, { route: { params: enabledParams } }
    )

    // check toggle with 'true' value
    const enableSwitch = await screen.findByTestId('property-enable-switch')
    await waitFor(() => expect(enableSwitch).toHaveAttribute('aria-checked', 'true'))

    // check rending msg-template tab list view
    await screen.findByRole('tablist')
  })

  it('should pop up warning dialog while disable property', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider
          // @ts-ignore
          value={{ editContextData: null, setEditContextData: setEditContextDataFn }}
        >
          <PropertyManagementTab />
        </VenueEditContext.Provider>
      </Provider>, { route: { params: enabledParams } }
    )

    // check toggle with 'true' value
    const enableSwitch = await screen.findByTestId('property-enable-switch')
    await waitFor(() => expect(enableSwitch).toHaveAttribute('aria-checked', 'true'))

    // try to disable PropertyConfig
    await userEvent.click(enableSwitch)

    // type confirm text
    const confirmBox = await screen.findByRole(
      'textbox',
      { name: /type the word "delete" to confirm:/i }
    )
    await userEvent.type(confirmBox, 'delete')

    const confirmButton = await screen.findByRole('button', { name: /delete/i })
    await userEvent.click(confirmButton)

    // check switch has been OFF
    expect(enableSwitch).toHaveAttribute('aria-checked', 'false')
  })
})
