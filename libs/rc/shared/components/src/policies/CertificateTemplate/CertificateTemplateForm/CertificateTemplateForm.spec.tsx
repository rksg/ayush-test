import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CertificateUrls, PersonaUrls, RulesManagementUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                   from '@acx-ui/test-utils'

import { mockPersonaGroupTableResult }                                                           from '../../../users/__tests__/fixtures'
import { certificateAuthorityList, certificateTemplate, certificateTemplateList, policySetList } from '../__test__/fixtures'

import { CertificateTemplateForm } from './CertificateTemplateForm'


const mockedUsedNavigate = jest.fn()
const mockedUsedEdit = jest.fn()
const mockedBind = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useEditCertificateTemplateMutation: () => [mockedUsedEdit],
  useBindCertificateTemplateWithPolicySetMutation: () => [mockedBind]
}))

describe('CertificateTemplateForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      ),
      rest.post(
        CertificateUrls.getCertificateTemplates.url,
        (req, res, ctx) => res(ctx.json(certificateTemplateList))
      ),
      rest.get(
        CertificateUrls.getCertificateTemplate.url,
        (req, res, ctx) => res(ctx.json(certificateTemplate))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.post(
        CertificateUrls.addCertificateTemplate.url,
        (req, res, ctx) => res(ctx.json({ id: '12345' }))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json(mockPersonaGroupTableResult))
        }
      ))
    jest.clearAllMocks()
  })

  it('should submit the add form correctly', async () => {
    render(<Provider><CertificateTemplateForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateTemplate/create'
      }
    })

    expect(screen.getByText('Summary')).toBeVisible()
    await userEvent.type(screen.getByLabelText('Certificate Template Name'), 'testTemplateName')
    await userEvent.type(screen.getByLabelText('Common Name'), 'testCommonName')
    const selects = await screen.findAllByRole('combobox')
    await userEvent.click(selects[0])
    await userEvent.click(await screen.findByText('Class A'))
    await userEvent.click(selects[1])
    await userEvent.click(await screen.findByText('ps12'))
    await userEvent.click(screen.getByText('Next'))

    const select = await screen.findByRole('combobox')
    await userEvent.click(select)
    await userEvent.click(await screen.findByText('onboard1'))
    const enableChromebookInput = screen.getByLabelText('Enable Chromebook Enrollment')
    await userEvent.click(enableChromebookInput)
    const apiKeyInput = await screen.findByLabelText('Google API Key')
    const credential = await screen.findByTestId('credential')
    await userEvent.type(apiKeyInput, 'testApiKey')
    // eslint-disable-next-line max-len
    const file = new File(['{"type":"service_account","project_id":"test","private_key_id":"123","private_key":"123","client_email":"123@crucial.com","client_id":"123","auth_uri":"123","token_uri":"123"}'], 'public.json', { type: 'application/json' })
    await userEvent.upload(credential, file)
    await userEvent.click(screen.getByText('Next'))

    expect(await screen.findByText('Onboard')).toBeVisible()
    expect(await screen.findByText('onboard1')).toBeVisible()
    expect(await screen.findByText('testTemplateName')).toBeVisible()
    expect(await screen.findByText('testCommonName')).toBeVisible()
    expect(await screen.findByText('ps12')).toBeVisible()
    expect(await screen.findByText('Accept')).toBeVisible()
    expect(await screen.findByText('Enabled')).toBeVisible()
    expect(await screen.findByText('Device')).toBeVisible()
    expect(await screen.findByText('Do not remove existing certificates.')).toBeVisible()
    expect(await screen.findByText('testApiKey')).toBeVisible()

    await userEvent.click(screen.getByText('Add'))
    await waitFor(() => expect(mockedBind).toBeCalledTimes(1))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledTimes(1))
  })

  it('should validate the validity period correctly', async () => {
    render(<Provider><CertificateTemplateForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateTemplate/create'
      }
    })

    await userEvent.type(screen.getByLabelText('Certificate Template Name'), 'testTemplateName')
    await userEvent.type(screen.getByLabelText('Common Name'), 'testCommonName')
    const selects = await screen.findAllByRole('combobox')
    await userEvent.click(selects[0])
    await userEvent.click(await screen.findByText('Class A'))
    await userEvent.click(selects[1])
    await userEvent.click(await screen.findByText('ps12'))
    await userEvent.click(screen.getByText('Next'))

    const showMoreButton = await screen.findByRole('button', { name: 'Show more settings' })
    await userEvent.click(showMoreButton)
    const expirationDateByDateRadio = await screen.queryAllByRole('radio', { name: 'By date' })[1]
    await userEvent.click(expirationDateByDateRadio)
    await userEvent.click(screen.getByText('Next'))
    expect(await screen.findByText('Please enter Expiration Date')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Both the Start Date and End Date must either be specified by selecting \'By Date\' or defined as a relative time interval.')).toBeVisible()
  })

  it('should render and submit the edit form correctly', async () => {
    render(<Provider><CertificateTemplateForm editMode={true} /></Provider>, {
      route: {
        params: { tenantId: 't-id', policyId: '84d3b18d00964fe0b4740eedb6623930' },
        path: '/:tenantId/policies/certificateTemplate/:policyId/edit'
      }
    })

    expect(await screen.findByText('Class A')).toBeVisible()
    expect(await screen.findByLabelText('Certificate Template Name'))
      .toHaveValue('certificateTemplate1')
    expect(await screen.findByLabelText('Common Name')).toHaveValue('test')
    await userEvent.click(screen.getByText('Apply'))
    await waitFor(() => expect(mockedUsedEdit).toBeCalledTimes(1))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledTimes(1))
  })
})
