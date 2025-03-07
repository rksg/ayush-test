import { CertificateStatusType } from '@acx-ui/rc/utils'

export const mockedTenantId = '__Tenant_ID__'
export const mockSamlIdpProfileId = '__samlIdpProfile_ID__'
export const mockSamlIdpProfileId2 = '__samlIdpProfile_ID_2__'
export const mockSamlIdpProfileId3 = '__samlIdpProfile_ID_3__'

export const mockSamlIdpProfileName = '__samlIdpProfile_Name__'
export const mockSamlIdpProfileName2 = '__samlIdpProfile_Name_2__'
export const mockSamlIdpProfileName3 = '__samlIdpProfile_Name_3__'

export const mockCertId1 = '__certId_1__'
export const mockCertId2 = '__certId_2__'

export const mockCertName1 = '__certName_1__'
export const mockCertName2 = '__certName_2__'

export const moeckedNetworkId = '__networkId__'

export const mockedSamlIdpProfile = {
  name: mockSamlIdpProfileName,
  metadata: Buffer.from('xmlContent').toString('base64'),
  authenticationRequestSignedEnabled: true
}

export const mockedSamlIpdProfileList = {
  page: 1,
  totalCount: 3,
  data: [
    {
      id: mockSamlIdpProfileId,
      name: mockSamlIdpProfileName,
      authenticationRequestSignedEnabled: true,
      responseEncryptionEnabled: true,
      encryptionCertificateId: mockCertId1,
      wifiNetworkIds: [moeckedNetworkId]
    },
    {
      id: mockSamlIdpProfileId2,
      name: mockSamlIdpProfileName2,
      authenticationRequestSignedEnabled: false,
      responseEncryptionEnabled: true,
      encryptionCertificateId: mockCertId2,
      wifiNetworkIds: [moeckedNetworkId]
    },
    {
      id: mockSamlIdpProfileId3,
      name: mockSamlIdpProfileName3,
      authenticationRequestSignedEnabled: false,
      responseEncryptionEnabled: false
    }
  ]
}

export const caList = {
  page: 1,
  totalCount: 2,
  data: [
    {
      id: '1',
      name: 'CA-1',
      status: ['VALID']
    },
    {
      id: '2',
      name: 'CA-2',
      status: ['VALID']
    }
  ]
}

export const certList = {
  page: 1,
  totalCount: 2,
  data: [
    {
      id: mockCertId1,
      name: mockCertName1,
      commonName: mockCertName1,
      status: [CertificateStatusType.VALID]
    },
    {
      id: mockCertId2,
      name: mockCertName2,
      commonName: mockCertName2,
      status: [CertificateStatusType.EXPIRED]
    }
  ]
}
