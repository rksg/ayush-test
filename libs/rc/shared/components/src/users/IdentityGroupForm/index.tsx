
import { useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { useIdentityGroupPageHeaderTitle } from '@acx-ui/cloudpath/components'
import { Loader, PageHeader, StepsForm }   from '@acx-ui/components'
import {
  useGetPersonaGroupByIdQuery,
  useGetIdentityGroupTemplateByIdQuery
} from '@acx-ui/rc/services'
import {
  CONFIG_TEMPLATE_LIST_PATH,
  PersonaGroup,
  useConfigTemplate,
  useConfigTemplateQueryFnSwitcher
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

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
  // eslint-disable-next-line max-len
  const { pathname: regularFallbackPath } = useTenantLink('users/identity-management/identity-group')
  const templateFallbackPath = useTenantLink(CONFIG_TEMPLATE_LIST_PATH, 'v')
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
      breadcrumb={[
        {
          text: $t({ defaultMessage: 'Clients' })
        },
        {
          text: $t({ defaultMessage: 'Identity Management' })
        },
        {
          text: $t({ defaultMessage: 'Identity Groups' }),
          link: 'users/identity-management'
        }
      ]}
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
