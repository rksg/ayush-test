
import { Form } from 'antd'
import { rest } from 'msw'

import { CertificateUrls, CommonUrlsInfo, PersonaUrls } from '@acx-ui/rc/utils'
import { Provider }                                     from '@acx-ui/store'
import { mockServer, render, renderHook, screen }       from '@acx-ui/test-utils'

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


describe('CertTemplateSettings', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(replacePagination(CertificateUrls.getCertificateTemplates.url),
        (req, res, ctx) => {
          getPersonaGroupById()
          return res(ctx.json(mockCertificateTemplates))
        }
      ),
      rest.get(PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => {
          getPersonaList()
          return res(ctx.json(mockPersonaGroupById))
        }
      ),
      rest.post(replacePagination(PersonaUrls.searchPersonaList.url),
        (req, res, ctx) => {
          res(ctx.json(mockPersonaTableResult))
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

    // eslint-disable-next-line max-len
    const certTemplateSelect = await screen.findByRole('combobox', { name: /Choose Certificate Template/ })
    expect(certTemplateSelect).toHaveValue('')
    const userText =
      screen.getByText
      ('Choose a certificate template to see the linked identity group and Wi-Fi networks')
    expect(userText).toBeInTheDocument()
  })
})