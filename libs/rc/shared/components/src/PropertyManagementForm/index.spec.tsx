import userEvent       from '@testing-library/user-event'
import { rest }        from 'msw'
import { useNavigate } from 'react-router-dom'

import { useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  PropertyConfigs,
  PropertyUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitForElementToBeRemoved,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  mockEnabledNoPinPropertyConfig } from './__tests__/fixtures'

import { VenuePropertyManagementForm } from '.'

const mockPropertyFormInitialValuesFn = jest.fn()
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./PropertyManagementForm', () => ({
  ...jest.requireActual('./PropertyManagementForm'),
  PropertyManagementForm: (props: {
    venueId: string
    initialValues: PropertyConfigs
  }) => {
    mockPropertyFormInitialValuesFn(props.initialValues)
    return <div data-testid='PropertyManagementForm'>
      <span>{'venueId:' + props.venueId}</span>
      <span>{'initialValues:' + JSON.stringify(props.initialValues)}</span>
    </div>}
}))

describe('Venue > Property Config Form', () => {
  const tenantId = '15a04f095a8f4a96acaf17e921e8a6df'

  const enabledParams = { tenantId, venueId: 'f892848466d047798430de7ac234e940' }
  const disabledParams = { tenantId, venueId: '206f35d341834d48a526eed6f3afbf99' }

  const mockedPostSubmit = jest.fn()
  const saveConfigFn = jest.fn()

  beforeEach(async () => {
    mockedPostSubmit.mockClear()
    saveConfigFn.mockClear()

    mockServer.use(
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => {
          if (req.params.venueId === enabledParams.venueId) {
            return res(ctx.json(mockEnabledNoPinPropertyConfig))
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
      )
    )
  })

  it('should redirect while cancel form', async () => {
    const { tenantId, venueId } = enabledParams
    const { result } = renderHook(() => {
      const navigate = useNavigate()
      return { navigate }
    })

    const navigateToVenueOverview = () => {
      result.current.navigate({
        hash: '',
        search: '',
        pathname: `/${tenantId}/t/venues/${venueId}/venue-details/overview`
      })
    }

    render(<Provider>
      <VenuePropertyManagementForm
        venueId={enabledParams.venueId}
        onCancel={navigateToVenueOverview}
      />
    </Provider>, { route: { params: enabledParams } })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const cancelFormBtn = await screen.findByRole('button', { name: /cancel/i })
    await userEvent.click(cancelFormBtn)

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${tenantId}/t/venues/${venueId}/venue-details/overview`,
      hash: '',
      search: ''
    })
  })

  it('should render simple Property config tab with 404 api response', async () => {
    render(<Provider>
      <VenuePropertyManagementForm
        venueId={disabledParams.venueId}
        postSubmit={mockedPostSubmit}
      />
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
    expect(mockedPostSubmit).not.toBeCalled()
  })

  it.skip('should render Property config tab', async () => {
    render(
      <Provider>
        <VenuePropertyManagementForm
          venueId={enabledParams.venueId}
        />
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

  it('should render Property config tab with msg-template and save', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <VenuePropertyManagementForm
          venueId={enabledParams.venueId}
        />
      </Provider>, { route: { params: enabledParams } }
    )

    // check toggle with 'true' value
    const enableSwitch = await screen.findByTestId('property-enable-switch')
    await waitFor(() => expect(enableSwitch).toHaveAttribute('aria-checked', 'true'))

    // Trigger save form
    const formSaveBtn = await screen.findByRole('button', { name: /save/i })
    await userEvent.click(formSaveBtn)
  })

  it('should render resident portal selector correctly without residentPortalId', async () => {
    mockServer.use(
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => {
          return res(ctx.json({
            ...mockEnabledNoPinPropertyConfig,
            residentPortalId: undefined,
            unitConfig: {
              ...mockEnabledNoPinPropertyConfig.unitConfig,
              residentApiAllowed: true,
              residentPortalAllowed: false
            }
          }))
        }
      )
    )

    render(
      <Provider>
        <VenuePropertyManagementForm
          venueId={enabledParams.venueId}
        />
      </Provider>, { route: { params: enabledParams } }
    )

    // check toggle with 'true' value
    const enableSwitch = await screen.findByTestId('property-enable-switch')
    await waitFor(() => expect(enableSwitch).toHaveAttribute('aria-checked', 'true'))

    // Trigger save form
    const formSaveBtn = await screen.findByRole('button', { name: /save/i })
    await userEvent.click(formSaveBtn)
    expect(saveConfigFn).toHaveBeenCalled()
  })

  it('should pop up warning dialog while disable property', async () => {
    render(
      <Provider>
        <VenuePropertyManagementForm
          venueId={enabledParams.venueId}
        />
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
