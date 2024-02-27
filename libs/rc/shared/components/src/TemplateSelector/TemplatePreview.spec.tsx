import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { msgTemplateApi }  from '@acx-ui/rc/services'
import { MsgTemplateUrls } from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'
import { store }           from '@acx-ui/store'
import {
  baseMsgTemplateApi
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
}    from '@acx-ui/test-utils'

import { emailTemplate, mockedTemplateGroups, smsTemplate } from './__tests__/fixtures'
import { TemplatePreview }                                  from './TemplatePreview'


describe('TemplateSelector', () => {

  beforeEach(() => {
    store.dispatch(baseMsgTemplateApi.util.resetApiState())

    store.dispatch(msgTemplateApi.util.resetApiState())
  })

  it('should render an e-mail template preview', async () => {
    mockServer.use(
      rest.get(
        MsgTemplateUrls.getTemplate.url,
        (req, res, ctx) => res(ctx.json({ ...emailTemplate }))

      )
    )


    render(<Provider>
      <TemplatePreview
        emailTemplateScopeId={emailTemplate.id}
        smsTemplateScopeId={smsTemplate.id}
        templateGroup={mockedTemplateGroups.content[0]} />
    </Provider>, {
      route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
    })


    await waitFor(() => {
      expect(screen.getByText(emailTemplate.extraFieldOneTemplate)).toBeVisible()
    })
    await waitFor(() => {
      expect(screen.getByText('E-Mail Template ${with.variable}.')).toBeVisible()
    })

  })

  it('should render an sms template preview', async () => {
    mockServer.use(
      rest.get(
        MsgTemplateUrls.getTemplate.url,
        (req, res, ctx) => res(ctx.json({ ...smsTemplate }))

      )
    )

    render(<Provider>
      <TemplatePreview
        emailTemplateScopeId={emailTemplate.id}
        smsTemplateScopeId={smsTemplate.id}
        templateGroup={mockedTemplateGroups.content[0]} />
    </Provider>, {
      route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
    })

    await userEvent.click(screen.getByRole('radio', { name: 'SMS' }))

    await waitFor(() => {
      expect(screen.queryByText(smsTemplate.extraFieldOneTemplate)).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText(smsTemplate.messageTemplate)).toBeVisible()
    })

  })

  it('should handle undefined template group', async () => {

    render(<Provider>
      <TemplatePreview
        emailTemplateScopeId={emailTemplate.id}
        smsTemplateScopeId={smsTemplate.id}
        templateGroup={undefined} />
    </Provider>, {
      route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
    })

    expect(screen.getByText('Template Not Found')).toBeVisible()
  })
})
