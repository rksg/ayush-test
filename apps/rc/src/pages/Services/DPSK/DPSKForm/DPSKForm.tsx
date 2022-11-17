import { useState, useRef } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useCreateDPSKMutation } from '@acx-ui/rc/services'
import {
  CreateDPSKFormFields,
  DPSKSaveData,
  PassphraseExpirationEnum,
  PassphraseFormatEnum
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { getServiceListRoutePath } from '../../serviceRouteUtils'
import DPSKSummary                 from '../DPSKSummary/DPSKSummary'

import DPSKSettingsForm         from './DPSKSettingsForm'
import { transferDetailToSave } from './parser'



export default function DPSKForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const params = useParams()

  const [createDPSK] = useCreateDPSKMutation()
  const formRef = useRef<StepsFormInstance<CreateDPSKFormFields>>()

  const [saveState, updateSaveState] = useState<DPSKSaveData>({
    name: '',
    tags: '',
    passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
    passphraseLength: 18,
    expiration: PassphraseExpirationEnum.UNLIMITED
  })

  const updateSaveData = (saveData: Partial<DPSKSaveData>) => {
    const newSavedata = { ...saveState, ...saveData }
    updateSaveState({ ...saveState, ...newSavedata })
  }

  const handleAddDPSK = async () => {
    try {
      await createDPSK({ params, payload: saveState }).unwrap()
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
      <StepsForm<CreateDPSKFormFields>
        formRef={formRef}
        onCancel={() => navigate(linkToServices)}
        onFinish={handleAddDPSK}
      >
        <StepsForm.StepForm<CreateDPSKFormFields>
          name='details'
          title={$t({ defaultMessage: 'Settings' })}
          onFinish={async (data) => {
            const detailsSaveData = transferDetailToSave(data)
            updateSaveData(detailsSaveData)
            return true
          }}
        >
          <DPSKSettingsForm />
        </StepsForm.StepForm>

        <StepsForm.StepForm name='summary' title={$t({ defaultMessage: 'Summary' })}>
          <DPSKSummary summaryData={saveState} />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
