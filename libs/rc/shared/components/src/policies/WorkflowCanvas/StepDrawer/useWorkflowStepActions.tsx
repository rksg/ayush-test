import {
  useCreateWorkflowStepMutation,
  useCreateWorkflowChildStepMutation,
  usePatchActionMutation,
  useCreateActionMutation,
  AsyncCommonResponse
} from '@acx-ui/rc/services'
import { ActionType, GenericActionData, StepType } from '@acx-ui/rc/utils'


export function useWorkflowStepActions () {
  const [ createAction ] = useCreateActionMutation()
  const [ patchAction ] = usePatchActionMutation()

  const [ createStepMutation ] = useCreateWorkflowStepMutation()
  const [ createChildStepMutation ] = useCreateWorkflowChildStepMutation()

  const createStepCallback = async (
    policyId: string,
    actionType: ActionType,
    actionId: string,
    priorNodeId?: string
  ) => {
    return priorNodeId
      ? await createChildStepMutation({
        params: { policyId, stepId: priorNodeId },
        payload: {
          type: StepType.Basic,
          enrollmentActionId: actionId
        },
        skip: !policyId
      })
      : await createStepMutation({
        params: { policyId },
        payload: {
          type: StepType.Basic,
          enrollmentActionId: actionId
        },
        skip: !policyId
      })
  }

  const createStepWithActionMutation = async (
    policyId: string,
    actionType: ActionType,
    formData: GenericActionData,
    priorNodeId?: string,
    onClose?: () => void
  ) => {

    return await createAction({
      payload: { ...formData, actionType },
      callback: async (response: AsyncCommonResponse) => {
        if (response.id) {
          await createStepCallback(policyId, actionType, response.id, priorNodeId)
          onClose?.()
        }
      } }).unwrap()
  }

  const findDiff = (originalObject: GenericActionData, updatedObject: GenericActionData) => {
    const differences: Partial<Record<keyof GenericActionData, object>> = {}

    Object.keys(updatedObject).forEach((key) => {
      const typedKey = key as keyof GenericActionData
      if (originalObject[typedKey] !== updatedObject[typedKey]) {
        Object.assign(differences, { [typedKey]: updatedObject[typedKey] })
      }
    })

    return { ...differences, _links: undefined }
  }

  const patchActionMutation = async (data: GenericActionData, formData: GenericActionData) => {
    const patchData = findDiff(data, formData)

    if (Object.values(patchData).every((value) => value === undefined)) return

    return patchAction({
      params: { actionId: formData.id },
      payload: { ...patchData }
    }).unwrap()
  }

  return {
    createStepWithActionMutation,
    patchActionMutation
  }
}
