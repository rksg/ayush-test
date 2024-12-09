import React, { useEffect, useRef } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Loader, PageHeader, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import { Features, useIsTierAllowed }                                   from '@acx-ui/feature-toggle'
import {
  useAddMacRegListMutation,
  useDeleteAdaptivePolicySetFromMacListMutation,
  useGetMacRegListQuery,
  useUpdateAdaptivePolicySetToMacListMutation,
  useUpdateMacRegListMutation
} from '@acx-ui/rc/services'
import {
  MacRegistrationPoolFormFields,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation,
  getPolicyListRoutePath,
  MacRegistrationPool,
  transferDataToExpirationFormFields,
  transferExpirationFormFieldsToData
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

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
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST })
  const linkToList = useTenantLink(`/${tablePath}`)
  const navigate = useNavigate()
  const formRef = useRef<StepsFormLegacyInstance<MacRegistrationPoolFormFields>>()

  const { data, isLoading } = useGetMacRegListQuery({ params: { policyId } }, { skip: !editMode })
  const [addMacRegList] = useAddMacRegListMutation()
  const [updateMacRegList, { isLoading: isUpdating }] = useUpdateMacRegListMutation()

  const policyEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)

  const [bindPolicySet] = useUpdateAdaptivePolicySetToMacListMutation()
  const [unbindPolicySet] = useDeleteAdaptivePolicySetFromMacListMutation()

  useEffect(() => {
    if (data && editMode) {
      formRef.current?.setFieldsValue({
        name: data.name,
        autoCleanup: data.autoCleanup,
        ...transferDataToExpirationFormFields(data)
      })

      if(policyEnabled) {
        formRef.current?.setFieldsValue({
          defaultAccess: data.defaultAccess,
          policySetId: data.policySetId
        })
      }
    }
  }, [data, editMode])

  const handleAddList = async (data: MacRegistrationPoolFormFields) => {
    try {
      const saveData = {
        name: data.name,
        autoCleanup: data.autoCleanup,
        ...transferExpirationFormFieldsToData(data.expiration),
        defaultAccess: data.defaultAccess ?? 'ACCEPT'
      }
      // eslint-disable-next-line max-len
      const result = await addMacRegList({ payload: saveData }).unwrap() as MacRegistrationPool

      if (result.id && data.policySetId) {
        await bindPolicySet({ params: { policyId: result.id, policySetId: data.policySetId } })
      }

      modalMode ? modalCallBack?.(result) : navigate(linkToList, { replace: true })
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
        defaultAccess: formData.defaultAccess ?? 'ACCEPT'
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

      modalMode ? modalCallBack?.() : navigate(linkToList, { replace: true })
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
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'Network Control' }) },
          {
            text: intl.$t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: intl.$t({ defaultMessage: 'MAC Registration Lists' }),
            link: tablePath }
        ]}
      />}
      <StepsFormLegacy<MacRegistrationPoolFormFields>
        editMode={editMode}
        formRef={formRef}
        buttonLabel={{ submit: intl.$t({ defaultMessage: 'Apply' }) }}
        onCancel={() => modalMode ? modalCallBack?.() : navigate(linkToList)}
        onFinish={editMode ? handleEditList : handleAddList}>
        <StepsFormLegacy.StepForm<MacRegistrationPoolFormFields>>
          <Loader states={[{
            isLoading: isLoading,
            isFetching: isUpdating
          }]}>
            <Row>
              <Col span={14}>
                <MacRegistrationListSettingForm/>
              </Col>
            </Row>
          </Loader>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
