
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                     from '@acx-ui/feature-toggle'
import { AaaUrls, CertificateUrls, ConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                         from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import {
  mockAAAPolicyListResponse,
  mockAAAPolicyNewCreateResponse,
  mockAAAPolicyTemplateListResponse,
  mockAAAPolicyTemplateResponse,
  mockCaListResponse,
  mockRadSecAAAPolicyNewCreateResponse
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import { AAAInstance } from '.'

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

describe('AAA Instance Page', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))
      ),
      rest.post(
        AaaUrls.queryAAAPolicyList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))
      ),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (_, res, ctx) => res(ctx.json({ ...mockAAAPolicyNewCreateResponse }))
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
        (_, res, ctx) => res(ctx.json(mockCaListResponse))
      ),
      rest.post(
        CertificateUrls.getCertificateList.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.put(
        CertificateUrls.activateCertificateAuthorityOnRadius.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )
  })

  beforeEach(() => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
  })

  it('should render instance page', async () => {
    render(<Provider><NetworkFormContext.Provider value={{
      editMode: false, cloneMode: false, isRuckusAiMode: false,
      data: { guestPortal:
        { enableSmsLogin: true, socialIdentities: {} } }
    }}><Form><AAAInstance serverLabel='' type='authRadius'/>
      </Form></NetworkFormContext.Provider></Provider>,
    {
      route: { params: { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' } }
    })
    await userEvent.click(await screen.findByRole('button', { name: /Add Server/i }))
    await userEvent.click((await screen.findByRole('button', { name: /Cancel/i })))
    await userEvent.click(await screen.findByRole('button', { name: /Add Server/i }))
    await userEvent.click(await screen.findByRole('button', { name: /Add Secondary Server/i }))

    const profileNameElement = await screen.findByRole('textbox', { name: /Profile Name/i })
    await userEvent.type(profileNameElement, mockAAAPolicyNewCreateResponse.name)

    const primaryIpElement = (await screen.findAllByRole('textbox', { name: 'IP Address' }))[0]
    await userEvent.type(primaryIpElement, mockAAAPolicyNewCreateResponse.primary.ip)

    const primaryPortElement = (await screen.findAllByRole('spinbutton', { name: 'Port' }))[0]
    await userEvent.clear(primaryPortElement)
    await userEvent.type(primaryPortElement, mockAAAPolicyNewCreateResponse.primary.port.toString())

    const primarySecretElement = (await screen.findAllByLabelText('Shared Secret'))[0]
    await userEvent.type(primarySecretElement, mockAAAPolicyNewCreateResponse.primary.sharedSecret)

    const secondaryIpElement = (await screen.findAllByRole('textbox', { name: 'IP Address' }))[1]
    await userEvent.type(secondaryIpElement, mockAAAPolicyNewCreateResponse.secondary.ip)

    const secondaryPortElement = (await screen.findAllByRole('spinbutton', { name: 'Port' }))[1]
    await userEvent.clear(secondaryPortElement)
    // eslint-disable-next-line max-len
    await userEvent.type(secondaryPortElement, mockAAAPolicyNewCreateResponse.secondary.port.toString())

    const secondarySecret = (await screen.findAllByLabelText('Shared Secret'))[1]
    await userEvent.type(secondarySecret, mockAAAPolicyNewCreateResponse.secondary.sharedSecret)

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await userEvent.click((await screen.findAllByRole('combobox'))[0])
    await userEvent.click((await screen.findAllByTitle(mockAAAPolicyNewCreateResponse.name))[0])

    expect((await screen.findByText(
      mockAAAPolicyNewCreateResponse.primary.ip + ':' + mockAAAPolicyNewCreateResponse.primary.port
    ))).toBeVisible()
  })

  it('should render instance page - RadSec', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider><NetworkFormContext.Provider value={{
      editMode: false, cloneMode: false, isRuckusAiMode: false,
      data: { guestPortal:
        { enableSmsLogin: true, socialIdentities: {} } }
    }}><Form><AAAInstance serverLabel='' type='authRadius'/>
      </Form></NetworkFormContext.Provider></Provider>,
    {
      route: { params: { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' } }
    })
    await userEvent.click(await screen.findByRole('button', { name: /Add Server/i }))
    await userEvent.click((await screen.findByRole('button', { name: /Cancel/i })))
    await userEvent.click(await screen.findByRole('button', { name: /Add Server/i }))

    const name = await screen.findByRole('textbox', { name: /Profile Name/i })
    await userEvent.type(name, mockRadSecAAAPolicyNewCreateResponse.name)

    const primaryIp = (await screen.findAllByRole('textbox', { name: 'IP Address' }))[0]
    await userEvent.type(primaryIp, mockRadSecAAAPolicyNewCreateResponse.primary.ip)

    const primaryPort = (await screen.findAllByRole('spinbutton', { name: 'Port' }))[0]
    await userEvent.clear(primaryPort)
    await userEvent.type(primaryPort,mockRadSecAAAPolicyNewCreateResponse.primary.port.toString())

    const tlsEnabled = await screen.findByRole('switch')
    await userEvent.click(tlsEnabled)

    const cnSanIdentity = await screen.findByRole('textbox', { name: 'CN/SAN Identity' })
    await userEvent.type(cnSanIdentity,
      mockRadSecAAAPolicyNewCreateResponse.radSecOptions.cnSanIdentity)

    const comboboxes = await screen.findAllByRole('combobox')
    expect(comboboxes.length).toBe(4)

    await userEvent.click(comboboxes[1])
    await userEvent.click(await screen.findByText('CA-1'))

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await userEvent.click((await screen.findAllByRole('combobox'))[0])
    await userEvent.click(
      (await screen.findAllByTitle(mockRadSecAAAPolicyNewCreateResponse.name))[0])

    expect((await screen.findByText(
      mockRadSecAAAPolicyNewCreateResponse.primary.ip + ':'
        + mockRadSecAAAPolicyNewCreateResponse.primary.port
    ))).toBeVisible()
  })

  it('should render template page', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

    render(<Provider>
      <NetworkFormContext.Provider value={{
        editMode: false,
        cloneMode: false,
        isRuckusAiMode: false,
        data: { guestPortal: { enableSmsLogin: true, socialIdentities: {} } }
      }}>
        <Form><AAAInstance serverLabel='Authentication Server' type='authRadius'/></Form>
      </NetworkFormContext.Provider>
    </Provider>,
    {
      route: { params: { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' } }
    })

    await userEvent.click((await screen.findByRole('combobox')))

    await waitFor(() => {
      expect(screen.getByText(mockAAAPolicyTemplateListResponse.data[0].name)).toBeInTheDocument()
    })
  })
})
