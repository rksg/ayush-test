import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { rest }       from 'msw'

import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import { rwgApi }          from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'


import { RWGForm } from '.'


const successResponse = {
  requestId: 'request-id'
}

const venuelist = {
  totalCount: 10,
  page: 1,
  data: [
    {
      city: 'New York',
      country: 'United States',
      description: 'My-Venue',
      id: '3f10af1401b44902a88723cb68c4bc77',
      latitude: '40.769141',
      longitude: '-73.9429713',
      name: 'My-Venue',
      status: '1_InSetupPhase',
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 }
    },
    {
      city: 'Sunnyvale, California',
      country: 'United States',
      description: '',
      id: 'a919812d11124e6c91b56b9d71eacc31',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      name: 'test',
      status: '1_InSetupPhase',
      switchClients: 2,
      switches: 1,
      edges: 3,
      clients: 1
    }
  ]
}

const gatewayResponse = {
  rwgId: 'bbc41563473348d29a36b76e95c50381',
  tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
  venueId: '3f10af1401b44902a88723cb68c4bc77',
  venueName: 'My-Venue',
  name: 'ruckusdemos',
  loginUrl: 'https://rxgs5-vpoc.ruckusdemos.net',
  username: 'inigo',
  password: 'Inigo123!',
  status: null,
  id: 'bbc41563473348d29a36b76e95c50381',
  new: false
}

const rwgList = {
  requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f',
  response: [{
    rwgId: 'bbc41563473348d29a36b76e95c50381',
    tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
    venueId: '3f10af1401b44902a88723cb68c4bc77',
    venueName: 'My-Venue',
    name: 'ruckusdemos',
    loginUrl: 'https://rxgs5-vpoc.ruckusdemos.net',
    username: 'inigo',
    password: 'Inigo123!',
    status: null,
    id: 'bbc41563473348d29a36b76e95c50381',
    new: false
  }]
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Gateway Form', () => {
  const params = { tenantId: 'tenant-id', action: 'add' }

  beforeEach(() => {
    store.dispatch(rwgApi.util.resetApiState())
    initialize()
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))),
      rest.get(CommonUrlsInfo.getRwgList.url,
        (req, res, ctx) => res(ctx.json(rwgList))),
      rest.post(CommonUrlsInfo.addGateway.url,
        (_, res, ctx) => res(ctx.status(200), ctx.json(successResponse))),
      rest.post(CommonUrlsInfo.updateGateway.url,
        (_, res, ctx) => res(ctx.status(200), ctx.json(successResponse)))
    )
  })

  it('should render gateway form', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <RWGForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/ruckus-wan-gateway/:action' }
      })

    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/add gateway/i)).toBeVisible()

    fireEvent.mouseDown(await screen.findByLabelText(/Venue/))
    const venue = await screen.findAllByText('My-Venue')
    await userEvent.click(venue[0])

    const gatewayInput = await screen.findByLabelText('Gateway Name')
    fireEvent.change(gatewayInput, { target: { value: 'ruckusdemos1' } })
    fireEvent.blur(gatewayInput)

    const hostnameInput = await screen.findByLabelText('Hostname')
    await fireEvent.change(hostnameInput, { target: { value: 'https://test.com' } })

    const usernameInput = await screen.findByLabelText('Username')
    await fireEvent.change(usernameInput, { target: { value: 'newUser' } })

    const passwordInput = await screen.findByLabelText('Password')
    await fireEvent.change(passwordInput, { target: { value: 'Temp!2345' } })

    await userEvent.click(actions.getByRole('button', { name: 'Add' }))


  })

  it('should edit gateway successfully', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.get(CommonUrlsInfo.getGateway.url,
        (req, res, ctx) => res(ctx.json(gatewayResponse)))
    )

    const params = {
      tenantId: 'tenant-id',
      action: 'edit'
    }

    render(
      <Provider>
        <RWGForm />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    const venueInput = await screen.findByLabelText('Gateway Name')
    fireEvent.change(venueInput, { target: { value: 'New Gateway' } })
    fireEvent.blur(venueInput)
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    const saveButton = screen.getByText('Save')
    await userEvent.click(saveButton)
  })

  it('gateway field validations', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <RWGForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/ruckus-wan-gateway/:action' }
      })

    const gatewayInput = await screen.findByLabelText('Gateway Name')
    fireEvent.change(gatewayInput, { target: { value: '  ' } })
    fireEvent.blur(gatewayInput)

    expect(await screen.findByText('Whitespace chars only are not allowed')).toBeVisible()

    const gatewayInput1 = await screen.findByLabelText('Gateway Name')
    fireEvent.change(gatewayInput1, { target: { value: '"test"with' } })
    fireEvent.blur(gatewayInput1)

    expect(await screen.findByText('Please enter a valid Name')).toBeVisible()


    const password = await screen.findByLabelText('Password')
    fireEvent.change(password, { target: { value: 'temp' } })
    fireEvent.blur(password)

    expect(await screen.findByText('Password must be more 8 or more characters long')).toBeVisible()

  })

  it('should back to gateway list', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <RWGForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/ruckus-wan-gateway/add' }
      })

    await userEvent.click(await screen.findByText('Cancel'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/ruckus-wan-gateway`,
      hash: '',
      search: ''
    })
  })
})
