import { StepsFormActionButtonEnum } from './useStepsForm'

export const isStepsFormBackStepClicked = (event?: React.MouseEvent):boolean => {
  return event?.currentTarget?.getAttribute('value') === StepsFormActionButtonEnum.PRE
}