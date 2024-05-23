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
    let mockActionId: string
    switch (actionType) {
      case ActionType.AUP:
        mockActionId = '74cb7994-dc41-485d-beab-652a9a156fed'
        break
      case ActionType.DISPLAY_MESSAGE:
        mockActionId = '23296df8-374d-4db1-a37e-6bdc68ea5701'
        break
      default:
        mockActionId = '74cb7994-dc41-485d-beab-652a9a156fed'
        break
    }

    return await createAction({
      payload: { ...formData, actionType },
      callback: (response: AsyncResponse) => {
        // FIXME: Replace to use the response.id
        if (response.requestId) {
          onClose?.()
          createStepCallback(serviceId, actionType, mockActionId, priorNodeId)
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
