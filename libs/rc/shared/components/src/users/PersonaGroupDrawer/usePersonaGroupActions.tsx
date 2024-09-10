import {
  CommonAsyncResponse,
  useAddPersonaGroupMutation,
  useAssociateIdentityGroupWithDpskMutation,
  useAssociateIdentityGroupWithMacRegistrationMutation,
  useUpdatePersonaGroupMutation
} from '@acx-ui/rc/services'
import { PersonaGroup } from '@acx-ui/rc/utils'

import { usePersonaAsyncHeaders } from '../usePersonaAsyncHeaders'



export function usePersonaGroupAction () {
  const { isAsync, customHeaders } = usePersonaAsyncHeaders()

  const [addPersonaGroup] = useAddPersonaGroupMutation()
  const [updatePersonaGroup] = useUpdatePersonaGroupMutation()
  const [associateDpsk] = useAssociateIdentityGroupWithDpskMutation()
  const [associateMacReg] = useAssociateIdentityGroupWithMacRegistrationMutation()

  const createPersonaGroupMutation = async (submittedData: PersonaGroup, callback?: Function) => {
    const { dpskPoolId, macRegistrationPoolId, ...groupData } = submittedData

    const associateDpskCallback = (groupId: string) => {
      if (dpskPoolId) {
        associateDpsk({
          params: { groupId, poolId: dpskPoolId }
        })
      }
    }
    const associateMacRegistrationCallback = (groupId: string) => {
      if (macRegistrationPoolId) {
        associateMacReg({
          params: { groupId, poolId: macRegistrationPoolId }
        })
      }
    }

    return await addPersonaGroup({
      payload: { ...(isAsync ? groupData : submittedData) },
      customHeaders,
      callback: (response: CommonAsyncResponse) => {
        callback?.(response)
        if (response.id && isAsync) {
          associateDpskCallback(response.id)
          associateMacRegistrationCallback(response.id)
        }
      }
    }).unwrap()
      .then(result => {
        if(!isAsync) callback?.(result)
      })
  }

  const updatePersonaGroupMutation
  = async (groupId: string, patchData?: Partial<PersonaGroup>) => {
    if (!patchData || Object.keys(patchData).length === 0) return

    const { dpskPoolId, macRegistrationPoolId, ...groupData } = patchData
    const associationPromises = []

    if (isAsync) {
      if (macRegistrationPoolId) {
        associationPromises.push(associateMacReg({
          params: {
            groupId,
            poolId: macRegistrationPoolId
          }
        }))
      }

      if (dpskPoolId) {
        associationPromises.push(associateDpsk({
          params: {
            groupId,
            poolId: dpskPoolId
          }
        }))
      }
    }

    let updatePersonaGroupPromise
    if (Object.keys(isAsync ? groupData : patchData).length !== 0) {
      updatePersonaGroupPromise = updatePersonaGroup({
        params: { groupId },
        payload: isAsync ? groupData : patchData,
        customHeaders
      })
      associationPromises.push(updatePersonaGroupPromise)
    }

    await Promise.all(associationPromises)

    return await updatePersonaGroupPromise?.unwrap()
  }

  return {
    createPersonaGroupMutation,
    updatePersonaGroupMutation
  }
}
