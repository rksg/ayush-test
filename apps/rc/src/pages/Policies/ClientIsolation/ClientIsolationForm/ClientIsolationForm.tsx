import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'


import {
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  useAddClientIsolationMutation,
  useGetClientIsolationQuery,
  useUpdateClientIsolationMutation
} from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation,
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
  // eslint-disable-next-line max-len
  const tablePath = getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
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
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit Client Isolation Profile' })
          : $t({ defaultMessage: 'Add Client Isolation Profile' })
        }
        breadcrumb={[
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Client Isolation' }), link: tablePath }
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
