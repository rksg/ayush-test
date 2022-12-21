import React, { useEffect, useRef } from 'react'

import { Col, Row } from 'antd'
import moment       from 'moment-timezone'
import { useIntl }  from 'react-intl'

import { Loader, PageHeader, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import {
  useAddMacRegListMutation,
  useGetMacRegListQuery,
  useMacRegListsQuery,
  useUpdateMacRegListMutation
} from '@acx-ui/rc/services'
import {
  MacRegistrationPoolFormFields,
  MacRegistrationPool,
  useMacRegListTableQuery,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation, ExpirationDateEntity, ExpirationMode, ExpirationType
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { MacRegistrationListSettingForm } from './MacRegistrationListSetting/MacRegistrationListSettingForm'


interface MacRegistrationListFormProps {
  editMode?: boolean
}

export default function MacRegistrationListForm (props: MacRegistrationListFormProps) {
  const intl = useIntl()
  const { editMode = false } = props
  const { policyId } = useParams()
  // eslint-disable-next-line max-len
  const linkToList = useTenantLink('/' + getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST }))
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance<MacRegistrationPoolFormFields>>()
  // const [poolSaveState, setPoolSaveState] = useState<MacRegistrationPool>({})

  const { data, isLoading } = useGetMacRegListQuery({ params: { policyId } }, { skip: !editMode })
  const [addMacRegList] = useAddMacRegListMutation()
  const [updateMacRegList, { isLoading: isUpdating }] = useUpdateMacRegListMutation()

  const tableQuery = useMacRegListTableQuery({
    useQuery: useMacRegListsQuery,
    apiParams: { size: '10', page: '0' },
    defaultPayload: {}
  })

  useEffect(() => {
    if (data && editMode) {
      formRef.current?.setFieldsValue({
        name: data?.name,
        autoCleanup: data.autoCleanup,
        ...transferDataToExpirationFormFields(data)
        // defaultAccess
        // policyId
      })
      // setPoolSaveState({ ...data })
    }
  }, [data, editMode])

  const transferExpirationFormFieldsToData = (data: ExpirationDateEntity) => {
    let expiration
    if (data.mode === ExpirationMode.NEVER) {
      expiration = {
        expirationEnabled: false
      }
    } else if (data.mode === ExpirationMode.BY_DATE) {
      expiration = {
        expirationType: ExpirationType.SPECIFIED_DATE,
        expirationDate: moment.utc(data.date).format('YYYY-MM-DDT23:59:59[Z]'),
        expirationEnabled: true
      }
    } else {
      expiration = {
        expirationType: data.type,
        expirationOffset: data.offset,
        expirationEnabled: true
      }
    }
    return expiration
  }

  const transferDataToExpirationFormFields = (data: MacRegistrationPool) => {
    let expiration: ExpirationDateEntity = new ExpirationDateEntity()
    if (!data.expirationEnabled) {
      expiration.setToNever()
    } else if (data.expirationType === ExpirationType.SPECIFIED_DATE) {
      expiration.setToByDate(data.expirationDate!)
    } else {
      expiration.setToAfterTime(data.expirationType!, data.expirationOffset!)
    }
    return { expiration }
  }

  const handleAddList = async (data: MacRegistrationPoolFormFields) => {
    try {
      const saveData = {
        name: data.name,
        autoCleanup: data.autoCleanup,
        priority: (editMode ? undefined : tableQuery.data ? tableQuery.data.totalElements + 1 : 0),
        ...transferExpirationFormFieldsToData(data.expiration)
        // defaultAccess
        // policyId
      }
      await addMacRegList({ payload: saveData }).unwrap()
      navigate(linkToList, { replace: true })
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
        autoCleanup: data.autoCleanup
        // defaultAccess
        // policyId
      }
      await updateMacRegList({
        params: { policyId },
        payload: saveData
      }).unwrap()
      navigate(linkToList, { replace: true })
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
      <PageHeader
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
      />
      <StepsForm<MacRegistrationPoolFormFields>
        editMode={editMode}
        formRef={formRef}
        buttonLabel={{ submit: 'Apply' }}
        onCancel={() => navigate(linkToList)}
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
