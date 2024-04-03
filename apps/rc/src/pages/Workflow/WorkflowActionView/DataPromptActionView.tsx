import React, { useState } from 'react'

import { Form, FormInstance } from 'antd'
import { useIntl }            from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps } from '@acx-ui/components'
import { DataPromptActionContext }               from '@acx-ui/rc/utils'

import { DataPromptActionForm } from '../WorkflowActionForm/DataPromptActionForm'
import DataPromptActionPreview  from '../WorkflowActionPreview/DataPromptActionPreview'



const mockDataPromptContext: DataPromptActionContext = {
  backButtonText: '', continueButtonText: '',
  title: 'We need your information !',
  messageHtml: '<div>HTML template</div>',
  variables: [
    {
      label: 'User Name'
    },
    {
      label: 'Email'
    }
  ]
}

export default function DataPromptActionView () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [context, setContext] = useState<DataPromptActionContext>({} as DataPromptActionContext)

  const tabs: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Content' }),
      value: '1',
      children:
        <DataPromptActionForm />
    },
    {
      label: $t({ defaultMessage: 'Look & Feel' }),
      value: '2',
      children:
        <DataPromptActionPreview {...context} />
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
