
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                                from '@acx-ui/feature-toggle'
import { servicesConfigTemplateApi, serviceApi }                                                 from '@acx-ui/rc/services'
import { ServicesConfigTemplateUrlsInfo, CommonUrlsInfo, PortalUrlsInfo, ConfigTemplateContext } from '@acx-ui/rc/utils'
import { Provider, store }                                                                       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  portalList, portalTemaplteResponse
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import PortalInstance from '.'

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))


describe('Portal Instance Page', () => {
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    store.dispatch(serviceApi.util.resetApiState())
    store.dispatch(servicesConfigTemplateApi.util.resetApiState())
    mockServer.use(
      rest.post(
        PortalUrlsInfo.getEnhancedPortalProfileList.url,
        (req, res, ctx) => res(ctx.json({ content: portalList,
          paging: { page: 1, pageSize: 10, totalCount: 1 } }))
      ),
      rest.get(PortalUrlsInfo.getPortal.url,
        (_, res, ctx) => {
          return res(ctx.json(portalList[0]))
        }),
      rest.post(
        PortalUrlsInfo.createPortal.url,
        (req, res, ctx) => res(ctx.json({ response: {
          requestId: 'request-id', id: '4', serviceName: 'test2' } }))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (req, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        }),
      rest.post(CommonUrlsInfo.getUploadURL.url,
        (_, res, ctx) => {
          return res(ctx.json({ signedUrl: '/api/test', fileId: 'test' }))
        }),
      rest.get(
        `${window.location.origin}/api/file/tenant/:tenantId/:imageId/url`,
        (req, res, ctx) => {
          return res(ctx.json({ signedUrl: 'url' }))
        }
      ),
      rest.put('/api/test',
        (_, res, ctx) => {
          return res(ctx.json({}))
        }),
      rest.post(ServicesConfigTemplateUrlsInfo.addPortal.url,
        (_, res, ctx) => {
          return res(ctx.json({ response: {
            requestId: 'request-id', id: '5', serviceName: 'test2' } }))
        }),
      rest.post(ServicesConfigTemplateUrlsInfo.getEnhancedPortalList.url,
        (_, res, ctx) => {
          return res(ctx.json({ data: [{ id: '3', name: 'test111' }],
            paging: { page: 1, pageSize: 10, totalCount: 1 } }))
        }),
      rest.get(ServicesConfigTemplateUrlsInfo.getPortal.url,
        (_, res, ctx) => {
          return res(ctx.json(portalTemaplteResponse))
        })
    )
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
  })

  it('should render instance page', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const params = { networkId: 'UNKNOWN-NETWORK-ID',
      tenantId: 'tenant-id' }
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    render(<Provider><NetworkFormContext.Provider value={{
      editMode: false, cloneMode: false, data: { guestPortal:
        { enableSmsLogin: true, socialIdentities: {} }, portalServiceProfileId: '2' }
    }}><Form><PortalInstance />
      </Form></NetworkFormContext.Provider></Provider>,
    {
      route: { params }
    })
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.click((await screen.findAllByText('Cancel'))[0])
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click((await screen.findAllByRole('combobox'))[0])
    await userEvent.click((await screen.findAllByTitle('test2'))[0])
  })

  it('should render instance page (portal servcie profile template)', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const params = { networkId: 'UNKNOWN-NETWORK-ID',
      tenantId: 'tenant-id', serviceId: '3' }
    render(<Provider>
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <NetworkFormContext.Provider value={{
          editMode: false, cloneMode: false, data: { guestPortal:
        { enableSmsLogin: true, socialIdentities: {} }, portalServiceProfileId: '1' }
        }}><Form><PortalInstance />
          </Form></NetworkFormContext.Provider></ConfigTemplateContext.Provider></Provider>,
    {
      route: { params }
    })
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.click((await screen.findAllByText('Cancel'))[0])
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal template')
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click((await screen.findAllByRole('combobox'))[0])
    await userEvent.click((await screen.findAllByTitle('test111'))[0])
  })

  //RBAC
  it('should render RBAC instance page', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID',
      tenantId: 'tenant-id' }
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    render(<Provider><NetworkFormContext.Provider value={{
      editMode: false, cloneMode: false, data: { guestPortal:
        { enableSmsLogin: true, socialIdentities: {} }, portalServiceProfileId: '2' }
    }}><Form><PortalInstance />
      </Form></NetworkFormContext.Provider></Provider>,
    {
      route: { params }
    })
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.click((await screen.findAllByText('Cancel'))[0])
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click((await screen.findAllByRole('combobox'))[0])
    await userEvent.click((await screen.findAllByTitle('test2'))[0])
  })

  it('should render RBAC instance page (portal servcie profile template)', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const params = { networkId: 'UNKNOWN-NETWORK-ID',
      tenantId: 'tenant-id', serviceId: '3' }
    render(<Provider>
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <NetworkFormContext.Provider value={{
          editMode: false, cloneMode: false, data: { guestPortal:
        { enableSmsLogin: true, socialIdentities: {} }, portalServiceProfileId: '1' }
        }}><Form><PortalInstance />
          </Form></NetworkFormContext.Provider></ConfigTemplateContext.Provider></Provider>,
    {
      route: { params }
    })
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.click((await screen.findAllByText('Cancel'))[0])
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal template')
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click((await screen.findAllByRole('combobox'))[0])
    await userEvent.click((await screen.findAllByTitle('test111'))[0])
  })
})
