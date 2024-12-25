import { useMemo } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader }                                                                  from '@acx-ui/components'
import { Features }                                                                    from '@acx-ui/feature-toggle'
import { useEdgePinActions, useIsEdgeFeatureReady }                                    from '@acx-ui/rc/components'
import { getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'

import {
  AccessSwitchStep,
  DistributionSwitchStep,
  GeneralSettingsStep,
  getStepsByTopologyType,
  PersonalIdentityNetworkForm,
  SmartEdgeStep,
  SummaryStep,
  WirelessNetworkStep
} from '../PersonalIdentityNetworkForm'
import { Wireless }                                from '../PersonalIdentityNetworkForm/NetworkTopologyForm'
import { PersonalIdentityNetworkFormDataProvider } from '../PersonalIdentityNetworkForm/PersonalIdentityNetworkFormContext'

const AddPersonalIdentityNetwork = () => {

  const { tenantId } = useParams()
  const { $t } = useIntl()
  const isEdgePinEnhanceReady = useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE)
  const [form] = Form.useForm()
  // eslint-disable-next-line max-len
  const networkTopologyType = Form.useWatch('networkTopologyType', form) || form.getFieldValue('networkTopologyType')
  const { addPin } = useEdgePinActions()

  const tablePath = getServiceRoutePath(
    { type: ServiceType.PIN, oper: ServiceOperation.LIST })

  const steps = useMemo(() => {
    return isEdgePinEnhanceReady ?
      getStepsByTopologyType(networkTopologyType || Wireless) :
      // eslint-disable-next-line max-len
      [GeneralSettingsStep, SmartEdgeStep, WirelessNetworkStep, DistributionSwitchStep, AccessSwitchStep, SummaryStep]
  }, [networkTopologyType])

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Personal Identity Network Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'Personal Identity Network' }), link: tablePath }
        ]}
      />
      <PersonalIdentityNetworkFormDataProvider>
        <PersonalIdentityNetworkForm
          form={form}
          steps={steps}
          initialValues={{
            vxlanTunnelProfileId: tenantId,
            networkTopologyType: Wireless
          }}
          onFinish={addPin}
        />
      </PersonalIdentityNetworkFormDataProvider>
    </>
  )
}

export default AddPersonalIdentityNetwork
