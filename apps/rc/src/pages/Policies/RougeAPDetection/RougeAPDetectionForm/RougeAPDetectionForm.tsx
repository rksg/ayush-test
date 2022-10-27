import { useRef, useReducer } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useAddRougePolicyMutation } from '@acx-ui/rc/services'
import {
  RougeAPDetectionContextType,
  RougeAPRule,
  RougeVenue
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import RougeAPDetectionContext , { mainReducer } from '../RougeAPDetectionContext'
import RougeAPDetectionScopeForm                 from '../RougeAPDetectionScope/RougeAPDetectionScopeForm'
import RougeAPDetectionSummaryForm               from '../RougeAPDetectionSummary/RougeAPDetectionSummaryForm'

import RougeAPDetectionSettingForm from './RougeAPDetectionSettingForm'

type RougeAPDetectionFormProps = {
  edit: boolean
}

const RougeAPDetectionForm = (props: RougeAPDetectionFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToPolicies = useTenantLink('/policies')
  const params = useParams()
  const { edit } = props

  const policyName = ''
  const description = '--'
  const tags:string[] = []
  const rules:RougeAPRule[] = []
  const venues:RougeVenue[] = []

  const formRef = useRef<StepsFormInstance<RougeAPDetectionContextType>>()
  const [state, dispatch] = useReducer(mainReducer, {
    policyName,
    tags,
    description,
    rules,
    venues
  })

  const [ createRougePolicy ] = useAddRougePolicyMutation()

  const handleAddRougeAPDetectionPolicy = async () => {
    try {
      await createRougePolicy({
        params,
        payload: state
      }).unwrap()
      navigate(linkToPolicies, { replace: true })
    } catch(error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <RougeAPDetectionContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={edit
          ? $t({ defaultMessage: 'Edit Rouge AP Detection Policy' })
          : $t({ defaultMessage: 'Add Rouge AP Detection Policy' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: '/policies' }
        ]}
      />
      <StepsForm<RougeAPDetectionContextType>
        formRef={formRef}
        onCancel={() => navigate(linkToPolicies)}
        onFinish={handleAddRougeAPDetectionPolicy}
      >
        <StepsForm.StepForm<RougeAPDetectionContextType>
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <RougeAPDetectionSettingForm edit={edit} formRef={formRef}/>
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='scope'
          title={$t({ defaultMessage: 'Scope' })}
        >
          <RougeAPDetectionScopeForm edit={edit}/>
        </StepsForm.StepForm>

        { !edit && <StepsForm.StepForm
          name='summary'
          title={$t({ defaultMessage: 'Summary' })}
        >
          <RougeAPDetectionSummaryForm />
        </StepsForm.StepForm> }
      </StepsForm>
    </RougeAPDetectionContext.Provider>
  )
}

export default RougeAPDetectionForm
