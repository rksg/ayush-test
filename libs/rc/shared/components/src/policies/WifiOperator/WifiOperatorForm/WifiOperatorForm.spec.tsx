import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { WifiOperator, WifiOperatorUrls, WifiOperatorViewModel } from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }                                    from '@acx-ui/test-utils'

import { WifiOperatorForm } from './WifiOperatorForm'



const successResponse = { requestId: 'request-id' }
const wifiOperatorData: WifiOperator = {
  id: '70ea860d29d34c218de1b42268b563dc',
  name: 'wo1',
  domainNames: [
    'rks.com',
    '*.rk.com'
  ],
  friendlyNames: [
    {
      name: 'dd',
      language: 'DUT'
    },
    {
      name: 'eng',
      language: 'ENG'
    }
  ],
  tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1'
}

const wifiOperatorList=[{
  id: '70ea860d29d34c218de1b42268b563dc',
  name: 'wo1'
},{
  id: 'policy-id',
  name: 'wo2'
}] as WifiOperatorViewModel[]

const mockNavigate = jest.fn()

describe('WifiOperatorForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        WifiOperatorUrls.getWifiOperatorList.url,
        (_, res, ctx) => {return res(ctx.json(wifiOperatorList))}
      ),
      rest.get(
        WifiOperatorUrls.getWifiOperator.url,
        (_, res, ctx) => {return res(ctx.json(wifiOperatorData))}
      )
    )
  })

  it.skip('should create Wi-Fi Operator successfully', async () => {
    const addWifiOperator = jest.fn()
    mockServer.use(
      // rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
      //   res(ctx.json({ COMMON: '{}' }))
      // ),
      rest.post(
        WifiOperatorUrls.addWifiOperator.url,
        (_, res, ctx) => {
          addWifiOperator()
          return res(ctx.json(successResponse))
        }
      ),
      rest.put(
        WifiOperatorUrls.updateWifiOperator.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      )
    )

    const params = { tenantId: 'tenant-id' }

    render(<Provider><WifiOperatorForm edit={false}/></Provider>, {
      route: { params }
    })

    //step 1 setting form
    await userEvent.type(await screen.findByLabelText('Policy Name'), 'test1')
    await userEvent.type(await screen.findByLabelText('Domain'), 'rks.com')
    // await userEvent.selectOptions(await screen.findByTestId('select_language_0'), 'ENG')
    const combobox = await screen.findByRole('combobox', { name: 'Language' })
    await userEvent.click(combobox)
    await userEvent.click(await screen.findByText( 'English' ))
    // const dropdown = await screen.findByRole('combobox')
    // expect(dropdown).toHaveAttribute('placeholder', 'Select...')
    // await userEvent.selectOptions(dropdown, 'ENG')
    // await userEvent.type(await screen.findByTestId('Friendly Name'), 'ENGG')
    await userEvent.type(await screen.findByTestId('input_name_0'), 'ENG_TEXT')
    // const input = await screen.findByRole('text', { name: 'Friendly Name' })
    // await userEvent.type(input, 'ENG_TEXT')

    // const form = within(await screen.findByTestId('steps-form'))
    // const body = within(form.getByTestId('steps-form-body'))

    await userEvent.click(await screen.findByText('Add'))

    expect(addWifiOperator).toBeCalledTimes(1)
  })

  it('should render breadcrumb correctly', async () => {
    const params = { tenantId: 'tenant-id' }
    render(<Provider><WifiOperatorForm edit={false}/></Provider>, {
      route: { params }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Wi-Fi Operator'
    })).toBeVisible()
  })

  it.skip('should edit vlan successfully', async () => {
    const editWifiOperator = jest.fn()
    mockServer.use(
      // rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
      //   res(ctx.json({ COMMON: '{}' }))
      // ),
      rest.post(
        WifiOperatorUrls.addWifiOperator.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.put(
        WifiOperatorUrls.updateWifiOperator.url,
        (_, res, ctx) => {
          editWifiOperator()
          return res(ctx.json(successResponse))
        }
      )
    )

    const params = { tenantId: 'tenant-id', policyId: '70ea860d29d34c218de1b42268b563dc' }

    render(<Provider><WifiOperatorForm edit={true}/></Provider>, {
      route: { params }
    })

    await userEvent.type(screen.getByLabelText('Policy Name'), 'test2')

    await userEvent.type(await screen.findByLabelText('Domain'), 'rks.rks.com')
    await userEvent.click(await screen.findByText('Finish'))

    await waitFor(async () => expect(editWifiOperator).toBeCalledTimes(1))
  })


  it.skip('should cancel Wi-Fi Operator Form successfully', async () => {
    mockServer.use(
      // rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
      //   res(ctx.json({ COMMON: '{}' }))
      // ),
      rest.post(
        WifiOperatorUrls.addWifiOperator.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.put(
        WifiOperatorUrls.updateWifiOperator.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      )
    )
    const params = { tenantId: 'tenant-id', policyId: '70ea860d29d34c218de1b42268b563dc' }

    render(<Provider><WifiOperatorForm edit={true}/></Provider>, {
      route: { params }
    })
    await userEvent.click(await screen.findByText('Cancel'))

    expect(mockNavigate).toHaveBeenCalledWith({
      hash: '', pathname: '/tenant-id/t/policies/wifiOperator/list', search: '' }, { replace: true }
    )
  })
})