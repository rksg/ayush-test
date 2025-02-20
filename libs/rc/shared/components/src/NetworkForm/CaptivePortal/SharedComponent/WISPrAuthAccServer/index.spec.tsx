import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { AaaUrls, CertificateUrls, ConfigTemplateContext, ConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                     from '@acx-ui/test-utils'

import {
  mockAAAPolicyListResponse,
  mockAAAPolicyNewCreateResponse,
  mockAAAPolicyTemplateListResponse,
  mockAAAPolicyTemplateResponse
} from '../../../__tests__/fixtures'
import NetworkFormContext from '../../../NetworkFormContext'

import { statesCollection, WISPrAuthAccContext } from './WISPrAuthAccServerReducer'

import { WISPrAuthAccServer } from '.'

describe('WISPRAuthACCServer', () => {
  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', policyId: 'test-id' }

  beforeEach(async () => {
    mockServer.use(
      rest.post(AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (_, res, ctx) => res(ctx.json(mockAAAPolicyNewCreateResponse))
      ),
      rest.post(
        AaaUrls.addAAAPolicy.url,
        (req, res, ctx) => res(ctx.json({
          requestId: 'request-id',
          response: mockAAAPolicyNewCreateResponse
        }))
      ),
      rest.post(
        ConfigTemplateUrlsInfo.getAAAPolicyTemplateList.url,
        (_, res, ctx) => res(ctx.json(mockAAAPolicyTemplateListResponse))
      ),
      rest.get(
        ConfigTemplateUrlsInfo.getAAAPolicyTemplate.url,
        (_, res, ctx) => res(ctx.json(mockAAAPolicyTemplateResponse))
      ),
      rest.post(
        CertificateUrls.getCAs.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CertificateUrls.getCertificateList.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render instance page', async () => {
    render(WISPRAuthACCServerNormalTestCase(),{ route: { params } })

    await userEvent.click(await screen.findByRole('button', { name: /Add Server/i }))
    await userEvent.click((await screen.findByRole('button', { name: /Cancel/i })))
    await userEvent.click(await screen.findByRole('button', { name: /Add Server/i }))
    await userEvent.click(await screen.findByRole('button', { name: /Add Secondary Server/i }))

    await userEvent.type(await screen.findByRole(
      'textbox', { name: /Profile Name/i }), mockAAAPolicyNewCreateResponse.name)
    await userEvent.type((await screen.findAllByRole('textbox', { name: 'IP Address' }))[0],
      mockAAAPolicyNewCreateResponse.primary.ip)
    await userEvent.type((await screen.findAllByLabelText('Shared Secret'))[0],
      mockAAAPolicyNewCreateResponse.primary.sharedSecret)
    await userEvent.type((await screen.findAllByRole('textbox', { name: 'IP Address' }))[1],
      mockAAAPolicyNewCreateResponse.secondary.ip)
    await userEvent.type((await screen.findAllByLabelText('Shared Secret'))[1],
      mockAAAPolicyNewCreateResponse.secondary.sharedSecret)
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await userEvent.click((await screen.findAllByRole('combobox'))[0])
    await userEvent.click((await screen.findAllByTitle(mockAAAPolicyNewCreateResponse.name))[0])

    expect((await screen.findByText(
      mockAAAPolicyNewCreateResponse.primary.ip + ':' + mockAAAPolicyNewCreateResponse.primary.port
    ))).toBeVisible()
  })

  it('should render template page', async () => {
    render(WISPRAuthACCServerNormalTestCase(true),{ route: { params } })

    await userEvent.click((await screen.findByRole('combobox')))

    await waitFor(() => {
      expect(screen.getByText(mockAAAPolicyTemplateListResponse.data[0].name)).toBeInTheDocument()
    })
  })
})

function WISPRAuthACCServerNormalTestCase (isTemplate = false) {
  const data = {
    guestPortal: {
      enableSmsLogin: true,
      socialIdentities: {}
    }
  }
  return (
    <Provider>
      <NetworkFormContext.Provider value={{
        editMode: false, cloneMode: false, data: data, isRuckusAiMode: false
      }}>
        <ConfigTemplateContext.Provider value={{ isTemplate }}>
          <Form>
            <WISPrAuthAccContext.Provider
              value={{ state: statesCollection.useBypassCNAAndAuth, dispatch: ()=>{} }}>
              <WISPrAuthAccServer
                onClickAllAccept={()=>{}}
                onClickAuth={()=>{}}
              />
            </WISPrAuthAccContext.Provider>
          </Form>
        </ConfigTemplateContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>
  )
}
