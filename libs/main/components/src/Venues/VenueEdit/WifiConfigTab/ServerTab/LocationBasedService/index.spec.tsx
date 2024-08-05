import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { policyApi }                                                                 from '@acx-ui/rc/services'
import { LbsServerProfileUrls }                                                      from '@acx-ui/rc/utils'
import { Provider, store }                                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ServerSettingContext }          from '..'
import { VenueEditContext, EditContext } from '../../../index'

import { mockedTenantId, mockedVenueId, dummyTableResult } from './__tests__/fixtures'

import { LocationBasedService } from './index'

let editContextData = {} as EditContext
const setEditContextData = jest.fn()
let editServerContextData = {} as ServerSettingContext

const params = {
  tenantId: mockedTenantId,
  venueId: mockedVenueId,
  activeTab: 'wifi',
  activeSubTab: 'servers'
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Location Based Service', () => {
  beforeEach(() => {
    store.dispatch(policyApi.util.resetApiState())
    mockedUsedNavigate.mockClear()
    mockServer.use(
      rest.post(LbsServerProfileUrls.getLbsServerProfileList.url,
        (_, res, ctx) => res(ctx.json(dummyTableResult)))
    )
  })

  it('Should Retrive Initial Data From Server and Render', async () => {
    render(
      <Provider>
        <Form>
          <LocationBasedService />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Use LBS Server'))
    expect(await screen.findByText(/Use LBS Server/)).toBeVisible()
    expect(await screen.findByText(/LBS 2/)).toBeVisible()
  })

  it('Should Update Location Based Service Profile After Save', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditServerContextData: jest.fn(),
          editServerContextData,
          setEditContextData
        }}>
          <Form>
            <LocationBasedService />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitFor(() => screen.findByText('Use LBS Server'))
    expect(await screen.findByText(/Use LBS Server/)).toBeVisible()

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = screen.getByText('LBS 1')
    await userEvent.click(option)
  })

  it('Should Be Able To Handle Location Based Service Switch Turn On/Off', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditServerContextData: jest.fn(),
          editServerContextData,
          setEditContextData
        }}>
          <Form>
            <LocationBasedService />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitFor(() => screen.findByText('Use LBS Server'))
    expect(await screen.findByText(/Use LBS Server/)).toBeVisible()

    fireEvent.click(await screen.findByTestId('lbs-switch'))
  })

  it('should handle click the Add Location Based Service Profile button', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditServerContextData: jest.fn(),
          editServerContextData,
          setEditContextData
        }}>
          <Form>
            <LocationBasedService />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitFor(() => screen.findByText('Use LBS Server'))
    expect(await screen.findByText(/Use LBS Server/)).toBeVisible()

    fireEvent.click(await screen.findByRole('button', { name: 'Add' }))

    // drawer
    await screen.findByText('Add Location Based Service Server')
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })
})