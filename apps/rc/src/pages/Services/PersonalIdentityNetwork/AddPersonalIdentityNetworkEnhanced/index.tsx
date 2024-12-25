import { useMemo } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader }                                                                  from '@acx-ui/components'
import { useEdgePinActions }                                                           from '@acx-ui/rc/components'
import { getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'

import {
  getStepsByTopologyType,
  PersonalIdentityNetworkForm,
  Wireless
} from '../PersonalIdentityNetworkForm'
import { PersonalIdentityNetworkFormDataProvider } from '../PersonalIdentityNetworkForm/PersonalIdentityNetworkFormContext'

const AddPersonalIdentityNetworkEnhanced = () => {

  const { tenantId } = useParams()
  const { $t } = useIntl()
  const [form] = Form.useForm()

  // eslint-disable-next-line max-len
  const networkTopologyType = Form.useWatch('networkTopologyType', form) || form.getFieldValue('networkTopologyType')
  const { addPin } = useEdgePinActions()

  const tablePath = getServiceRoutePath(
    { type: ServiceType.PIN, oper: ServiceOperation.LIST })

  const steps = useMemo(() => {
    return getStepsByTopologyType(networkTopologyType || Wireless)
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
          hasPrerequisite
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

export default AddPersonalIdentityNetworkEnhanced