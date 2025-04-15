import { difference, isEqual, omit } from 'lodash'

import { Features }          from '@acx-ui/feature-toggle'
import {
  useActivateEdgePinNetworkMutation,
  useCreateEdgePinMutation,
  useDeactivateEdgePinNetworkMutation,
  useUpdateEdgePinMutation
} from '@acx-ui/rc/services'
import {
  CommonErrorsResult,
  CommonResult,
  PersonalIdentityNetworkFormData
} from '@acx-ui/rc/utils'
import {
  CatchErrorDetails
} from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

// return the networks NOT included in `second`
const differenceNetworks = (first: string[], second: string[]) => {
  return difference(first, second)
}

const customHeaders = {
  'Content-Type': 'application/vnd.ruckus.v1.1+json'
}

export const useEdgePinActions = () => {
  const isL2GreEnabled = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)
  const [createPin] = useCreateEdgePinMutation()
  const [updatePin] = useUpdateEdgePinMutation()

  const [activate] = useActivateEdgePinNetworkMutation()
  const [deactivate] = useDeactivateEdgePinNetworkMutation()

  const handleAssociationDiff = async (
    serviceId: string,
    originData: PersonalIdentityNetworkFormData | undefined,
    payload: PersonalIdentityNetworkFormData
  ): Promise<CommonResult[] | CommonErrorsResult<CatchErrorDetails>> => {
    const activateNetworks = differenceNetworks(payload.networkIds, originData?.networkIds ?? [])
      .map(wifiNetworkId => activate({ params: { serviceId, wifiNetworkId } }).unwrap())
    const deactivateNetworks = differenceNetworks(originData?.networkIds ?? [], payload.networkIds)
      .map(wifiNetworkId => deactivate({ params: { serviceId, wifiNetworkId } }).unwrap())

    const actions = [...deactivateNetworks, ...activateNetworks]

    try {
      const relationActs = await Promise.all(actions)
      return Promise.resolve(relationActs)
    } catch(error) {
      return Promise.reject(error as CommonErrorsResult<CatchErrorDetails>)
    }
  }

  const addPin = async (req: {
    payload: PersonalIdentityNetworkFormData,
    callback?: (res: (CommonResult[]
      | CommonErrorsResult<CatchErrorDetails>)) => void
  }) => {
    const { payload, callback } = req

    return await createPin({
      ...(isL2GreEnabled ? { customHeaders } : {}),
      payload,
      callback: async (response: CommonResult) => {
        const serviceId = response.response?.id

        if (!serviceId) {
          // eslint-disable-next-line no-console
          console.error('empty service id')
          callback?.([])
          return
        }

        try {
          const reqResult = await handleAssociationDiff(serviceId!,
            undefined,
            payload)
          callback?.([response].concat(reqResult as CommonResult[]))
        } catch(error) {
          callback?.(error as CommonErrorsResult<CatchErrorDetails>)
        }
      }
    }).unwrap()
  }

  const editPin = async (originData: PersonalIdentityNetworkFormData, req: {
    payload: PersonalIdentityNetworkFormData,
    callback?: (res: (CommonResult[]
      | CommonErrorsResult<CatchErrorDetails>)) => void
  }) => {
    const { callback } = req
    const { id: serviceId, vxlanTunnelProfileId, ...payload } = req.payload

    try {
      const isProfileNoChange = isEqual(omit(originData, 'networkIds'), omit(payload, 'networkIds'))

      if (isProfileNoChange) {
        // eslint-disable-next-line max-len
        const reqResult = await handleAssociationDiff(serviceId!, originData, payload as PersonalIdentityNetworkFormData)
        callback?.(reqResult)
      } else {
        const updateResult = await updatePin({
          ...(isL2GreEnabled ? { customHeaders } : {}),
          params: { serviceId },
          payload: isL2GreEnabled ? payload : { ...payload, vxlanTunnelProfileId }
        }).unwrap()


        // eslint-disable-next-line max-len
        const reqResult = await handleAssociationDiff(serviceId!, originData, payload as PersonalIdentityNetworkFormData)
        callback?.([updateResult].concat(reqResult as CommonResult[]))
        return Promise.resolve()
      }
    } catch(error) {
      callback?.(error as CommonErrorsResult<CatchErrorDetails>)
      return Promise.reject(error as CommonErrorsResult<CatchErrorDetails>)
    }
  }

  return {
    addPin,
    editPin
  }
}
