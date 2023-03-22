import React, { useEffect, useRef, useState } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, PageHeader, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
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
  editMode?: boolean
}

export default function H (props: AdaptivePolicySetFormProps) {
  const { $t } = useIntl()
  const { editMode = false } = props
  const { policyId } = useParams()
  // eslint-disable-next-line max-len
  const linkToList = useTenantLink('/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.LIST }))
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance>()

  const [addAdaptivePolicySet] = useAddAdaptivePolicySetMutation()
  const [updateAdaptiveSetPolicy] = useUpdateAdaptivePolicySetMutation()
  // eslint-disable-next-line max-len
  const { data, isLoading: isGetPolicyLoading } = useGetAdaptivePolicySetQuery({ params: { policySetId: policyId } }, { skip: !editMode })
  const [isUpdating, setIsUpdating] = useState(false)
  const [accessPolicies, setAccessPolicies] = useState([] as AdaptivePolicy [])

  // eslint-disable-next-line max-len
  const [addPrioritizedPolicy] = useAddPrioritizedPolicyMutation()
  const [deletePrioritizedPolicy] = useDeletePrioritizedPolicyMutation()
  // eslint-disable-next-line max-len
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
        }).unwrap()

        let result =
          await getPrioritizedPolicies({ params: { policySetId: policyId } }).unwrap()
        // delete policies
        if (result.data) {
          const prioritizedPolicies = result.data
          for(let policy of prioritizedPolicies) {
            if(accessPolicies.findIndex(p => p.id === policy.policyId) === -1) {
              await deletePrioritizedPolicy({
                params: { policySetId: policyId, policyId: policy.policyId }
              }).unwrap()
            }
          }
        }
        // get list again for newer prioritized policies and do add or update policies
        result = await getPrioritizedPolicies({ params: { policySetId: policyId } }).unwrap()
        if (result.data) {
          const prioritizedPolicies = result.data
          for (let i = 0; i < accessPolicies.length; i++) {
            const id = accessPolicies[i].id
            const index = prioritizedPolicies.findIndex(p => p.policyId === id)
            if(i !== index) {
              await addPrioritizedPolicy({
                params: { policySetId: policyId, policyId: id },
                payload: { policyId: id, priority: i }
              }).unwrap()
            }
          }
        }
      } else {
        const { id: policySetId } = await addAdaptivePolicySet({
          payload: policyPayload
        }).unwrap()

        for (const i in accessPolicies) {
          const policyId = accessPolicies[i].id
          await addPrioritizedPolicy({
            params: { policySetId: policySetId, policyId: policyId },
            payload: { policyId: policyId, priority: i }
          }).unwrap()
        }
      }
      showToast({
        type: 'success',
        content: $t(
          // eslint-disable-next-line max-len
          { defaultMessage: 'Policy Set {name} was {editMode, select, true {updated} other {added}}' },
          { name: data.name, editMode }
        )
      })
      navigate(linkToList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Configure {name}' }, { name: data?.name })
          : $t({ defaultMessage: 'Add Adaptive Policy Set' })}
        breadcrumb={[
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) },
          { text: $t({ defaultMessage: 'Adaptive Set Policy' }),
            // eslint-disable-next-line max-len
            link: getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.LIST }) }
        ]}
      />
      <StepsForm
        editMode={editMode}
        formRef={formRef}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        onCancel={() => navigate(linkToList)}
        onFinish={handleSubmit}>
        <StepsForm.StepForm
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
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

