import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { useDpskNewConfigFlowParams } from '@acx-ui/rc/components'
import {
  useCreateDpskMutation,
  useGetDpskListQuery,
  useGetDpskQuery,
  useUpdateDpskMutation
} from '@acx-ui/rc/services'
import {
  CreateDpskFormFields,
  PassphraseFormatEnum,
  ServiceType,
  getServiceRoutePath,
  ServiceOperation,
  DpskSaveData,
  DeviceNumberType,
  getServiceListRoutePath,
  DpskMutationResult,
  DpskNewFlowMutationResult
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import DpskSettingsForm                                               from './DpskSettingsForm'
import { transferFormFieldsToSaveData, transferSaveDataToFormFields } from './parser'

interface DpskFormProps {
  editMode?: boolean,
  modalMode?: boolean,
  modalCallBack?: (result?: DpskSaveData) => void
}

export default function DpskForm (props: DpskFormProps) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tablePath = getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST })
  const linkToServices = useTenantLink(tablePath)
  const params = useParams()
  const { editMode = false, modalMode = false, modalCallBack } = props

  const idAfterCreatedRef = useRef<string>()
  const isNewConfigFlow = useIsSplitOn(Features.DPSK_NEW_CONFIG_FLOW_TOGGLE)
  const dpskNewConfigFlowParams = useDpskNewConfigFlowParams()
  const { data: dpskList } = useGetDpskListQuery({ params: dpskNewConfigFlowParams },
    { skip: !isModalModeForNewConfigFlow() })
  const [ createDpsk ] = useCreateDpskMutation()
  const [ updateDpsk ] = useUpdateDpskMutation()
  const {
    data: dataFromServer,
    isLoading,
    isFetching
  } = useGetDpskQuery({ params: { ...params, ...dpskNewConfigFlowParams } }, { skip: !editMode })
  const formRef = useRef<StepsFormLegacyInstance<CreateDpskFormFields>>()
  const initialValues: Partial<CreateDpskFormFields> = {
    passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
    passphraseLength: 18,
    deviceNumberType: DeviceNumberType.UNLIMITED
  }

  function isModalModeForNewConfigFlow (): boolean {
    return modalMode && isNewConfigFlow && !editMode
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

    try {
      if (editMode) {
        result = await updateDpsk({
          params: { ...params, ...dpskNewConfigFlowParams },
          payload: _.omit(dpskSaveData, 'id')
        }).unwrap()
      } else {
        result = await createDpsk({
          params: dpskNewConfigFlowParams,
          payload: dpskSaveData
        }).unwrap()
      }

      if (modalMode) {
        if (isNewConfigFlow) {
          idAfterCreatedRef.current = (result as DpskNewFlowMutationResult).id
        } else {
          modalCallBack?.(result as DpskSaveData)
        }
      } else {
        navigate(linkToServices, { replace: true })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      {!modalMode && <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit DPSK Service' })
          : $t({ defaultMessage: 'Add DPSK Service' })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'DPSK' }),
            link: tablePath
          }
        ]}
      />}
      <Loader states={[{ isLoading, isFetching }]}>
        <StepsFormLegacy<CreateDpskFormFields>
          formRef={formRef}
          onCancel={() => modalMode ? modalCallBack?.() : navigate(linkToServices)}
          onFinish={saveData}
          buttonLabel={{
            submit: editMode
              ? $t({ defaultMessage: 'Apply' })
              : $t({ defaultMessage: 'Add' })
          }}
        >
          <StepsFormLegacy.StepForm<CreateDpskFormFields>
            name='details'
            title={$t({ defaultMessage: 'Settings' })}
            initialValues={initialValues}
            preserve={modalMode ? false : true}
          >
            <DpskSettingsForm modalMode={modalMode} />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Loader>
    </>
  )
}
