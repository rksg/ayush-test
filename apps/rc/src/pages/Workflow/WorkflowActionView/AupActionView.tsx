import React, { useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps } from '@acx-ui/components'
import { AupActionContext }                      from '@acx-ui/rc/utils'

import AupActionSettingsForm from '../WorkflowActionForm/AupActionSettingsForm'
import AupActionPreview      from '../WorkflowActionPreview/AupActionPreview'


export default function AupActionView () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [context, setContext] = useState<AupActionContext>({} as AupActionContext)

  const tabs: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Content' }),
      value: '1',
      children:
        <AupActionSettingsForm/>
    },
    {
      label: $t({ defaultMessage: 'Look & Feel' }),
      value: '2',
      children:
        <AupActionPreview {...context} />
    }
  ]

  const onChange = () => {
    setContext(form.getFieldsValue())
  }

  return (
    <ContentSwitcher
      tabDetails={tabs}
      onChange={onChange}
    />
  )
}
