import { EspProposal, IkeProposal, IpSecAdvancedOptionEnum, IpSecAuthEnum, IpSecDhGroupEnum, IpSecEncryptionAlgorithmEnum, IpSecFailoverModeEnum, IpSecIntegrityAlgorithmEnum, IpSecProposalTypeEnum, IpSecPseudoRandomFunctionEnum, IpSecRekeyTimeUnitEnum, IpsecViewData, IpsecWiredActivation, IpsecWiredApActivation } from '@acx-ui/rc/utils'

export const mockIpSecTable = {
  data: {
    fields: null,
    totalCount: 3,
    page: 1,
    data: [
      {
        id: '0d89c0f5596c4689900fb7f5f53a0859',
        name: 'ipsecProfileName1',
        serverAddress: '128.0.0.1',
        authenticationType: IpSecAuthEnum.PSK,
        preSharedKey: 'admin!234',
        ikeProposalType: IpSecProposalTypeEnum.DEFAULT,
        ikeProposals: [] as IkeProposal[],
        espProposalType: IpSecProposalTypeEnum.DEFAULT,
        espProposals: [] as EspProposal[],
        activations: [{
          venueId: '0e2f68ab79154ffea64aa52c5cc48826',
          wifiNetworkIds: [
            '9b33509cc0a1464cad9447778a72006f',
            '797a1f499c254260b7a1aedafba524a3',
            'b946294426b8413d819751cb3d320a20'
          ]
        }],
        venueActivations: [] as IpsecWiredActivation[],
        apActivations: [] as IpsecWiredApActivation[]
      },
      {
        id: '75aa5131892d44a6a85a623dd3e524ed',
        name: 'ipsecProfileName2',
        serverAddress: '128.0.0.3',
        authenticationType: IpSecAuthEnum.PSK,
        preSharedKey: 'admin!234',
        ikeProposalType: IpSecProposalTypeEnum.DEFAULT,
        ikeProposals: [] as IkeProposal[],
        espProposalType: IpSecProposalTypeEnum.SPECIFIC,
        espProposals: [{
          encAlg: IpSecEncryptionAlgorithmEnum.AES128,
          authAlg: IpSecIntegrityAlgorithmEnum.AEX_XBC,
          dhGroup: IpSecDhGroupEnum.MODP2048
        }],
        activations: [{
          venueId: '0e2f68ab79154ffea64aa52c5cc48826',
          wifiNetworkIds: [
            '9b33509cc0a1464cad9447778a72006fe'
          ]
        }],
        venueActivations: [] as IpsecWiredActivation[],
        apActivations: [] as IpsecWiredApActivation[]
      },
      {
        id: 'ipsecProfileName3-id',
        name: 'ipsecProfileName3',
        serverAddress: '128.0.0.5',
        authenticationType: IpSecAuthEnum.PSK,
        preSharedKey: 'admin!234',
        ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
        ikeProposals: [{
          encAlg: IpSecEncryptionAlgorithmEnum.AES128,
          authAlg: IpSecIntegrityAlgorithmEnum.AEX_XBC,
          prfAlg: IpSecPseudoRandomFunctionEnum.PRF_SHA256,
          dhGroup: IpSecDhGroupEnum.MODP2048
        },
        {
          encAlg: IpSecEncryptionAlgorithmEnum.AES128,
          authAlg: IpSecIntegrityAlgorithmEnum.MD5,
          prfAlg: IpSecPseudoRandomFunctionEnum.PRF_SHA256,
          dhGroup: IpSecDhGroupEnum.MODP768
        }],
        espProposalType: IpSecProposalTypeEnum.DEFAULT,
        espProposals: [] as EspProposal[],
        activations: [{
          venueId: '0e2f68ab79154ffea64aa52c5cc48826',
          wifiNetworkIds: [
            '9b33509cc0a1464cad9447778a72006fe'
          ]
        }],
        venueActivations: [] as IpsecWiredActivation[],
        apActivations: [] as IpsecWiredApActivation[]
      }
    ] as IpsecViewData[]
  },
  isFetching: false,
  handleTableChange: () => {},
  handleFilterChange: () => {}
}

