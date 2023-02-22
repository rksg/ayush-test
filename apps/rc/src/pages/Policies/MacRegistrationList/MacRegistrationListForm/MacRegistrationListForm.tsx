import React, { useEffect, useRef } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Loader, PageHeader, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import {
  useAddMacRegListMutation,
  useGetMacRegListQuery,
  useUpdateMacRegListMutation
} from '@acx-ui/rc/services'
import {
  MacRegistrationPoolFormFields,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { transferDataToExpirationFormFields, transferExpirationFormFieldsToData } from '../MacRegistrationListUtils'

import { MacRegistrationListSettingForm } from './MacRegistrationListSetting/MacRegistrationListSettingForm'


interface MacRegistrationListFormProps {
  editMode?: boolean,
  modalMode?: boolean,
  modalCallBack?: () => void
}

export default function MacRegistrationListForm (props: MacRegistrationListFormProps) {
  const intl = useIntl()
  const { editMode = false, modalMode, modalCallBack } = props
  const { policyId } = useParams()
  // eslint-disable-next-line max-len
  const linkToList = useTenantLink('/' + getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST }))
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance<MacRegistrationPoolFormFields>>()

  const { data, isLoading } = useGetMacRegListQuery({ params: { policyId } }, { skip: !editMode })
  const [addMacRegList] = useAddMacRegListMutation()
  const [updateMacRegList, { isLoading: isUpdating }] = useUpdateMacRegListMutation()

  useEffect(() => {
    if (data && editMode) {
      formRef.current?.setFieldsValue({
        name: data.name,
        autoCleanup: data.autoCleanup,
        ...transferDataToExpirationFormFields(data),
        defaultAccess: data.defaultAccess,
        policySetId: data.policySetId
      })
    }
  }, [data, editMode])

  const handleAddList = async (data: MacRegistrationPoolFormFields) => {
    try {
      const saveData = {
        name: data.name,
        autoCleanup: data.autoCleanup,
        ...transferExpirationFormFieldsToData(data.expiration),
        defaultAccess: data.defaultAccess,
        policySetId: data.policySetId
      }
      await addMacRegList({ payload: saveData }).unwrap()

      showToast({
        type: 'success',
        content: intl.$t(
          { defaultMessage: 'List {name} was added' },
          { name: saveData.name }
        )
      })

      modalMode ? modalCallBack?.() : navigate(linkToList, { replace: true })
    } catch (error) {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' }),
        // FIXME: Correct the error message
        link: { onClick: () => alert(JSON.stringify(error)) }
      })
    }
  }

  const handleEditList = async (data: MacRegistrationPoolFormFields) => {
    try {
      const saveData = {
        name: data.name,
        ...transferExpirationFormFieldsToData(data.expiration),
        autoCleanup: data.autoCleanup,
        defaultAccess: data.defaultAccess,
        policySetId: data.policySetId
      }
      await updateMacRegList({
        params: { policyId },
        payload: saveData
      }).unwrap()

      showToast({
        type: 'success',
        content: intl.$t(
          { defaultMessage: 'List {name} was updated' },
          { name: saveData.name }
        )
      })

      modalMode ? modalCallBack?.() : navigate(linkToList, { replace: true })
    } catch (error) {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' }),
        // FIXME: Correct the error message
        link: { onClick: () => alert(JSON.stringify(error)) }
      })
    }
  }

  return (
    <>
      {!modalMode && <PageHeader
        title={editMode
          ? intl.$t({ defaultMessage: 'Configure {listName}' }, { listName: data?.name })
          : intl.$t({ defaultMessage: 'Add MAC Registration List' })}
        breadcrumb={[
          {
            text: intl.$t({ defaultMessage: 'Policies & Profiles > MAC Registration Lists' }),
            // eslint-disable-next-line max-len
            link: getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST })
          }
        ]}
      />}
      <StepsForm<MacRegistrationPoolFormFields>
        editMode={editMode}
        formRef={formRef}
        buttonLabel={{ submit: intl.$t({ defaultMessage: 'Apply' }) }}
        onCancel={() => modalMode ? modalCallBack?.() : navigate(linkToList)}
        onFinish={editMode ? handleEditList : handleAddList}>
        <StepsForm.StepForm<MacRegistrationPoolFormFields>>
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
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
