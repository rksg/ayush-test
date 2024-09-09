import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PageHeader }                                                              from '@acx-ui/components'
import { useActivateHqosOnEdgeClusterMutation, useCreateEdgeHqosProfileMutation }  from '@acx-ui/rc/services'
import { PolicyOperation, PolicyType, getPolicyListRoutePath, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                              from '@acx-ui/react-router-dom'

import HqosBandwidthForm, { HqosBandwidthFormModel } from '../HqosBandwidthForm'
import { ScopeForm }                               from '../HqosBandwidthForm/ScopeForm'
import { SettingsForm }                            from '../HqosBandwidthForm/SettingsForm'
import { SummaryForm }                             from '../HqosBandwidthForm/SummaryForm'


const AddEdgeHqosBandwidth = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const qosListRoute = getPolicyRoutePath({
    type: PolicyType.HQOS_BANDWIDTH,
    oper: PolicyOperation.LIST
  })

  const linkToProfileList = useTenantLink(qosListRoute)
  const [addQosProfile] = useCreateEdgeHqosProfileMutation()
  const [activateEdgeCluster] = useActivateHqosOnEdgeClusterMutation()
  const [form] = Form.useForm()

  const steps = [
    {
      title: $t({ defaultMessage: 'Settings' }),
      content: <SettingsForm />
    },
    {
      title: $t({ defaultMessage: 'Scope' }),
      content: <ScopeForm />
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: <SummaryForm />
    }
  ]

  const addEdgeClusterAssociation = async (qosId?:string, formData?: HqosBandwidthFormModel) => {
    const activateChangedClusters = formData?.activateChangedClusters
    const activateChangedClustersInfo = formData?.activateChangedClustersInfo
    if(!activateChangedClusters ) {
      return
    }
    const changedKeys = Object.keys(activateChangedClusters)
    const activateClusterIds = changedKeys.filter(k => activateChangedClusters[k] === true)
    if(!activateClusterIds || !activateChangedClustersInfo) {
      return
    }

    activateClusterIds.forEach(clusterId => {
      activateEdgeCluster({ params: {
        policyId: qosId,
        venueId: activateChangedClustersInfo[clusterId].venueId,
        edgeClusterId: clusterId
      } }).unwrap()
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFinish = async (formData: HqosBandwidthFormModel) => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        trafficClassSettings: formData.trafficClassSettings
      }

      const addQosResponse = await addQosProfile({ payload }).unwrap()
      const qosId = addQosResponse?.response?.id

      addEdgeClusterAssociation(qosId, formData)

      navigate(linkToProfileList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }


  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add QoS Bandwidth Profile' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) },
          { text: $t({ defaultMessage: 'QoS Bandwidth' }), link: qosListRoute }
        ]}
      />
      <HqosBandwidthForm
        form={form}
        steps={steps}
        onFinish={handleFinish}
        onCancel={() => navigate(linkToProfileList)}
      />
    </>
  )
}

export default AddEdgeHqosBandwidth
