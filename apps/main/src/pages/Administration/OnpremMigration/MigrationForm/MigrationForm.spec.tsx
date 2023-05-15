import React from 'react'

import '@testing-library/jest-dom'
import { act }   from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  policyApi
} from '@acx-ui/rc/services'
import {
  MigrationContextType,
  MigrationUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  migrationResult
} from '../__tests__/fixtures'
import MigrationContext from '../MigrationContext'

import MigrationForm from './MigrationForm'

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

const setZdAPConfigure = jest.fn()

const initState = {
  file: new Blob(),
  venueName: '',
  description: '',
  address: ''
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
    mockServer.use(rest.post(
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

    await userEvent.click(screen.getByRole('button', { name: 'Validate' }))

    expect(await screen.findByText('Validation Table')).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Migrate' }))

    await screen.findByRole('heading', { level: 3, name: 'Migration' })

    // await userEvent.type(await screen.findByTestId('name'), 'venuexxxx')
    await userEvent.type(await screen.findByTestId('test-description'), 'venuexxxx')
    await userEvent.type(await screen.findByTestId('address'), 'venuexxxx')

    await userEvent.click(screen.getByRole('button', { name: 'Migrate' }))

    // expect(await screen.findByText('Summary Table')).toBeVisible()

    // await userEvent.click(screen.getByRole('button', { name: 'Done' }))

  })

})
