import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useCreateDpskMutation,
  useCreateDpskTemplateMutation,
  useCreateDpskWithIdentityGroupMutation,
  useGetDpskListQuery,
  useGetDpskQuery,
  useGetDpskTemplateQuery,
  useGetEnhancedDpskTemplateListQuery,
  useUpdateDpskMutation,
  useUpdateDpskTemplateMutation
} from '@acx-ui/rc/services'
import {
  CreateDpskFormFields,
  PassphraseFormatEnum,
  ServiceType,
  ServiceOperation,
  DpskSaveData,
  DeviceNumberType,
  DpskMutationResult,
  DpskNewFlowMutationResult,
  useServiceListBreadcrumb,
  useServicePageHeaderTitle,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher,
  TableResult,
  useServicePreviousPath,
  useConfigTemplate,
  ConfigTemplateType,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'

import { useEnforcedStatus } from '../../configTemplates'

import DpskSettingsForm                                               from './DpskSettingsForm'
import { transferFormFieldsToSaveData, transferSaveDataToFormFields } from './parser'

interface DpskFormProps {
  editMode?: boolean,
  modalMode?: boolean,
  modalCallBack?: (result?: DpskSaveData) => void
}

export function DpskForm (props: DpskFormProps) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const { pathname: previousPath } = useServicePreviousPath(ServiceType.DPSK, ServiceOperation.LIST)
  const routeToList = useTenantLink(getServiceRoutePath({
    type: ServiceType.DPSK,
    oper: ServiceOperation.LIST
  }))
  const params = useParams()
  const { editMode = false, modalMode = false, modalCallBack } = props

  const idAfterCreatedRef = useRef<string>()
  const { isTemplate } = useConfigTemplate()
  const isIdentityGroupRequired = useIsSplitOn(Features.DPSK_REQUIRE_IDENTITY_GROUP) && !isTemplate

  const { data: dpskList } = useConfigTemplateQueryFnSwitcher<TableResult<DpskSaveData>>({
    useQueryFn: useGetDpskListQuery,
    useTemplateQueryFn: useGetEnhancedDpskTemplateListQuery,
    skip: !isModalMode()
  })

  const [ createDpsk ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useCreateDpskMutation,
    useTemplateMutationFn: useCreateDpskTemplateMutation
  })
  const [ updateDpsk ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateDpskMutation,
    useTemplateMutationFn: useUpdateDpskTemplateMutation
  })
  const [ createDpskWithIdentityGroup ] = useCreateDpskWithIdentityGroupMutation()

  // eslint-disable-next-line max-len
  const { data: dataFromServer, isLoading, isFetching } = useConfigTemplateQueryFnSwitcher<DpskSaveData>({
    useQueryFn: useGetDpskQuery,
    useTemplateQueryFn: useGetDpskTemplateQuery,
    skip: !editMode
  })

  const formRef = useRef<StepsFormLegacyInstance<CreateDpskFormFields>>()
  const initialValues: Partial<CreateDpskFormFields> = {
    passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
    passphraseLength: 18,
    deviceNumberType: DeviceNumberType.UNLIMITED
  }
  const breadcrumb = useServiceListBreadcrumb(ServiceType.DPSK)
  const pageTitle = useServicePageHeaderTitle(editMode, ServiceType.DPSK)
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const { saveEnforcementConfig } = useConfigTemplate()
  const { getEnforcedStepsFormProps } = useEnforcedStatus(ConfigTemplateType.DPSK)

  function isModalMode (): boolean {
    return modalMode && !editMode
  }

  useEffect(() => {
    if (dataFromServer && editMode) {
      formRef.current?.setFieldsValue(transferSaveDataToFormFields(dataFromServer))
    }
  }, [dataFromServer, editMode])

  // This is for the new DPSK configuration flow,
  // in the new flow, the create API only responds with the request ID and the entity ID instead of the whole entity,
  // when the create process completes, we should find this entity for the modal callback
  useEffect(() => {
    if (!idAfterCreatedRef.current || !dpskList?.data) return

    const targetDpsk = dpskList.data.find(dpsk => dpsk.id === idAfterCreatedRef.current)
    if (targetDpsk) {
      modalCallBack?.(targetDpsk)
    }
  }, [idAfterCreatedRef, dpskList])

  const saveData = async (data: CreateDpskFormFields) => {
    const dpskSaveData = transferFormFieldsToSaveData(data)
    let result: DpskMutationResult
    let entityId: string | undefined

    try {
      if (editMode) {
        result = await updateDpsk({
          params: { ...params },
          payload: _.omit(dpskSaveData, 'id'),
          enableRbac
        }).unwrap()

        entityId = params.serviceId
      } else {
        if (isIdentityGroupRequired) {
          result = await createDpskWithIdentityGroup({
            params: { identityGroupId: dpskSaveData.identityId },
            payload: _.omit(dpskSaveData, 'identityId'),
            enableRbac
          }).unwrap()
        } else {
          result = await createDpsk({
            payload: dpskSaveData,
            enableRbac
          }).unwrap()
        }

        entityId = result.id
      }

      if (entityId) {
        await saveEnforcementConfig(entityId)
      }

      if (modalMode) {
        idAfterCreatedRef.current = (result as DpskNewFlowMutationResult).id
      } else {
        navigate(routeToList, { replace: true })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      {!modalMode && <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />}
      <Loader states={[{ isLoading, isFetching }]}>
        <StepsFormLegacy<CreateDpskFormFields>
          formRef={formRef}
          onCancel={() => modalMode ? modalCallBack?.() : navigate(previousPath)}
          onFinish={saveData}
          editMode={editMode}
          {...getEnforcedStepsFormProps('StepsFormLegacy', dataFromServer?.isEnforced)}
        >
          <StepsFormLegacy.StepForm<CreateDpskFormFields>
            name='details'
            title={$t({ defaultMessage: 'Settings' })}
            initialValues={initialValues}
            preserve={modalMode ? false : true}
          >
            <DpskSettingsForm
              modalMode={modalMode}
              editMode={editMode}
              isEnforced={dataFromServer?.isEnforced}
            />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Loader>
    </>
  )
}
