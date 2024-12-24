import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader }                                                                  from '@acx-ui/components'
import { useEdgePinActions }                                                           from '@acx-ui/rc/components'
import { getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'

import { PersonalIdentityNetworkForm }             from '../PersonalIdentityNetworkForm'
import { AccessSwitchForm }                        from '../PersonalIdentityNetworkForm/AccessSwitchForm'
import { DistributionSwitchForm }                  from '../PersonalIdentityNetworkForm/DistributionSwitchForm'
import { GeneralSettingsForm }                     from '../PersonalIdentityNetworkForm/GeneralSettingsForm'
import { PersonalIdentityNetworkFormDataProvider } from '../PersonalIdentityNetworkForm/PersonalIdentityNetworkFormContext'
import { SmartEdgeForm }                           from '../PersonalIdentityNetworkForm/SmartEdgeForm'
import { SummaryForm }                             from '../PersonalIdentityNetworkForm/SummaryForm'
import { WirelessNetworkForm }                     from '../PersonalIdentityNetworkForm/WirelessNetworkForm'

import { Prerequisition } from './Prerequisition'

const AddPersonalIdentityNetworkEnahanced = () => {
  const { tenantId } = useParams()
  const { $t } = useIntl()
  const { addPin } = useEdgePinActions()

  const tablePath = getServiceRoutePath(
    { type: ServiceType.PIN, oper: ServiceOperation.LIST })

  const steps = [
    {
      title: $t({ defaultMessage: 'Prerequisition' }),
      content: <Prerequisition />
    },
    {
      title: $t({ defaultMessage: 'General Settings' }),
      content: <GeneralSettingsForm />
    },
    {
      title: $t({ defaultMessage: 'RUCKUS Edge' }),
      content: <SmartEdgeForm />
    },
    {
      title: $t({ defaultMessage: 'Wireless Network' }),
      content: <WirelessNetworkForm />
    },
    {
      title: $t({ defaultMessage: 'Dist. Switch' }),
      content: <DistributionSwitchForm />
    },
    {
      title: $t({ defaultMessage: 'Access Switch' }),
      content: <AccessSwitchForm />
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: <SummaryForm />
    }
  ]

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
          steps={steps}
          initialValues={{
            vxlanTunnelProfileId: tenantId
          }}
          hasPrerequisition
          onFinish={addPin}
        />
      </PersonalIdentityNetworkFormDataProvider>
    </>
  )
}

export default AddPersonalIdentityNetworkEnahanced