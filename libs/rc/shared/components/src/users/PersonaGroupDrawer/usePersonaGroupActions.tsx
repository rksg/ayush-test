import {
  AsyncCommonResponse,
  useAddPersonaGroupMutation,
  useAssociateIdentityGroupWithDpskMutation,
  useAssociateIdentityGroupWithMacRegistrationMutation,
  useUpdatePersonaGroupMutation
} from '@acx-ui/rc/services'
import { PersonaGroup } from '@acx-ui/rc/utils'

import { usePersonaAsyncHeaders } from '../usePersonaAsyncHeaders'



export function usePersonaGroupAction () {
  const { customHeaders } = usePersonaAsyncHeaders()

  const [addPersonaGroup] = useAddPersonaGroupMutation()
  const [updatePersonaGroup] = useUpdatePersonaGroupMutation()
  const [associateDpsk] = useAssociateIdentityGroupWithDpskMutation()
  const [associateMacReg] = useAssociateIdentityGroupWithMacRegistrationMutation()

  const createPersonaGroupMutation = async (submittedData: PersonaGroup) => {
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
      payload: groupData,
      customHeaders,
      callback: (response: AsyncCommonResponse) => {
        if (response.id) {
          associateDpskCallback(response.id)
          associateMacRegistrationCallback(response.id)
        }
      }
    }).unwrap()
  }

  const updatePersonaGroupMutation
  = async (groupId: string, patchData?: Partial<PersonaGroup>) => {
    if (!patchData || Object.keys(patchData).length === 0) return

    const { dpskPoolId, macRegistrationPoolId, ...groupData } = patchData
    const associationPromises = []

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

    let updatePersonaGroupPromise
    if (Object.keys(groupData).length !== 0) {
      updatePersonaGroupPromise = updatePersonaGroup({
        params: { groupId },
        payload: groupData,
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
