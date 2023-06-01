import { useEffect, useMemo } from 'react'

import { Form, FormItemProps } from 'antd'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'

import { Loader }                              from '@acx-ui/components'
import { useGetTemplateSelectionContentQuery } from '@acx-ui/rc/services'

import { templateNames, templateScopeLabels } from './msgTemplateLocalizedMessages'
import { TemplateSelect }                     from './TemplateSelect'


export interface TemplateSelectorProps {
  formItemProps?: FormItemProps,
  placeholder?: string,
  scopeId: string,
  registrationId: string
}

export function TemplateSelector (props: TemplateSelectorProps) {
  const { $t } = useIntl()

  const {
    scopeId,
    registrationId,
    placeholder = $t({ defaultMessage: 'Select Template...' })
  } = props

  const templateDataRequest = useGetTemplateSelectionContentQuery(
    { params: { templateScopeId: scopeId, registrationId: registrationId } })

  const form = Form.useFormInstance()

  const formItemProps = {
    name: props.scopeId + 'templateId',
    ...props.formItemProps
  }

  // Generate form data from data request
  const { templateOptions, scopeLabel, initialOption } = useMemo(() => {
    if (!templateDataRequest.isSuccess) {
      return { templateOptions: [],
        scopeLabel: $t({ defaultMessage: 'Loading Templates...' }),
        initialOption: undefined }
    }

    const templateOptions = templateDataRequest.data?.templates.map((t) =>
      ({ value: t.id,
        label: (t.userProvidedName?
          t.userProvidedName : $t(_.get(templateNames, t.nameLocalizationKey))) }))

    const scopeLabel = templateDataRequest.data?.templateScopeNameKey ?
      $t(_.get(templateScopeLabels, templateDataRequest.data.templateScopeNameKey))
      : $t({ defaultMessage: 'Loading Templates...' })

    const initialOption = templateDataRequest.data?.defaultTemplateId ?
      templateOptions.find(t => t.value === templateDataRequest.data?.defaultTemplateId)
      : undefined

    return {
      templateOptions,
      scopeLabel,
      initialOption
    }
  }, [templateDataRequest.data])

  // Set initial selected value
  useEffect(() => {
    let currentFormValue = form.getFieldValue(formItemProps.name)

    if(!currentFormValue && initialOption) {
      form.setFieldValue(formItemProps.name, initialOption.value)
    }
  }, [initialOption, templateOptions])

  // RENDER //////////////////////////////////////////////////////
  return (
    <Loader style={{ height: 'auto', minHeight: 45 }} states={[templateDataRequest]}>
      <Form.Item {...formItemProps}
        label={scopeLabel}>
        <TemplateSelect
          placeholder={placeholder}
          options={templateOptions}
          templateType={templateDataRequest.data?.templateScopeType}
          templates={templateDataRequest.data?.templates}
        />
      </Form.Item>
    </Loader>
  )
}
