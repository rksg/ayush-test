import { useState, useRef, useEffect } from 'react'

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
  DpskSaveData,
  PassphraseFormatEnum
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { getServiceListRoutePath } from '../../serviceRouteUtils'

import DpskSettingsForm                 from './DpskSettingsForm'
import { transferFormFieldsToSaveData } from './parser'

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

  const [data, setData] = useState<DpskSaveData>({
    name: '',
    passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
    passphraseLength: 18,
    expirationType: null
  })

  useEffect(() => {
    if (dataFromServer && editMode) {
      setData(dataFromServer)
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
        >
          <DpskSettingsForm data={data} />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
