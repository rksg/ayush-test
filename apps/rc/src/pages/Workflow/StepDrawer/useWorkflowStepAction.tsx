import {
  useCreateWorkflowStepMutation,
  useCreateWorkflowChildStepMutation,
  usePatchActionMutation,
  AsyncResponse,
  useCreateActionMutation
} from '@acx-ui/rc/services'
import { ActionType, GenericActionData, isSplitActionType } from '@acx-ui/rc/utils'


enum StepType {
    Basic = 'stepDto',
    Split = 'splitStepDto'
  }

export function useWorkflowStepActions () {
  const [ createAction ] = useCreateActionMutation()
  const [ patchAction ] = usePatchActionMutation()

  const [ createStepMutation ] = useCreateWorkflowStepMutation()
  const [ createChildStepMutation ] = useCreateWorkflowChildStepMutation()

  const createStepCallback = async (
    serviceId: string,
    actionType: ActionType,
    actionId: string,
    priorNodeId?: string
  ) => {
    return priorNodeId
      ? await createChildStepMutation({
        params: { serviceId, stepId: priorNodeId },
        payload: {
          type: isSplitActionType(actionType) ? StepType.Split : StepType.Basic,
          enrollmentActionId: actionId
        },
        skip: !serviceId
      })
      : await createStepMutation({
        params: { serviceId },
        payload: {
          type: isSplitActionType(actionType) ? StepType.Split : StepType.Basic,
          enrollmentActionId: actionId
        },
        skip: !serviceId
      })
  }

  const createStepWithActionMutation = async (
    serviceId: string,
    actionType: ActionType,
    formData: GenericActionData,
    priorNodeId?: string,
    onClose?: () => void
  ) => {

    return await createAction({
      payload: { ...formData, actionType },
      callback: (response: AsyncResponse) => {
        if (response.id) {
          onClose?.()
          createStepCallback(serviceId, actionType, response.id, priorNodeId)
        }
      } }).unwrap()
  }

  const findDiff = (originalObject: GenericActionData, updatedObject: GenericActionData) => {
    // console.log('Original = ', originalObject)
    // console.log('Updated = ', updatedObject)
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

    // console.log('Diff', patchData)

    if (Object.values(patchData).every((value) => value === undefined)) return

    return patchAction({
      params: { actionId: formData.actionId },
      payload: { ...patchData }
    }).unwrap()
  }

  return {
    createStepWithActionMutation,
    patchActionMutation
  }
}
