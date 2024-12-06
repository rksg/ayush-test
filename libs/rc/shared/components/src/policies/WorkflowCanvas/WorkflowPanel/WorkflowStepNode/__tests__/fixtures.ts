import {
  ActionType,
  DpskAction,
  DpskSaveData, MacRegAction, MacRegistrationPool,CertTempAction,
  PassphraseFormatEnum,
  PersonaGroup,
  CertificateTemplate,
  AlgorithmType
} from '@acx-ui/rc/utils'


export const mockedDpskEnrollmentAction:DpskAction = {
  name: 'dpsk-enrollment-action',
  description: 'fake data for testing',
  actionType: ActionType.DPSK,
  id: '65d2f63d-b773-45f6-b81d-a2cb832e3841',
  version: 0,
  dpskPoolId: 'dpsk-pool-id-for-testing',
  identityGroupId: 'identity-group-id-for-testing',
  valid: true
}

export const mockedDpskActionInvalid:DpskAction = {
  name: 'dpsk-enrollment-action',
  description: 'fake data for testing',
  actionType: ActionType.DPSK,
  id: '0d218f04-c61d-4267-92e9-dedf1649be3f',
  version: 0,
  dpskPoolId: 'dpsk-pool-id-for-testing',
  identityGroupId: 'bogus-identity-group-id',
  valid: false
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

export const mockedMacRegEnrollmentAction:MacRegAction = {
  name: 'mac-reg-enrollment-action',
  description: 'fake data for testing',
  actionType: ActionType.MAC_REG,
  id: 'bacc6a41-0c27-4b4e-a2a4-d7ad506974af',
  version: 0,
  macRegListId: 'dpsk-pool-id-for-testing',
  identityGroupId: 'identity-group-id-for-testing',
  valid: true
}

export const mockedMacRegData:MacRegistrationPool = {
  id: 'test-mac-list-id',
  name: 'test-mac-list-name',
  registrationCount: 1,
  defaultAccess: 'true',
  autoCleanup: true,
  enabled: true
}

export const mockedMacRegActionInvalid:MacRegAction = {
  name: 'mac-reg-enrollment-action',
  description: 'fake data for testing',
  actionType: ActionType.MAC_REG,
  id: 'invalid-mac-reg-id',
  version: 0,
  macRegListId: 'mac-reg-list-id-for-testing',
  identityGroupId: 'bogus-identity-group-id',
  valid: false
}

export const mockedCertTempEnrollmentAction:CertTempAction = {
  name: 'cert-enrollment-action',
  description: 'fake data for testing',
  actionType: ActionType.CERT_TEMPLATE,
  id: '65d2f63d-b773-45f6-b81d-a2cb832e3841',
  version: 0,
  certTemplateId: 'cert-template-id-for-testing',
  identityGroupId: 'identity-group-id-for-testing',
  valid: true
}

export const mockedCertTempActionInvalid:CertTempAction = {
  name: 'cert-enrollment-action',
  description: 'fake data for testing',
  actionType: ActionType.CERT_TEMPLATE,
  id: 'invalid-cert-temp-id',
  version: 0,
  certTemplateId: 'cert-pool-id-for-testing',
  identityGroupId: 'bogus-identity-group-id',
  valid: false
}

export const mockedCertTempData:CertificateTemplate = {
  id: 'cert-template-id-for-testing',
  description: 'cert-template-id-for-testing',
  name: 'cert-template-id-for-testing',
  networkIds: ['65d2f63d-b773-45f6-b81d-a2cb832e3841', '65d2f63d-b773-45f6-b81d-a2cb832e3811'],
  identityGroupId: 'identity-group-id-for-testing',
  caType: '',
  keyLength: 0,
  algorithm: AlgorithmType.SHA_256
}