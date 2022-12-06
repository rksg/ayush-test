import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'


import {
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useCreateDpskMutation, useGetDpskQuery, useUpdateDpskMutation } from '@acx-ui/rc/services'
import {
  CreateDpskFormFields,
  PassphraseFormatEnum,
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
  editMode?: boolean
}

export default function DpskForm (props: DpskFormProps) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink(getServiceListRoutePath(true))
  const params = useParams()
  const { editMode = false } = props

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

    try {
      if (editMode) {
        await updateDpsk({ params, payload: _.omit(dpskSaveData, 'id') }).unwrap()
      } else {
        await createDpsk({ params, payload: dpskSaveData }).unwrap()
      }

      navigate(linkToServices, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add DPSK service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: getServiceListRoutePath(true) }
        ]}
      />
      <StepsForm<CreateDpskFormFields>
        formRef={formRef}
        onCancel={() => navigate(linkToServices)}
        onFinish={saveData}
      >
        <StepsForm.StepForm<CreateDpskFormFields>
          name='details'
          title={$t({ defaultMessage: 'Settings' })}
          initialValues={initialValues}
        >
          <DpskSettingsForm />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
