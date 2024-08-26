import {
  ActionType,
  DpskAction,
  DpskSaveData, MacRegistrationPool,
  PassphraseFormatEnum,
  PersonaGroup
} from '@acx-ui/rc/utils'


export const mockedDpskEnrollmentAction:DpskAction = {
  name: 'dpsk-enrollment-action',
  description: 'fake data for testing',
  actionType: ActionType.DPSK,
  id: '65d2f63d-b773-45f6-b81d-a2cb832e3841',
  version: 0,
  dpskPoolId: 'dpsk-pool-id-for-testing',
  identityGroupId: 'identity-group-id-for-testing'
}

export const mockedDpskData:DpskSaveData = {
  name: 'My Dpsk Group For Testing',
  passphraseLength: 0,
  passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
  expirationType: null
}

export const mockedIdentityGroupData:PersonaGroup = {
  id: 'fake-persona-group-id',
  name: 'My Identity Group for Testing'
}

export const mockedMacRegData:MacRegistrationPool = {
  id: 'test-mac-list-id',
  name: 'test-mac-list-name',
  registrationCount: 1,
  defaultAccess: 'true',
  autoCleanup: true,
  enabled: true
}
