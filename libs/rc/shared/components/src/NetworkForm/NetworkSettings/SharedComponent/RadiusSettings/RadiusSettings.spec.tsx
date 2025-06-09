import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { DpskUrls, WifiUrlsInfo, AaaUrls }          from '@acx-ui/rc/utils'
import { Provider }                                 from '@acx-ui/store'
import { mockServer, render, screen }               from '@acx-ui/test-utils'

import { mockAAAPolicyListResponse, mockedRadsecAAA, partialDpskNetworkEntity } from '../../../__tests__/fixtures'
import NetworkFormContext                                                       from '../../../NetworkFormContext'

import { RadiusSettings } from './RadiusSettings'


jest.mocked(useIsSplitOn).mockImplementation(
  (ff) => { return ff === Features.WIFI_RADSEC_TOGGLE }
)

jest.mocked(useIsTierAllowed).mockReturnValue(true)
const mockedGetAAA = jest.fn()
describe('RadiusSettings', () => {
  beforeEach(() => {

    mockedGetAAA.mockClear()

    mockServer.use(
      rest.get(
        WifiUrlsInfo.queryDpskService.url,
        (_req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))
      ),
      rest.get(AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => {
          mockedGetAAA()
          return res(ctx.json(mockedRadsecAAA))
        }
      )
    )
  })

  it('should render RadiusSettings correctly', async () => {
    render(
      <Provider>
        <Form>
          <NetworkFormContext.Provider
            value={{
              editMode: false,
              cloneMode: false,
              isRuckusAiMode: true,
              data: partialDpskNetworkEntity
            }}
          >
            <RadiusSettings />
          </NetworkFormContext.Provider>
        </Form>
      </Provider>
    )

    // const securityCombo = screen.getByTestId('radius-select-combobox')
    // await userEvent.click(securityCombo)
    await userEvent.click((await screen.findByText('Select RADIUS')))
    await userEvent.click((await screen.findByText('RadSec AAA')))

    expect(mockedGetAAA).toHaveBeenCalled()

    expect((await screen.findByText('123.123.123.2:2083'))).toBeInTheDocument()
  })
})
