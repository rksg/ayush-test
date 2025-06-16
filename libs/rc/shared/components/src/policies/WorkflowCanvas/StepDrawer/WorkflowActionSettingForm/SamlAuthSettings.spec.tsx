import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import {
  SamlIdpProfileUrls, CertificateUrls, SamlAuthContext
} from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import { mockSamlProfileList, mockSamlProfile, mockServerCert
} from './__tests__/fixtures'
import { SamlAuthSettings } from './SamlAuthSettings'

const getServerCert = jest.fn()
const getSamlProfile = jest.fn()
const getSamlProfileList = jest.fn()

describe('SamlAuthSettings', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        SamlIdpProfileUrls.getSamlIdpProfileViewDataList.url,
        (req, res, ctx) => {
          getSamlProfileList()
          return res(ctx.json(mockSamlProfileList))
        }
      ),
      rest.get(SamlIdpProfileUrls.getSamlIdpProfile.url,
        (req, res, ctx) => {
          getSamlProfile()
          return res(ctx.json(mockSamlProfile))
        }),
      rest.get(CertificateUrls.downloadServerCertificate.url,
        (req, res, ctx) => {
          getServerCert()
          return res(ctx.json(mockServerCert))
        })
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the form with default values', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <SamlAuthSettings/>
        </Form>
      </Provider>
      , { route: { params: { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' } } }
    )

    // eslint-disable-next-line max-len
    const profileSelect = await screen.findByRole('combobox', { name: /Choose SAML IdP Profile/ })
    expect(profileSelect).toHaveValue('')

    expect(screen.getByTestId('saml-idp-profile-add-button')).toBeVisible()
  })


  it('should render the component after saml profile is selected', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm<SamlAuthContext>()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <SamlAuthSettings/>
        </Form>
      </Provider>
      , { route: { params: { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' } } }
    )

    await waitFor(() => expect(getSamlProfileList).toBeCalled())
    // eslint-disable-next-line max-len
    const profileSelect = await screen.findByRole('combobox', { name: /Choose SAML IdP Profile/ })
    await userEvent.click(profileSelect)

    const profileName = mockSamlProfileList.data[0].name
    expect(await screen.findAllByTitle(profileName)).toHaveLength(1)

    await userEvent.click(screen.getByTitle(profileName))

    await waitFor(() => expect(getSamlProfileList).toBeCalled())
    await waitFor(() => expect(getSamlProfile).toBeCalled())
    await waitFor(() => expect(getServerCert).toBeCalled())

    expect(await screen.findByText('Yes')).toBeVisible()
    expect(await screen.findByText('No')).toBeVisible()
    expect(await screen.findByText(mockServerCert.name)).toBeVisible()
  })

  it('should render the form with provided values in edit mode', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm<SamlAuthContext>()
      form.setFieldsValue({
        samlIdpProfileId: mockSamlProfileList.data[0].id
      })
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <SamlAuthSettings/>
        </Form>
      </Provider>
      , { route: { params: { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' } } }
    )

    await waitFor(() => expect(getSamlProfileList).toBeCalled())
    await waitFor(() => expect(getSamlProfile).toBeCalled())
    await waitFor(() => expect(getServerCert).toBeCalled())

    expect(await screen.findByText(mockSamlProfileList.data[0].name)).toBeVisible()
    expect(await screen.findByText('Yes')).toBeVisible()
    expect(await screen.findByText('No')).toBeVisible()
    expect(await screen.findByText(mockServerCert.name)).toBeVisible()
  })
})
