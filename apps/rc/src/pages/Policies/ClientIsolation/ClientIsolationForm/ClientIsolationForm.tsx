import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'


import {
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  useAddClientIsolationMutation,
  useGetClientIsolationQuery,
  useUpdateClientIsolationMutation
} from '@acx-ui/rc/services'
import {
  getPolicyListRoutePath,
  ClientIsolationSaveData
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import ClientIsolationSettingsForm from './ClientIsolationSettingsForm'

interface ClientIsolationFormProps {
  editMode?: boolean
}

export default function ClientIsolationForm (props: ClientIsolationFormProps) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToPolicies = useTenantLink(getPolicyListRoutePath(true))
  const params = useParams()
  const { editMode = false } = props

  const [ addClientIsolation ] = useAddClientIsolationMutation()
  const [ updateClientIsolation ] = useUpdateClientIsolationMutation()
  const { data: dataFromServer } = useGetClientIsolationQuery({ params }, { skip: !editMode })
  const formRef = useRef<StepsFormInstance<ClientIsolationSaveData>>()

  useEffect(() => {
    if (dataFromServer && editMode) {
      formRef.current?.setFieldsValue(dataFromServer)
    }
  }, [dataFromServer, editMode])

  const saveData = async (data: ClientIsolationSaveData) => {
    try {
      if (editMode) {
        await updateClientIsolation({ params, payload: _.omit(data, 'id') }).unwrap()
      } else {
        await addClientIsolation({ params, payload: data }).unwrap()
      }

      navigate(linkToPolicies, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Client Isolation Allowlist Policy' })}
        breadcrumb={[
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) }
        ]}
      />
      <StepsForm<ClientIsolationSaveData>
        formRef={formRef}
        onCancel={() => navigate(linkToPolicies)}
        onFinish={saveData}
      >
        <StepsForm.StepForm<ClientIsolationSaveData>
          name='details'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <ClientIsolationSettingsForm />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
