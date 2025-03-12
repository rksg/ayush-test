import {
  CommonAsyncResponse,
  useAddPersonaGroupMutation,
  useAssociateIdentityGroupWithDpskMutation,
  useAssociateIdentityGroupWithMacRegistrationMutation,
  useAssociateIdentityGroupWithPolicySetMutation,
  useDissociateIdentityGroupWithPolicySetMutation,
  useUpdatePersonaGroupMutation
} from '@acx-ui/rc/services'
import { PersonaGroup } from '@acx-ui/rc/utils'



export function usePersonaGroupAction () {
  const [addPersonaGroup] = useAddPersonaGroupMutation()
  const [updatePersonaGroup] = useUpdatePersonaGroupMutation()
  const [associateDpsk] = useAssociateIdentityGroupWithDpskMutation()
  const [associateMacReg] = useAssociateIdentityGroupWithMacRegistrationMutation()
  const [associatePolicySet] = useAssociateIdentityGroupWithPolicySetMutation()
  const [dissociatePolicySet] = useDissociateIdentityGroupWithPolicySetMutation()

  const createPersonaGroupMutation = async (submittedData: PersonaGroup, callback?: Function) => {
    const { dpskPoolId, macRegistrationPoolId, policySetId, ...groupData } = submittedData

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
    const associatePolicySetCallback = (groupId: string) => {
      if (policySetId) {
        associatePolicySet({
          params: { groupId, policySetId }
        })
      }
    }

    return await addPersonaGroup({
      payload: groupData,
      onSuccess: (response: CommonAsyncResponse) => {
        callback?.(response)
        if (response.id) {
          associateDpskCallback(response.id)
          associateMacRegistrationCallback(response.id)
          associatePolicySetCallback(response.id)
        }
      },
      onError: (response?: CommonAsyncResponse) => {
        callback?.(response)
      }
    }).unwrap()
  }

  const updatePersonaGroupMutation
  = async (groupId: string, oldData?: PersonaGroup, newData?: PersonaGroup) => {
    if (!newData || !oldData || Object.keys(newData).length === 0) return

    const personaGroupKeys = [
      'name',
      'description',
      'macRegistrationPoolId',
      'dpskPoolId',
      'policySetId'
    ] as const
    const patchData: Partial<PersonaGroup> = {}

    personaGroupKeys.forEach(key => {
      if (newData[key] !== oldData[key]) {
        Object.assign(patchData, { [key]: newData[key] })
      }
    })

    const { dpskPoolId, macRegistrationPoolId, policySetId, ...groupData } = patchData
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

    if (policySetId) {
      associationPromises.push(associatePolicySet({
        params: {
          groupId,
          policySetId
        }
      }))
    } else if (newData.hasOwnProperty('policySetId')
      && newData.policySetId === undefined
      && oldData.policySetId) {
      associationPromises.push(dissociatePolicySet({
        params: {
          groupId,
          policySetId: oldData.policySetId
        }
      }))
    }

    let updatePersonaGroupPromise
    if (Object.keys(groupData).length !== 0) {
      updatePersonaGroupPromise = updatePersonaGroup({
        params: { groupId },
        payload: groupData
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
