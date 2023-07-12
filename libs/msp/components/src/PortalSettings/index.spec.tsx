/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { BaseUrl, CommonUrlsInfo, ExternalProviders, MspPortal, MspUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }                                                          from '@acx-ui/store'
import {
  render,
  mockServer,
  screen,
  fireEvent,
  waitFor
} from '@acx-ui/test-utils'

import { PortalSettings } from '.'


// const params: { tenantId: string } = { tenantId: '3061bd56e37445a8993ac834c01e2710' }
const mockDate = new Date('2023-02-25T18:53:39.319+00:00')
const emptyMspLabel: MspPortal = {}
const mspLabel: MspPortal =
    {
      msp_label: 'demo-msp',
      logo_uuid: '0fd0c03f9cb746579f1292d310e3e849-001.png',
      alarm_notification_logo_uuid: '0fd0c03f9cb746579f1292d310e3e849-001.png',
      ping_notification_logo_uuid: '14e7c2c9797a4c4c9dd6cb85fda654db-001.png',
      ping_login_logo_uuid: '63c272eb7cdd4dd6acc8adbff40f407b-001.png',
      mspLogoFileDataList:
            [
              {
                createdDate: mockDate,
                id: 'dd5c65c95ed748c98f6f7983949a9171',
                logo_file_name: 'img1.png',
                logo_fileuuid: '0fd0c03f9cb746579f1292d310e3e849-001.png',
                updatedDate: mockDate
              },
              {
                createdDate: mockDate,
                id: 'e657a642086c45048c35da3c3c95b467',
                logo_file_name: 'img2.png',
                logo_fileuuid: '63c272eb7cdd4dd6acc8adbff40f407b-001.png',
                updatedDate: mockDate
              },
              {
                createdDate: mockDate,
                id: '28d3ef7716e74dd8b126a7280b5b02e8',
                logo_file_name: 'img3.png',
                logo_fileuuid: '14e7c2c9797a4c4c9dd6cb85fda654db-001.png',
                updatedDate: mockDate
              },
              {
                createdDate: mockDate,
                id: '38d3ef7716e74dd8b126a7280b5b02e9',
                logo_file_name: 'img4.png',
                logo_fileuuid: '1b077fa595074a2ca757c37b0d3d3e13-001.png',
                updatedDate: mockDate
              }
            ],
      contact_support_behavior: 'hide',
      open_case_url: 'http://opencasetest.com',
      my_open_case_url: 'http://myopencasetest.com',
      msp_phone: '+19255557458',
      msp_email: 'info@email.com',
      msp_website: 'http://websitetest.com'
      // preferredWisprProvider: MspPreferredWisprProvider;
    }
const externalProviders: ExternalProviders =
    {
      providers:
            [
              {
                customExternalProvider: false,
                name: 'Aislelabs',
                regions:
                    [
                      {
                        name: 'Global',
                        showAnalyticsData: false,
                        captivePortalUrl: '',
                        redirectUrl: ''
                      }
                    ]
              }
            ]
    }

const baseUrl: BaseUrl =
    {
      base_url: 'msp.devalto.ruckuswireless.com'
    }

