import React, { useEffect, useRef } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, PageHeader, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import {
  useAddAdaptivePolicySetMutation,
  useAddPrioritizedPolicyMutation,
  useDeletePrioritizedPolicyMutation,
  useGetAdaptivePolicySetQuery,
  useGetPrioritizedPoliciesQuery,
  useUpdateAdaptivePolicySetMutation
} from '@acx-ui/rc/services'
import {
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
  const [updateAdaptiveSetPolicy, { isLoading: isUpdating }] = useUpdateAdaptivePolicySetMutation()
  // eslint-disable-next-line max-len
  const { data, isLoading: isGetPolicyLoading } = useGetAdaptivePolicySetQuery({ params: { policySetId: policyId } }, { skip: !editMode })
  // eslint-disable-next-line max-len
  const { data: prioritizedPoliciesData, isLoading: isGetPrioritizedPoliciesLoading } = useGetPrioritizedPoliciesQuery({
    params: { policySetId: policyId } }, { skip: !editMode })

  // eslint-disable-next-line max-len
  const [addPrioritizedPolicy, { isLoading: isAddPrioritizedPolicyUpdating }] = useAddPrioritizedPolicyMutation()
  const [deletePrioritizedPolicy] = useDeletePrioritizedPolicyMutation()

  useEffect(() => {
    if(data && editMode) {
      formRef.current?.setFieldsValue({
        ...data
      })
    }
  }, [data, editMode])

  useEffect(() => {
    if(prioritizedPoliciesData) {
      formRef.current?.setFieldValue('accessPolicies', prioritizedPoliciesData.data)
    }
  }, [prioritizedPoliciesData])

  const handleSubmit = async () => {
    const data = formRef.current?.getFieldsValue()
    try {
      const policyPayload = {
        name: data.name,
        description: data.name
      }

      let usePolicySetId
      if(editMode){
        await updateAdaptiveSetPolicy({
          params: { policySetId: policyId },
          payload: policyPayload
        }).unwrap()
        usePolicySetId = policyId
      } else {
        const { id } = await addAdaptivePolicySet({
          payload: policyPayload
        }).unwrap()
        usePolicySetId = id
      }

      if(data.accessPolicies) {
        for(let policy of data.accessPolicies) {
          await addPrioritizedPolicy({
            params: { policySetId: usePolicySetId, policyId: policy.policyId },
            payload: { policyId: policy.policyId }
          }).unwrap()
        }
      }

      if(data.accessDeletePolicies) {
        for(let policy of data.accessDeletePolicies) {
          await deletePrioritizedPolicy({
            params: { policySetId: usePolicySetId, policyId: policy.policyId }
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
            isLoading: isGetPolicyLoading || isGetPrioritizedPoliciesLoading,
            isFetching: isUpdating || isAddPrioritizedPolicyUpdating
          }]}>
            <AdaptivePolicySetSettingForm/>
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

