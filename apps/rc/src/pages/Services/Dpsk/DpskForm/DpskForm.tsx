import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { useDpskNewConfigFlowParams }                                    from '@acx-ui/rc/components'
import { useCreateDpskMutation, useGetDpskQuery, useUpdateDpskMutation } from '@acx-ui/rc/services'
import {
  CreateDpskFormFields,
  PassphraseFormatEnum,
  ServiceType,
  getServiceRoutePath,
  ServiceOperation,
  DpskSaveData,
  DeviceNumberType,
  getServiceListRoutePath
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

  const dpskNewConfigFlowParams = useDpskNewConfigFlowParams()
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

  useEffect(() => {
    if (dataFromServer && editMode) {
      formRef.current?.setFieldsValue(transferSaveDataToFormFields(dataFromServer))
    }
  }, [dataFromServer, editMode])

  const saveData = async (data: CreateDpskFormFields) => {
    const dpskSaveData = transferFormFieldsToSaveData(data)
    let result: DpskSaveData

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

      modalMode ? modalCallBack?.(result) : navigate(linkToServices, { replace: true })
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
        >
          <StepsFormLegacy.StepForm<CreateDpskFormFields>
            name='details'
            title={$t({ defaultMessage: 'Settings' })}
            initialValues={initialValues}
            preserve={modalMode ? false : true}
          >
            <DpskSettingsForm />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Loader>
    </>
  )
}
