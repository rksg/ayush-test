import { Form } from 'antd'
import { rest } from 'msw'

import { MsgTemplateUrls } from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  waitFor
}    from '@acx-ui/test-utils'

import { mockedRegistration,
  mockedTemplates,
  mockedTemplateScope } from './__tests__/fixtures'

import { TemplateSelector } from '.'

describe('TemplateSelector', () => {

  it('should render spinner not form item if error', async () => {
    mockServer.use(
      rest.get(
        MsgTemplateUrls.getTemplateScopeById.url,
        (req, res, ctx) => res(ctx.status(500))
      ),
      rest.get(
        // Remove the query parameter to make MSW happy
        MsgTemplateUrls.getAllTemplatesByTemplateScopeId.url.split('?')[0],
        (req, res, ctx) => res(ctx.status(500))
      ),
      rest.get(
        MsgTemplateUrls.getRegistrationById.url,
        (req, res, ctx) => res(ctx.status(500))
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
          <TemplateSelector scopeId={scopeId}
            registrationId={registrationId}
            formItemProps={{ name: formItemName }}/>
        </Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
      }
    )

    await waitFor(() => {
      expect(formRef.current.getFieldValue(formItemName)).toEqual(undefined)
    })
  })

  it('should render the selector with template scope default template', async () => {
    mockServer.use(
      rest.get(
        MsgTemplateUrls.getTemplateScopeById.url,
        (req, res, ctx) => res(ctx.json({ ...mockedTemplateScope }))
      ),
      rest.get(
        // Remove the query parameter to make MSW happy
        MsgTemplateUrls.getAllTemplatesByTemplateScopeId.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedTemplates }))
      ),
      rest.get(
        MsgTemplateUrls.getRegistrationById.url,
        (req, res, ctx) => res(ctx.status(404))
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
      expect(formRef.current.getFieldValue(formItemName).value)
        .toEqual(mockedTemplateScope.defaultTemplateId)
    })
  })

})
