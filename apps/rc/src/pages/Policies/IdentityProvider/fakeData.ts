import { NaiRealmAuthInfoEnum, NaiRealmAuthTypeInnerEnum, NaiRealmAuthTypeNonEapEnum, NaiRealmEapMethodEnum, NaiRealmEcodingEnum } from '@acx-ui/rc/utils'

export const mockIdentityProviderList = {
  totalCount: 2,
  data: [{
    id: '92b81721-8bb6-47a0-8b22-41d5084372fb',
    name: 'HS20 Identity Provider 1',
    tenantId: '2409eeac-afeb-4562-ab4b-157ca67b0f8d',
    authRadiusId: '8378fc3c-eb1e-483d-b694-b36d7afac741',
    accountingRadiusId: 'd375b381-80ef-4744-a8b6-a16931d56235',
    accountingRadiusEnabled: true,
    dynamicVlan: 1,
    roamConsortiumOIs: [{
      name: 'Roaming Consortium 1',
      organizationId: '0011334489'
    }, {
      name: 'Roaming Consortium 2',
      organizationId: '001133'
    }],
    plmns: [{
      mcc: '001',
      mnc: '01'
    }, {
      mcc: '999',
      mnc: '999'
    }],
    naiRealms: [{
      name: 'abc.com',
      encoding: NaiRealmEcodingEnum.RFC4282,
      eap: [{
        method: NaiRealmEapMethodEnum.PEAP,
        authInfos: [{
          info: NaiRealmAuthInfoEnum.Expanded,
          vendorId: '0',
          vendorType: '0'
        }, {
          info: NaiRealmAuthInfoEnum.Non_Eap,
          nonEapAuth: NaiRealmAuthTypeNonEapEnum.MSCHAPV2
        }]
      }]
    }, {
      name: 'bbc.com',
      encoding: NaiRealmEcodingEnum.UTF8,
      eap: [{
        method: NaiRealmEapMethodEnum.TLS,
        authInfos: [{
          info: NaiRealmAuthInfoEnum.Inner,
          eapInnerAuth: NaiRealmAuthTypeInnerEnum.EAP_TTLS
        }]
      }]
    }],
    networkIds: []
  }, {
    id: 'b267e2fb-487a-4d7f-83e3-8d8b94bfb701',
    name: 'HS20 Identity Provider 2',
    tenantId: '2409eeac-afeb-4562-ab4b-157ca67b0f8d',
    authRadiusId: '8378fc3c-eb1e-483d-b694-b36d7afac741',
    accountingRadiusEnabled: false,
    dynamicVlan: 4094,
    roamConsortiumOIs: [{
      name: 'Roaming Consortium 1',
      organizationId: '0011334489'
    }],
    plmns: [{
      mcc: '001',
      mnc: '01'
    }],
    naiRealms: [{
      name: 'abc.com',
      encoding: NaiRealmEcodingEnum.RFC4282,
      eap: [{
        method: NaiRealmEapMethodEnum.PEAP,
        authInfos: [{
          info: NaiRealmAuthInfoEnum.Expanded,
          vendorId: '0',
          vendorType: '0'
        }]
      }]
    }],
    networkIds: []
  }]
}