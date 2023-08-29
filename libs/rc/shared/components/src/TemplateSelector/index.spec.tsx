import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { msgTemplateApi }  from '@acx-ui/rc/services'
import { MsgTemplateUrls } from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'
import {
  baseMsgTemplateApi
} from '@acx-ui/store'
import { store } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor
}    from '@acx-ui/test-utils'

import { mockedRegistration,
  mockedTemplates,
  mockedTemplateScope,
  mockedTemplateScopeNoDefault,
  mockedTemplateScopeWithRegistration } from './__tests__/fixtures'

import { TemplateSelector } from '.'


// NOTE: this tests both TemplateSelector and TemplateSelect,
// which is why TemplateSelect isn't tested separately.
describe('TemplateSelector', () => {

  beforeEach(() => {
    store.dispatch(baseMsgTemplateApi.util.resetApiState())
    store.dispatch(msgTemplateApi.util.resetApiState())
  })

  it('should render the selector with template scope default template', async () => {
    mockServer.use(
      rest.get(
        MsgTemplateUrls.getTemplateScopeByIdWithRegistration.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedTemplateScope }))
      ),
      rest.get(
        // Remove the query parameter to make MSW happy
        MsgTemplateUrls.getAllTemplatesByTemplateScopeId.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedTemplates }))
      )
    )

    const formItemName = 'templateSelectorTest'
    const scopeId = mockedTemplateScope.id
    const registrationId = mockedRegistration.id

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <TemplateSelector
            scopeId={scopeId}
            registrationId={registrationId}
            formItemProps={{ name: formItemName }}/>
        </Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
      }
    )

    await waitFor(() => {
      expect(formRef.current.getFieldValue(formItemName))
        .toEqual(mockedTemplateScope.defaultTemplateId)
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Preview/i })).toBeEnabled()
    })

    // Opens modal with correct content
    await userEvent.click(screen.getByRole('button', { name: /Preview/i }))
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText(mockedTemplates.content[0].extraFieldOneTemplate)).toBeVisible()

  })

  it('should render the selector with registration template', async () => {
    mockServer.use(
      rest.get(
        MsgTemplateUrls.getTemplateScopeByIdWithRegistration.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedTemplateScopeWithRegistration }))
      ),
      rest.get(
        // Remove the query parameter to make MSW happy
        MsgTemplateUrls.getAllTemplatesByTemplateScopeId.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedTemplates }))
      )
    )

    const formItemName = 'templateSelectorTest'
    const scopeId = mockedTemplateScope.id
    const registrationId = mockedRegistration.id

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <TemplateSelector
            scopeId={scopeId}
            registrationId={registrationId}
            formItemProps={{ name: formItemName }}/>
        </Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
      }
    )

    await waitFor(() => {
      expect(formRef.current.getFieldValue(formItemName))
        .toEqual(mockedRegistration.templateId)
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Preview/i })).toBeEnabled()
    })

    // Opens modal with correct content
    await userEvent.click(screen.getByRole('button', { name: /Preview/i }))
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText(mockedTemplates.content[1].extraFieldOneTemplate)).toBeVisible()
  })

  it('should render the selector with no selected template', async () => {
    mockServer.use(
      rest.get(
        MsgTemplateUrls.getTemplateScopeByIdWithRegistration.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedTemplateScopeNoDefault }))
      ),
      rest.get(
        // Remove the query parameter to make MSW happy
        MsgTemplateUrls.getAllTemplatesByTemplateScopeId.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedTemplates }))
      )
    )

    const formItemName = 'templateSelectorTest'
    const scopeId = mockedTemplateScope.id
    const registrationId = mockedRegistration.id

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <TemplateSelector
            scopeId={scopeId}
            registrationId={registrationId}
            formItemProps={{ name: formItemName }}/>
        </Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
      }
    )

    await waitFor(() => {
      expect(formRef.current.getFieldValue(formItemName)).toBeFalsy()
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Preview/i })).toBeDisabled()
    })

  })

})
