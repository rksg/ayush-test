import { useEffect, useMemo } from 'react'

import { Form, FormItemProps } from 'antd'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'

import { Loader }                            from '@acx-ui/components'
import { useGetAllTemplatesByTemplateScopeIdQuery,
  useGetTemplateScopeWithRegistrationQuery } from '@acx-ui/rc/services'

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

  const templateScopeData = useGetTemplateScopeWithRegistrationQuery(
    { params: { templateScopeId: scopeId, registrationId: registrationId } })


  const templateDataRequest = useGetAllTemplatesByTemplateScopeIdQuery(
    { params: { templateScopeId: scopeId } })

  const form = Form.useFormInstance()

  const formItemProps = {
    name: props.scopeId + 'templateId',
    ...props.formItemProps
  }

  // Generate form data from data request
  const { templateOptions, scopeLabel, initialOption } = useMemo(() => {
    if(!templateScopeData.data || !templateDataRequest.data) {
      return { templateOptions: [],
        scopeLabel: $t({ defaultMessage: 'Loading Templates...' }),
        initialOption: undefined }
    }

    const templateOptions = templateDataRequest.data?.content.map((t) =>
      ({ value: t.id,
        label: (t.userProvidedName?
          t.userProvidedName : $t(_.get(templateNames, t.nameLocalizationKey))) }))

    const scopeLabel = templateScopeData.data?.nameLocalizationKey ?
      $t(_.get(templateScopeLabels, templateScopeData.data.nameLocalizationKey))
      : $t({ defaultMessage: 'Loading Templates...' })


    let selectedTemplateId = templateScopeData.data?.defaultTemplateId
    if(templateScopeData.data?.registrations?.length) {
      selectedTemplateId = templateScopeData.data.registrations[0].templateId
    }

    const initialOption = selectedTemplateId ?
      templateOptions.find(t => t.value === selectedTemplateId)
      : undefined

    return {
      templateOptions,
      scopeLabel,
      initialOption
    }
  }, [templateScopeData.data, templateDataRequest.data])

  // Set initial selected value
  useEffect(() => {
    let currentFormValue = form.getFieldValue(formItemProps.name)

    if(!currentFormValue && initialOption) {
      form.setFieldValue(formItemProps.name, initialOption.value)
    }
  }, [initialOption, templateOptions])

  // RENDER //////////////////////////////////////////////////////
  return (
    <Loader style={{ height: 'auto', minHeight: 45 }}
      states={[templateDataRequest, templateScopeData]}>
      <Form.Item {...formItemProps}
        label={scopeLabel}>
        <TemplateSelect
          placeholder={placeholder}
          options={templateOptions}
          templateType={templateScopeData.data?.messageType}
          templates={templateDataRequest.data?.content}
        />
      </Form.Item>
    </Loader>
  )
}
