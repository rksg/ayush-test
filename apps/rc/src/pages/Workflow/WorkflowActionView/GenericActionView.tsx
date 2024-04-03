import React, { useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps } from '@acx-ui/components'
import { DpskForm }                              from '@acx-ui/rc/components'
import { ActionType, AupActionContext }          from '@acx-ui/rc/utils'

import AupActionSettingsForm    from '../WorkflowActionForm/AupActionSettingsForm'
import { DataPromptActionForm } from '../WorkflowActionForm/DataPromptActionForm'
import AupActionPreview         from '../WorkflowActionPreview/AupActionPreview'
import DataPromptActionPreview  from '../WorkflowActionPreview/DataPromptActionPreview'


const actionFormMapping = {
  [ActionType.AUP]: AupActionSettingsForm,
  [ActionType.DATA_PROMPT]: DataPromptActionForm,
  [ActionType.DPSK]: DpskForm
}

const actionPreviewMapping = {
  [ActionType.AUP]: AupActionPreview,
  [ActionType.DATA_PROMPT]: DataPromptActionPreview
}

export default function GenericActionView (props: { actionType: ActionType }) {
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
