import '@testing-library/jest-dom'
import React from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { venueApi }               from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  ConfigTemplateContext,
  PoliciesConfigTemplateUrlsInfo,
  RogueApUrls,
  VenueConfigTemplateUrlsInfo,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { VenueEditContext }     from '../..'
import {
  venueData,
  venueRogueAp,
  venueApTlsEnhancedKey,
  venueDosProtection,
  venueRoguePolicyList,
  rogueApPolicyNotDefaultProfile,
  mockRogueApPoliciesListRbac
} from '../../../__tests__/fixtures'


import { SecurityTab } from '.'

const params = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  venueId: 'f892848466d047798430de7ac234e940'
}
const mockedUpdateFn = jest.fn()
const mockGetRoguePolicy = jest.fn()

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {children ? children : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

describe('SecurityTab', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        CommonUrlsInfo.getDenialOfServiceProtection.url,
        (_, res, ctx) => res(ctx.json(venueDosProtection))),
      rest.get(
        CommonUrlsInfo.getVenueRogueAp.url,
        (_, res, ctx) => res(ctx.json(venueRogueAp))),
      rest.get(
        CommonUrlsInfo.getVenueApEnhancedKey.url,
        (_, res, ctx) => res(ctx.json(venueApTlsEnhancedKey))),
      rest.put(
        CommonUrlsInfo.updateVenueApEnhancedKey.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.put(
        CommonUrlsInfo.getDenialOfServiceProtection.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.put(
        CommonUrlsInfo.updateVenueRogueAp.url,
        (_, res, ctx) => {
          mockedUpdateFn()
          return res(ctx.json({ requestId: 'req1' }))
        }),
      rest.get(
        RogueApUrls.getRoguePolicy.url,
        (_, res, ctx) => res(ctx.json(rogueApPolicyNotDefaultProfile))
      ),
      rest.post(
        RogueApUrls.getEnhancedRoguePolicyList.url,
        (_, res, ctx) => {
          return res(ctx.json(venueRoguePolicyList))
        }),
      // RBAC API
      rest.get(
        WifiRbacUrlsInfo.getDenialOfServiceProtection.url,
        (_, res, ctx) => res(ctx.json(venueDosProtection))),
      rest.put(
        WifiRbacUrlsInfo.updateDenialOfServiceProtection.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        RogueApUrls.getRoguePolicyListRbac.url,
        (req, res, ctx) => res(
          ctx.json(mockRogueApPoliciesListRbac)
        )
      ),
      rest.put(
        WifiRbacUrlsInfo.updateVenueRogueAp.url,
        (_, res, ctx) => {
          mockedUpdateFn()
          return res(ctx.json({ requestId: 'req1' }))
        }),
      rest.get(
        WifiRbacUrlsInfo.getVenueRogueAp.url,
        (_, res, ctx) => res(
          mockGetRoguePolicy(),
          ctx.json({ reportThreshold: 0 }))
      ),
      rest.get(
        RogueApUrls.getRoguePolicyRbac.url,
        (_, res, ctx) => res(ctx.json(rogueApPolicyNotDefaultProfile))
      )
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
  it.skip('should render correctly', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          setEditContextData: jest.fn(),
          setEditSecurityContextData: jest.fn()
        }}>
          <SecurityTab />
        </VenueEditContext.Provider>
      </Provider>, { route: { params } })

    const switchButton = await screen.findAllByRole('switch')
    await userEvent.click(switchButton[0])
    await userEvent.click(switchButton[1])
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should render correctly with RogueApProfile settings', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          setEditContextData: jest.fn(),
          setEditSecurityContextData: jest.fn()
        }}>
          <SecurityTab />
        </VenueEditContext.Provider>
      </Provider>, { route: { params } })

    await screen.findByRole('option', { name: 'roguePolicy1' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[0],
      screen.getByRole('option', { name: 'roguePolicy1' })
    )

    await userEvent.click(await screen.findByRole('button', { name: 'View Details' }))

    await screen.findByTitle('Rogue AP Detection Policy Profile:')

    await screen.findByTitle('Classification rules (2)')

    const cancelButton = await screen.findAllByRole('button', { name: 'Cancel' })

    await userEvent.click(cancelButton[1])

    expect(screen.queryByText(/rogue ap detection policy details: roguepolicy1/i)).toBeNull()

    await screen.findByRole('option', { name: 'Default profile' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[0],
      screen.getByRole('option', { name: 'Default profile' })
    )

    expect(screen.queryByRole('option', { name: 'Default profile' })).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

    expect(mockedUpdateFn).toHaveBeenCalledTimes(1)
  })

  it('should render correctly with RogueApProfile settings then cancel', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          setEditContextData: jest.fn(),
          setEditSecurityContextData: jest.fn()
        }}>
          <SecurityTab />
        </VenueEditContext.Provider>
      </Provider>, { route: { params } })

    await screen.findByRole('option', { name: 'roguePolicy1' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[0],
      screen.getByRole('option', { name: 'roguePolicy1' })
    )

    await userEvent.click(await screen.findByRole('button', { name: 'View Details' }))

    await screen.findByTitle('Rogue AP Detection Policy Profile:')

    await screen.findByTitle('Classification rules (2)')

    const cancelButton = await screen.findAllByRole('button', { name: 'Cancel' })

    await userEvent.click(cancelButton[1])

    expect(screen.queryByText(/rogue ap detection policy details: roguepolicy1/i)).toBeNull()
  })

  it('should render correctly with TlsEnhancedKey settings then cancel', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueApEnhancedKey.url,
        (_, res, ctx) => res(ctx.json(venueApTlsEnhancedKey)))
    )

    render(
      <Provider>
        <VenueEditContext.Provider value={{
          setEditContextData: jest.fn(),
          setEditSecurityContextData: jest.fn()
        }}>
          <SecurityTab />
        </VenueEditContext.Provider>
      </Provider>, { route: { params } })

    await screen.findByText('TLS Enhanced Key (RSA 3072/ECDSA P-256)')

    const cancelButton = await screen.findAllByRole('button', { name: 'Cancel' })

    await userEvent.click(cancelButton[1])

    expect(screen.queryByText(/rogue ap detection policy details: roguepolicy1/i)).toBeNull()
  })

  it('should render correctly with RogueApProfile settings with RBAC turned on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)

    render(
      <Provider>
        <VenueEditContext.Provider value={{
          setEditContextData: jest.fn(),
          setEditSecurityContextData: jest.fn()
        }}>
          <SecurityTab />
        </VenueEditContext.Provider>
      </Provider>, { route: { params } })

    await waitFor(() => expect(mockGetRoguePolicy).toBeCalled())

    await screen.findByRole('option', { name: 'a123' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[0],
      screen.getByRole('option', { name: 'a123' })
    )

    await userEvent.click(await screen.findByRole('button', { name: 'View Details' }))

  })

  // eslint-disable-next-line max-len
  it('should render correctly with RogueApProfile settings with RBAC_CONFIG_TEMPLATE_TOGGLE turned on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_CONFIG_TEMPLATE_TOGGLE)

    const mockGetRoguePolicyTemplate = jest.fn()
    mockServer.use(
      rest.get(
        PoliciesConfigTemplateUrlsInfo.getVenueRogueAp.url,
        (_, res, ctx) => {
          return res(ctx.json({}))
        }),
      rest.post(
        PoliciesConfigTemplateUrlsInfo.getRoguePolicyListRbac.url,
        (req, res, ctx) => res(
          mockGetRoguePolicyTemplate(),
          ctx.json(mockRogueApPoliciesListRbac)
        )
      ),
      rest.get(
        PoliciesConfigTemplateUrlsInfo.getRoguePolicyRbac.url,
        (_, res, ctx) => {
          return res(ctx.json(rogueApPolicyNotDefaultProfile))
        }),
      rest.get(
        PoliciesConfigTemplateUrlsInfo.getVenueRogueApRbac.url,
        (_, res, ctx) => {
          return res(ctx.json(venueRogueAp))
        }),
      rest.get(
        VenueConfigTemplateUrlsInfo.getDenialOfServiceProtection.url,
        (_, res, ctx) => res(ctx.json(venueDosProtection))
      ),
      rest.get(
        VenueConfigTemplateUrlsInfo.getDenialOfServiceProtectionRbac.url,
        (_, res, ctx) => res(ctx.json(venueDosProtection))
      )
    )
    render(
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <Provider>
          <VenueEditContext.Provider value={{
            setEditContextData: jest.fn(),
            setEditSecurityContextData: jest.fn()
          }}>
            <SecurityTab />
          </VenueEditContext.Provider>
        </Provider></ConfigTemplateContext.Provider>, { route: { params } })

    await waitFor(() => expect(mockGetRoguePolicyTemplate).toBeCalled())

    await screen.findByRole('option', { name: 'a123' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[0],
      screen.getByRole('option', { name: 'a123' })
    )

    await userEvent.click(await screen.findByRole('button', { name: 'View Details' }))
  })
})
