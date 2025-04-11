import '@testing-library/jest-dom'

import { rest } from 'msw'

import type { Settings }                                                                               from '@acx-ui/analytics/utils'
import { useIsSplitOn }                                                                                from '@acx-ui/feature-toggle'
import { dataApiURL, Provider, rbacApiURL }                                                            from '@acx-ui/store'
import { render, screen, mockServer, fireEvent, mockGraphqlQuery, waitForElementToBeRemoved, waitFor } from '@acx-ui/test-utils'
import { WifiScopes }                                                                                  from '@acx-ui/types'
import { getUserProfile, setUserProfile }                                                              from '@acx-ui/user'
import { AccountType }                                                                                 from '@acx-ui/utils'

import { mockBrandTimeseries, prevTimeseries, currTimeseries, propertiesMappingData, franchisorZones } from './__tests__/fixtures'
import { FranchisorTimeseries }                                                                        from './services'

import { Brand360 } from '.'

const services = require('@acx-ui/msp/services')
const rcServices = require('@acx-ui/rc/services')
const utils = require('@acx-ui/utils')

jest.mock('./Table', () => ({
  BrandTable: ({ sliceType, slaThreshold }: { sliceType: string, slaThreshold: Settings }) =>
    <div data-testid={'brand360Table'}>
      {sliceType} {JSON.stringify(slaThreshold)}
    </div>
}))
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services')
}))
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils')
}))
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => jest.fn()
}))
const wrapData = (value: unknown) => ({
  data: {
    franchisorTimeseries: value as FranchisorTimeseries
  }
})

jest.mock('./SlaTile', () => ({
  SlaTile: ({
    chartKey,
    sliceType,
    chartData,
    prevData,
    currData
  }
  :{
    chartKey: string,
    sliceType: string,
    chartData: string,
    prevData: string,
    currData: string
  }) =>
    <div data-testid={'brand360Tile'}>
      {JSON.stringify({ chartKey, sliceType, chartData, prevData, currData })}
    </div>
}))
jest.mock('./Settings', () => ({
  ConfigSettings: () => <div data-testid='settings'></div>
}))

