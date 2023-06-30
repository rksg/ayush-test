import { MessageType } from '@acx-ui/rc/utils'
import { Provider }    from '@acx-ui/store'
import {
  render,
  screen
}    from '@acx-ui/test-utils'

import { emailTemplate, smsTemplate } from './__tests__/fixtures'
import { TemplatePreview }            from './TemplatePreview'

describe('TemplateSelector', () => {

  it('should render an e-mail template preview', async () => {

    render(<Provider>
      <TemplatePreview template={emailTemplate} templateType={MessageType.EMAIL} />
    </Provider>, {
      route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
    })

    expect(screen.getByText(emailTemplate.extraFieldOneTemplate)).toBeVisible()
    expect(screen.getByText('E-Mail Template ${with.variable}.')).toBeVisible()

  })

  it('should render an sms template preview', async () => {

    render(<Provider>
      <TemplatePreview template={smsTemplate} templateType={MessageType.SMS} />
    </Provider>, {
      route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
    })

    expect(screen.queryByText(smsTemplate.extraFieldOneTemplate)).not.toBeInTheDocument()
    expect(screen.getByText(smsTemplate.messageTemplate)).toBeVisible()

  })

  it('should handle unknown template type', async () => {

    render(<Provider>
      <TemplatePreview template={emailTemplate} templateType={MessageType.WEBPUSH} />
    </Provider>, {
      route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
    })

    expect(screen.getByText('Template preview unavailable...')).toBeVisible()
  })

  it('should handle undefined template', async () => {

    render(<Provider>
      <TemplatePreview template={undefined} templateType={MessageType.EMAIL} />
    </Provider>, {
      route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
    })

    expect(screen.getByText('Template preview unavailable...')).toBeVisible()

  })
})
