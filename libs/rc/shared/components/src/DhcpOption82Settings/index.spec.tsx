import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { softGreApi }      from '@acx-ui/rc/services'
import { SoftGreUrls }     from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { mockDHCP82OptionSetting } from './__tests__/fixture'
import { DhcpOption82Settings }    from './DhcpOption82Settings'

describe('DhcpOption82Settings', () => {
  const mockReqVenueData = jest.fn()
  const mockReqAPData = jest.fn()
  const venueId = 'bad700975bbb42c1b8c7e5cdb764dfb6'
  const portId = '1'
  const apModel = 'H320'
  const serialNumber = '123456'

  beforeEach(() => {
    mockReqVenueData.mockReset()
    mockReqAPData.mockReset()
    store.dispatch(softGreApi.util.resetApiState())
    mockServer.use(
      rest.get(
        SoftGreUrls.getSoftGreProfileConfigurationOnVenue.url
          .replace(':venueId' ,venueId)
          .replace(':portId' ,portId)
          .replace(':apModel' ,apModel)
        , (req, res, ctx) => {
          mockReqVenueData()
          return res(ctx.json(mockDHCP82OptionSetting))
        }),
      rest.get(
        SoftGreUrls.getSoftGreProfileConfigurationOnAP.url
          .replace(':venueId' ,venueId)
          .replace(':portId' ,portId)
          .replace(':serialNumber' ,serialNumber)
        , (req, res, ctx) => {
          mockReqAPData()
          return res(ctx.json(mockDHCP82OptionSetting))
        })
    )
  })

  it('Should call Venue', async () => {
    render(
      <Provider>
        <Form>
          <DhcpOption82Settings
            index={1}
            isUnderAPNetworking={false}
            venueId={venueId}
            portId={portId}
            apModel={apModel}
            readonly={false}
          />
        </Form>
      </Provider>)
    expect(await screen.findByTestId('dhcpoption82-switch-toggle')).toBeInTheDocument()
    await waitFor(() => {
      expect(mockReqVenueData).toBeCalled()
    })
  })
  it('Should call AP API', async () => {
    render(
      <Provider>
        <Form>
          <DhcpOption82Settings
            index={1}
            isUnderAPNetworking={true}
            venueId={venueId}
            portId={portId}
            serialNumber={serialNumber}
            readonly={false}
          />
        </Form>
      </Provider>)
    expect(await screen.findByTestId('dhcpoption82-switch-toggle')).toBeInTheDocument()
    await waitFor(() => {
      expect(mockReqAPData).toBeCalled()
    })
  })
  it('Should be disabled under readonly', async () => {
    render(
      <Provider>
        <Form>
          <DhcpOption82Settings
            index={1}
            isUnderAPNetworking={true}
            venueId={venueId}
            portId={portId}
            serialNumber={serialNumber}
            readonly={true}
          />
        </Form>
      </Provider>)
    expect(await screen.findByTestId('dhcpoption82-switch-toggle')).toBeDisabled()
  })
})
