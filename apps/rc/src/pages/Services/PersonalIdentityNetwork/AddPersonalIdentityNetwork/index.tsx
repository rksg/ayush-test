
import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader }                               from '@acx-ui/components'
import { Features }                                 from '@acx-ui/feature-toggle'
import { useEdgePinActions, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { ServiceType, useServiceListBreadcrumb }    from '@acx-ui/rc/utils'

import {
  AccessSwitchStep,
  DistributionSwitchStep,
  GeneralSettingsStep,
  PersonalIdentityNetworkForm,
  SmartEdgeStep,
  SummaryStep,
  WirelessNetworkStep,
  PrerequisiteStep
} from '../PersonalIdentityNetworkForm'
import { PersonalIdentityNetworkFormDataProvider } from '../PersonalIdentityNetworkForm/PersonalIdentityNetworkFormContext'

// eslint-disable-next-line max-len
const pinSteps = [GeneralSettingsStep, SmartEdgeStep, WirelessNetworkStep, DistributionSwitchStep, AccessSwitchStep, SummaryStep]
const pinEnhancedSteps = [PrerequisiteStep].concat(pinSteps)

const AddPersonalIdentityNetwork = () => {
  const isEdgePinEnhancementReady = useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE)
  const isL2GreEnabled = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)
  const { tenantId } = useParams()
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { addPin } = useEdgePinActions()

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Personal Identity Network Service' })}
        breadcrumb={useServiceListBreadcrumb(ServiceType.PIN)}
      />
      <PersonalIdentityNetworkFormDataProvider>
        <PersonalIdentityNetworkForm
          form={form}
          hasPrerequisite={isEdgePinEnhancementReady}
          steps={isEdgePinEnhancementReady ? pinEnhancedSteps : pinSteps}
          initialValues={{
            vxlanTunnelProfileId: isL2GreEnabled ? undefined : tenantId
          }}
          onFinish={addPin}
        />
      </PersonalIdentityNetworkFormDataProvider>
    </>
  )
}

export default AddPersonalIdentityNetwork