export const mockIpSecTable2 = {
  data: {
    fields: null,
    totalCount: 5,
    page: 1,
    data: [
      {
        id: 'a983a74d1791406a9dfb17c6796676d4',
        name: '1112232',
        serverAddress: '128.0.0.1',
        authenticationType: IpSecAuthEnum.PSK,
        preSharedKey: 'admin!234',
        ikeProposalType: IpSecProposalTypeEnum.DEFAULT,
        ikeProposals: [] as IkeProposal[],
        espProposalType: IpSecProposalTypeEnum.DEFAULT,
        espProposals: [] as EspProposal[],
        activations: [
          {
            venueId: '0e2f68ab79154ffea64aa52c5cc48826',
            wifiNetworkIds: [
              '9b33509cc0a1464cad9447778a72006f',
              '797a1f499c254260b7a1aedafba524a3',
              'b946294426b8413d819751cb3d320a20'
            ]
          }
        ]
      },
      {
        id: 'd01d17d3a59f4907b7ad895cc3182394',
        name: '5555',
        serverAddress: '128.0.0.1',
        authenticationType: IpSecAuthEnum.PSK,
        preSharedKey: 'admin!234',
        ikeProposalType: IpSecProposalTypeEnum.DEFAULT,
        ikeProposals: [] as IkeProposal[],
        espProposalType: IpSecProposalTypeEnum.DEFAULT,
        espProposals: [] as EspProposal[]
      },
      {
        id: '086b1cacab274e0e8f7c3b8e40cfd73e',
        name: 'ipsecProfileName3',
        serverAddress: '128.0.0.1',
        authenticationType: IpSecAuthEnum.PSK,
        preSharedKey: 'admin!234',
        ikeProposalType: IpSecProposalTypeEnum.DEFAULT,
        ikeProposals: [] as IkeProposal[],
        espProposalType: IpSecProposalTypeEnum.DEFAULT,
        espProposals: [] as EspProposal[],
        activations: [
          {
            venueId: '0e2f68ab79154ffea64aa52c5cc48826'
          }
        ]
      },
      {
        id: 'ipsecProfileName4-id',
        name: 'ipsecProfileName4',
        serverAddress: '128.0.0.1',
        authenticationType: IpSecAuthEnum.PSK,
        preSharedKey: 'admin!234',
        ikeProposalType: IpSecProposalTypeEnum.DEFAULT,
        ikeProposals: [] as IkeProposal[],
        espProposalType: IpSecProposalTypeEnum.DEFAULT,
        espProposals: [] as EspProposal[],
        activations: [
          {
            venueId: '0e2f68ab79154ffea64aa52c5cc48826'
          }
        ]
      },
      {
        id: 'ipsecProfileName5-id',
        name: 'ipsecProfileName5',
        serverAddress: '128.0.0.1',
        authenticationType: IpSecAuthEnum.PSK,
        preSharedKey: 'admin!234',
        ikeProposalType: IpSecProposalTypeEnum.DEFAULT,
        ikeProposals: [] as IkeProposal[],
        espProposalType: IpSecProposalTypeEnum.DEFAULT,
        espProposals: [] as EspProposal[],
        activations: [
          {
            venueId: '0e2f68ab79154ffea64aa52c5cc48826',
            wifiNetworkIds: [
              '9b33509cc0a1464cad9447778a72006f',
              '797a1f499c254260b7a1aedafba524a3',
              'b946294426b8413d819751cb3d320a20'
            ]
          }
        ]
      }
    ]
  },
  isFetching: false,
  handleTableChange: () => {},
  handleFilterChange: () => {}
}


export const mockIpSecDetail = {
  id: '0d89c0f5596c4689900fb7f5f53a0859',
  name: 'ipsecProfileName1',
  serverAddress: '7.7.7.7',
  authType: IpSecAuthEnum.PSK,
  preSharedKey: 'admin!234',
  ikeSecurityAssociation: {
    ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
    ikeProposals: [
      {
        encAlg: IpSecEncryptionAlgorithmEnum.THREE_DES,
        authAlg: IpSecIntegrityAlgorithmEnum.MD5,
        prfAlg: IpSecPseudoRandomFunctionEnum.PRF_MD5,
        dhGroup: IpSecDhGroupEnum.MODP768
      },
      {
        encAlg: IpSecEncryptionAlgorithmEnum.AES128,
        authAlg: IpSecIntegrityAlgorithmEnum.AEX_XBC,
        prfAlg: IpSecPseudoRandomFunctionEnum.PRF_SHA256,
        dhGroup: IpSecDhGroupEnum.MODP2048
      }
    ]
  },
  espSecurityAssociation: {
    espProposalType: IpSecProposalTypeEnum.DEFAULT
  },
  advancedOption: {
    dhcpOpt43Subcode: 7,
    retryLimit: 5,
    replayWindow: 32,
    ipcompEnable: IpSecAdvancedOptionEnum.ENABLED,
    enforceNatt: IpSecAdvancedOptionEnum.ENABLED,
    dpdDelay: 0,
    keepAliveInterval: 20,
    failoverRetryPeriod: 0,
    failoverRetryInterval: 1,
    failoverMode: IpSecFailoverModeEnum.NON_REVERTIVE,
    failoverPrimaryCheckInterval: 1
  },
  ikeRekeyTime: 4,
  ikeRekeyTimeUnit: IpSecRekeyTimeUnitEnum.HOUR,
  espRekeyTime: 1,
  espRekeyTimeUnit: IpSecRekeyTimeUnitEnum.HOUR
}