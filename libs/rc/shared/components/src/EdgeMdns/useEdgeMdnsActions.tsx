import { differenceBy } from 'lodash'

import {
  useActivateEdgeMdnsProxyClusterMutation,
  useAddEdgeMdnsProxyMutation,
  useDeactivateEdgeMdnsProxyClusterMutation,
  useUpdateEdgeMdnsProxyMutation
} from '@acx-ui/rc/services'
import {
  EdgeMdnsProxyActivation,
  EdgeMdnsProxyViewData,
  edgeMdnsFormRequestPreProcess
} from '@acx-ui/rc/utils'
import { CommonResult } from '@acx-ui/user'

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
      addEdgeMdns({
        payload,
        callback: async (response: CommonResult) => {
          const serviceId = response.response?.id

          if (serviceId) {

            // do activation
            const actions = formData.activations?.map(item =>
              activateEdgeMdnsCluster(serviceId, item.venueId, item.edgeClusterId))

            if (actions) {
              Promise.all(actions).then(() => resolve(response))
            } else {
              resolve(response)
            }
          } else {
            reject(new Error('empty service id'))
          }
        }
        // need to catch basic service profile failed
      }).unwrap()
        .catch(reject)
    })
  }

  // eslint-disable-next-line max-len
  const editEdgeMdns = async (formData: EdgeMdnsProxyViewData, originData: EdgeMdnsProxyViewData): Promise<CommonResult> => {
    const { id: serviceId, ...otherFormData } = formData
    const payload = edgeMdnsFormRequestPreProcess(otherFormData)

    if (!serviceId) return Promise.reject(new Error('servcieId is required'))

    const actions = [updateEdgeMdns({
      params: { serviceId },
      payload
    }).unwrap()]

    // do activation
    // eslint-disable-next-line max-len
    const activates = differenceVenueClusters(formData.activations ?? [], originData.activations ?? [])
    actions.push(...activates?.map(item =>
      activateEdgeMdnsCluster(serviceId, item.venueId, item.edgeClusterId)))

    // eslint-disable-next-line max-len
    const deactivates = differenceVenueClusters(originData.activations ?? [], formData.activations ?? [])
    actions.push(...deactivates?.map(item =>
      deactivateEdgeMdnsCluster(serviceId, item.venueId, item.edgeClusterId)))

    try {
      const results = await Promise.all(actions)
      return Promise.resolve(results[0])
    } catch(err) {
      return Promise.reject(err)
    }
  }

  // eslint-disable-next-line max-len
  const activateEdgeMdnsCluster = (serviceId: string, venueId: string, edgeClusterId: string, callback?: () => void): Promise<CommonResult> => {
    return activateEdgeMdns({
      params: {
        serviceId,
        venueId,
        edgeClusterId
      },
      callback
    }).unwrap()
  }

  // eslint-disable-next-line max-len
  const deactivateEdgeMdnsCluster = (serviceId: string, venueId: string, edgeClusterId: string, callback?: () => void): Promise<CommonResult> => {
    return deactivateEdgeMdns({
      params: {
        serviceId,
        venueId,
        edgeClusterId
      },
      callback
    }).unwrap()
  }
  return {
    createEdgeMdns,
    editEdgeMdns,
    activateEdgeMdnsCluster,
    deactivateEdgeMdnsCluster
  }
}