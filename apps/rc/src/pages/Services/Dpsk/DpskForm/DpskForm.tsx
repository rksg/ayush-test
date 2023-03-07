import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'


import {
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useCreateDpskMutation, useGetDpskQuery, useUpdateDpskMutation } from '@acx-ui/rc/services'
import {
  CreateDpskFormFields,
  PassphraseFormatEnum,
  ServiceType,
  getServiceRoutePath,
  ServiceOperation,
  DpskSaveData
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
  // eslint-disable-next-line max-len
  const linkToServices = useTenantLink(getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST }))
  const params = useParams()
  const { editMode = false, modalMode = false, modalCallBack } = props

  const [ createDpsk ] = useCreateDpskMutation()
  const [ updateDpsk ] = useUpdateDpskMutation()
  const { data: dataFromServer } = useGetDpskQuery({ params }, { skip: !editMode })
  const formRef = useRef<StepsFormInstance<CreateDpskFormFields>>()
  const initialValues: Partial<CreateDpskFormFields> = {
    passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
    passphraseLength: 18
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
        result = await updateDpsk({ params, payload: _.omit(dpskSaveData, 'id') }).unwrap()
      } else {
        result = await createDpsk({ payload: dpskSaveData }).unwrap()
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
          {
            text: $t({ defaultMessage: 'DPSK' }),
            link: getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST })
          }
        ]}
      />}
      <StepsForm<CreateDpskFormFields>
        formRef={formRef}
        onCancel={() => modalMode ? modalCallBack?.() : navigate(linkToServices)}
        onFinish={saveData}
      >
        <StepsForm.StepForm<CreateDpskFormFields>
          name='details'
          title={$t({ defaultMessage: 'Settings' })}
          initialValues={initialValues}
          preserve={modalMode ? false : true}
        >
          <DpskSettingsForm />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
