import {
  CommonAsyncResponse,
  useAddPersonaGroupMutation,
  useAssociateIdentityGroupWithCertificateTemplateMutation,
  useAssociateIdentityGroupWithDpskMutation,
  useAssociateIdentityGroupWithMacRegistrationMutation,
  useAssociateIdentityGroupWithPolicySetMutation,
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
  const [associateCertTemplate] = useAssociateIdentityGroupWithCertificateTemplateMutation()
  const [associatePolicySet] = useAssociateIdentityGroupWithPolicySetMutation()

  const createPersonaGroupMutation = async (submittedData: PersonaGroup, callback?: Function) => {
    // eslint-disable-next-line max-len
    const { dpskPoolId, macRegistrationPoolId, certificateTemplateId, policySetId, ...groupData } = submittedData

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
    const associateCertificateTemplateCallback = (groupId: string) => {
      if (certificateTemplateId) {
        associateCertTemplate({
          params: { groupId, templateId: certificateTemplateId }
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
      payload: { ...(isAsync ? groupData : submittedData) },
      customHeaders,
      callback: (response: CommonAsyncResponse) => {
        callback?.(response)
        if (response.id && isAsync) {
          associateDpskCallback(response.id)
          associateMacRegistrationCallback(response.id)
          associateCertificateTemplateCallback(response.id)
          associatePolicySetCallback(response.id)
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
    // eslint-disable-next-line max-len
    const { dpskPoolId, macRegistrationPoolId, certificateTemplateId, policySetId, ...groupData } = patchData
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

      if (certificateTemplateId) {
        associationPromises.push(associateCertTemplate({
          params: {
            groupId,
            templateId: certificateTemplateId
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
