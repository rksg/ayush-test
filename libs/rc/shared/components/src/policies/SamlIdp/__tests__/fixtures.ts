import { CertificateStatusType, GuestNetworkTypeEnum, KeyUsageType, NetworkTypeEnum } from '@acx-ui/rc/utils'

export const mockedTenantId = '__Tenant_ID__'
export const mockSamlIdpProfileId = '__samlIdpProfile_ID__'
export const mockSamlIdpProfileName = '__samlIdpProfile_Name__'
export const mockCertId1 = '__certId_1__'
export const mockCertId2 = '__certId_2__'
export const mockCertId3 = '__certId_3__'

export const mockCertName1 = '__certName_1__'
export const mockCertName2 = '__certName_2__'
export const mockCertName3 = '__certName_3__'

export const mockedNetworkId1 = '__networkId1__'
export const mockedNetworkId2 = '__networkId2__'

export const mockedNetworkName1 = '__networkName1__'
export const mockedNetworkName2 = '__networkName2__'

export const mockedMetadata = '<xmlContent>mocked XML</xmlContent>'

export const mockedSamlIdpProfile = {
  id: mockSamlIdpProfileId,
  name: mockSamlIdpProfileName,
  metadata: Buffer.from('xmlContent').toString('base64'),
  metadataUrl: ''
}

export const mockedsamlIpdProfileList = {
  page: 1,
  totalCount: 1,
  data: [
    {
      id: mockSamlIdpProfileId,
      name: mockSamlIdpProfileName,
      signingCertificateEnabled: true,
      signingCertificateId: mockCertId3,
      encryptionCertificateEnabled: true,
      encryptionCertificateId: mockCertId1,
      wifiNetworkIds: [mockedNetworkId1]
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
      key: mockCertId1,
      id: mockCertId1,
      name: mockCertName1,
      commonName: mockCertName1,
      value: mockCertName1,
      status: ['VALID'],
      keyUsages: [KeyUsageType.DIGITAL_SIGNATURE, KeyUsageType.KEY_ENCIPHERMENT]
    },
    {
      key: mockCertId2,
      id: mockCertId2,
      name: mockCertName2,
      commonName: mockCertName2,
      value: mockCertName2,
      status: ['VALID'],
      keyUsages: [KeyUsageType.KEY_ENCIPHERMENT]
    },
    {
      key: mockCertId3,
      id: mockCertId3,
      name: mockCertName3,
      commonName: mockCertName3,
      value: mockCertName3,
      status: [CertificateStatusType.EXPIRED],
      keyUsages: [KeyUsageType.DIGITAL_SIGNATURE]
    }
  ]
}

export const samlNetworkList = {
  fields: ['name', 'id', 'nwSubType', 'captiveType'],
  totalCount: 2,
  page: 1,
  data: [
    {
      name: mockedNetworkName1,
      id: mockedNetworkId1,
      nwSubType: NetworkTypeEnum.CAPTIVEPORTAL,
      captiveType: GuestNetworkTypeEnum.SAML
    },
    {
      name: mockedNetworkName2,
      id: mockedNetworkId2,
      nwSubType: NetworkTypeEnum.CAPTIVEPORTAL,
      captiveType: GuestNetworkTypeEnum.SAML
    }
  ]
}


