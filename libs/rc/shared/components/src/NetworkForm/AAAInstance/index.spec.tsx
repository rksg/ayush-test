
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                                            from '@acx-ui/feature-toggle'
import { AaaUrls, CertificateUrls, ConfigTemplateContext, ConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
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

describe('AAA Instance Page', () => {
  const mockedAddAAAPolicyFn = jest.fn()

  beforeEach(async () => {
    mockedAddAAAPolicyFn.mockClear()

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
        (req, res, ctx) => {
          mockedAddAAAPolicyFn()
          return res(ctx.json({
            requestId: 'request-id',
            response: mockAAAPolicyNewCreateResponse
          }))
        }
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

    const newAAAPolicy = { ...mockAAAPolicyNewCreateResponse }

    const profileNameElement = await screen.findByRole('textbox', { name: /Profile Name/i })
    await userEvent.type(profileNameElement, newAAAPolicy.name)

    const primaryIpElement = (await screen.findAllByRole('textbox', { name: 'IP Address' }))[0]
    await userEvent.type(primaryIpElement, newAAAPolicy.primary.ip)

    const primaryPortElement = (await screen.findAllByRole('spinbutton', { name: 'Port' }))[0]
    await userEvent.clear(primaryPortElement)
    await userEvent.type(primaryPortElement, newAAAPolicy.primary.port.toString())

    const primarySecretElement = (await screen.findAllByLabelText('Shared Secret'))[0]
    await userEvent.type(primarySecretElement, newAAAPolicy.primary.sharedSecret)

    const secondaryIpElement = (await screen.findAllByRole('textbox', { name: 'IP Address' }))[1]
    await userEvent.type(secondaryIpElement, newAAAPolicy.secondary.ip)

    const secondaryPortElement = (await screen.findAllByRole('spinbutton', { name: 'Port' }))[1]
    await userEvent.clear(secondaryPortElement)
    await userEvent.type(secondaryPortElement, newAAAPolicy.secondary.port.toString())

    const secondarySecret = (await screen.findAllByLabelText('Shared Secret'))[1]
    await userEvent.type(secondarySecret, newAAAPolicy.secondary.sharedSecret)

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await waitFor(() => expect(mockedAddAAAPolicyFn).toHaveBeenCalled())

    const newAAAPolicyPrimary = newAAAPolicy.primary.ip + ':' + newAAAPolicy.primary.port
    expect((await screen.findByText(newAAAPolicyPrimary))).toBeVisible()
  })

  it('should render RadSec instance page', async () => {
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

    const radSecAAA = { ...mockRadSecAAAPolicyNewCreateResponse }

    const name = await screen.findByRole('textbox', { name: /Profile Name/i })
    await userEvent.type(name, radSecAAA.name)

    const primaryIp = (await screen.findAllByRole('textbox', { name: 'IP Address' }))[0]
    await userEvent.type(primaryIp, radSecAAA.primary.ip)

    const primaryPort = (await screen.findAllByRole('spinbutton', { name: 'Port' }))[0]
    await userEvent.clear(primaryPort)
    await userEvent.type(primaryPort,radSecAAA.primary.port.toString())

    const tlsEnabled = await screen.findByRole('switch')
    await userEvent.click(tlsEnabled)

    const cnSanIdentity = await screen.findByRole('textbox', { name: 'SAN Identity' })
    await userEvent.type(cnSanIdentity, radSecAAA.radSecOptions.cnSanIdentity)

    const comboboxes = await screen.findAllByRole('combobox')
    expect(comboboxes.length).toBe(4)

    await userEvent.click(comboboxes[1])
    await userEvent.click(await screen.findByText('CA-1'))

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await waitFor(() => expect(mockedAddAAAPolicyFn).toHaveBeenCalled())

    const radSecAAAPrimary = radSecAAA.primary.ip + ':' + radSecAAA.primary.port

    expect((await screen.findByText(radSecAAAPrimary))).toBeVisible()
  })

  it('should exclude RadSec when edit PSK network', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const radSecItem = mockAAAPolicyListResponse.data.find(aaa => aaa.radSecOptions?.tlsEnabled)!
    // eslint-disable-next-line max-len
    const nonRadSecItem = mockAAAPolicyListResponse.data.find(aaa => !aaa.radSecOptions?.tlsEnabled)!

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue({
        authRadiusId: radSecItem.id,
        authRadius: radSecItem
      })
      return form
    })

    render(<Provider><NetworkFormContext.Provider value={{
      editMode: true, cloneMode: false, isRuckusAiMode: false,
      data: {}
    }}><Form form={formRef.current} >
        <AAAInstance serverLabel='' type='authRadius' excludeRadSec={true}/>
      </Form></NetworkFormContext.Provider></Provider>,
    {
      route: { params: { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' } }
    })

    await userEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      expect(screen.getByText(nonRadSecItem.name)).toBeInTheDocument()
    })

    expect(screen.queryByText(radSecItem.name)).not.toBeInTheDocument()
  })

  it('should not exclude non-RadSec when edit OPEN network', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue({
        authRadiusId: '1',
        authRadius: {
          name: 'test1',
          type: 'AUTHENTICATION',
          primary: '1.1.1.2:1812',
          id: '1'
        }
      })
      return form
    })

    render(<Provider><NetworkFormContext.Provider value={{
      editMode: true, cloneMode: false, isRuckusAiMode: false,
      data: {}
    }}><Form form={formRef.current} >
        <AAAInstance serverLabel='' type='authRadius' excludeRadSec={true}/>
      </Form></NetworkFormContext.Provider></Provider>,
    {
      route: { params: { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' } }
    })

    expect((await screen.findByText('test1'))).toBeVisible()
  })

  it('should render template page', async () => {
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
      route: { params: { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' } },
      wrapper: ({ children }) => {
        return <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
          {children}
        </ConfigTemplateContext.Provider>
      }
    })

    await userEvent.click((await screen.findByRole('combobox')))

    await waitFor(() => {
      expect(screen.getByText(mockAAAPolicyTemplateListResponse.data[0].name)).toBeInTheDocument()
    })
  })
})
