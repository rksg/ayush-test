import React from 'react'

import { FormInstance } from 'antd'
import { useIntl }      from 'react-intl'

import { PageHeader, StepsForm } from '@acx-ui/components'

export interface ComponentModeFormProps {
  pageTitle: string
  breadcrumb: {
    text: string
    link?: string | undefined
  }[]
  form: FormInstance | undefined
  editMode: boolean
  content: JSX.Element
  handleContentClose: () => void
  handleContentFinish: () => Promise<void>
}

export const ComponentModeForm = (props: ComponentModeFormProps) => {
  const {
    content,
    pageTitle,
    breadcrumb,
    form,
    editMode,
    handleContentClose,
    handleContentFinish
  } = props
  const { $t } = useIntl()


  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />
      <StepsForm
        form={form}
        editMode={editMode}
        onCancel={handleContentClose}
        onFinish={handleContentFinish}
      >
        <StepsForm.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          {content}
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
