import { useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  getIdentityGroupRoutePath,
  IdentityOperation,
  useIdentityGroupBreadcrumbs,
  useIdentityGroupPageHeaderTitle
} from '@acx-ui/cloudpath/components'
import { Loader, PageHeader, StepsForm }                                     from '@acx-ui/components'
import { useGetIdentityGroupTemplateByIdQuery, useGetPersonaGroupByIdQuery } from '@acx-ui/rc/services'
import {
  PersonaGroup,
  useConfigTemplate,
  useConfigTemplateQueryFnSwitcher,
  useConfigTemplateTenantLink
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'

import { usePersonaGroupAction } from '../PersonaGroupDrawer/usePersonaGroupActions'

import { IdentityGroupSettingForm } from './IdentityGroupSettingForm'


interface IdentityGroupFormProps {
  editMode?: boolean,
  modalMode?: boolean,
  callback?: (identityGroupId?: string) => void
}

export function IdentityGroupForm ({
  editMode = false,
  modalMode = false,
  callback
}: IdentityGroupFormProps) {
  const { $t } = useIntl()
  const [ form ] = Form.useForm<PersonaGroup>()
  const navigate = useNavigate()
  const { isTemplate } = useConfigTemplate()
  const pageTitle = useIdentityGroupPageHeaderTitle({ isEdit: editMode })
  const breadcrumb = useIdentityGroupBreadcrumbs(IdentityOperation.LIST)
  // eslint-disable-next-line max-len
  const regularFallbackPath = getIdentityGroupRoutePath(IdentityOperation.LIST, false)
  const templateFallbackPath = useConfigTemplateTenantLink('')
  const previousPath = isTemplate ? templateFallbackPath : regularFallbackPath

  const { personaGroupId } = useParams()

  const { data: dataFromServer, isLoading, isFetching }
    = useConfigTemplateQueryFnSwitcher<PersonaGroup>({
      useQueryFn: useGetPersonaGroupByIdQuery,
      useTemplateQueryFn: useGetIdentityGroupTemplateByIdQuery,
      skip: !editMode,
      extraParams: { groupId: personaGroupId }
    })

  useEffect(() => {
    if (editMode && dataFromServer) {
      form.setFieldsValue(dataFromServer)
    }
  }, [editMode, dataFromServer])

  const { createPersonaGroupMutation, updatePersonaGroupMutation } = usePersonaGroupAction()

  const handleSubmit = async () => {
    let result
    try {
      await form.validateFields()
      if (editMode) {
        if (personaGroupId) {
          await updatePersonaGroupMutation(personaGroupId, dataFromServer, form.getFieldsValue())
        }
      } else {
        result = await createPersonaGroupMutation(form.getFieldsValue(), callback)
      }

      if (modalMode) {
        callback?.(result?.id)
      } else {
        editMode
          ? navigate(-1)
          : navigate(previousPath, { replace: true })
      }
    } catch (e) {
      return Promise.resolve()
    }
  }

  return (<>
    {!modalMode && <PageHeader
      title={pageTitle}
      breadcrumb={breadcrumb}
    />}
    <Loader states={[{ isLoading, isFetching }]}>
      <StepsForm
        editMode={editMode}
        form={form}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        onCancel={() => modalMode ? callback?.() : navigate(-1)}
        onFinish={handleSubmit}>
        <StepsForm.StepForm>
          <IdentityGroupSettingForm modalMode={modalMode}/>
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  </>
  )
}
