import React, { useEffect, useRef } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Loader, PageHeader, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import { Features, useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import {
  useAddMacRegListMutation, useAddMacRegListWithIdentityMutation,
  useDeleteAdaptivePolicySetFromMacListMutation,
  useGetMacRegListQuery,
  useUpdateAdaptivePolicySetToMacListMutation,
  useUpdateMacRegListMutation
} from '@acx-ui/rc/services'
import {
  MacRegistrationPoolFormFields,
  PolicyType,
  PolicyOperation,
  usePolicyListBreadcrumb,
  MacRegistrationPool,
  transferDataToExpirationFormFields,
  transferExpirationFormFieldsToData,
  usePolicyPreviousPath,
  useAfterPolicySaveRedirectPath
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'

import { MacRegistrationListSettingForm } from './MacRegistrationListSettingForm'

interface MacRegistrationListFormProps {
  editMode?: boolean,
  modalMode?: boolean,
  modalCallBack?: (saveData?: MacRegistrationPool) => void
}

export function MacRegistrationListForm (props: MacRegistrationListFormProps) {
  const intl = useIntl()
  const { editMode = false, modalMode, modalCallBack } = props
  const { policyId } = useParams()
  const navigate = useNavigate()
  const formRef = useRef<StepsFormLegacyInstance<MacRegistrationPoolFormFields>>()

  const { data, isLoading } = useGetMacRegListQuery({ params: { policyId } }, { skip: !editMode })
  const [addMacRegList] = useAddMacRegListMutation()
  const [addMacRegListWithIdentity] = useAddMacRegListWithIdentityMutation()
  const [updateMacRegList, { isLoading: isUpdating }] = useUpdateMacRegListMutation()

  const [bindPolicySet] = useUpdateAdaptivePolicySetToMacListMutation()
  const [unbindPolicySet] = useDeleteAdaptivePolicySetFromMacListMutation()

  const isIdentityRequired = useIsSplitOn(Features.MAC_REGISTRATION_REQUIRE_IDENTITY_GROUP_TOGGLE)
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.MAC_REGISTRATION_LIST)
  const previousPath = usePolicyPreviousPath(PolicyType.MAC_REGISTRATION_LIST, PolicyOperation.LIST)
  const redirectPathAfterSave = useAfterPolicySaveRedirectPath(PolicyType.MAC_REGISTRATION_LIST)

  useEffect(() => {
    if (data && editMode) {
      formRef.current?.setFieldsValue({
        name: data.name,
        autoCleanup: data.autoCleanup,
        ...transferDataToExpirationFormFields(data),
        defaultAccess: data.defaultAccess,
        policySetId: data.policySetId
      })

      if(isIdentityRequired) {
        formRef.current?.setFieldsValue({
          identityGroupId: data.identityGroupId,
          identityId: data.identityId,
          isUseSingleIdentity: !!data.identityId
        })
      }
    }
  }, [data, editMode])

  const handleAddList = async (data: MacRegistrationPoolFormFields) => {
    try {
      let result = null
      if(isIdentityRequired) {
        const saveData = {
          name: data.name,
          autoCleanup: data.autoCleanup,
          ...transferExpirationFormFieldsToData(data.expiration),
          defaultAccess: data.defaultAccess ?? 'ACCEPT',
          identityId: data.isUseSingleIdentity ? data.identityId : undefined
        }
        // eslint-disable-next-line max-len
        result = await addMacRegListWithIdentity({ params: { identityGroupId: data.identityGroupId }, payload: saveData }).unwrap() as MacRegistrationPool
      } else {
        const saveData = {
          name: data.name,
          autoCleanup: data.autoCleanup,
          ...transferExpirationFormFieldsToData(data.expiration),
          defaultAccess: data.defaultAccess ?? 'ACCEPT'
        }
        // eslint-disable-next-line max-len
        result = await addMacRegList({ payload: saveData }).unwrap() as MacRegistrationPool
      }

      if (result.id && data.policySetId) {
        await bindPolicySet({ params: { policyId: result.id, policySetId: data.policySetId } })
      }

      modalMode ? modalCallBack?.(result) : navigate(redirectPathAfterSave, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleEditList = async (formData: MacRegistrationPoolFormFields) => {
    try {
      const saveData = {
        name: formData.name,
        ...transferExpirationFormFieldsToData(formData.expiration),
        autoCleanup: formData.autoCleanup,
        defaultAccess: formData.defaultAccess ?? 'ACCEPT',
        identityId: isIdentityRequired ?
          (formData.isUseSingleIdentity ? formData.identityId : null) : undefined
      }

      await updateMacRegList({
        params: { policyId },
        payload: saveData
      }).unwrap()

      if (formData.policySetId) {
        await bindPolicySet({ params: { policyId, policySetId: formData.policySetId } })
      } else if (data?.policySetId) {
        await unbindPolicySet({ params: { policyId, policySetId: data?.policySetId } })
      }

      modalMode ? modalCallBack?.() : navigate(redirectPathAfterSave, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      {!modalMode && <PageHeader
        title={editMode
          ? intl.$t({ defaultMessage: 'Configure {listName}' }, { listName: data?.name })
          : intl.$t({ defaultMessage: 'Add MAC Registration List' })}
        breadcrumb={breadcrumb}
      />}
      <StepsFormLegacy<MacRegistrationPoolFormFields>
        editMode={editMode}
        formRef={formRef}
        buttonLabel={{ submit: intl.$t({ defaultMessage: 'Apply' }) }}
        onCancel={() => modalMode ? modalCallBack?.() : navigate(previousPath)}
        onFinish={editMode ? handleEditList : handleAddList}>
        <StepsFormLegacy.StepForm<MacRegistrationPoolFormFields>>
          <Loader states={[{
            isLoading: isLoading,
            isFetching: isUpdating
          }]}>
            <Row>
              <Col span={14}>
                <MacRegistrationListSettingForm editMode={editMode}/>
              </Col>
            </Row>
          </Loader>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
