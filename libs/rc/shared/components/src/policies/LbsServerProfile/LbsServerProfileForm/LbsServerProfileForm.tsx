import { useEffect, useRef } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import {
  GridCol,
  GridRow,
  PageHeader,
  showActionModal,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import {
  useAddLbsServerProfileMutation,
  useGetLbsServerProfileQuery,
  useGetLbsServerProfileListQuery,
  useUpdateLbsServerProfileMutation
} from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  LbsServerProfileContext,
  usePolicyPageHeaderTitle,
  getPolicyRoutePath,
  usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'
import { CommonResult }  from '@acx-ui/user'

import LbsServerProfileSettingForm from './LbsServerProfileSettingForm'


type LbsServerProfileFormProps = {
  editMode?: boolean,
  modalMode?: boolean,
  modalCallBack?: (id?: string) => void
}

export const LbsServerProfileForm = (props: LbsServerProfileFormProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const tablePath = getPolicyRoutePath({
    type: PolicyType.LBS_SERVER_PROFILE,
    oper: PolicyOperation.LIST
  })
  const linkToPolicies = useTenantLink(tablePath)

  const { editMode = false, modalMode = false, modalCallBack } = props

  const formRef = useRef<StepsFormLegacyInstance<LbsServerProfileContext>>()
  const { data } = useGetLbsServerProfileQuery({ params }, { skip: !editMode })
  const { data: list } = useGetLbsServerProfileListQuery({
    params,
    payload: {
      fields: ['id', 'name', 'lbsServerVenueName', 'server'], sortField: 'name',
      sortOrder: 'ASC', page: 1, pageSize: 10000
    }
  })
  const [createLbsServerProfile] = useAddLbsServerProfileMutation()
  const [updateLbsServerProfile] = useUpdateLbsServerProfileMutation()

  const breadcrumb = usePolicyListBreadcrumb(PolicyType.LBS_SERVER_PROFILE)
  const pageTitle = usePolicyPageHeaderTitle(editMode, PolicyType.LBS_SERVER_PROFILE)

  useEffect(() => {
    if (data) {
      const context = { ...data }
      formRef?.current?.setFieldsValue(context)
    }
  }, [data])

  const handleLbsServerProfile = async (formData: LbsServerProfileContext) => {
    const payload = { ...formData }
    if (isDuplicateProfile(payload)) {
      return
    }
    await saveLbsServerProfile(payload)
  }

  const isDuplicateProfile = (payload: LbsServerProfileContext) => {
    const otherProfiles = list?.data?.filter((o) => params?.policyId !== o.id)
    const isDuplicated = otherProfiles?.some((o) =>
      // eslint-disable-next-line max-len
      payload.lbsServerVenueName === o.lbsServerVenueName && payload.serverAddress === o.server.split(':')[0])

    if (isDuplicated) {
      // eslint-disable-next-line max-len
      const errorMessage = $t({ defaultMessage: 'The LBS Server <VenueSingular></VenueSingular> Name and Server Address are duplicates of another profile' })
      showActionModal({
        type: 'error',
        content: errorMessage
      })
    }
    return isDuplicated
  }

  const saveLbsServerProfile = async (payload: LbsServerProfileContext) => {
    try {
      if (!editMode) {
        await createLbsServerProfile({
          params,
          payload,
          callback: async (res: CommonResult) => {
            const id = res.response?.id
            payload.id = id
            if (modalMode) {
              modalCallBack?.(id)
            }
          }
        }).unwrap().then(() => {
          if (!modalMode) {
            navigate(linkToPolicies, { replace: true })
          }
        })
      } else {
        await updateLbsServerProfile({
          params,
          payload
        }).unwrap()
        modalMode ? modalCallBack?.() : navigate(linkToPolicies, { replace: true })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (<>
    {!modalMode &&
      <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />
    }
    <StepsFormLegacy<LbsServerProfileContext>
      formRef={formRef}
      editMode={editMode}
      onCancel={() => modalMode ? modalCallBack?.() : navigate(linkToPolicies, { replace: true })}
      onFinish={handleLbsServerProfile}
    >
      <StepsFormLegacy.StepForm>
        <GridRow>
          <GridCol col={{ span: modalMode ? 24 : 10 }}>
            <LbsServerProfileSettingForm list={list}/>
          </GridCol>
        </GridRow>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </>)
}
