import React from 'react'

import '@testing-library/jest-dom'
import { act }   from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  policyApi
} from '@acx-ui/rc/services'
import {
  getUrlForTest,
  CommonUrlsInfo,
  MigrationContextType,
  MigrationUrlsInfo,
  AdministrationUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  venuelist,
  migrationResult,
  configurationResult
} from '../__tests__/fixtures'
import MigrationContext from '../MigrationContext'

import MigrationForm      from './MigrationForm'
import { defaultAddress } from './MigrationSettingForm'

const venueResponse = {
  id: '2c16284692364ab6a01f4c60f5941836',
  createdDate: '2022-09-06T09:41:27.550+00:00',
  updatedDate: '2022-09-22T10:36:28.113+00:00',
  name: 'My-Venue',
  description: 'My-Venue',
  address: {
    country: 'New York',
    city: 'United States',
    addressLine: 'New York, NY, USA',
    latitude: 40.7127753,
    longitude: -74.0059728,
    timezone: 'America/New_York'
  }
}

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

const setZdAPConfigure = jest.fn()

const initFile = new File([''], 'zd_ipv4_db_050923_17_14.bak', { type: 'application/x-trash' })

const initState = {
  file: initFile,
  venueName: '',
  description: '',
  address: defaultAddress,
  errorMsg: ''
} as MigrationContextType

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: jest.fn(),
  useTenantLink: jest.fn()
}))


describe('MigrationForm', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })
  })

  it('should render MigrationForm successfully', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    mockServer.use(rest.post(
      getUrlForTest(CommonUrlsInfo.getVenuesList),
      (req, res, ctx) => res(ctx.json(venuelist))
    ),
    rest.get(
      getUrlForTest(CommonUrlsInfo.getVenue),
      (req, res, ctx) => res(ctx.json(venueResponse))
    ), rest.post(
      MigrationUrlsInfo.uploadZdConfig.url,
      (_, res, ctx) => res(
        ctx.json(migrationResult)
      )
    ), rest.post(
      MigrationUrlsInfo.addZdMigration.url,
      (_, res, ctx) => res(
        ctx.json(migrationResult)
      )
    ), rest.get(
      MigrationUrlsInfo.getMigrationResult.url,
      (_, res, ctx) => res(
        ctx.json(migrationResult)
      )
    ), rest.get(
      MigrationUrlsInfo.getZdConfiguration.url,
      (_, res, ctx) => res(
        ctx.json(configurationResult)
      )
    ), rest.get(
      AdministrationUrlsInfo.getPreferences.url,
      (_req, res, ctx) => res(ctx.json({
        global: {
          mapRegion: 'US'
        }
      }))
    ))

    render(
      <MigrationContext.Provider value={{
        state: initState,
        dispatch: setZdAPConfigure
      }}>
        <MigrationForm />
      </MigrationContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByRole('heading', { name: 'Backup File Selection', level: 3 })

    const errorFile = new File([''], 'zd_ipv4_db_050923_17_14.csv', { type: 'application/csv' })
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, errorFile)

    const bigFile = new File([''], 'zd_ipv4_db_050923_17_big.bak', { type: 'application/x-trash' })
    Object.defineProperty(bigFile, 'size', { value: 1024 * 1024 * 10 + 1, configurable: true })
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, bigFile)

    const bakFile = new File([''], 'zd_ipv4_db_050923_17_14.bak', { type: 'application/x-trash' })
    Object.defineProperty(bakFile, 'size', { value: 1024 * 1024 + 1, configurable: true })
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, bakFile)

    await userEvent.click(await screen.findByRole('button', { name: 'Validate' }))

    // expect(await screen.findByText('Validation Table')).toBeVisible()
    // await screen.findByRole('heading', { name: 'Validation State: Qualified', level: 4 })

    // await userEvent.click(screen.getByRole('button', { name: 'Migrate' }))

    // await screen.findByRole('heading', { level: 3, name: 'Migration' })

    // await userEvent.type(await screen.findByTestId('name'), 'venuexxxx')
    // await userEvent.type(await screen.findByTestId('test-description'), 'venuexxxx')
    // await userEvent.type(await screen.findByTestId('address'), 'venuexxxx')

    // await userEvent.click(screen.getByRole('button', { name: 'Migrate' }))

    // expect(await screen.findByText('Summary Table')).toBeVisible()

    // await userEvent.click(screen.getByRole('button', { name: 'Done' }))

  })

})

