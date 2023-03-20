import { useEffect, useState } from 'react'

import { Form, Select, FormItemProps, Spin } from 'antd'
import _                                     from 'lodash'
import { useIntl }                           from 'react-intl'

import { useGetTemplateSelectionContentQuery } from '@acx-ui/rc/services'

import { templateNames, templateScopeLabels } from './MsgTemplateLocalizedMessages'

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


  const [templateOptions, setTemplateOptions] = useState<Array<{ value:string, label:string }>>([])

  const form = Form.useFormInstance()

  const formItemProps = {
    name: props.scopeId + 'templateId',
    ...props.formItemProps
  }

  const [formItemLabel, setFormItemLabel] = useState($t({ defaultMessage: 'Loading Templates...' }))

  // Setup form options ////
  useEffect(() => {
    if(!templateDataRequest.isSuccess) {
      return
    }

    let options = templateDataRequest.data?.templates.map((t) =>
      ({ value: t.id,
        label: (t.userProvidedName?
          t.userProvidedName : $t(_.get(templateNames, t.nameLocalizationKey))) }))
    setTemplateOptions(options)
  }, [templateDataRequest.isSuccess, templateDataRequest.data?.templates])

  // Set intitial selected value
  useEffect(() => {
    let currentFormValue = form.getFieldValue(formItemProps.name)
    let initialTemplateId = templateDataRequest.data?.defaultTemplateId

    if(!currentFormValue && initialTemplateId) {
      let initialSelection =
        templateOptions.find(t => t.value === templateDataRequest.data?.defaultTemplateId)

      form.setFieldValue(formItemProps.name, initialSelection)
    }
  }, [templateDataRequest.data?.defaultTemplateId,
    templateDataRequest.data?.templates, templateOptions])

  const [componentMode, setComponentMode] = useState<'LOADING' | 'ERROR' | 'LOADED'>('LOADING')

  useEffect(() => {
    if(templateDataRequest.isLoading) {
      setComponentMode('LOADING')
    } else if(templateDataRequest.isError) {
      setComponentMode('ERROR')
    } else if(templateDataRequest.isSuccess) {
      setComponentMode('LOADED')
    }
  }, [templateDataRequest.isLoading, templateDataRequest.isError, templateDataRequest.isSuccess])

  useEffect(() => {
    if(componentMode === 'LOADED' && templateDataRequest.data?.templateScopeNameKey) {
      setFormItemLabel(
        $t(_.get(templateScopeLabels, templateDataRequest.data.templateScopeNameKey)))
    } else {
      setFormItemLabel($t({ defaultMessage: 'Loading Templates...' }))
    }
  }, [templateDataRequest.data?.templateScopeNameKey, componentMode])


  if(componentMode !== 'LOADED') {
    return (<div style={{ display: 'block' }}><Spin></Spin></div>)
  } else {
    return (
      <Form.Item {...formItemProps}
        label={formItemLabel}>
        <Select
          placeholder={placeholder}
          options={templateOptions}
          onSelect={(item:unknown, option:unknown) => {
            form.setFieldValue(formItemProps.name, option)
            form.validateFields()
          }}
        />
      </Form.Item>
    )
  }
}
