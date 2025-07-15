import '@testing-library/jest-dom'

import { Form } from 'antd'
import { rest } from 'msw'

import { useIsTierAllowed }           from '@acx-ui/feature-toggle'
import { MacRegListUrlsInfo }         from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { baseMockSummary, mockMacRegListData } from './__tests__/fixtures'
import { MacAuthenticationInfo }               from './MacAuthenticationInfo'

// Mock the feature toggle hook
jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsTierAllowed: jest.fn()
}))

const mockUseIsTierAllowed = jest.mocked(useIsTierAllowed)

describe('MacAuthenticationInfo', () => {
  beforeEach(() => {
    mockUseIsTierAllowed.mockReturnValue(true)

    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPools.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockMacRegListData))
      )
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render MAC authentication disabled when not enabled', () => {
    const summaryData = {
      ...baseMockSummary,
      wlan: {
        macAddressAuthentication: false
      }
    }

    render(
      <Provider>
        <Form>
          <MacAuthenticationInfo summaryData={summaryData} />
        </Form>
      </Provider>
    )

    expect(screen.getByText('Use MAC Auth')).toBeInTheDocument()
    expect(screen.getByText('Disabled')).toBeInTheDocument()
    expect(screen.queryByText('Mac registration list')).not.toBeInTheDocument()
    expect(screen.queryByText('MAC Address Format')).not.toBeInTheDocument()
  })

  it('should render MAC authentication enabled when enabled', () => {
    const summaryData = {
      ...baseMockSummary,
      wlan: {
        macAddressAuthentication: true
      }
    }

    render(
      <Provider>
        <Form>
          <MacAuthenticationInfo summaryData={summaryData} />
        </Form>
      </Provider>
    )

    expect(screen.getByText('Use MAC Auth')).toBeInTheDocument()
    expect(screen.getByText('Enabled')).toBeInTheDocument()
  })

  // eslint-disable-next-line max-len
  it('should render MAC registration list when MAC auth is enabled and using registration list', async () => {
    const summaryData = {
      ...baseMockSummary,
      wlan: {
        macAddressAuthentication: true,
        isMacRegistrationList: true,
        macRegistrationListId: 'mac-reg-list-1'
      }
    }

    render(
      <Provider>
        <Form>
          <MacAuthenticationInfo summaryData={summaryData} />
        </Form>
      </Provider>
    )

    expect(screen.getByText('Use MAC Auth')).toBeInTheDocument()
    expect(screen.getByText('Enabled')).toBeInTheDocument()
    expect(await screen.findByText('Mac registration list')).toBeInTheDocument()
    expect(await screen.findByText('Test MAC Registration List 1')).toBeInTheDocument()
  })

  // eslint-disable-next-line max-len
  it('should render MAC address format when MAC auth is enabled but not using registration list', () => {
    const summaryData = {
      ...baseMockSummary,
      wlan: {
        macAddressAuthentication: true,
        isMacRegistrationList: false,
        macAuthMacFormat: 'LowerColon'
      }
    }

    render(
      <Provider>
        <Form>
          <MacAuthenticationInfo summaryData={summaryData} />
        </Form>
      </Provider>
    )

    expect(screen.getByText('Use MAC Auth')).toBeInTheDocument()
    expect(screen.getByText('Enabled')).toBeInTheDocument()
    expect(screen.getByText('MAC Address Format')).toBeInTheDocument()
    expect(screen.getByText('aa:bb:cc:dd:ee:ff')).toBeInTheDocument()
  })
})