const services = require('@acx-ui/rc/services')
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services')
  // useAddMspLabelMutation: () => Promise.resolve({
  //   json: () => Promise.resolve({ requestId: '456' }),
  //   clone: () => Promise.resolve({ requestId: '456' })
  // })
}))
const utils = require('@acx-ui/utils')
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils')
}))
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('PortalSettings', () => {
  const params = { tenantId: '3061bd56e37445a8993ac834c01e2710' }
  const fileUrl: string = '/api/file/tenant/' + params.tenantId + '/'

  beforeEach(async () => {
    services.useExternalProvidersQuery = jest.fn().mockImplementation(() => {
      return { data: externalProviders }
    })
    services.useGetMspBaseURLQuery = jest.fn().mockImplementation(() => {
      return { data: baseUrl }
    })
    utils.loadImageWithJWT = jest.fn().mockImplementation((imageId: string) => {
      return Promise.resolve(fileUrl + imageId)
    })
    jest.spyOn(services, 'useGetUploadURLMutation')
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getUploadURL.url,
        (req, res, ctx) => res(ctx.json({ fileId: 'f1-001/xml', signedUrl: 'www.storage.com' }))
      )
    )
    jest.spyOn(services, 'useUpdateMspLabelMutation')
    mockServer.use(
      rest.put(
        MspUrlsInfo.updateMspLabel.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
    jest.spyOn(services, 'useAddMspLabelMutation')
    mockServer.use(
      rest.post(
        MspUrlsInfo.addMspLabel.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      )
    )
    // mockServer.use(
    //   rest.post(
    //     MspUrlsInfo.addMspLabel.url,
    //     (req, res, ctx) => res(ctx.json({ requestId: '456'}, ctx.))
    //   )
    // )
    global.URL.createObjectURL = jest.fn()
    jest.spyOn(global.URL, 'createObjectURL')
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        text: () => Promise.resolve({})
      })
    )
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render correctly for add', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: emptyMspLabel }
    })

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()

    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 3, name: 'Branding' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Logo:' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Logo Preview:' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()
  })
  it('should render correctly for edit', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspLabel }
    })

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()
    await waitFor(() =>
      expect(utils.loadImageWithJWT).toHaveBeenCalledTimes(8))

    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 3, name: 'Branding' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Logo:' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Logo Preview:' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()
  })
  it('domain form item should load correctly for add', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: emptyMspLabel }
    })

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()

    const formItem = screen.getByRole('textbox')
    expect(formItem).toBeVisible()
    expect(formItem).toHaveValue('')
  })
  it('domain form item should load correctly for edit', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspLabel }
    })

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()
    await waitFor(() =>
      expect(utils.loadImageWithJWT).toHaveBeenCalledTimes(8))

    const formItem = screen.getByRole('textbox')
    expect(formItem).toBeVisible()
    expect(formItem).toHaveValue('demo-msp')
    expect(screen.getByText('.msp.devalto.ruckuswireless.com')).toBeVisible()
    expect(screen.getByDisplayValue('demo-msp')).toBeInTheDocument()
  })
  it('empty domain form item should show correct error message', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspLabel }
    })

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()

    const formItem = screen.getByRole('textbox')
    expect(formItem).toBeVisible()
    expect(formItem).toHaveValue('demo-msp')

    userEvent.setup()
    await userEvent.clear(formItem)
    await userEvent.click(screen.getByRole('button', { name: '3rd Party Portal Providers' }))

    await waitFor(async () => {
      expect(await screen.findByRole('alert')).toBeVisible()
    })
    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toBe('Please enter a domain name')
    })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: 'Branding' })).toBeVisible()
    })
  })
  it('invalid domain form item should show correct error message', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspLabel }
    })

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()

    const formItem = screen.getByRole('textbox')
    expect(formItem).toBeVisible()
    expect(formItem).toHaveValue('demo-msp')

    userEvent.setup()
    await userEvent.clear(formItem)
    await userEvent.type(formItem, '!')
    await userEvent.click(screen.getByRole('button', { name: '3rd Party Portal Providers' }))

    await waitFor(async () => {
      expect(await screen.findByRole('alert')).toBeVisible()
    })
    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toBe('Please enter a valid domain name')
    })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: 'Branding' })).toBeVisible()
    })
  })
  it('valid domain form item should show allow next step', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspLabel }
    })

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()
    await waitFor(() =>
      expect(utils.loadImageWithJWT).toHaveBeenCalledTimes(8))

    const formItem = screen.getByRole('textbox')
    expect(formItem).toBeVisible()
    expect(formItem).toHaveValue('demo-msp')

    fireEvent.click(screen.getByRole('button', { name: '3rd Party Portal Providers' }))
    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })
  it('logo form item should load correctly for add', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: emptyMspLabel }
    })

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()

    const defaultLogoRadio = screen.getByRole('radio', { name: 'COMMSCOPE RUCKUS logo' })
    expect(defaultLogoRadio).toBeVisible()
    expect(defaultLogoRadio).toBeChecked()

    const customLogoRadio = screen.getByRole('radio', { name: 'My Logo' })
    expect(customLogoRadio).toBeVisible()
    expect(customLogoRadio).not.toBeChecked()

    expect(screen.getByRole('heading', { level: 4, name: 'Logo Preview:' })).toBeVisible()
    expect(screen.getByText('Portal Header')).toBeVisible()
    expect(screen.getByText('Customer Login')).toBeVisible()
    expect(screen.getByText('Customer Support Emails')).toBeVisible()
    expect(screen.getByText('Alarm Notification Emails')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Import Logo' })).toBeNull()
    expect(screen.queryAllByRole('combobox')).toHaveLength(0)
    // Assert logo previews have the correct default logos
    expect(screen.getByRole('img', { name: 'portal header logo' })).toHaveAttribute('src', 'RuckusLogoCloud')
    expect(screen.getByRole('img', { name: 'customer login logo' })).toHaveAttribute('src', 'ComscopeLogoPing')
    expect(screen.getByRole('img', { name: 'customer support logo' })).toHaveAttribute('src', 'RuckusLogoNotification')
    expect(screen.getByRole('img', { name: 'alarm logo' })).toHaveAttribute('src', 'RuckusLogoAlarm')
  })
  it('logo form item should load correctly for edit when custom logo list exists', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspLabel }
    })

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()
    await waitFor(() =>
      expect(utils.loadImageWithJWT).toHaveBeenCalledTimes(8))

    const defaultLogoRadio = screen.getByRole('radio', { name: 'COMMSCOPE RUCKUS logo' })
    expect(defaultLogoRadio).toBeVisible()
    expect(defaultLogoRadio).not.toBeChecked()

    const customLogoRadio = screen.getByRole('radio', { name: 'My Logo' })
    expect(customLogoRadio).toBeVisible()
    expect(customLogoRadio).toBeChecked()

    expect(screen.getAllByRole('button', { name: 'Import Logo' }).find(button => button.hasAttribute('type'))).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Logo Preview:' })).toBeVisible()
    expect(screen.getByText('Portal Header')).toBeVisible()
    expect(screen.getByText('Customer Login')).toBeVisible()
    expect(screen.getByText('Customer Support Emails')).toBeVisible()
    expect(screen.getByText('Alarm Notification Emails')).toBeVisible()
    // Assert list of custom logos correct
    expect(screen.getByRole('img', { name: 'img1.png' })).toBeVisible()
    expect(screen.getByRole('img', { name: 'img2.png' })).toBeVisible()
    expect(screen.getByRole('img', { name: 'img3.png' })).toBeVisible()
    expect(screen.getByRole('img', { name: 'img4.png' })).toBeVisible()
    expect(screen.getAllByRole('img', { name: 'delete' })).toHaveLength(4)
    // Assert logo previews have the correct custom logos
    expect(screen.getByRole('img', { name: 'portal header logo' })).toHaveAttribute('src', fileUrl + '0fd0c03f9cb746579f1292d310e3e849-001.png')
    expect(screen.getByRole('img', { name: 'customer login logo' })).toHaveAttribute('src', fileUrl + '63c272eb7cdd4dd6acc8adbff40f407b-001.png')
    expect(screen.getByRole('img', { name: 'customer support logo' })).toHaveAttribute('src', fileUrl + '14e7c2c9797a4c4c9dd6cb85fda654db-001.png')
    expect(screen.getByRole('img', { name: 'alarm logo' })).toHaveAttribute('src', fileUrl + '0fd0c03f9cb746579f1292d310e3e849-001.png')
    // Assert logo preview dropdowns have the correct options
    const dropdowns = screen.getAllByRole('combobox')
    expect(dropdowns).toHaveLength(4)
    expect(screen.getAllByText('img1.png')).toHaveLength(3)
    expect(screen.getAllByText('img2.png')).toHaveLength(2)
    expect(screen.getAllByText('img3.png')).toHaveLength(2)
    expect(screen.getAllByText('img4.png')).toHaveLength(1)
    fireEvent.mouseDown(dropdowns.at(0)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(4)
    expect(screen.getAllByText('img2.png')).toHaveLength(3)
    expect(screen.getAllByText('img3.png')).toHaveLength(3)
    expect(screen.getAllByText('img4.png')).toHaveLength(2)
    fireEvent.mouseDown(dropdowns.at(1)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(5)
    expect(screen.getAllByText('img2.png')).toHaveLength(4)
    expect(screen.getAllByText('img3.png')).toHaveLength(4)
    expect(screen.getAllByText('img4.png')).toHaveLength(3)
    fireEvent.mouseDown(dropdowns.at(2)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(6)
    expect(screen.getAllByText('img2.png')).toHaveLength(5)
    expect(screen.getAllByText('img3.png')).toHaveLength(5)
    expect(screen.getAllByText('img4.png')).toHaveLength(4)
    fireEvent.mouseDown(dropdowns.at(3)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(7)
    expect(screen.getAllByText('img2.png')).toHaveLength(6)
    expect(screen.getAllByText('img3.png')).toHaveLength(6)
    expect(screen.getAllByText('img4.png')).toHaveLength(5)
  })
  it('logo form item should load correctly for edit when custom logo list does not exist', async () => {
    const mspLabelWithoutLogoList : MspPortal = { ...mspLabel }
    mspLabelWithoutLogoList.mspLogoFileDataList = undefined
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspLabelWithoutLogoList }
    })

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()

    const defaultLogoRadio = screen.getByRole('radio', { name: 'COMMSCOPE RUCKUS logo' })
    expect(defaultLogoRadio).toBeVisible()
    expect(defaultLogoRadio).toBeChecked()

    const customLogoRadio = screen.getByRole('radio', { name: 'My Logo' })
    expect(customLogoRadio).toBeVisible()
    expect(customLogoRadio).not.toBeChecked()

    expect(screen.getByRole('heading', { level: 4, name: 'Logo Preview:' })).toBeVisible()
    expect(screen.getByText('Portal Header')).toBeVisible()
    expect(screen.getByText('Customer Login')).toBeVisible()
    expect(screen.getByText('Customer Support Emails')).toBeVisible()
    expect(screen.getByText('Alarm Notification Emails')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Import Logo' })).toBeNull()
    expect(screen.queryAllByRole('combobox')).toHaveLength(0)
    // Assert logo previews have the correct default logos
    expect(screen.getByRole('img', { name: 'portal header logo' })).toHaveAttribute('src', 'RuckusLogoCloud')
    expect(screen.getByRole('img', { name: 'customer login logo' })).toHaveAttribute('src', 'ComscopeLogoPing')
    expect(screen.getByRole('img', { name: 'customer support logo' })).toHaveAttribute('src', 'RuckusLogoNotification')
    expect(screen.getByRole('img', { name: 'alarm logo' })).toHaveAttribute('src', 'RuckusLogoAlarm')
  })
  it('import logo validates against invalid file type', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspLabel }
    })
    mockServer.use(rest.post('',
      (_, res, ctx) => res(ctx.json({})))
    )

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()
    await waitFor(() =>
      expect(utils.loadImageWithJWT).toHaveBeenCalledTimes(8))

    // Upload invalid image
    const jpegFile = new File(['(⌐□_□)'], 'invalid_image.jpeg', { type: 'image/jpeg' })
    await userEvent.click(screen.getAllByRole('button', { name: 'Import Logo' }).at(0)!)
    // eslint-disable-next-line testing-library/no-node-access
    const fileInput = document.querySelector('input[type=file]')! as Element
    fireEvent.change(fileInput, { target: { files: [jpegFile] } })

    await waitFor(async () => {
      expect(await screen.findByText('invalid_image.jpeg' )).toBeVisible()
    })
    // Assert error message is shown
    expect(screen.getByText('Invalid image type!')).toBeVisible()
    await userEvent.click(screen.getByRole('img', { name: 'close' }))
    // // Assert file is not added as option in logo preview dropdowns
    const dropdowns = screen.getAllByRole('combobox')
    expect(dropdowns).toHaveLength(4)
    expect(screen.getAllByText('img1.png')).toHaveLength(3)
    expect(screen.getAllByText('img2.png')).toHaveLength(2)
    expect(screen.getAllByText('img3.png')).toHaveLength(2)
    expect(screen.getAllByText('img4.png')).toHaveLength(1)
    expect(screen.getAllByText('invalid_image.jpeg')).toHaveLength(1)
    fireEvent.mouseDown(dropdowns.at(0)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(4)
    expect(screen.getAllByText('img2.png')).toHaveLength(3)
    expect(screen.getAllByText('img3.png')).toHaveLength(3)
    expect(screen.getAllByText('img4.png')).toHaveLength(2)
    expect(screen.getAllByText('invalid_image.jpeg')).toHaveLength(1)
    fireEvent.mouseDown(dropdowns.at(1)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(5)
    expect(screen.getAllByText('img2.png')).toHaveLength(4)
    expect(screen.getAllByText('img3.png')).toHaveLength(4)
    expect(screen.getAllByText('img4.png')).toHaveLength(3)
    expect(screen.getAllByText('invalid_image.jpeg')).toHaveLength(1)
    fireEvent.mouseDown(dropdowns.at(2)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(6)
    expect(screen.getAllByText('img2.png')).toHaveLength(5)
    expect(screen.getAllByText('img3.png')).toHaveLength(5)
    expect(screen.getAllByText('img4.png')).toHaveLength(4)
    expect(screen.getAllByText('invalid_image.jpeg')).toHaveLength(1)
    fireEvent.mouseDown(dropdowns.at(3)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(7)
    expect(screen.getAllByText('img2.png')).toHaveLength(6)
    expect(screen.getAllByText('img3.png')).toHaveLength(6)
    expect(screen.getAllByText('img4.png')).toHaveLength(5)
    expect(screen.getAllByText('invalid_image.jpeg')).toHaveLength(1)
  })
  it('import logo validates against invalid file size', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspLabel }
    })
    mockServer.use(rest.post('',
      (_, res, ctx) => res(ctx.json({})))
    )

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()
    await waitFor(() =>
      expect(utils.loadImageWithJWT).toHaveBeenCalledTimes(8))

    // Upload invalid image
    await userEvent.click(screen.getAllByRole('button', { name: 'Import Logo' }).at(0)!)
    // eslint-disable-next-line testing-library/no-node-access
    const fileInput = document.querySelector('input[type=file]')! as Element
    fireEvent.change(fileInput, { target: { files: [{ file: 'invalid_image.jpg', type: 'image/jpg', size: 780000 }] } })

    // Assert error message is shown
    await waitFor(async () => {
      expect(screen.getByText('Image must be smaller than 750KB!')).toBeVisible()
    })
    await userEvent.click(screen.getByRole('img', { name: 'close' }))
    // // Assert file is not added as option in logo preview dropdowns
    const dropdowns = screen.getAllByRole('combobox')
    expect(dropdowns).toHaveLength(4)
    expect(screen.getAllByText('img1.png')).toHaveLength(3)
    expect(screen.getAllByText('img2.png')).toHaveLength(2)
    expect(screen.getAllByText('img3.png')).toHaveLength(2)
    expect(screen.getAllByText('img4.png')).toHaveLength(1)
    expect(screen.queryByText('invalid_image.jpg')).toBeNull()
    fireEvent.mouseDown(dropdowns.at(0)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(4)
    expect(screen.getAllByText('img2.png')).toHaveLength(3)
    expect(screen.getAllByText('img3.png')).toHaveLength(3)
    expect(screen.getAllByText('img4.png')).toHaveLength(2)
    expect(screen.queryByText('invalid_image.jpg')).toBeNull()
    fireEvent.mouseDown(dropdowns.at(1)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(5)
    expect(screen.getAllByText('img2.png')).toHaveLength(4)
    expect(screen.getAllByText('img3.png')).toHaveLength(4)
    expect(screen.getAllByText('img4.png')).toHaveLength(3)
    expect(screen.queryByText('invalid_image.jpg')).toBeNull()
    fireEvent.mouseDown(dropdowns.at(2)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(6)
    expect(screen.getAllByText('img2.png')).toHaveLength(5)
    expect(screen.getAllByText('img3.png')).toHaveLength(5)
    expect(screen.getAllByText('img4.png')).toHaveLength(4)
    expect(screen.queryByText('invalid_image.jpg')).toBeNull()
    fireEvent.mouseDown(dropdowns.at(3)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(7)
    expect(screen.getAllByText('img2.png')).toHaveLength(6)
    expect(screen.getAllByText('img3.png')).toHaveLength(6)
    expect(screen.getAllByText('img4.png')).toHaveLength(5)
    expect(screen.queryByText('invalid_image.jpg')).toBeNull()
  })
  it('import logo validates against file with already existing filename', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspLabel }
    })
    mockServer.use(rest.post('',
      (_, res, ctx) => res(ctx.json({})))
    )

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()
    await waitFor(() =>
      expect(utils.loadImageWithJWT).toHaveBeenCalledTimes(8))

    // Upload invalid image
    const pngFile = new File(['(⌐□_□)'], 'img4.png', { type: 'image/png' })
    await userEvent.click(screen.getAllByRole('button', { name: 'Import Logo' }).at(0)!)
    // eslint-disable-next-line testing-library/no-node-access
    const fileInput = document.querySelector('input[type=file]')! as Element
    fireEvent.change(fileInput, { target: { files: [pngFile] } })

    await waitFor(async () => {
      expect(screen.getAllByText('img4.png')).toHaveLength(2)
    })
    // Assert error message is shown
    expect(screen.getByText('An image already exists with that filename!')).toBeVisible()
    await userEvent.click(screen.getByRole('img', { name: 'close' }))
    // // Assert img4.jpg filename is not duplicated in logo preview dropdowns
    const dropdowns = screen.getAllByRole('combobox')
    expect(dropdowns).toHaveLength(4)
    expect(screen.getAllByText('img1.png')).toHaveLength(3)
    expect(screen.getAllByText('img2.png')).toHaveLength(2)
    expect(screen.getAllByText('img3.png')).toHaveLength(2)
    fireEvent.mouseDown(dropdowns.at(0)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(4)
    expect(screen.getAllByText('img2.png')).toHaveLength(3)
    expect(screen.getAllByText('img3.png')).toHaveLength(3)
    expect(screen.getAllByText('img4.png')).toHaveLength(3)
    fireEvent.mouseDown(dropdowns.at(1)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(5)
    expect(screen.getAllByText('img2.png')).toHaveLength(4)
    expect(screen.getAllByText('img3.png')).toHaveLength(4)
    expect(screen.getAllByText('img4.png')).toHaveLength(4)
    fireEvent.mouseDown(dropdowns.at(2)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(6)
    expect(screen.getAllByText('img2.png')).toHaveLength(5)
    expect(screen.getAllByText('img3.png')).toHaveLength(5)
    expect(screen.getAllByText('img4.png')).toHaveLength(5)
    fireEvent.mouseDown(dropdowns.at(3)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(7)
    expect(screen.getAllByText('img2.png')).toHaveLength(6)
    expect(screen.getAllByText('img3.png')).toHaveLength(6)
    expect(screen.getAllByText('img4.png')).toHaveLength(6)
  })
  it('import logo correctly uploads valid file and disables upload after 5 logos imported', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspLabel }
    })
    mockServer.use(rest.post('',
      (_, res, ctx) => res(ctx.json({})))
    )

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()
    await waitFor(() =>
      expect(utils.loadImageWithJWT).toHaveBeenCalledTimes(8))

    // Upload valid image
    const jpgFile = new File(['(⌐□_□)'], 'valid_image.jpg', { type: 'image/jpg' })
    await userEvent.click(screen.getAllByRole('button', { name: 'Import Logo' }).at(0)!)
    // eslint-disable-next-line testing-library/no-node-access
    const fileInput = document.querySelector('input[type=file]')! as Element
    fireEvent.change(fileInput, { target: { files: [jpgFile] } })

    // Assert new logo is shown in list of custom logos
    await waitFor(() => {
      expect(screen.getByText('valid_image.jpg')).toBeVisible()
    })
    // Assert Import Logo button is disabled
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Import Logo' }).find(button => button.hasAttribute('type'))).toBeDisabled()
    })
    // Assert no error messages are shown
    await waitFor(() => {
      expect(screen.queryByText('Invalid image type!')).toBeNull()
    })
    await waitFor(() => {
      expect(screen.queryByText('Image must be smaller than 750KB!')).toBeNull()
    })
    await waitFor(() => {
      expect(screen.queryByText('An image already exists with that filename!')).toBeNull()
    })
    // Assert new logo is added to options in logo preview dropdowns
    const dropdowns = screen.getAllByRole('combobox')
    expect(dropdowns).toHaveLength(4)
    expect(screen.getAllByText('img1.png')).toHaveLength(3)
    expect(screen.getAllByText('img2.png')).toHaveLength(2)
    expect(screen.getAllByText('img3.png')).toHaveLength(2)
    expect(screen.getAllByText('img4.png')).toHaveLength(1)
    fireEvent.mouseDown(dropdowns.at(0)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(4)
    expect(screen.getAllByText('img2.png')).toHaveLength(3)
    expect(screen.getAllByText('img3.png')).toHaveLength(3)
    expect(screen.getAllByText('img4.png')).toHaveLength(2)
    expect(screen.getAllByText('valid_image.jpg')).toHaveLength(2)
    fireEvent.mouseDown(dropdowns.at(1)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(5)
    expect(screen.getAllByText('img2.png')).toHaveLength(4)
    expect(screen.getAllByText('img3.png')).toHaveLength(4)
    expect(screen.getAllByText('img4.png')).toHaveLength(3)
    expect(screen.getAllByText('valid_image.jpg')).toHaveLength(3)
    fireEvent.mouseDown(dropdowns.at(2)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(6)
    expect(screen.getAllByText('img2.png')).toHaveLength(5)
    expect(screen.getAllByText('img3.png')).toHaveLength(5)
    expect(screen.getAllByText('img4.png')).toHaveLength(4)
    expect(screen.getAllByText('valid_image.jpg')).toHaveLength(4)
    fireEvent.mouseDown(dropdowns.at(3)!)
    expect(screen.getAllByText('img1.png')).toHaveLength(7)
    expect(screen.getAllByText('img2.png')).toHaveLength(6)
    expect(screen.getAllByText('img3.png')).toHaveLength(6)
    expect(screen.getAllByText('img4.png')).toHaveLength(5)
    expect(screen.getAllByText('valid_image.jpg')).toHaveLength(5)

    // Delete one custom logo
    const deleteButton = screen.getAllByTitle('Remove file').at(0)!
    userEvent.click(deleteButton)

    // Assert Import Logo button is enabled
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Import Logo' }).find(button => button.hasAttribute('type'))).toBeEnabled()
    })
  })
  it('import logo sets new image as selected in logo preview dropdowns when custom logo list is empty', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: emptyMspLabel }
    })
    mockServer.use(rest.post('',
      (_, res, ctx) => res(ctx.json({})))
    )

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()

    await userEvent.click(screen.getByRole('radio', { name: 'My Logo' }))

    // Upload valid image
    const jpgFile = new File(['(⌐□_□)'], 'valid_image.jpg', { type: 'image/jpg' })
    await userEvent.click(screen.getAllByRole('button', { name: 'Import Logo' }).at(0)!)
    // eslint-disable-next-line testing-library/no-node-access
    const fileInput = document.querySelector('input[type=file]')! as Element
    fireEvent.change(fileInput, { target: { files: [jpgFile] } })

    // Assert new logo is shown in list of custom logos and in as the value in each logo preview dropdown
    await waitFor(() => {
      expect(screen.getAllByText('valid_image.jpg')).toHaveLength(5)
    })
  })
  it('deleting logo from custom logo list removes logo from logo previews and all dropdowns', async () => {
    const data = mspLabel
    data.ping_login_logo_uuid = '14e7c2c9797a4c4c9dd6cb85fda654db-001.png'
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: data }
    })
    mockServer.use(rest.post('',
      (_, res, ctx) => res(ctx.json({})))
    )

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()
    await waitFor(() =>
      expect(utils.loadImageWithJWT).toHaveBeenCalledTimes(8))

    // Delete one custom logo
    const deleteButton = screen.getAllByTitle('Remove file').at(0)!
    await userEvent.click(deleteButton)

    // Assert deleted logo is removed from logo preview dropdowns
    const deletedLogo = 'img1.png'
    const dropdowns = screen.getAllByRole('combobox')
    expect(dropdowns).toHaveLength(4)
    expect(screen.queryByText(deletedLogo)).toBeNull()
    fireEvent.mouseDown(dropdowns.at(0)!)
    expect(screen.queryByText(deletedLogo)).toBeNull()
    fireEvent.mouseDown(dropdowns.at(1)!)
    expect(screen.queryByText(deletedLogo)).toBeNull()
    fireEvent.mouseDown(dropdowns.at(2)!)
    expect(screen.queryByText(deletedLogo)).toBeNull()
    fireEvent.mouseDown(dropdowns.at(3)!)
    expect(screen.queryByText(deletedLogo)).toBeNull()

    // Assert deleted logo image is removed from affected logo previews
    expect(screen.queryByRole('img', { name: 'portal header logo' })).toBeNull()
    expect(screen.getByRole('img', { name: 'customer login logo' })).toBeVisible()
    expect(screen.getByRole('img', { name: 'customer support logo' })).toBeVisible()
    expect(screen.queryByRole('img', { name: 'alarm logo' })).toBeNull()

    // Delete another custom logo
    const deleteButton2 = screen.getAllByTitle('Remove file').at(1)!
    await userEvent.click(deleteButton2)

    // Assert deleted logo is removed from logo preview dropdowns
    // TODO: check below
    // const deletedLogo2 = 'img3.png'
    // const dropdowns2 = screen.getAllByRole('combobox')
    // expect(dropdowns2).toHaveLength(4)
    // expect(screen.queryByText(deletedLogo2)).toBeNull()
    // fireEvent.mouseDown(dropdowns2.at(0)!)
    // expect(screen.queryByText(deletedLogo2)).toBeNull()
    // fireEvent.mouseDown(dropdowns2.at(1)!)
    // expect(screen.queryByText(deletedLogo2)).toBeNull()
    // fireEvent.mouseDown(dropdowns2.at(2)!)
    // expect(screen.queryByText(deletedLogo2)).toBeNull()
    // fireEvent.mouseDown(dropdowns2.at(3)!)
    // expect(screen.queryByText(deletedLogo2)).toBeNull()

    // // Assert deleted logo image is removed from affected logo previews
    expect(screen.queryByRole('img', { name: 'portal header logo' })).toBeNull()
    expect(screen.queryByRole('img', { name: 'customer login logo' })).toBeNull()
    expect(screen.queryByRole('img', { name: 'customer support logo' })).toBeNull()
    expect(screen.queryByRole('img', { name: 'alarm logo' })).toBeNull()
  })
  it('should save correctly for edit', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspLabel }
    })

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()
    await waitFor(() =>
      expect(utils.loadImageWithJWT).toHaveBeenCalledTimes(8))

    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 3, name: 'Branding' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Logo:' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Logo Preview:' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: '3rd Party Portal Providers' }))
    expect(await screen.findByRole('heading', { level: 3, name: '3rd Party Portal Providers' })).toBeVisible()
    expect(screen.queryByRole('heading', { level: 4, name: 'Logo:' })).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Support Links' }))
    expect(await screen.findByRole('heading', { level: 3, name: 'Support links behavior' })).toBeVisible()
    expect(screen.queryByRole('heading', { level: 3, name: '3rd Party Portal Providers' })).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Contact Info' }))
    expect(await screen.findByRole('heading', { level: 3, name: 'Contact information for emails footer' })).toBeVisible()
    expect(screen.queryByRole('heading', { level: 3, name: 'Support links behavior' })).toBeNull()

    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    // expect(mockedUsedNavigate).toHaveBeenCalledWith({
    //   pathname: `/${params.tenantId}/v/dashboard`,
    //   hash: '',
    //   search: ''
    // }, { replace: true })
  })
  it('should save correctly for add', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: emptyMspLabel }
    })

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()

    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 3, name: 'Branding' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Logo:' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Logo Preview:' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()


    const mspLabelInput = screen.getByRole('textbox')
    fireEvent.change(mspLabelInput, { target: { value: 'mspeleu' } })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('heading', { level: 3, name: '3rd Party Portal Providers' })).toBeVisible()
    expect(screen.queryByRole('heading', { level: 4, name: 'Logo:' })).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('heading', { level: 3, name: 'Support links behavior' })).toBeVisible()
    expect(screen.queryByRole('heading', { level: 3, name: '3rd Party Portal Providers' })).toBeNull()

    const urlInputs = screen.getAllByRole('textbox')
    expect(urlInputs).toHaveLength(2)
    fireEvent.change(urlInputs[0], { target: { value: 'http://test.com' } })
    fireEvent.change(urlInputs[1], { target: { value: 'http://test.com' } })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('heading', { level: 3, name: 'Contact information for emails footer' })).toBeVisible()
    expect(screen.queryByRole('heading', { level: 3, name: 'Support links behavior' })).toBeNull()

    const emailInput = screen.getByRole('textbox', { name: 'Email' })
    const websiteInput = screen.getByRole('textbox', { name: 'Website' })
    fireEvent.change(emailInput, { target: { value: 'info@email.com' } })
    fireEvent.change(websiteInput, { target: { value: 'http://test.com' } })

    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    // expect(mockedUsedNavigate).toHaveBeenCalledWith({
    //   pathname: `/${params.tenantId}/v/dashboard`,
    //   hash: '',
    //   search: ''
    // }, { replace: true })
  })
  xit('should catch error when saving for edit', async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspLabel }
    })
    mockServer.use(
      rest.put(
        MspUrlsInfo.updateMspLabel.url,
        (req, res, ctx) => res(ctx.status(401))
      )
    )

    render(
      <Provider>
        <PortalSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/portalSetting' }
      })

    expect(services.useGetMspLabelQuery).toHaveBeenCalled()
    await waitFor(() =>
      expect(utils.loadImageWithJWT).toHaveBeenCalledTimes(8))

    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 3, name: 'Branding' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Logo:' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Logo Preview:' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()

    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(mockedUsedNavigate).not.toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/dashboard`,
      hash: '',
      search: ''
    }, { replace: true })
  })
})

