
import { within } from '@testing-library/react'
import userEvent  from '@testing-library/user-event'
import { rest }   from 'msw'

import { CommonUrlsInfo, MacRegListUrlsInfo, NewDpskBaseUrl, NewPersonaBaseUrl, PropertyUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved }                                   from '@acx-ui/test-utils'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  mockDpskList,
  mockMacRegistrationList,
  mockPersonaGroupList,
  replacePagination
} from '../../../../../../rc/src/pages/Users/Persona/__tests__/fixtures'
import { mockEnabledPropertyConfig } from '../../__tests__/fixtures'
import { VenueEditContext }          from '../index'

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

  beforeEach(async () => {
    setEditContextDataFn.mockClear()

    mockServer.use(
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => {
          if (req.params.venueId === enabledParams.venueId) {
            return res(ctx.json(mockEnabledPropertyConfig))
          } else {
            return res(ctx.status(404))
          }
        }
      ),
      rest.put(
        PropertyUrlsInfo.updatePropertyConfigs.url,
        (req, res, ctx) => res(ctx.json({}))
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
        PropertyUrlsInfo.getResidentPortalList.url,
        (req, res, ctx) => res(ctx.json({ content: [] }))
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
    await screen.findByRole('switch', {
      name: 'Enable Property Management',
      checked: false
    })

    // other fields should not render(e.g., Persona Group)
    const otherFields = screen.queryByText('Persona Group')
    expect(otherFields).toBeNull()

    const formSaveBtn = await screen.findByRole('button', { name: /save/i })

    await userEvent.click(formSaveBtn)
    expect(setEditContextDataFn).toBeCalled()
  })

  it('should render Property config tab', async () => {
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

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // check toggle with 'true' value
    await screen.findByRole('switch', {
      name: 'Enable Property Management',
      checked: true
    })

    // check rending other fields
    await screen.findByText('Persona Group')

    // Open addPersonaGroup drawer and close drawer.
    const addPersonaGroupButton = await screen.findByRole('button', { name: 'Add Persona Group' })
    await userEvent.click(addPersonaGroupButton)

    const personaGroupDrawer = await screen.findByRole('dialog')
    const cancelBtn = await within(personaGroupDrawer).findByRole('button', { name: /cancel/i })

    await userEvent.click(cancelBtn)
    expect(screen.queryByRole('dialog')).toBeNull()

    // Change any field to trigger setEditContextData function
    const residentSwitch = await screen.findByLabelText('Enable Resident Portal')

    await userEvent.click(residentSwitch)
    expect(setEditContextDataFn).toBeCalled()

    // Trigger save form
    const formSaveBtn = await screen.findByRole('button', { name: /save/i })
    await userEvent.click(formSaveBtn)
  })
})
