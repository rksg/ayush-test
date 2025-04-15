import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'


import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
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
  getPolicyListRoutePath, formatMacAddress
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import ClientIsolationSettingsForm from './ClientIsolationSettingsForm'

interface ClientIsolationFormProps {
  editMode?: boolean
  isEmbedded?: boolean
  updateInstance?: (createId?:string) => void
}

export function ClientIsolationForm (props: ClientIsolationFormProps) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const tablePath = getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const params = useParams()
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const { editMode = false , isEmbedded = false, updateInstance } = props

  const [ addClientIsolation ] = useAddClientIsolationMutation()
  const [ updateClientIsolation ] = useUpdateClientIsolationMutation()
  const { data: dataFromServer } = useGetClientIsolationQuery(
    { params, enableRbac },
    { skip: !editMode })
  const formRef = useRef<StepsFormLegacyInstance<ClientIsolationSaveData>>()

  useEffect(() => {
    if (dataFromServer && editMode) {
      formRef.current?.setFieldsValue(dataFromServer)
    }
  }, [dataFromServer, editMode])

  const transformData = (data: ClientIsolationSaveData) => {
    return {
      ...data,
      allowlist: data.allowlist.map((client) => {
        return {
          ...client,
          mac: formatMacAddress(client.mac)
        }
      })
    }
  }

  const saveData = async (data: ClientIsolationSaveData) => {
    try {
      if (editMode) {
        // eslint-disable-next-line max-len
        await updateClientIsolation({ params, payload: _.omit(transformData(data), 'id'), enableRbac }).unwrap()
      } else {
        const createResult = await addClientIsolation(
          { params, payload: transformData(data), enableRbac }
        ).unwrap()

        updateInstance?.(createResult.response?.id)
      }

      if(!isEmbedded) {
        navigate(linkToPolicies, { replace: true })
      }

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      {!isEmbedded && <PageHeader
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
      }
      <StepsFormLegacy<ClientIsolationSaveData>
        formRef={formRef}
        onCancel={() => {
          if(isEmbedded) {
            formRef.current?.resetFields()
            updateInstance?.()
          } else {
            navigate(linkToPolicies)
          }
        }}
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
          <ClientIsolationSettingsForm editMode={editMode} isEmbedded={isEmbedded} />
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
