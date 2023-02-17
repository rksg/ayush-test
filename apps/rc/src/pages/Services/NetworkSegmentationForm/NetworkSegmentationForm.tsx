import { useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader, StepsForm, StepsFormInstance } from '@acx-ui/components'
import { NetworkSegmentationSaveData }              from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }    from '@acx-ui/react-router-dom'

import AccessSwitchSetting            from './AccessSwitch/AccessSwitchSetting'
import DistributionSwitchSetting      from './DistributionSwitch/DistributionSwitchSetting'
import { GeneralSettings }            from './GeneralSettings'
import NetworkSegmentationFormContext from './NetworkSegmentationFormContext'


export default function NetworkSegmentationForm () {
  const { $t } = useIntl()

  const params = useParams()

  const editMode = params.action === 'edit'

  const formRef = useRef<StepsFormInstance<NetworkSegmentationSaveData>>()

  const navigate = useNavigate()

  const linkToServices = useTenantLink('/services')

  const [ saveState, updateSaveState ] = useState<NetworkSegmentationSaveData>({
    name: ''
  })

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Network Segmentation' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />

      <NetworkSegmentationFormContext.Provider value={{ editMode, saveState, updateSaveState }}>
        <StepsForm<NetworkSegmentationSaveData>
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToServices)}
        >
          <StepsForm.StepForm
            name='generalSettings'
            title={$t({ defaultMessage: 'General Settings' })}
            onFinish={async (data) => {
              updateSaveState(data)
              return true
            }}
          >
            <GeneralSettings/>
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='smartEdge'
            title={$t({ defaultMessage: 'SmartEdge' })}
          >

          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='distSwitch'
            title={$t({ defaultMessage: 'Dist. Switch' })}
            onFinish={async (data) => {
              updateSaveState({ ...saveState, ...data })
              return true
            }}
          >
            <DistributionSwitchSetting />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='accessSwitch'
            title={$t({ defaultMessage: 'Access Switch' })}
          >
            <AccessSwitchSetting />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='summary'
            title={$t({ defaultMessage: 'Summary' })}
          >

          </StepsForm.StepForm>

        </StepsForm>

      </NetworkSegmentationFormContext.Provider>


    </>
  )
}
