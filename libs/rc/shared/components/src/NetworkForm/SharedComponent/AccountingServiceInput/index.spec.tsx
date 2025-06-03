

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { AaaUrls }                                  from '@acx-ui/rc/utils'
import { Provider }                                 from '@acx-ui/store'
import { mockServer, render, screen }               from '@acx-ui/test-utils'

import {
  mockAAAPolicyAccountingListResponse,
  mockedAccountingRadsecName1,
  mockedAccountingRadsecService1
} from '../../__tests__/fixtures'

import { AccountingServiceInput } from '.'
const mockedGetAAA = jest.fn()
jest.mocked(useIsSplitOn).mockImplementation(
  (ff) => { return ff === Features.WIFI_RADSEC_TOGGLE }
)
jest.mocked(useIsTierAllowed).mockReturnValue(true)
describe('AccountingServiceInput', () => {

  beforeEach(() => {

    mockedGetAAA.mockClear()

    mockServer.use(
      rest.post(AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyAccountingListResponse))
      ),
      rest.get(AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => {
          mockedGetAAA()
          return res(ctx.json(mockedAccountingRadsecService1))
        }
      )
    )
  })

  it('should render AccountingServiceInput successfully', async () => {
    render(
      <Provider>
        <Form>
          <AccountingServiceInput
            isProxyModeConfigurable={true}
          />
        </Form>
      </Provider>
    )

    expect(screen.getByText('Accounting Service')).toBeInTheDocument()
    const enableToggle = screen.getByTestId('enable-accounting-service')
    await userEvent.click(enableToggle)
    const accountingCombo = screen.getByRole('combobox', { name: 'Accounting Server' })
    expect(accountingCombo).toBeInTheDocument()

    await userEvent.click(accountingCombo)

    await userEvent.click(await screen.findByText(mockedAccountingRadsecName1))
    expect(mockedGetAAA).toHaveBeenCalledTimes(1)
  })
})