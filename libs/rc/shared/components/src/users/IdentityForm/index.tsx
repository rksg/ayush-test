import { useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader, PageHeader, StepsForm }                                           from '@acx-ui/components'
import { useAddPersonaMutation, useGetPersonaByIdQuery, useUpdatePersonaMutation } from '@acx-ui/rc/services'
import { Persona }                                                                 from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                   from '@acx-ui/react-router-dom'

import { IdentitySettingForm } from './IdentitySettingForm'


interface IdentityFormProps {
  editMode?: boolean,
  modalMode?: boolean,
  callback?: (identityId?: string) => void
  selectedPersonaGroupId?: string
}

export function IdentityForm (props: IdentityFormProps) {
  const { editMode, modalMode, callback, selectedPersonaGroupId } = props
  const { $t } = useIntl()
  const [ form ] = Form.useForm<Persona>()
  const navigate = useNavigate()
  const { pathname: previousPath } = useTenantLink('users/identity-management/identity-group')
  const { personaGroupId, personaId } = useParams()

  const [ addPersona ] = useAddPersonaMutation()
  const [ updatePersona ] = useUpdatePersonaMutation()

  const { data: dataFromServer, isLoading, isFetching } = useGetPersonaByIdQuery({
    params: { groupId: personaGroupId, id: personaId }
  }, { skip: !editMode })

  useEffect(() => {
    if (editMode && dataFromServer) {
      form.setFieldsValue(dataFromServer)
    }
  }, [editMode, dataFromServer])

  useEffect(() => {
    if(modalMode) {
      form.setFieldValue('groupId', selectedPersonaGroupId)
    }
  }, [selectedPersonaGroupId])

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      const result = editMode
        ? await handleUpdatePersona(form.getFieldsValue())
        : await handleAddPersona(form.getFieldsValue())

      if (modalMode) {
        callback?.(result?.id)
      } else {
        editMode
          ? navigate(-1)
          : navigate(
            previousPath.concat(personaGroupId ? `/${personaGroupId}` : ''),
            { replace: true })
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }

  const handleUpdatePersona = async (submittedData: Persona) => {
    if (!dataFromServer) return

    const personaKeys = ['name', 'email', 'description', 'vlan', 'phoneNumber'] as const
    const patchData = {}

    personaKeys.forEach(key => {
      if (submittedData[key] !== dataFromServer[key]) {
        Object.assign(patchData, { [key]: submittedData[key] })
      }
    })

    if (Object.keys(patchData).length === 0) return

    return updatePersona({
      params: { groupId: submittedData.groupId, id: dataFromServer?.id },
      payload: patchData
    }).unwrap()
  }

  const handleAddPersona = async (submittedData: Persona) => {
    return addPersona({
      params: { groupId: submittedData.groupId },
      payload: { ...submittedData }
    }).unwrap()
  }

  return (
    <>
      {!modalMode && <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit Identity' })
          : $t({ defaultMessage: 'Create Identity' })}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Clients' })
          },
          {
            text: $t({ defaultMessage: 'Identity Management' })
          },
          {
            text: $t({ defaultMessage: 'Identities' }),
            link: 'users/identity-management/identity'
          }
        ]}
      />}
      <Loader
        states={[{ isLoading, isFetching }]}
      >
        <StepsForm
          editMode={editMode}
          form={form}
          buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
          onCancel={() => modalMode ? callback?.() : navigate(-1)}
          onFinish={handleSubmit}
        >
          <StepsForm.StepForm>
            <IdentitySettingForm modalMode={modalMode}/>
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
    </>
  )
}
