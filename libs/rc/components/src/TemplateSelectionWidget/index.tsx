
import { Spin, Form, Select, FormItemProps, Typography } from 'antd'
import { useIntl } from 'react-intl'
import { useGetTemplateScopeByIdQuery, useGetAllTemplatesByTemplateScopeIdQuery, useGetRegistrationByIdQuery } from '@acx-ui/rc/services'
import { templateNames, templateScopeLabels } from './MsgTemplateLocalizedMessages'


export interface TemplateSelectorProps {
  formItemProps?: FormItemProps,
  placeholder?: string,
  scopeId: string,
  registrationId: string
}

export const TemplateSelector = (props: TemplateSelectorProps) => {
  const { $t } = useIntl()
  const { 
    scopeId, 
    registrationId, 
    placeholder = $t({defaultMessage: "Select Template..."})
  } = props

  const templateScopeRequest = 
    useGetTemplateScopeByIdQuery({params: { templateScopeId: scopeId }})
  const templatesRequest = 
    useGetAllTemplatesByTemplateScopeIdQuery({params: {templateScopeId: scopeId}})
  const registrationRequest = 
    useGetRegistrationByIdQuery({params: {templateScopeId: scopeId, registrationId: registrationId}})

  let selectedTemplateId = undefined
  let registrationRequestFailed = false;
  if(registrationRequest.isError 
    && 'status' in registrationRequest.error
    && registrationRequest.error.status === 404
    && templateScopeRequest.data?.defaultTemplateId) {

    selectedTemplateId = templateScopeRequest.data.defaultTemplateId

  } else if(registrationRequest.isSuccess && registrationRequest.data?.templateId) {
    selectedTemplateId = registrationRequest.data.templateId
  } else if(registrationRequest.isError) {
    registrationRequestFailed = true;
  }

  let content
  if(templateScopeRequest.isLoading || templatesRequest.isLoading || registrationRequest.isLoading) {
    content = <Spin />

  } else if(templateScopeRequest.isSuccess && templatesRequest.isSuccess && !registrationRequest.isLoading) {
    const form = Form.useFormInstance()
    const formItemProps = {
      name: props.scopeId + 'templateId',
      label: $t(templateScopeLabels[templateScopeRequest.data.nameLocalizationKey]),
      ...props.formItemProps,
    }

    content = (<Form.Item {...formItemProps}>
        <Select
          placeholder={placeholder}
          options={templatesRequest.data.content.map(({id, nameLocalizationKey, userProvidedName}) => ({value: id, label: (userProvidedName? userProvidedName : $t(templateNames[nameLocalizationKey]))}))}
          onSelect={(templateId:string) => {
            form.setFieldValue(formItemProps.name, templateId)
            form.validateFields()
          }}/>
      </Form.Item>)
      if(selectedTemplateId) {
        form.setFieldValue(formItemProps.name, selectedTemplateId)
      }

  } else if(templateScopeRequest.isError || templatesRequest.isError || registrationRequestFailed) {
    content=(<p><Typography.Text type="warning">{$t({defaultMessage: 'Failed to load templates, please reload the page.'})}</Typography.Text></p>)
  }

  return (
    <>
      {content}
    </>
  )
}
