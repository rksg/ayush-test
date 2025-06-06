import userEvent                       from '@testing-library/user-event'
import { rest }                        from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import {
  AnalyticsPreferences,
  preferencesApi,
  useUpdateTenantSettingsMutation
} from '@acx-ui/analytics/services'
import { getUserProfile as getRaiUserProfile, UserProfile }      from '@acx-ui/analytics/utils'
import { get }                                                   from '@acx-ui/config'
import { notificationApiURL, Provider, store }                   from '@acx-ui/store'
import { render, screen, mockServer, waitFor, mockRestApiQuery } from '@acx-ui/test-utils'
import { CatchErrorDetails }                                     from '@acx-ui/utils'

import { AiFeatures }                                                                                       from './config'
import { Settings, convertToDbConfig, getEnabledIntentSubscriptionsFromDb, prepareNotificationPreferences } from './Settings'

const components = require('@acx-ui/components')
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
const mockGet = jest.mocked(get)
jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn()
}))
const mockRaiUserProfile = jest.mocked(getRaiUserProfile)
const mockedIntentNotificationsWithoutIntentAI = {
  incident: {
    P1: ['email'],
    P2: ['email']
  }
} as AnalyticsPreferences

const mockedUseUpdateTenantSettingsMutation = useUpdateTenantSettingsMutation as jest.Mock
jest.mock('@acx-ui/analytics/services', () => ({
  ...jest.requireActual('@acx-ui/analytics/services'),
  useUpdateTenantSettingsMutation: jest.fn()
}))

