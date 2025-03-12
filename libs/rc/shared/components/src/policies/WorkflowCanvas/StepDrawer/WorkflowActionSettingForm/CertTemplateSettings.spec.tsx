
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CertificateUrls, CommonUrlsInfo, PersonaUrls }    from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import {
  mockedNetworkList,
  mockPersonaGroupById,
  mockPersonaTableResult,
  mockCertificateTemplates,
  replacePagination
} from './__tests__/fixtures'
import { CertTemplateSettings } from './CertTemplateSettings'

const getPersonaList = jest.fn()
const getNetworkList = jest.fn()
const getPersonaGroupById = jest.fn()
const getCertTemplateList = jest.fn()


describe('CertTemplateSettings', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(replacePagination(CertificateUrls.getCertificateTemplates.url),
        (req, res, ctx) => {
          getCertTemplateList()
          return res(ctx.json(mockCertificateTemplates))
        }
      ),
      rest.get(PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => {
          getPersonaGroupById()
          return res(ctx.json(mockPersonaGroupById))
        }
      ),
      rest.post(replacePagination(PersonaUrls.searchPersonaList.url),
        (req, res, ctx) => {
          getPersonaList()
          return res(ctx.json(mockPersonaTableResult))
        }
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => {
          getNetworkList()
          return res(ctx.json(mockedNetworkList))
        })
    )
  })

  afterEach(() => jest.clearAllMocks())

  it('should render the form with default values', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <CertTemplateSettings />
        </Form>
      </Provider>
    )
    const certTemplateSelect =
      await screen.findByRole('combobox', { name: /Choose Certificate Template/ })
    expect(certTemplateSelect).toHaveValue('')
    const userText =
      screen.getByText
      ('Choose a certificate template to see the linked identity group and Wi-Fi networks')
    expect(userText).toBeInTheDocument()
  })

  it('should respond to cert template selection', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <CertTemplateSettings />
        </Form>
      </Provider>
    )
    await waitFor(() => expect(getCertTemplateList).toBeCalled())
    const certTemplateSelect =
      await screen.findByRole('combobox', { name: /Choose Certificate Template/ })
    expect(certTemplateSelect).toHaveValue('')


    await userEvent.click(certTemplateSelect)
    expect(await screen.findAllByTitle(mockCertificateTemplates.data[0].name)).toHaveLength(1)

    await userEvent.click(screen.getByTitle(mockCertificateTemplates.data[0].name))
    await waitFor(() => expect(getNetworkList).toBeCalled())
    await waitFor(() => expect(getPersonaGroupById).toBeCalled())
    expect(await screen.findByText(mockPersonaGroupById.name)).toBeVisible()
    expect(await screen.findByText(mockedNetworkList.data[0].ssid)).toBeInTheDocument()
  })

  it('should render values on edit mode', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        identityGroupId: '65d2f63d-b773-45f6-b81d-a2cb832e3841',
        certTemplateId: 'cert-template-id-for-testing',
        identityId: 'persona-id-1'
      })
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <CertTemplateSettings />
        </Form>
      </Provider>
    )
    await waitFor(() => expect(getCertTemplateList).toBeCalled())
    expect(await screen.findByText('cert-template-id-for-testing')).toBeInTheDocument()
    await waitFor(() => expect(getPersonaGroupById).toBeCalled())
    await waitFor(() => expect(getNetworkList).toBeCalled())
    expect(await screen.findByText(mockPersonaGroupById.name)).toBeInTheDocument()
    await waitFor(() => expect(getPersonaList).toBeCalled())
    expect(await screen.findByText(mockPersonaTableResult.content[0].name)).toBeInTheDocument()
  })
})