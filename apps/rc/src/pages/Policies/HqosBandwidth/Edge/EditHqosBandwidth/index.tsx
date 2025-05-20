import { Form }    from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Loader, PageHeader }        from '@acx-ui/components'
import {
  useActivateHqosOnEdgeClusterMutation,
  useDeactivateHqosOnEdgeClusterMutation,
  useGetEdgeHqosProfileViewDataListQuery,
  useUpdateEdgeHqosProfileMutation
} from '@acx-ui/rc/services'
import {
  EdgeHqosViewData,
  PolicyOperation,
  PolicyType,
  TrafficClassSetting,
  usePolicyListBreadcrumb,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import HqosBandwidthForm, { HqosBandwidthFormModel } from '../HqosBandwidthForm'
import { ScopeForm }                                 from '../HqosBandwidthForm/ScopeForm'
import { SettingsForm }                              from '../HqosBandwidthForm/SettingsForm'


const EditEdgeHqosBandwidth = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const params = useParams()
  const qosListRoute = getPolicyRoutePath({
    type: PolicyType.HQOS_BANDWIDTH,
    oper: PolicyOperation.LIST
  })
  const linkToProfileList = useTenantLink(qosListRoute)
  const [updateEdgeHqosProfile] = useUpdateEdgeHqosProfileMutation()
  const [activateEdgeCluster] = useActivateHqosOnEdgeClusterMutation()
  const [deactivateEdgeCluster] = useDeactivateHqosOnEdgeClusterMutation()
  const { viewData, isLoading } = useGetEdgeHqosProfileViewDataListQuery(
    { payload: {
      filters: { id: [params.policyId] }
    } },
    {
      selectFromResult: ({ data, isLoading }) => ({
        viewData: data?.data?.[0] || {} as EdgeHqosViewData,
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

  const handleFinish = async (formData: HqosBandwidthFormModel) => {
    updateQosConfig(formData, viewData)
    changeEdgeClusterAssociation(formData)
  }

  const isChangedTrafficClassSettings =
   (req: TrafficClassSetting[], db: TrafficClassSetting[]) => {
     // eslint-disable-next-line max-len
     const sortedReq = _.sortBy(req, ['trafficClass', 'priority']).map(item => _(item).omitBy(_.isUndefined).omitBy(_.isNull).value())
     const sortedDb = _.sortBy(db, ['trafficClass', 'priority'])
     return !_.isEqual(sortedReq, sortedDb)
   }

  const updateQosConfig = async (reqConfig: HqosBandwidthFormModel, dbConfig: EdgeHqosViewData)=> {
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

      await updateEdgeHqosProfile({ params, payload }).unwrap()
      navigate(linkToProfileList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  const changeEdgeClusterAssociation = async (formData: HqosBandwidthFormModel) => {
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
        title={$t({ defaultMessage: 'Edit HQoS Bandwidth Profile' })}
        breadcrumb={usePolicyListBreadcrumb(PolicyType.HQOS_BANDWIDTH)}
      />
      <Loader states={[{ isLoading }]}>
        <HqosBandwidthForm
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

export default EditEdgeHqosBandwidth