describe('IntentAI Settings', () => {
  beforeEach(() => {
    const updateSettingsMock = jest.fn(() => Promise.resolve({ data: 'Created' }))
    mockedUseUpdateTenantSettingsMutation.mockImplementation(() =>
      [updateSettingsMock, { isLoading: false }])
    mockServer.use(
      rest.get(`${notificationApiURL}/preferences`,
        (_req, res, ctx) => res(ctx.json(mockedIntentNotificationsWithoutIntentAI))),
      rest.post(`${notificationApiURL}/preferences`,
        (_req, res, ctx) => res(ctx.json({ success: true })))
    )
  })
  afterEach(() => {
    store.dispatch(preferencesApi.util.resetApiState())
    components.showToast.mockClear()
    mockedUseUpdateTenantSettingsMutation.mockClear()
  })
  it('should render Settings and about intents drawer', async () => {
    const settings = JSON.stringify({
      [AiFeatures.EcoFlex]: true
    })
    render(<Settings settings={settings}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    const intentSubscriptions = await screen.findByText('Intent Subscriptions (4)') // default has 3, so total 4 with EcoFlex
    expect(intentSubscriptions).toBeVisible()
    await userEvent.click(intentSubscriptions)
    expect(await screen.findByText('Available Intents')).toBeVisible()
    expect(await screen.findByText('Notifications')).toBeVisible()
    const aboutIntents = await screen.findByTestId('about-intents')
    await userEvent.click(aboutIntents)
    const closeButtons = await screen.findAllByTestId('CloseSymbol')
    await userEvent.click(closeButtons.at(1)!)
    await userEvent.click(closeButtons.at(0)!)
    expect(intentSubscriptions).toBeVisible()
  })
  it('should save settings', async () => {
    const settings = JSON.stringify({
      [AiFeatures.EcoFlex]: true
    })
    render(<Settings settings={settings}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    const intentSubscriptions = await screen.findByText('Intent Subscriptions (4)')
    expect(intentSubscriptions).toBeVisible()
    await userEvent.click(await screen.findByTestId('intent-subscriptions'))
    expect(await screen.findByText('Available Intents')).toBeVisible()
    expect(await screen.findByText('Notifications')).toBeVisible()
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()

    const item = screen.getByText('Energy Saving')
    await userEvent.click(item)
    const addButton = screen.getByRole('button', {
      name: /remove/i
    })
    expect(addButton).toBeTruthy()
    await userEvent.click(addButton)
    const checkbox = await screen.findByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    await userEvent.click(checkbox)

    await userEvent.click(applyBtn)
    await waitFor(() => {
      expect(components.showToast)
        .toHaveBeenLastCalledWith({
          type: 'success',
          content: 'Subscriptions saved successfully!'
        })
    })
  })
  it('should handle error on save settings for tenantSettings', async () => {
    const error = 'tenantSettings server error'
    const updateSettingsMock = jest.fn(() => Promise.resolve({
      error: {
        status: 500,
        data: JSON.stringify({ error })
      }
    }))
    mockedUseUpdateTenantSettingsMutation.mockImplementation(() =>
      [updateSettingsMock, { isLoading: false }])
    const settings = JSON.stringify({
      [AiFeatures.EcoFlex]: true
    })
    render(<Settings settings={settings}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    const intentSubscriptions = await screen.findByText('Intent Subscriptions (4)')
    expect(intentSubscriptions).toBeVisible()
    await userEvent.click(await screen.findByTestId('intent-subscriptions'))
    expect(await screen.findByText('Available Intents')).toBeVisible()
    expect(await screen.findByText('Notifications')).toBeVisible()
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()
    await userEvent.click(applyBtn)
    await waitFor(() => {
      expect(components.showToast)
        .toHaveBeenLastCalledWith({
          type: 'error',
          content: JSON.stringify({ error })
        })
    })
  })
  it('should handle error on save settings for notification preferences', async () => {
    const errorMsg = 'notification preferences server error'
    const errors = [{ message: errorMsg }] as CatchErrorDetails[]
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'post', { errors }, false, true)
    const settings = JSON.stringify(['Energy Saving'])
    render(<Settings settings={settings}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByTestId('intent-subscriptions'))
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(applyBtn)
    await waitFor(() => {
      expect(components.showToast)
        .toHaveBeenLastCalledWith({
          type: 'error',
          content: errorMsg
        })
    })
  })
  describe('should render hyperlinks', () => {
    beforeEach(() => {
      mockGet.mockReturnValue('')
    })
    afterEach(() => {
      mockGet.mockReset()
    })
    it('should render the correct links in RAI', async () => {
      mockGet.mockReturnValue('true')
      mockRaiUserProfile.mockReturnValue({ selectedTenant: 'tenant-id' } as unknown as UserProfile)
      const settings = JSON.stringify({
        [AiFeatures.EcoFlex]: true
      })
      render(
        <Provider>
          <MemoryRouter initialEntries={['/ai/intentAI']}>
            <Routes>
              <Route path='/ai/profile/notifications'
                element={<div>Notifications Page</div>} />
              <Route path='/ai/intentAI'
                element={<Settings settings={settings} />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      )
      const intentSubscriptions = await screen.findByText('Intent Subscriptions (4)')
      expect(intentSubscriptions).toBeVisible()
      await userEvent.click(await screen.findByTestId('intent-subscriptions'))
      expect(await screen.findByRole('link')).toHaveAttribute(
        'href', '/ai/profile/notifications')
      const tenantLink = await screen.findByRole('link', { name: /Manage in My Preferences/i })
      await userEvent.click(tenantLink)
      expect(sessionStorage.getItem('intent-subscription-forward-r1-show-drawer')).toBeNull()
    })
    it('should render the correct links in R1', async () => {
      const settings = JSON.stringify({
        [AiFeatures.EcoFlex]: true
      })
      render(
        <Provider>
          <MemoryRouter initialEntries={['/tenant-id/t/analytics/intentAI']}>
            <Routes>
              <Route path='/:tenantId/t/administration/notifications'
                element={<div>Notifications Page</div>} />
              <Route path='/:tenantId/t/analytics/intentAI'
                element={<Settings settings={settings} />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      )
      const intentSubscriptions = await screen.findByText('Intent Subscriptions (4)')
      expect(intentSubscriptions).toBeVisible()
      await userEvent.click(await screen.findByTestId('intent-subscriptions'))
      expect(await screen.findByRole('link')).toHaveAttribute(
        'href', '/tenant-id/t/administration/notifications')
      const tenantLink = await screen.findByRole('link', { name: /Manage in My Preferences/i })
      await userEvent.click(tenantLink)
      expect(sessionStorage.getItem('intent-subscription-forward-r1-show-drawer')).toEqual('true')
    })
  })
  describe('should generate notification preferences correctly for IntentAI Settings', () => {
    it('should add intentAI to preferences when notification is checked', async () => {
      let result = prepareNotificationPreferences(mockedIntentNotificationsWithoutIntentAI, true)
      expect(result).toEqual({
        ...mockedIntentNotificationsWithoutIntentAI,
        intentAI: { all: ['email'] }
      })
    })
    it('should remove intentAI from preferences when notification is unchecked', async () => {
      const preferencesWithIntentAI = {
        ...mockedIntentNotificationsWithoutIntentAI,
        intentAI: { all: ['email'] }
      } as AnalyticsPreferences
      let result = prepareNotificationPreferences(preferencesWithIntentAI, false)
      expect(result).toEqual(mockedIntentNotificationsWithoutIntentAI)
    })
    it('should not change original data when intentAI item already exists or not exist',
      async () => {
        // intentAI item already exists
        const preferencesWithIntentAI = {
          ...mockedIntentNotificationsWithoutIntentAI,
          intentAI: { all: ['email'] }
        } as AnalyticsPreferences
        let result = prepareNotificationPreferences(preferencesWithIntentAI, true)
        expect(result).toEqual(preferencesWithIntentAI)
        // intentAI item does not exists
        result = prepareNotificationPreferences(mockedIntentNotificationsWithoutIntentAI, false)
        expect(result).toEqual(mockedIntentNotificationsWithoutIntentAI)
      })
  })
})

describe('Intent Subscription DB/UI Format Conversion', () => {
  it('should use default config when user has not configured yet after parsing from DB', () => {
    const dbConfig = {}
    const result = getEnabledIntentSubscriptionsFromDb(JSON.stringify(dbConfig))
    expect(result).toEqual([
      AiFeatures.RRM,
      AiFeatures.AIOps,
      AiFeatures.EquiFlex
    ])
  })
  it('should merge DB config with default config after parsing from DB', () => {
    const dbConfig = {
      [AiFeatures.RRM]: false,
      [AiFeatures.AIOps]: true
    }
    const result = getEnabledIntentSubscriptionsFromDb(JSON.stringify(dbConfig))
    expect(result).toEqual([
      AiFeatures.AIOps,
      AiFeatures.EquiFlex
    ])
  })
  it('should parse from UI format to DB format', () => {
    const uiConfig = [
      AiFeatures.RRM,
      AiFeatures.EcoFlex
    ]
    const result = convertToDbConfig(uiConfig)
    expect(JSON.parse(result)).toEqual({
      [AiFeatures.RRM]: true,
      [AiFeatures.AIOps]: false,
      [AiFeatures.EquiFlex]: false,
      [AiFeatures.EcoFlex]: true
    })
  })
})