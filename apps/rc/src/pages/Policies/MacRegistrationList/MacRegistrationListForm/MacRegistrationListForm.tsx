import React, { useEffect, useRef } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Loader, PageHeader, showToast, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                from '@acx-ui/feature-toggle'
import {
  useAddMacRegListMutation,
  useGetMacRegListQuery,
  useUpdateMacRegListMutation
} from '@acx-ui/rc/services'
import {
  MacRegistrationPoolFormFields,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation,
  getPolicyListRoutePath,
  MacRegistrationPool
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { transferDataToExpirationFormFields, transferExpirationFormFieldsToData } from '../MacRegistrationListUtils'

import { MacRegistrationListSettingForm } from './MacRegistrationListSetting/MacRegistrationListSettingForm'


interface MacRegistrationListFormProps {
  editMode?: boolean,
  modalMode?: boolean,
  modalCallBack?: (saveData?: MacRegistrationPool) => void
}

export default function MacRegistrationListForm (props: MacRegistrationListFormProps) {
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
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

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
        defaultAccess: data.defaultAccess ?? 'ACCEPT',
        policySetId: data.policySetId
      }
      const result = await addMacRegList({ payload: saveData }).unwrap() as MacRegistrationPool

      showToast({
        type: 'success',
        content: intl.$t(
          { defaultMessage: 'List {name} was added' },
          { name: saveData.name }
        )
      })

      modalMode ? modalCallBack?.(result) : navigate(linkToList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleEditList = async (data: MacRegistrationPoolFormFields) => {
    try {
      const saveData = {
        name: data.name,
        ...transferExpirationFormFieldsToData(data.expiration),
        autoCleanup: data.autoCleanup,
        defaultAccess: data.defaultAccess ?? 'ACCEPT',
        policySetId: data.policySetId ?? null
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
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      {!modalMode && <PageHeader
        title={editMode
          ? intl.$t({ defaultMessage: 'Configure {listName}' }, { listName: data?.name })
          : intl.$t({ defaultMessage: 'Add MAC Registration List' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: intl.$t({ defaultMessage: 'Network Control' }) },
          {
            text: intl.$t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: intl.$t({ defaultMessage: 'MAC Registration Lists' }),
            link: tablePath }
        ] : [{
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
