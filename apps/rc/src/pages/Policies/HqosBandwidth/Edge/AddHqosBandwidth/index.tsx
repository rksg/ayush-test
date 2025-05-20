import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PageHeader }                                                                                                 from '@acx-ui/components'
import { useActivateHqosOnEdgeClusterMutation, useCreateEdgeHqosProfileMutation }                                     from '@acx-ui/rc/services'
import { CommonErrorsResult, CommonResult, PolicyOperation, PolicyType, usePolicyListBreadcrumb, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                                                                 from '@acx-ui/react-router-dom'
import { CatchErrorDetails }                                                                                          from '@acx-ui/utils'

import HqosBandwidthForm, { HqosBandwidthFormModel } from '../HqosBandwidthForm'
import { ScopeForm }                                 from '../HqosBandwidthForm/ScopeForm'
import { SettingsForm }                              from '../HqosBandwidthForm/SettingsForm'
import { SummaryForm }                               from '../HqosBandwidthForm/SummaryForm'


const getActivateClusterIds = (
  activateChangedClusters?:{ [key:string]:boolean },
  // eslint-disable-next-line max-len
  activateChangedClustersInfo?:{ [key:string]:{ clusterName:string, venueId:string, venueName:string } }
) => {

  if(!activateChangedClusters ) {
    return []
  }
  const changedKeys = Object.keys(activateChangedClusters)
  const activateClusterIds = changedKeys.filter(k => activateChangedClusters[k] === true)
  if(!activateClusterIds || !activateChangedClustersInfo) {
    return []
  }
  return activateClusterIds
}

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

  const addEdgeClusterAssociation = async (qosId?:string, activateClusterIds?: string[],
    activateChangedClustersInfo?:{ [key:string]:
      { clusterName:string, venueId:string, venueName:string } }
  )
  : Promise<CommonResult[] | CommonErrorsResult<CatchErrorDetails>> => {

    const requiredActions: CommonResult[] | CommonErrorsResult<CatchErrorDetails> =[]
    activateClusterIds?.forEach(clusterId => {
      requiredActions.push(activateEdgeCluster({ params: {
        policyId: qosId,
        venueId: activateChangedClustersInfo? activateChangedClustersInfo[clusterId].venueId:'',
        edgeClusterId: clusterId
      } }))
    })
    try {
      return await Promise.all(requiredActions)
    } catch(error) {
      return error as CommonErrorsResult<CatchErrorDetails>
    }
  }

  const addHqosAction = async (req: {
    formData: HqosBandwidthFormModel,
    callback?: (res: (CommonResult[]
      | CommonErrorsResult<CatchErrorDetails>)) => void
  }) => {
    const { formData, callback } = req
    const payload = {
      name: formData.name,
      description: formData.description,
      trafficClassSettings: formData.trafficClassSettings
    }
    return await addQosProfile({
      payload,
      callback: async (addResponse: CommonResult) => {
        const hqosId = addResponse.response?.id
        const allResults = []
        if (!hqosId) {
          // eslint-disable-next-line no-console
          console.error('empty hqos id')
          callback?.([])
          return
        }
        allResults.push(addResponse)
        const activateChangedClusters = formData?.activateChangedClusters
        const activateChangedClustersInfo = formData?.activateChangedClustersInfo
        // eslint-disable-next-line max-len
        const activateClusterIds = getActivateClusterIds(activateChangedClusters, activateChangedClustersInfo)
        if(activateClusterIds.length === 0) {
          callback?.(allResults)
          return
        }

        try {
          // eslint-disable-next-line max-len
          const reqResult = await addEdgeClusterAssociation(hqosId, activateClusterIds, activateChangedClustersInfo)
          callback?.(reqResult)
        } catch(error) {
          callback?.(error as CommonErrorsResult<CatchErrorDetails>)
        }
      }
    }).unwrap()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFinish = async (formData: HqosBandwidthFormModel) => {
    try {
      await new Promise(async (resolve, reject) => {
        await addHqosAction({
          formData,
          callback: (result) => {
            // callback is after all RBAC related APIs sent
            if (Array.isArray(result)) {
              resolve(true)
            } else {
              reject(result)
            }
          }
        // need to catch basic service profile failed
        }).catch(reject)
      })

      navigate(linkToProfileList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }


  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add HQoS Bandwidth Profile' })}
        breadcrumb={usePolicyListBreadcrumb(PolicyType.HQOS_BANDWIDTH)}
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
