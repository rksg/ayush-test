import { useIntl } from 'react-intl'

import { TemplateGroup } from '@acx-ui/rc/utils'
import { ContentSwitcher, ContentSwitcherProps, Loader } from '@acx-ui/components'
import { useGetTemplateByIdQuery } from '@acx-ui/rc/services'

export interface TemplatePreviewProps {
  emailTemplateScopeId: string | undefined,
  smsTemplateScopeId: string | undefined,
  templateGroup: TemplateGroup | undefined
}

export function TemplatePreview (props: TemplatePreviewProps) {
  const { $t } = useIntl()

  const {
    emailTemplateScopeId,
    smsTemplateScopeId,
    templateGroup
  } = props

  const emailTemplateRequest = useGetTemplateByIdQuery({params: {templateScopeId: emailTemplateScopeId, templateId: templateGroup?.emailTemplateId}}, {skip:!templateGroup})
  const smsTemplateRequest = useGetTemplateByIdQuery({params: {templateScopeId: smsTemplateScopeId, templateId: templateGroup?.smsTemplateId}}, {skip:!templateGroup})

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Email' }),
      value: 'email',
      children: <>
          <Loader style={{ height: 'auto', minHeight: 45 }} states={[emailTemplateRequest]}>
        
            <p style={{ borderBottom: '2px solid black', paddingBottom: '1em' }}>
              <strong>
                {emailTemplateRequest.data?.extraFieldOneTemplate}
              </strong>
            </p>
            {/* NOTE: Generally this HTML is trusted because it is input by ACX developers or input
                    by the customer using the UI, however we could consider sanitizing it with
                    DOMPurify or something similar to be extra careful. */}
            <div dangerouslySetInnerHTML={{ __html:
              emailTemplateRequest.data?.messageTemplate ?? $t({defaultMessage: 'Template Not Found'}) }} />
          </Loader>  
        </>
    },
    {
      label: $t({ defaultMessage: 'SMS' }),
      value: 'sms',
      children: <>
        <Loader style={{ height: 'auto', minHeight: 45 }} states={[smsTemplateRequest]}>
          <p>{smsTemplateRequest.data?.messageTemplate ?? $t({defaultMessage: 'Template Not Found'})}</p>
        </Loader>
      </>
    }]

  return (
    <>
      <ContentSwitcher
            defaultValue='email'
            tabDetails={tabDetails}
            size='small'
            align='left'
          />
    </>
  )

}
