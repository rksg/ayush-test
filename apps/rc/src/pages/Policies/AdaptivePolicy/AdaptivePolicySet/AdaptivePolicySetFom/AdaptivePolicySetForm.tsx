import React, { useEffect, useRef, useState } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, PageHeader, showToast, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                  from '@acx-ui/feature-toggle'
import {
  useAddAdaptivePolicySetMutation,
  useAddPrioritizedPolicyMutation,
  useDeletePrioritizedPolicyMutation,
  useGetAdaptivePolicySetQuery,
  useLazyGetPrioritizedPoliciesQuery,
  useUpdateAdaptivePolicySetMutation
} from '@acx-ui/rc/services'
import {
  AdaptivePolicy,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType, PrioritizedPolicy
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { AdaptivePolicySetSettingForm } from './AdaptivePolicySetSettingForm'

interface AdaptivePolicySetFormProps {
  editMode?: boolean,
  modalMode?: boolean,
  modalCallBack?: (addedPolicySetId?: string) => void
}

export default function AdaptivePolicySetForm (props: AdaptivePolicySetFormProps) {
  const { $t } = useIntl()
  const { editMode = false, modalMode = false, modalCallBack } = props
  const { policyId } = useParams()
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.LIST })
  const linkToList = useTenantLink(`/${tablePath}`)
  const navigate = useNavigate()
  const formRef = useRef<StepsFormLegacyInstance>()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const [addAdaptivePolicySet] = useAddAdaptivePolicySetMutation()
  const [updateAdaptiveSetPolicy] = useUpdateAdaptivePolicySetMutation()
  // eslint-disable-next-line max-len
  const { data, isLoading: isGetPolicyLoading } = useGetAdaptivePolicySetQuery({ params: { policySetId: policyId } }, { skip: !editMode })
  const [isUpdating, setIsUpdating] = useState(false)
  const [accessPolicies, setAccessPolicies] = useState([] as AdaptivePolicy [])

  const [addPrioritizedPolicy] = useAddPrioritizedPolicyMutation()
  const [deletePrioritizedPolicy] = useDeletePrioritizedPolicyMutation()
  const [getPrioritizedPolicies] = useLazyGetPrioritizedPoliciesQuery()

  useEffect(() => {
    if(data && editMode) {
      formRef.current?.setFieldsValue({
        ...data
      })
    }
  }, [data, editMode])

  const handleSubmit = async () => {
    const data = formRef.current?.getFieldsValue()
    try {
      setIsUpdating(true)
      const policyPayload = {
        name: data.name,
        description: data.name
      }

      if(editMode){
        await updateAdaptiveSetPolicy({
          params: { policySetId: policyId },
          payload: policyPayload
        })

        const { data } = await getPrioritizedPolicies({
          params: { policySetId: policyId } })
        // delete policies
        if (data) {
          const prioritizedPolicies = data.data
          for(let policy of prioritizedPolicies) {
            if(accessPolicies.findIndex(p => p.id === policy.policyId) === -1) {
              await deletePrioritizedPolicy({
                params: { policySetId: policyId, policyId: policy.policyId }
              })
            }
          }
        }

        // get list again for newer prioritized policies and do add or update policies
        const { data: newPolicies } = await getPrioritizedPolicies(
          { params: { policySetId: policyId } })
        if (newPolicies) {
          // eslint-disable-next-line max-len
          const prioritizedPolicies = Array.from(newPolicies.data?? []).sort((p1, p2) => p1.priority - p2.priority)
          for (let i = 0; i < accessPolicies.length; i++) {
            const id = accessPolicies[i].id
            if(i >= prioritizedPolicies.length || id !== prioritizedPolicies[i].policyId) {
              const payload = {
                params: { policySetId: policyId, policyId: id },
                payload: { policyId: id, priority: i }
              }
              await addPrioritizedPolicy(payload)
            }
          }
        }
        navigate(linkToList, { replace: true })
      } else {
        const { id: policySetId } = await addAdaptivePolicySet({
          payload: policyPayload
        }).unwrap()

        for (const i in accessPolicies) {
          const policyId = accessPolicies[i].id
          await addPrioritizedPolicy({
            params: { policySetId: policySetId, policyId: policyId },
            payload: { policyId: policyId, priority: i }
          })
        }
        modalMode ? modalCallBack?.(policySetId) : navigate(linkToList, { replace: true })
      }
      showToast({
        type: 'success',
        content: $t(
          // eslint-disable-next-line max-len
          { defaultMessage: 'Policy Set {name} was {editMode, select, true {updated} other {added}}' },
          { name: data.name, editMode }
        )
      })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      {!modalMode && <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Configure {name}' }, { name: data?.name })
          : $t({ defaultMessage: 'Add Adaptive Policy Set' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'Adaptive Policy Sets' }),
            link: tablePath }
        ] : [
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'Adaptive Set Policy' }),
            link: tablePath }
        ]}
      />}
      <StepsFormLegacy
        editMode={editMode}
        formRef={formRef}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        onCancel={() => modalMode ? modalCallBack?.() : navigate(linkToList)}
        onFinish={handleSubmit}>
        <StepsFormLegacy.StepForm
          initialValues={{ accessDeletePolicies: [] as PrioritizedPolicy [] }}>
          <Loader states={[{
            isLoading: isGetPolicyLoading,
            isFetching: isUpdating
          }]}>
            <AdaptivePolicySetSettingForm
              editMode={editMode}
              accessPolicies={accessPolicies}
              setAccessPolicies={setAccessPolicies}/>
          </Loader>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}

