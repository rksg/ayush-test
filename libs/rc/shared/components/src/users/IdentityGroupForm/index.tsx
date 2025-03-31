
import { useEffect } from 'react'

import { Form }    from 'antd'
import { omit }    from 'lodash'
import { useIntl } from 'react-intl'

import { Loader, PageHeader, StepsForm } from '@acx-ui/components'
import {
  useAddPersonaGroupMutation,
  useAssociateIdentityGroupWithPolicySetMutation,
  useGetPersonaGroupByIdQuery
} from '@acx-ui/rc/services'
import { PersonaGroup }                          from '@acx-ui/rc/utils'
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
  const { pathname: previousPath } = useTenantLink('users/identity-management/identity-group')
  const { personaGroupId } = useParams()

  const { data: dataFromServer, isLoading, isFetching } = useGetPersonaGroupByIdQuery({
    params: { groupId: personaGroupId }
  }, { skip: !editMode })

  useEffect(() => {
    if (editMode && dataFromServer) {
      form.setFieldsValue(dataFromServer)
    }
  }, [editMode, dataFromServer])

  const { updatePersonaGroupMutation } = usePersonaGroupAction()
  const [ addPersonaGroup ] = useAddPersonaGroupMutation()
  const [ associatePolicySet ] = useAssociateIdentityGroupWithPolicySetMutation()

  const handleSubmit = async () => {
    let result
    try {
      await form.validateFields()
      if (editMode) {
        if (personaGroupId) {
          await updatePersonaGroupMutation(personaGroupId, dataFromServer, form.getFieldsValue())
        }
      } else {
        result = await addPersonaGroup({
          payload: omit(form.getFieldsValue(), ['policySetId'])
        }).unwrap()

        if (form.getFieldsValue().policySetId) {
          await associatePolicySet({
            params: { groupId: result.id, policySetId: form.getFieldsValue().policySetId }
          })
        }
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
      title={editMode
        ? $t({ defaultMessage: 'Edit Identity Group' })
        : $t({ defaultMessage: 'Create Identity Group' })}
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
