import { useEffect, useMemo } from 'react'

import { Form, FormItemProps } from 'antd'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'

import { Loader }                            from '@acx-ui/components'
import { useGetAllTemplateGroupsByCategoryIdQuery,
  useGetCategoryQuery,
  useGetRegistrationByIdQuery } from '@acx-ui/rc/services'

import { TemplateSelect }                     from './TemplateSelect'


export interface TemplateSelectorProps {
  formItemProps?: FormItemProps,
  placeholder?: string,
  categoryId: string,
  emailRegistrationId: string,
  smsRegistrationId: string
}

export function TemplateSelector (props: TemplateSelectorProps) {
  const { $t } = useIntl()

  const {
    categoryId,
    emailRegistrationId,
    smsRegistrationId,
    placeholder = $t({ defaultMessage: 'Select Template...' })
  } = props

  const msgCategoryData = useGetCategoryQuery({params: {categoryId: categoryId}})
  const templateGroupData = 
    useGetAllTemplateGroupsByCategoryIdQuery({params: {categoryId: categoryId}})

  //TODO: verify this is not called until we have the msgCategoryData
  const emailRegistrationData = useGetRegistrationByIdQuery({params:{
    templateScopeId: msgCategoryData.data?.emailTemplateScopeId, 
    registrationId: emailRegistrationId}}, {skip:!msgCategoryData.data?.emailTemplateScopeId})
  
  const form = Form.useFormInstance()

  const formItemProps = {
    name: props.categoryId + 'templateId',
    ...props.formItemProps
  }

  // Generate form data from data request
  const { groupOptions, categoryLabel, initialOptionValue } = useMemo(() => {
    if(!msgCategoryData.data || !templateGroupData.data || (!emailRegistrationData.isError && !emailRegistrationData.isSuccess)) {
      return {
        groupOptions: [],
        categoryLabel: $t({ defaultMessage: 'Loading Templates...' }),
        initialOptionValue: undefined
      }
    }

    const emailTemplateScopeId = msgCategoryData.data?.emailTemplateScopeId
    const smsTemplateScopeId = msgCategoryData.data?.smsTemplateScopeId
    // value contains necessary information to save registrations
    const groupOptions = templateGroupData.data?.data.map((g) => ({ 
      value: emailTemplateScopeId+','+g.emailTemplateId+','+smsTemplateScopeId+','+g.smsTemplateId, 
      label: g.name }))

    const categoryLabel = msgCategoryData.data?.name ? 
      msgCategoryData.data?.name : $t({ defaultMessage: 'Loading Templates...' })
    
    let selectedGroup = undefined;
    // TODO: should I link up registrations template scopes with template groups in the front end or back? -- if this is inefficient add the group ont eh backend
    if(emailRegistrationData.isSuccess) {
      selectedGroup = templateGroupData.data?.data.find(g => g.emailTemplateId === emailRegistrationData.data.templateId)
    }

    if(!selectedGroup) {
      selectedGroup = templateGroupData.data.data.find(g => g.id === msgCategoryData.data?.defaultTemplateGroupId)
    }
    

    const initialOptionValue = selectedGroup ?
      emailTemplateScopeId+','+selectedGroup.emailTemplateId+','+smsTemplateScopeId+','+selectedGroup.smsTemplateId 
      : undefined

    return {
      groupOptions,
      categoryLabel,
      initialOptionValue
    }
  }, [msgCategoryData.data, templateGroupData.data])

  // Set initial selected value
  useEffect(() => {
    let currentFormValue = form.getFieldValue(formItemProps.name)

    // TODO: need to functionally test and make sure this is being set correctly
    if(!currentFormValue && initialOptionValue) {
      form.setFieldValue(formItemProps.name, initialOptionValue)
    }
  }, [initialOptionValue, groupOptions])

  // RENDER //////////////////////////////////////////////////////
  return (
    <Loader style={{ height: 'auto', minHeight: 45 }}
      states={[templateGroupData, msgCategoryData]}>
      <Form.Item {...formItemProps}
        label={categoryLabel}>
        <TemplateSelect
          placeholder={placeholder}
          options={groupOptions}
          msgCategory={msgCategoryData.data}
          templateGroups={templateGroupData.data?.data}
        />
      </Form.Item>
    </Loader>
  )
}
