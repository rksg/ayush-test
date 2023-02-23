import { Button } from '@acx-ui/components'
import { Spin, Form, Select } from 'antd'
import { useIntl } from 'react-intl'
import { useGetTemplateScopeByIdQuery, useGetAllTemplatesByTemplateScopeIdQuery } from '@acx-ui/rc/services'
import { TemplateScope } from '@acx-ui/rc/utils'

type Props = {scopeId:string, registrationId:string}

export const TemplateSelectionWidget = (props: Props) => {
  const { $t } = useIntl()

  console.log("Template Scope Id in widget: ", props.scopeId)
  const templateScopeRequest = useGetTemplateScopeByIdQuery({
    params: { templateScopeId: props.scopeId }
  })

  const templatesRequest = useGetAllTemplatesByTemplateScopeIdQuery({params: {templateScopeId: props.scopeId}})

  let content
  if(templateScopeRequest.isLoading || templatesRequest.isLoading) {

    // TODO: may need to style this
    // TODO: add text about what is being loaded?
    content = <Spin />

  } else if(templateScopeRequest.isSuccess && templatesRequest.isSuccess) {
    
    content = <Form.Item name={['communicationConfiguration', 'unitAssignmentTemplateId']}
      label={templateScopeRequest.data.nameLocalizationKey}
      // rules={[{ required: true }]}
      children={<><Select options={templatesRequest.data.content.map(({id, nameLocalizationKey}) => ({value: id, label: nameLocalizationKey}))}/></>}/>
      // TODO: add link to preview

  } else if(templateScopeRequest.isError || templatesRequest.isError) {
    
    // TODO: clean this up
    content= <h3>Failed To Load</h3>
    // console.log(templatesRequest)
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
