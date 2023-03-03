import { Form, Select, FormItemProps } from 'antd'
import { useIntl }                     from 'react-intl'
import { useGetTemplateScopeByIdQuery,
  useGetAllTemplatesByTemplateScopeIdQuery,
  useGetRegistrationByIdQuery } from '@acx-ui/rc/services'
import { templateNames, templateScopeLabels } from './MsgTemplateLocalizedMessages'

export interface TemplateSelectorProps {
  formItemProps?: FormItemProps,
  placeholder?: string,
  scopeId: string,
  registrationId: string
}

export function TemplateSelector(props: TemplateSelectorProps) {
  const { $t } = useIntl()

  const {
    scopeId,
    registrationId,
    placeholder = $t({ defaultMessage: 'Select Template...' })
  } = props

  const templateScopeRequest =
    useGetTemplateScopeByIdQuery({ params: { templateScopeId: scopeId } })
  const templatesRequest =
    useGetAllTemplatesByTemplateScopeIdQuery({ params: { templateScopeId: scopeId } })
  const registrationRequest =
    useGetRegistrationByIdQuery({
      params: { templateScopeId: scopeId, registrationId: registrationId } })

  let initialTemplateId:string = ''
  let registrationRequestFailed = false
  if(registrationRequest.isError
    && 'status' in registrationRequest.error
    && registrationRequest.error.status === 404
    && templateScopeRequest.data?.defaultTemplateId) {

    initialTemplateId = templateScopeRequest.data.defaultTemplateId

  } else if(registrationRequest.isSuccess && registrationRequest.data?.templateId) {
    initialTemplateId = registrationRequest.data.templateId
  } else if(registrationRequest.isError) {
    registrationRequestFailed = true
  }

  const form = Form.useFormInstance()

  let isLoading = true
  let isDisabled = true
  let options = new Array<{ value:string, label:string }>()
  let formItemProps = {
    name: props.scopeId + 'templateId',
    label: $t({ defaultMessage: 'Loading Templates...' }),
    ...props.formItemProps
  }
  if(templateScopeRequest.isLoading
    || templatesRequest.isLoading
    || registrationRequest.isLoading) {
      
    isLoading = true
    isDisabled = true
    formItemProps.label = $t({ defaultMessage: 'Loading Templates...' })
    options = []

  } else if(templateScopeRequest.isSuccess
    && templatesRequest.isSuccess
    && !registrationRequest.isLoading) {

    formItemProps.label = $t(templateScopeLabels[templateScopeRequest.data.nameLocalizationKey])
    isLoading = false
    isDisabled = false
    options = templatesRequest.data.content.map(({ id, nameLocalizationKey, userProvidedName }) =>
      ({ value: id,
        label: (userProvidedName? userProvidedName : $t(templateNames[nameLocalizationKey])) }))

        if(initialTemplateId) {
          let initialSelection = options.find(t => t.value === initialTemplateId);
          form.setFieldValue(formItemProps.name, initialSelection)
        }

  } else if(templateScopeRequest.isError || templatesRequest.isError || registrationRequestFailed) {

    isLoading=false
    isDisabled=true
    formItemProps.label = $t({ defaultMessage: 'Error Loading templates...' })
    options=[]

  }

  return (
    <Form.Item {...formItemProps}>
      <Select
        loading={isLoading}
        disabled={isDisabled}
        placeholder={placeholder}
        options={options}
        onSelect={(item:any, option:any) => {
          form.setFieldValue(formItemProps.name, option)
          form.validateFields()
        }}
      />
    </Form.Item>
  )
}
