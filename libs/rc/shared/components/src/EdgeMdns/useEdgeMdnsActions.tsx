import { differenceBy } from 'lodash'

import {
  useActivateEdgeMdnsProxyClusterMutation,
  useAddEdgeMdnsProxyMutation,
  useDeactivateEdgeMdnsProxyClusterMutation,
  useUpdateEdgeMdnsProxyMutation
} from '@acx-ui/rc/services'
import { EdgeMdnsProxyActivation, EdgeMdnsProxyViewData } from '@acx-ui/rc/utils'
import { CommonResult }                                   from '@acx-ui/user'

import { edgeMdnsFormRequestPreProcess } from './edgeMdnsUtils'

// eslint-disable-next-line max-len
export const differenceVenueClusters = (first: EdgeMdnsProxyActivation[], second: EdgeMdnsProxyActivation[]) => {
  return differenceBy(first, second, (item) => item.venueId + item.edgeClusterId)
}

export const useEdgeMdnsActions = () => {
  const [addEdgeMdns] = useAddEdgeMdnsProxyMutation()
  const [updateEdgeMdns] = useUpdateEdgeMdnsProxyMutation()

  const [activateEdgeMdns] = useActivateEdgeMdnsProxyClusterMutation()
  const [deactivateEdgeMdns] = useDeactivateEdgeMdnsProxyClusterMutation()

  const createEdgeMdns = async (formData: EdgeMdnsProxyViewData): Promise<CommonResult> => {
    const payload = edgeMdnsFormRequestPreProcess(formData)

    return new Promise(async (resolve, reject) => {
      await addEdgeMdns({
        payload,
        callback: (result: CommonResult) => {
          // callback is after all RBAC related APIs sent
          if (Array.isArray(result)) {
            // do activation
            const actions = formData.activations?.map(item =>
              activateEdgeMdnsCluster(result[0].id, item.edgeClusterId))

            if (actions) {
              Promise.all(actions).then(() => resolve(result))
            } else {
              resolve(result)
            }
          } else {
            reject(result)
          }
        }
        // need to catch basic service profile failed
      }).unwrap()
        .catch(reject)
    })
  }

  // eslint-disable-next-line max-len
  const editEdgeMdns = async (formData: EdgeMdnsProxyViewData, originData: EdgeMdnsProxyViewData): Promise<CommonResult> => {
    const { id, ...otherFormData } = formData
    const payload = edgeMdnsFormRequestPreProcess(otherFormData)

    if (!id) return Promise.reject(new Error('id is required'))

    const actions = [updateEdgeMdns({
      params: { id },
      payload
    }).unwrap()]

    // do activation
    // eslint-disable-next-line max-len
    const activates = differenceVenueClusters(formData.activations ?? [], originData.activations ?? [])
    actions.push(...activates?.map(item =>
      activateEdgeMdnsCluster(id, item.edgeClusterId)))

    // eslint-disable-next-line max-len
    const deactivates = differenceVenueClusters(originData.activations ?? [], formData.activations ?? [])
    actions.push(...deactivates?.map(item =>
      deactivateEdgeMdnsCluster(id, item.edgeClusterId)))

    try {
      const results = await Promise.all(actions)
      return Promise.resolve(results[0])
    } catch(err) {
      return Promise.reject(err)
    }
  }

  const activateEdgeMdnsCluster = (serviceId: string, clusterId: string): Promise<CommonResult> => {
    return activateEdgeMdns({
      params: {
        serviceId,
        clusterId
      }
    }).unwrap()
  }

  // eslint-disable-next-line max-len
  const deactivateEdgeMdnsCluster = (serviceId: string, clusterId: string): Promise<CommonResult> => {
    return deactivateEdgeMdns({ params: {
      serviceId,
      clusterId
    } }).unwrap()
  }
  return {
    createEdgeMdns,
    editEdgeMdns,
    activateEdgeMdnsCluster,
    deactivateEdgeMdnsCluster
  }
}