import { ActionType, DataPromptAction } from '@acx-ui/rc/utils'

export const mockDataPrompt:DataPromptAction = {
  title: 'My Title',
  messageHtml: 'My test message.',
  displayTitle: true,
  actionType: ActionType.DATA_PROMPT,
  displayMessageHtml: true,
  name: 'test-name',
  backButtonText: 'Back',
  continueButtonText: 'Continue',
  id: 'my-test-data-prompt',
  displayBackButton: true,
  displayContinueButton: true,
  description: '',
  version: 1,
  variables: [{ label: 'Thing 1', type: 'EMAIL' }, { label: 'Thing 2', type: 'INPUT_FIELD_1' }] }