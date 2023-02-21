import { Button } from '@acx-ui/components'
import { Spin, Form, Select } from 'antd'
import { useIntl } from 'react-intl'
import { useGetTemplateScopeByIdQuery } from '@acx-ui/rc/services'
import { TemplateScope } from '@acx-ui/rc/utils'

type Props = {scopeId:string, registrationId:string}

export const TemplateSelectionWidget = (props: Props) => {
  const { $t } = useIntl()

  console.log("Template Scope Id in widget: ", props.scopeId)
  const templateScopeRequest = useGetTemplateScopeByIdQuery({
    params: { templateScopeId: props.scopeId }
  })

  let content
  if(templateScopeRequest.isLoading) {
    // TODO: may need to style this
    // TODO: add text about what is being loaded?
    content = <Spin />
  } else if(templateScopeRequest.isSuccess) {
    content = <Form.Item name={['communicationConfiguration', 'unitAssignmentTemplateId']}
      label={templateScopeRequest.data.nameLocalizationKey}
      // label={$t({ defaultMessage: 'Onboarding Template' })}
      // rules={[{ required: true }]}
      children={<><Select /></>}/>
      // TODO: add link to preview
  } else if(templateScopeRequest.isError) {
    // TODO: clean this up
    content= <h3>Failed To Load</h3>
  }

  // const personaGroupList = useGetPersonaGroupListQuery({
  //   payload: {
  //     page: 1, pageSize: 2147483647, sortField: 'name', sortOrder: 'ASC'
  //   }
  // })

  // return (
  //   <Select
  //     {...props}
  //     options={
  //       personaGroupList.data?.data
  //         .map(group => ({ value: group.id, label: group.name }))
  //     }
  //   />
  // )



  return (
    <>
      {content}
    </>
  )
}
