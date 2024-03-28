import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { WifiOperator, WifiOperatorUrls }      from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

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

const wifiOperatorList = {
  totalCount: 2,
  data: [{
    id: '70ea860d29d34c218de1b42268b563dc',
    name: 'wo1'
  },{
    id: 'policy-id',
    name: 'wo2'
  }] }

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

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

  it('should create Wi-Fi Operator successfully', async () => {
    const addWifiOperator = jest.fn()
    mockServer.use(
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

    render(<Provider><WifiOperatorForm editMode={false}/></Provider>, {
      route: { params }
    })

    //step 1 setting form
    await userEvent.type(await screen.findByLabelText('Policy Name'), 'test1')
    await userEvent.type(await screen.findByLabelText('Domain'), 'rks.com')
    const combobox = await screen.findByRole('combobox', { name: 'Language' })
    await userEvent.click(combobox)
    await userEvent.click(await screen.findByText( 'English' ))
    await userEvent.type(await screen.findByTestId('input_name_0'), 'ENG_TEXT')

    await userEvent.click(await screen.findByText('Add'))

    expect(addWifiOperator).toBeCalledTimes(1)
  })

  it('should render breadcrumb correctly', async () => {
    const params = { tenantId: 'tenant-id' }
    render(<Provider><WifiOperatorForm editMode={false}/></Provider>, {
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

  it('should edit Wi-Fi Operator successfully', async () => {
    const editWifiOperator = jest.fn()
    mockServer.use(
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

    render(<Provider><WifiOperatorForm editMode={true}/></Provider>, {
      route: { params }
    })

    await userEvent.type(screen.getByLabelText('Policy Name'), 'test2')

    await userEvent.type(await screen.findByLabelText('Domain'), '\nrks.rks.com')
    const dropdown = await screen.findByTestId('select_language_0')
    await userEvent.click(dropdown)
    await userEvent.click(await screen.findByText( 'English' ))

    await userEvent.type(await screen.findByTestId('input_name_0'), 'ENG_TEXT')

    await userEvent.click(await screen.findByText('Finish'))

    await waitFor(async () => expect(editWifiOperator).toBeCalledTimes(1))
  })


  it('should cancel Wi-Fi Operator Form successfully', async () => {
    mockServer.use(
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

    render(<Provider><WifiOperatorForm editMode={true}/></Provider>, {
      route: { params }
    })
    await userEvent.click(await screen.findByText('Cancel'))

    expect(mockNavigate).toHaveBeenCalledWith({
      hash: '', pathname: '/tenant-id/t/policies/wifiOperator/list', search: '' }
    )
  })
})