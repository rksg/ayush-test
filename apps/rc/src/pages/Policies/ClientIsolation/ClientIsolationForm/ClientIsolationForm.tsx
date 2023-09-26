import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'


import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
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
  ClientIsolationSaveData,
  getPolicyListRoutePath
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
  const formRef = useRef<StepsFormLegacyInstance<ClientIsolationSaveData>>()

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
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'Client Isolation' }), link: tablePath }
        ]}
      />
      <StepsFormLegacy<ClientIsolationSaveData>
        formRef={formRef}
        onCancel={() => navigate(linkToPolicies)}
        onFinish={saveData}
        buttonLabel={{
          submit: editMode
            ? $t({ defaultMessage: 'Apply' })
            : $t({ defaultMessage: 'Add' })
        }}
      >
        <StepsFormLegacy.StepForm<ClientIsolationSaveData>
          name='details'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <ClientIsolationSettingsForm editMode={editMode} />
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
