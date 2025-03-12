import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { baseUrlFor }                                                                   from '@acx-ui/config'
import { Features, useIsSplitOn }                                                       from '@acx-ui/feature-toggle'
import { servicesConfigTemplateApi, serviceApi }                                        from '@acx-ui/rc/services'
import { ServicesConfigTemplateUrlsInfo, CommonUrlsInfo, PortalUrlsInfo, Portal, Demo } from '@acx-ui/rc/utils'
import { Path, To }                                                                     from '@acx-ui/react-router-dom'
import { Provider, store }                                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, waitFor }               from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                                 from '@acx-ui/user'

import { portalResponse, portalTemaplteResponse, createPath } from './__tests__/fixtures'
import PortalForm                                             from './PortalForm'
export const successResponse = { requestId: 'request-id' }

const Logo = baseUrlFor('/assets/images/portal/RuckusCloud.png')

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getImageDownloadUrl: () => Promise.resolve('testId')
}))

async function fillInBeforeSettings (portalName: string) {
  // Set Service Name
  await userEvent.type(
    await screen.findByRole('textbox', { name: /Service Name/i }),
    portalName
  )
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })
}

describe('PortalForm', () => {
  const mockAdd = jest.fn()
  const mockCreatePortal = jest.fn()
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    store.dispatch(serviceApi.util.resetApiState())
    store.dispatch(servicesConfigTemplateApi.util.resetApiState())
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.get(PortalUrlsInfo.getPortal.url,
        (_, res, ctx) => {
          return res(ctx.json(portalResponse))
        }),
      rest.post(
        PortalUrlsInfo.createPortal.url,
        (_, res, ctx) => {
          mockCreatePortal()
          return res(ctx.json(successResponse))
        }
      ),
      rest.put(PortalUrlsInfo.updatePortal.url,
        (_, res, ctx) => {
          return res(ctx.json(portalResponse))
        }),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ signedUrl: 'test', fileId: 'test' }))
        }),
      rest.post(CommonUrlsInfo.getUploadURL.url,
        (_, res, ctx) => {
          return res(ctx.json({ signedUrl: '/api/test', fileId: 'test' }))
        }),
      rest.put('/api/test',
        (_, res, ctx) => {
          mockAdd()
          return res(ctx.json({}))
        }),
      rest.post(PortalUrlsInfo.getEnhancedPortalProfileList.url,
        (_, res, ctx) => {
          return res(ctx.json({ content: [{ id: 'test', serviceName: 'test' }],
            paging: { page: 1, pageSize: 10, totalCount: 1 } }))
        }),
      rest.post(ServicesConfigTemplateUrlsInfo.getEnhancedPortalList.url,
        (_, res, ctx) => {
          return res(ctx.json({ data: [{ id: 'test', name: 'test' }],
            paging: { page: 1, pageSize: 10, totalCount: 1 } }))
        }),
      rest.get(ServicesConfigTemplateUrlsInfo.getPortal.url,
        (_, res, ctx) => {
          return res(ctx.json(portalTemaplteResponse))
        }),
      rest.post(PortalUrlsInfo.uploadPhoto.url,
        (_, res, ctx) => {
          return res(ctx.json({}))
        }),
      rest.post(PortalUrlsInfo.uploadLogo.url,
        (_, res, ctx) => {
          return res(ctx.json({}))
        }),
      rest.post(PortalUrlsInfo.uploadBgImage.url,
        (_, res, ctx) => {
          return res(ctx.json({}))
        }),
      rest.post(PortalUrlsInfo.uploadPoweredImg.url,
        (_, res, ctx) => {
          return res(ctx.json({}))
        }),
      rest.post(ServicesConfigTemplateUrlsInfo.uploadPhoto.url,
        (_, res, ctx) => {
          return res(ctx.json({}))
        }),
      rest.post(ServicesConfigTemplateUrlsInfo.uploadLogo.url,
        (_, res, ctx) => {
          return res(ctx.json({}))
        }),
      rest.post(ServicesConfigTemplateUrlsInfo.uploadBgImage.url,
        (_, res, ctx) => {
          return res(ctx.json({}))
        }),
      rest.post(ServicesConfigTemplateUrlsInfo.uploadPoweredImg.url,
        (_, res, ctx) => {
          return res(ctx.json({}))
        })
    )
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
    mockAdd.mockClear()
    mockCreatePortal.mockClear()
  })
  it('should create Portal with file successfully', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi' }

    render(<Provider><PortalForm /></Provider>, {
      route: { params, path: createPath }
    })
    //step 1 setting form
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')
    await userEvent.click(await screen.findByText('Reset'))
    const file = new File(['logo ruckus'],
      Logo,
      { type: 'image/png' })
    await userEvent.click(await screen.findByTitle('background setting'))

    await userEvent.upload(await screen.findByLabelText('Select image'),file)
    await userEvent.click(await screen.findByText('Select image'))

    await userEvent.click(await screen.findByText('Add'))
    await waitFor(() => expect(mockCreatePortal).toBeCalled())
    expect(await screen.findByText('English')).toBeVisible()
  })

  // RBAC
  it('should create Portal RBAC with file successfully', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi' }

    render(<Provider><PortalForm /></Provider>, {
      route: { params, path: createPath }
    })
    //step 1 setting form
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')
    await userEvent.click(await screen.findByText('Reset'))
    const file = new File(['logo ruckus'],
      Logo,
      { type: 'image/png' })
    await userEvent.click(await screen.findByTitle('background setting'))

    await userEvent.upload(await screen.findByLabelText('Select image'),file)
    await userEvent.click(await screen.findByText('Select image'))

    await userEvent.click(await screen.findByText('Add'))
    await waitFor(() => expect(mockCreatePortal).toBeCalled())
    expect(await screen.findByText('English')).toBeVisible()
  })
  it('should create Portal RBAC successfully', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi' }

    render(<Provider><PortalForm /></Provider>, {
      route: { params }
    })

    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')

    await userEvent.click(await screen.findByText('Add'))
    await waitFor(() => expect(mockCreatePortal).toBeCalled())
  })

  it('should edit open Portal RBAC successfully', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    const params = { networkId: '5d45082c812c45fbb9aab24420f39bf0',
      tenantId: 'tenant-id', action: 'edit', serviceId: '5d45082c812c45fbb9aab24420f39bf1' }
    render(<Provider><PortalForm editMode={true}/></Provider>, {
      route: { params }
    })
    fillInBeforeSettings('open portal edit test')

    await screen.findByRole('heading', { level: 3, name: 'Settings' })
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByRole('button', { name: 'Finish' }))
  })
  it('should cancel successfully', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    const cancelPortalRes: Portal = { ...portalResponse, content: { ...portalResponse.content,
      componentDisplay: { ...portalResponse.content?.componentDisplay, wifi4eu: true } }as Demo
    }
    const params = { networkId: '5d45082c812c45fbb9aab24420f39bf0',
      tenantId: 'tenant-id', action: 'edit', serviceId: '5d45082c812c45fbb9aab24420f39bf1' }

    mockServer.use(
      rest.get(PortalUrlsInfo.getPortal.url,
        (_, res, ctx) => {
          return res(ctx.json(cancelPortalRes))
        })
    )

    render(<Provider><PortalForm editMode={true}/></Provider>, {
      route: { params }
    })

    fillInBeforeSettings('open portal edit test')

    await screen.findByRole('heading', { level: 3, name: 'Settings' })
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByRole('button', { name: 'Finish' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })
})
