import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { rest }       from 'msw'

import { useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { iotApi }                           from '@acx-ui/rc/services'
import { IotUrlsInfo, IotControllerStatus } from '@acx-ui/rc/utils'
import { Provider, store }                  from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  within,
  waitFor
} from '@acx-ui/test-utils'

import { IotControllerForm } from '.'

const successResponse = {
  requestId: 'request-id'
}

const iotControllerList = {
  requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f',
  response: {
    data: [{
      id: '123',
      name: 'ruckusdemos',
      inboundAddress: '192.168.1.1',
      serialNumber: 'rewqfdsafasd',
      publicAddress: 'ruckusdemos.cloud',
      publicPort: 443,
      apiToken: 'xxxxxxxxxxxxxxxxxxx',
      tenantId: '3f10af1401b44902a88723cb68c4bc77'
    }, {
      id: 'bbc41563473348d29a36b76e95c50382',
      name: 'iotController1',
      inboundAddress: '192.168.2.21',
      serialNumber: 'jfsdjoiasdfjo',
      publicAddress: 'iotController1.cloud',
      publicPort: 443,
      apiToken: 'xxxxxxxxxxxxxxxxxxx',
      tenantId: '3f10af1401b44902a88723cb68c4bc77'
    }] as IotControllerStatus[]
  }
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Iot Controller Form', () => {
  const params = { tenantId: 'tenant-id', action: 'add' }
  const mockFn = jest.fn()
  const mockedReqFn = jest.fn()

  beforeEach(() => {
    store.dispatch(iotApi.util.resetApiState())
    mockFn.mockClear()
    mockedReqFn.mockClear()
    initialize()
    mockServer.use(
      rest.post(IotUrlsInfo.getIotControllerList.url,
        (req, res, ctx) => {
          mockFn()
          return res(ctx.json(iotControllerList.response))
        }),
      rest.post(IotUrlsInfo.addIotController.url,
        (_, res, ctx) => {
          mockedReqFn()
          return res(ctx.status(200), ctx.json(successResponse))
        }),
      rest.patch(IotUrlsInfo.updateIotController.url,
        (_, res, ctx) => {
          mockedReqFn()
          return res(ctx.status(200), ctx.json(successResponse))
        })
    )
  })

  it('should render iot controller form', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const user = userEvent.setup()

    render(
      <Provider>
        <IotControllerForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/iotController/add' }
      })

    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByText(/add iot controller/i)).toBeVisible()

    const iotControllerInput = await screen.findByLabelText('IoT Controller Name')
    fireEvent.change(iotControllerInput, { target: { value: 'ruckusdemos11' } })
    fireEvent.blur(iotControllerInput)

    const URLInput = screen.getByLabelText('FQDN / IP (AP Inbound IP address)')
    await fireEvent.change(URLInput, { target: { value: 'test.com' } })

    const toggle = screen.getByRole('switch')
    await user.click(toggle)
    expect(toggle).toBeChecked()
    await screen.findByText('API Token')

    const passwordInput = screen.getByLabelText('API Token')
    // eslint-disable-next-line max-len
    await fireEvent.change(passwordInput, { target: { value: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' } })

    const serialInput = screen.getByLabelText('IoT Controller Serial Number')
    // eslint-disable-next-line max-len
    await fireEvent.change(serialInput, { target: { value: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' } })

    await userEvent.click(actions.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(mockedReqFn).toBeCalled())

  })

  it('should edit iot controller successfully', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    // const mockFn = jest.fn()

    // mockServer.use(
    //   rest.get(IotUrlsInfo.getIotControllerList.url,
    //     (req, res, ctx) => {
    //       mockFn()
    //       return res(ctx.json(iotController))
    //     })
    // )

    const params = {
      tenantId: 'tenant-id',
      venueId: '3f10af1401b44902a88723cb68c4bc77',
      action: 'edit',
      iotId: '123'
    }

    render(
      <Provider>
        <IotControllerForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/iotController/:iotId/:action' }
      })

    await waitFor(() => expect(mockFn).toBeCalled())

    const nameInput = await screen.findByLabelText('IoT Controller Name')
    fireEvent.change(nameInput, { target: { value: 'New Iot constroller' } })
    fireEvent.blur(nameInput)

    const URLInput = screen.getByLabelText('FQDN / IP (AP Inbound IP address)')
    await fireEvent.change(URLInput, { target: { value: 'newtest.com' } })

    const serialInput = screen.getByLabelText('IoT Controller Serial Number')
    // eslint-disable-next-line max-len
    await fireEvent.change(serialInput, { target: { value: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' } })

    const saveButton = screen.getByText('Save')
    await userEvent.click(saveButton)

    await waitFor(() => expect(mockedReqFn).toBeCalled())
  })

  it('should back to iot controller list', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <IotControllerForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/iotController/add' }
      })

    await userEvent.click(screen.getByText('Cancel'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/iotController`,
      hash: '',
      search: ''
    })
  })
})
