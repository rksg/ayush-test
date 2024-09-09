import { Form }    from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Loader, PageHeader }       from '@acx-ui/components'
import {
  useActivateQosOnEdgeClusterMutation,
  useDeactivateQosOnEdgeClusterMutation,
  useGetEdgeQosProfileViewDataListQuery,
  useUpdateEdgeQosProfileMutation
} from '@acx-ui/rc/services'
import {
  EdgeQosViewData,
  PolicyOperation,
  PolicyType,
  TrafficClassSetting,
  getPolicyListRoutePath,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import QosBandwidthForm, { QosBandwidthFormModel } from '../HqosBandwidthForm'
import { ScopeForm }                               from '../HqosBandwidthForm/ScopeForm'
import { SettingsForm }                            from '../HqosBandwidthForm/SettingsForm'


const EditEdgeQosBandwidth = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const params = useParams()
  const qosListRoute = getPolicyRoutePath({
    type: PolicyType.HQOS_BANDWIDTH,
    oper: PolicyOperation.LIST
  })
  const linkToProfileList = useTenantLink(qosListRoute)
  const [updateEdgeQosProfile] = useUpdateEdgeQosProfileMutation()
  const [activateEdgeCluster] = useActivateQosOnEdgeClusterMutation()
  const [deactivateEdgeCluster] = useDeactivateQosOnEdgeClusterMutation()
  // const { data, isLoading } = useGetEdgeQosProfileByIdQuery({ params })
  const { viewData, isLoading } = useGetEdgeQosProfileViewDataListQuery(
    { payload: {
      filters: { id: [params.policyId] }
    } },
    {
      selectFromResult: ({ data, isLoading }) => ({
        viewData: data?.data?.[0] || {} as EdgeQosViewData,
        isLoading
      })
    }
  )

  const steps = [
    {
      title: $t({ defaultMessage: 'Settings' }),
      content: <SettingsForm />
    },
    {
      title: $t({ defaultMessage: 'Scope' }),
      content: <ScopeForm />
    }
  ]

  const handleFinish = async (formData: QosBandwidthFormModel) => {
    updateQosConfig(formData, viewData)
    changeEdgeClusterAssociation(formData)
  }

  const isChangedTrafficClassSettings =
   (req: TrafficClassSetting[], db: TrafficClassSetting[]) => {
     const diffPriorityScheduling = _.differenceBy(
       req, db, 'priorityScheduling')
     const diffMaxBandwidth = _.differenceBy(
       req, db, 'maxBandwidth')
     const diffMinBandwidth = _.differenceBy(
       req, db, 'minBandwidth')
     if (diffPriorityScheduling.length>0
      || diffMaxBandwidth.length>0
      || diffMinBandwidth.length>0) {
       return true
     }
     return false
   }

  const updateQosConfig = async (reqConfig: QosBandwidthFormModel, dbConfig: EdgeQosViewData)=> {
    if(reqConfig.name === dbConfig.name && reqConfig.description === dbConfig.description
      && !isChangedTrafficClassSettings(
        reqConfig.trafficClassSettings??[], dbConfig.trafficClassSettings??[])
    ) {
      navigate(linkToProfileList, { replace: true })
      return
    }

    try {
      const payload = {
        name: reqConfig.name,
        description: reqConfig.description,
        trafficClassSettings: reqConfig.trafficClassSettings
      }

      await updateEdgeQosProfile({ params, payload }).unwrap()
      navigate(linkToProfileList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  const changeEdgeClusterAssociation = async (formData: QosBandwidthFormModel) => {
    const activateChangedClusters = formData.activateChangedClusters
    const activateChangedClustersInfo = formData.activateChangedClustersInfo??{}
    const reqClusterIds = viewData.edgeClusterIds??[]
    if(!activateChangedClusters ) {
      navigate(linkToProfileList, { replace: true })
      return
    }

    const changedKeys = Object.keys(activateChangedClusters)
    const activateClusterIds = changedKeys.filter(k => activateChangedClusters[k] === true)
    if(_.isEqual(reqClusterIds, activateClusterIds)) {
      navigate(linkToProfileList, { replace: true })
      return
    }

    const disabedClusterIds = changedKeys.filter(k => activateChangedClusters[k] === false)
    const deactivateClusterIds = disabedClusterIds.filter(d => reqClusterIds?.includes(d))

    activateClusterIds.forEach(clusterId => {
      const clusterInfo = activateChangedClustersInfo[clusterId]
      if(clusterInfo) {
        activateEdgeCluster({ params: {
          policyId: params.policyId,
          venueId: clusterInfo.venueId,
          edgeClusterId: clusterId
        } }).unwrap()
      }

    })

    deactivateClusterIds.forEach(clusterId => {
      const clusterInfo = activateChangedClustersInfo[clusterId]
      if(clusterInfo) {
        deactivateEdgeCluster({ params: {
          policyId: params.policyId,
          venueId: activateChangedClustersInfo[clusterId].venueId,
          edgeClusterId: clusterId
        } }).unwrap()
      }
    })

  }


  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Edit QoS Bandwidth Profile' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) },
          { text: $t({ defaultMessage: 'QoS Bandwidth' }), link: qosListRoute }
        ]}
      />
      <Loader states={[{ isLoading }]}>
        <QosBandwidthForm
          form={form}
          steps={steps}
          onFinish={handleFinish}
          editData={viewData}
          onCancel={() => navigate(linkToProfileList)}
        />
      </Loader>
    </>
  )
}

export default EditEdgeQosBandwidth
