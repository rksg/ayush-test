import { useIntl } from 'react-intl'

import { Template, MessageType } from '@acx-ui/rc/utils'

export interface TemplatePreviewProps {
  templateType: MessageType | undefined,
  template: Template | undefined
}

export function TemplatePreview (props: TemplatePreviewProps) {
  const { $t } = useIntl()

  const {
    templateType,
    template
  } = props

  if(templateType === MessageType.EMAIL && template) {
    return (
      <>
        <p style={{ borderBottom: '2px solid black', paddingBottom: '1em' }}>
          <strong>
            {template.extraFieldOneTemplate}
          </strong>
        </p>
        {/* NOTE: Generally this HTML is trusted because it is input by ACX developers or input
                by the customer using the UI, however we could consider sanitizing it with
                DOMPurify or something similar to be extra careful. */}
        <div dangerouslySetInnerHTML={{ __html:
          template.messageTemplate ? template.messageTemplate : '' }} />
      </>
    )
  } else if(templateType === MessageType.SMS && template) {
    return (<p>{template.messageTemplate}</p>)
  } else {
    return (<p>{$t({ defaultMessage: 'Template preview unavailable... ' })}</p>)
  }

}
