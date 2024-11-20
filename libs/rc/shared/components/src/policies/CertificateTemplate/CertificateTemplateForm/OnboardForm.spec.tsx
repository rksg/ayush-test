import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CertificateUrls, PersonaUrls, RulesManagementUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, renderHook, screen }                from '@acx-ui/test-utils'

import { mockPersonaGroupTableResult }            from '../../../users/__tests__/fixtures'
import { certificateTemplateList, policySetList } from '../__test__/fixtures'

import OnboardForm from './OnboardForm'

describe('OnboardForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCertificateTemplates.url,
        (req, res, ctx) => res(ctx.json(certificateTemplateList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json(mockPersonaGroupTableResult))
        }
      )
    )
  })
  it('should render the form correctly', async () => {
    render(
      <Provider>
        <Form>
          <OnboardForm />
        </Form>
      </Provider>)

    expect(screen.getByLabelText('Certificate Template Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Common Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Identity Group')).toBeInTheDocument()
    expect(screen.getByLabelText('Adaptive Policy Set')).toBeInTheDocument()

    const dropdownElements = screen.getAllByRole('combobox')
    await userEvent.click(dropdownElements[0])
    await userEvent.click(await screen.findByText('Class A'))

    await userEvent.click(dropdownElements[1])
    await userEvent.click(await screen.findByText('ps12'))
    const selectionControlElement = screen.getByText('Default Access')
    expect(selectionControlElement).toBeInTheDocument()

    const addButtons = screen.getAllByRole('button', { name: 'Add' })
    expect(addButtons).toHaveLength(2)

  })

  it('should render the form with the given data', async () => {
    const data = {
      name: 'templateName',
      onboard: {
        commonNamePattern: '${username}@abc.com'
      },
      identityGroupId: 'persona-group-id-1',
      policySetId: 'a76cac94-3180-4f5f-9c3b-50319cb24ef8'
    }
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(data)
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <OnboardForm />
        </Form>
      </Provider>
    )

    expect(await screen.findByLabelText('Certificate Template Name')).toHaveValue('templateName')
    expect(screen.getByLabelText('Common Name')).toHaveValue('${username}@abc.com')
    expect(screen.getByText('persona-group-id-1')).toBeInTheDocument()
    expect(screen.getByText('ps2')).toBeInTheDocument()
  })

  it('should validate duplicate certificate template name', async () => {
    render(
      <Provider>
        <Form>
          <OnboardForm />
        </Form>
      </Provider>)

    const certificateAuthorityName = screen.getByLabelText('Certificate Template Name')
    await userEvent.type(certificateAuthorityName, 'certificateTemplate1')
    await userEvent.tab()
    expect(await screen.findByText('Certificate Template with that name already exists'))
      .toBeVisible()
  })
})
