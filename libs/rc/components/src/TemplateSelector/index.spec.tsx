import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { MsgTemplateUrls } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  screen,
  render,
  renderHook,
  waitFor
}    from '@acx-ui/test-utils'

import { mockedRegistration, mockedTemplates, mockedTemplateScope, mockedTemplateScopeNoDefault } from './__tests__/fixtures'

import { TemplateSelector } from '.'

describe('TemplateSelector', () => {

  it('should render the selector with no template if error', async () => {
    mockServer.resetHandlers()
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
            <TemplateSelector scopeId={scopeId} registrationId={registrationId} formItemProps={{name: formItemName}}/>
        </Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
      }
    )

    const targetAp = mockedTemplateScope.id

    await waitFor(() => {
      expect(formRef.current.getFieldValue(formItemName)).toEqual(undefined)
    })
  })

  it('should render the selector with registration template', async () => {
    mockServer.resetHandlers()
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
        (req, res, ctx) => res(ctx.json({ ...mockedRegistration }))
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
            <TemplateSelector scopeId={scopeId} registrationId={registrationId} formItemProps={{name: formItemName}}/>
        </Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
      }
    )

    const targetAp = mockedTemplateScope.id

    await waitFor(() => {
      expect(formRef.current.getFieldValue(formItemName)).toEqual(mockedRegistration.templateId)
    })
  })

  it('should render the selector with template scope default template', async () => {
    mockServer.resetHandlers()
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
            <TemplateSelector scopeId={scopeId} registrationId={registrationId} formItemProps={{name: formItemName}}/>
        </Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
      }
    )

    await waitFor(() => {
      expect(formRef.current.getFieldValue(formItemName)).toEqual(mockedTemplateScope.defaultTemplateId)
    })
  })
  
  it('should change value when new item is selected', async () => {
    
    mockServer.use(
      rest.get(
        MsgTemplateUrls.getTemplateScopeById.url,
        (req, res, ctx) => res(ctx.json({...mockedTemplateScopeNoDefault}))
      ),
      rest.get(
        // Remove the query parameter to make MSW happy
        MsgTemplateUrls.getAllTemplatesByTemplateScopeId.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({...mockedTemplates}))
      ),
      rest.get(
        MsgTemplateUrls.getRegistrationById.url,
        (req, res, ctx) => res(ctx.json({...mockedRegistration}))
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
            <TemplateSelector scopeId={scopeId} registrationId={registrationId} formItemProps={{name: formItemName}}/>
        </Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
      }
    )

    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.click(await screen.findByText("User Created Template 1"))

    await waitFor(() => {
      expect(formRef.current.getFieldValue(formItemName)).toEqual("746ac7b2-1ec5-412c-9354-e5ac274b7bd9")
    })
  })
})
