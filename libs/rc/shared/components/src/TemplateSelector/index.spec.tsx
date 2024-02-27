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
  mockedCategory,
  mockedTemplateGroups,
  mockedCategoryNoDefault } from './__tests__/fixtures'

import { TemplateSelector } from '.'


// NOTE: this tests both TemplateSelector and TemplateSelect,
// which is why TemplateSelect isn't tested separately.
describe('TemplateSelector', () => {

  beforeEach(() => {
    store.dispatch(baseMsgTemplateApi.util.resetApiState())
    store.dispatch(msgTemplateApi.util.resetApiState())
  })

  it('should render the selector with msgCategory default template group', async () => {
    mockServer.use(
      rest.get(
        MsgTemplateUrls.getCategoryById.url,
        (req, res, ctx) => res(ctx.json({ ...mockedCategory }))

      ),
      rest.post(
        MsgTemplateUrls.getAllTemplateGroupsByCategoryId.url,
        (req, res, ctx) => res(ctx.json({ ...mockedTemplateGroups }))
      ),
      rest.get(
        MsgTemplateUrls.getRegistrationById.url,
        (req, res, ctx) => res(ctx.status(404))
      )
    )

    const formItemName = 'templateSelectorTest'
    const categoryId = mockedCategory.id
    const registrationId = mockedRegistration.id

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <TemplateSelector
            categoryId={categoryId}
            emailRegistrationId={registrationId}
            smsRegistrationId=''
            formItemProps={{ name: formItemName }}/>
        </Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
      }
    )

    await waitFor(() => {
      expect(formRef.current.getFieldValue(formItemName))
        .toEqual(mockedCategory.emailTemplateScopeId+','+
          mockedTemplateGroups.content[0].emailTemplateId+','+mockedCategory.smsTemplateScopeId+
          ','+mockedTemplateGroups.content[0].smsTemplateId)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Preview/i })).toBeEnabled()
    })

    // Opens modal with correct content
    await userEvent.click(screen.getByRole('button', { name: /Preview/i }))
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText(mockedTemplateGroups.content[0].name)).toBeVisible()

  })

  it('should render the selector with registration template group', async () => {
    mockServer.use(
      rest.get(
        MsgTemplateUrls.getCategoryById.url,
        (req, res, ctx) => res(ctx.json({ ...mockedCategory }))

      ),
      rest.post(
        MsgTemplateUrls.getAllTemplateGroupsByCategoryId.url,
        (req, res, ctx) => res(ctx.json({ ...mockedTemplateGroups }))
      ),
      rest.get(
        MsgTemplateUrls.getRegistrationById.url,
        (req, res, ctx) => res(ctx.json({ ...mockedRegistration }))
      )
    )

    const formItemName = 'templateSelectorTest'
    const categoryId = mockedCategory.id
    const registrationId = mockedRegistration.id

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <TemplateSelector
            categoryId={categoryId}
            emailRegistrationId={registrationId}
            smsRegistrationId=''
            formItemProps={{ name: formItemName }}/>
        </Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
      }
    )

    await waitFor(() => {
      expect(formRef.current.getFieldValue(formItemName))
        .toEqual(mockedCategory.emailTemplateScopeId+','+
          mockedTemplateGroups.content[1].emailTemplateId+','+mockedCategory.smsTemplateScopeId+
          ','+mockedTemplateGroups.content[1].smsTemplateId)
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Preview/i })).toBeEnabled()
    })

    // Opens modal with correct content
    await userEvent.click(screen.getByRole('button', { name: /Preview/i }))
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText(mockedTemplateGroups.content[1].name)).toBeVisible()
  })

  it('should render the selector with no selected template group', async () => {
    mockServer.use(
      rest.get(
        MsgTemplateUrls.getCategoryById.url,
        (req, res, ctx) => res(ctx.json({ ...mockedCategoryNoDefault }))

      ),
      rest.post(
        MsgTemplateUrls.getAllTemplateGroupsByCategoryId.url,
        (req, res, ctx) => res(ctx.json({ ...mockedTemplateGroups }))
      ),
      rest.get(
        MsgTemplateUrls.getRegistrationById.url,
        (req, res, ctx) => res(ctx.status(404))
      )
    )

    const formItemName = 'templateSelectorTest'
    const categoryId = mockedCategoryNoDefault.id
    const registrationId = mockedRegistration.id

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <TemplateSelector
            categoryId={categoryId}
            emailRegistrationId={registrationId}
            smsRegistrationId=''
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