describe('Brand360', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(`${rbacApiURL}/tenantSettings`, (_req, res, ctx) => res(ctx.text(
        // eslint-disable-next-line max-len
        '[{"key": "sla-p1-incidents-count", "value": "1"},{"key": "sla-guest-experience", "value": "2"},{"key": "sla-brand-ssid-compliance", "value": "3"}]'
      )))
    )
    services.useMspECListQuery = jest.fn().mockImplementation(() => {
      return { data: propertiesMappingData }
    })
    rcServices.useGetTenantDetailsQuery = jest.fn(() => {
      return { data: { mspEc: { parentMspId: 'parentTenantId' } } }
    })
    services.useIntegratorCustomerListDropdownQuery = jest.fn(() => {
      return { data: propertiesMappingData }
    })
    mockGraphqlQuery(dataApiURL, 'FranchisorZones', {
      data: { franchisorZones: franchisorZones.data }
    })
    utils.getJwtTokenPayload = jest.fn(() => ({
      tenantId: 'testTenantId',
      tenantType: AccountType.MSP_REC
    }))
    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2023-12-12T00:00:00+00:00')))
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })
  afterEach(() => jest.useRealTimers())
  it('renders msp widgets', async () => {
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', mockBrandTimeseries)
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(prevTimeseries))
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(currTimeseries))
    render(<Provider><Brand360 /></Provider>)
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findAllByDisplayValue('Last 8 Hours')).toHaveLength(2)
    const tiles = await screen.findAllByTestId('brand360Tile')
    expect(tiles).toHaveLength(3)
    tiles.forEach(tile => expect(tile).toBeVisible())
    // eslint-disable-next-line max-len
    expect(await screen.findAllByText('lsp {"brand-ssid-compliance-matcher":"^[a-zA-Z0-9]{5}_GUEST$","sla-p1-incidents-count":"1","sla-guest-experience":"2","sla-brand-ssid-compliance":"3"}')).toHaveLength(1)
    expect(await screen.findByTestId('brand360Table')).toBeVisible()
  })
  it('should render with empty mspPropertiesData', async () => {
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', mockBrandTimeseries)
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(prevTimeseries))
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(currTimeseries))
    services.useMspECListQuery = jest.fn().mockImplementation(() => {
      return { data: null }
    })
    render(<Provider><Brand360 /></Provider>)
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findAllByDisplayValue('Last 8 Hours')).toHaveLength(2)
    const tiles = await screen.findAllByTestId('brand360Tile')
    expect(tiles).toHaveLength(3)
    tiles.forEach(tile => expect(tile).toBeVisible())
    // eslint-disable-next-line max-len
    expect(await screen.findAllByText('lsp {"brand-ssid-compliance-matcher":"^[a-zA-Z0-9]{5}_GUEST$","sla-p1-incidents-count":"1","sla-guest-experience":"2","sla-brand-ssid-compliance":"3"}')).toHaveLength(1)
    expect(await screen.findByTestId('brand360Table')).toBeVisible()
  })
  it('changes sliceType', async () => {
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', mockBrandTimeseries)
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(prevTimeseries))
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(currTimeseries))
    render(<Provider><Brand360 /></Provider>)
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    fireEvent.click(await screen.findByTestId('CaretDownSolid'))
    fireEvent.click(await screen.findByText('Property'))
    // eslint-disable-next-line max-len
    expect(await screen.findAllByText('property {"brand-ssid-compliance-matcher":"^[a-zA-Z0-9]{5}_GUEST$","sla-p1-incidents-count":"1","sla-guest-experience":"2","sla-brand-ssid-compliance":"3"}')).toHaveLength(1)
    expect(await screen.findByTestId('brand360Table')).toBeVisible()
    const tiles = await screen.findAllByTestId('brand360Tile')
    const tile = tiles[0]
    expect(tile.textContent?.includes('property')).toBeTruthy()
  })
  it('applies SLAs', async () => {
    const update = new Promise(resolve => mockServer.use(
      rest.post(`${rbacApiURL}/tenantSettings`, ({ body }, res) => {
        resolve(body)
        return res()
      })
    ))
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', mockBrandTimeseries)
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(prevTimeseries))
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(currTimeseries))
    render(<Provider><Brand360 /></Provider>)
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const sliders = await screen.findAllByRole('slider')
    fireEvent.mouseDown(sliders[0])
    fireEvent.mouseMove(sliders[0], { clientX: 10 })
    fireEvent.mouseUp(sliders[0])
    fireEvent.click(await screen.findByText('Apply'))
    expect(await update).toEqual({
      'brand-ssid-compliance-matcher': '^[a-zA-Z0-9]{5}_GUEST$',
      'sla-brand-ssid-compliance': '3',
      'sla-guest-experience': '2',
      'sla-p1-incidents-count': '100'
    })
  })
  it('resets SLAs', async () => {
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', mockBrandTimeseries)
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(prevTimeseries))
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(currTimeseries))
    const { asFragment } = render(<Provider><Brand360 /></Provider>)
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const sliders = await screen.findAllByRole('slider')
    fireEvent.mouseDown(sliders[0])
    fireEvent.mouseMove(sliders[0], { clientX: 10 })
    fireEvent.mouseUp(sliders[0])
    fireEvent.click(await screen.findByText('Reset'))
    expect(asFragment()).toMatchSnapshot()
  })

  it('displays read only SLAs', async () => {
    const userProfile = getUserProfile()
    setUserProfile({
      ...userProfile,
      abacEnabled: true,
      isCustomRole: true,
      scopes: [WifiScopes.READ]
    })
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', mockBrandTimeseries)
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(prevTimeseries))
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(currTimeseries))
    render(<Provider><Brand360 /></Provider>)
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await waitFor(async () =>
      expect(await screen.findByRole('button', { name: 'Apply' })).toBeDisabled()
    )
  })

  it('should show not show option for LSP account', async () => {
    utils.getJwtTokenPayload = jest.fn().mockImplementation(() => {
      return {
        acx_account_tier: 'Platinum',
        acx_account_vertical: 'Default',
        isBetaFlag: false,
        tenantType: AccountType.MSP_INTEGRATOR
      }
    })
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', mockBrandTimeseries)
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(prevTimeseries))
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', wrapData(currTimeseries))
    render(<Provider><Brand360 /></Provider>)
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    // eslint-disable-next-line max-len
    expect(await screen.findAllByText('property {"brand-ssid-compliance-matcher":"^[a-zA-Z0-9]{5}_GUEST$","sla-p1-incidents-count":"1","sla-guest-experience":"2","sla-brand-ssid-compliance":"3"}')).toHaveLength(1)
    expect(await screen.findByTestId('brand360Table')).toBeVisible()
    const tiles = await screen.findAllByTestId('brand360Tile')
    const tile = tiles[0]
    expect(tile.textContent?.includes('property')).toBeTruthy()
  })
})
