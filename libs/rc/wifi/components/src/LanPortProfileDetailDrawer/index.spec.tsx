import { rest } from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { clientApi }    from '@acx-ui/rc/services'
import {
  AaaUrls,
  ClientIsolationUrls,
  EthernetPortProfileUrls,
  IpsecUrls,
  LanPortsUrls,
  SoftGreUrls,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import LanPortProfileDetailsDrawer from '.'

const LanPortSetting = {
  poeMode: 'Auto',
  lanPorts: [
    {
      type: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      portId: '1',
      enabled: true
    },
    {
      type: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      portId: '2',
      enabled: true
    }
  ],
  useVenueSettings: false
}

const RadiusList = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'f5cf248c518645248c1adafdcb60d99e',
      name: 'test-radius-1'
    },
    {
      id: 'b91e0a5217ee46a3aa0c1f60a2c86fef',
      name: 'test-acct-1'
    }
  ]
}

const PortSetting = {
  overwriteUntagId: 1,
  overwriteVlanMembers: '1-4094',
  softGreEnabled: true,
  clientIsolationEnabled: true,
  clientIsolationSettings: {
    packetsType: 'UNICAST',
    autoVrrp: false
  },
  useVenueSettings: false,
  enabled: true
}

const EthernetPortProfiles = {
  fields: [
    'vni',
    'apActivations',
    'id',
    'apSerialNumbers',
    'venueIds',
    'venueActivations'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'a6bd9bfa129c402da8d146d649c6aad9',
      venueIds: [
        'venue_id_2'
      ],
      apSerialNumbers: [
        '123456789012'
      ],
      venueActivations: [
        {
          venueId: 'venue_id_2',
          apModel: 'H670',
          portId: 3
        }
      ],
      apActivations: [
        {
          venueId: '14ef8a8eea324fdb99d3f86390b280cc',
          apSerialNumber: '123456789012',
          portId: 2
        }
      ],
      authRadiusId: 'f5cf248c518645248c1adafdcb60d99e',
      accountingRadiusId: 'b91e0a5217ee46a3aa0c1f60a2c86fef'
    }
  ]
}

const SoftGreData = {
  fields: null,
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '1fcbab0ddbda4d4f8dda26fddbee8631',
      tenantId: '6d2727f108a040adb77522ac35a8a9e8',
      name: 'softgre-1',
      activations: [
        {
          venueId: '213ba34c74384d8ca1ef2c0c95651669',
          wifiNetworkIds: [
            'faaea2f0c5e440b3b6a22f8875b1e81d'
          ]
        }
      ],
      venueActivations: [
        {
          venueId: '5fbd1d9dcf00444b82ed2fc6f08c04f0',
          apModel: 'H320',
          portId: 1,
          apSerialNumbers: []
        }
      ],
      apActivations: [
        {
          venueId: '14ef8a8eea324fdb99d3f86390b280cc',
          apSerialNumber: '123456789012',
          portId: 1
        }
      ]
    }
  ]
}

const IpsecData = {
  fields: null,
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'cc9d4faffce740b5ab595db69c635f61',
      tenantId: '6d2727f108a040adb77522ac35a8a9e8',
      name: 'IPsec-1',
      serverAddress: '1.1.1.100',
      authenticationType: 'PSK',
      preSharedKey: '192837465',
      ikeProposalType: 'DEFAULT',
      ikeProposals: [

      ],
      espProposalType: 'DEFAULT',
      espProposals: [

      ],
      activations: [

      ],
      venueActivations: [

      ],
      apActivations: [
        {
          venueId: '14ef8a8eea324fdb99d3f86390b280cc',
          softGreProfileId: '1fcbab0ddbda4d4f8dda26fddbee8631',
          apSerialNumber: '123456789012',
          portId: 1
        }
      ]
    }
  ]
}

const ClientIsolationData = {
  fields: null,
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '4c237d2779454f94b4538f293deeedb0',
      name: 'clientIsolationProfile1',
      description: '',
      clientEntries: [
        '11:22:33:44:55:66'
      ],
      activations: [

      ],
      venueActivations: [

      ],
      apActivations: [
        {
          venueId: '14ef8a8eea324fdb99d3f86390b280cc',
          apSerialNumber: '123456789012',
          portId: 1
        }
      ]
    }
  ]
}

const ApData = {
  data: {
    model: 'R550'
  }
}

const EthernetPortProfileMacData = {
  type: 'TRUNK',
  name: 'client_visibility_enabled',
  isDefault: false,
  authType: 'MAC_BASED_AUTHENTICATOR',
  enableAuthProxy: true,
  enableAccountingProxy: true,
  bypassMacAddressAuthentication: true,
  dynamicVlanEnabled: true,
  untagId: 1,
  vlanMembers: '1-4094',
  isEnforced: false,
  id: 'a6bd9bfa129c402da8d146d649c6aad9'
}

const EthernetPortProfileOpenData = {
  type: 'TRUNK',
  name: 'client_visibility_enabled',
  isDefault: false,
  authType: 'OPEN',
  enableAuthProxy: false,
  enableAccountingProxy: false,
  bypassMacAddressAuthentication: false,
  dynamicVlanEnabled: false,
  untagId: 1,
  vlanMembers: '1-4094',
  isEnforced: false,
  id: 'a6bd9bfa129c402da8d146d649c6aad9'
}

describe('LanPortProfileDetailDrawer', () => {
  const params = { tenantId: 'tenant-id' }
  beforeEach(() => {
    store.dispatch(clientApi.util.resetApiState())
    mockServer.use(
      rest.get(WifiRbacUrlsInfo.getApLanPorts.url,
        (_, res, ctx) => res(ctx.json(LanPortSetting))
      ),
      rest.post(AaaUrls.queryAAAPolicyList.url,
        (_, res, ctx) => res(ctx.json(RadiusList))
      ),
      rest.get(LanPortsUrls.getApLanPortSettings.url,
        (_, res, ctx) => res(ctx.json(PortSetting))
      ),
      rest.post(EthernetPortProfileUrls.getEthernetPortProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(EthernetPortProfiles))
      ),
      rest.post(SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => res(ctx.json(SoftGreData))
      ),
      rest.get(WifiRbacUrlsInfo.updateAp.url,
        (_, res, ctx) => res(ctx.json(ApData))
      ),
      rest.post(IpsecUrls.getIpsecViewDataList.url,
        (_, res, ctx) => res(ctx.json(IpsecData))
      ),
      rest.post(ClientIsolationUrls.queryClientIsolation.url,
        (_, res, ctx) => res(ctx.json(ClientIsolationData))
      ),
      rest.get(EthernetPortProfileUrls.getEthernetPortProfile.url,
        (_, res, ctx) => res(ctx.json(EthernetPortProfileMacData))
      )
    )
  })

  it('Should render correctly for wired client port detail by mac based', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const mockedCallBack = jest.fn()
    const apSerialNumber = '123456789012'
    const venueId = '14ef8a8eea324fdb99d3f86390b280cc'

    const portData = {
      apName: 'AP Name',
      serialNumber: apSerialNumber,
      detailVisible: true,
      portId: '2',
      venueId: venueId
    }

    render(<Provider>
      <LanPortProfileDetailsDrawer
        visible={true}
        setVisible={mockedCallBack}
        portData={portData}
      />
    </Provider>, { route: { params } })

    expect(await screen.findByText('AP Name - LAN 2')).toBeInTheDocument()
    expect(await screen.findByText('Ethernet Port Profile')).toBeInTheDocument()
    expect(await screen.findByText('Port Type')).toBeInTheDocument()
    expect(await screen.findByText('VLAN Untag ID')).toBeInTheDocument()
    expect(await screen.findByText('VLAN Members')).toBeInTheDocument()
    expect(await screen.findByText('1-4094')).toBeInTheDocument()
    expect(await screen.findByText('Trunk')).toBeInTheDocument()
    expect(await screen.findByText('1')).toBeInTheDocument()
    expect(await screen.findByText('Ethernet Port Profile')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'client_visibility_enabled' })).toBeVisible()
    expect(await screen.findByText('802.1X')).toBeInTheDocument()
    expect(await screen.findByText('802.1X Role')).toBeInTheDocument()
    expect(await screen.findByText('MAC-based Authenticator')).toBeInTheDocument()
    expect(await screen.findByText('Authentication Service')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'test-radius-1' })).toBeVisible()
    expect(await screen.findByText('Proxy Service (Auth)')).toBeInTheDocument()
    expect(await screen.findByText('Accounting Service')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'test-acct-1' })).toBeVisible()
    expect(await screen.findByText('Proxy Service (Accounting)')).toBeInTheDocument()
    expect(await screen.findByText('MAC Auth Bypass')).toBeInTheDocument()
    expect(await screen.findByText('Dynamic VLAN')).toBeInTheDocument()
    expect(await screen.findByText('Guest VLAN')).toBeInTheDocument()
    expect(await screen.findByText('SoftGRE Tunnel')).toBeInTheDocument()
    expect(await screen.findByText('IPsec')).toBeInTheDocument()
    expect(await screen.findByText('Client Isolation')).toBeInTheDocument()
    expect(await screen.findAllByText('On')).toHaveLength(7)
    expect(await screen.findByText('Client Isolation Allowlist')).toBeInTheDocument()
    expect(await screen.findByText('Not active')).toBeInTheDocument()
  })

  it('Should render correctly for wired client port detail by open', async () => {
    mockServer.use(
      rest.get(EthernetPortProfileUrls.getEthernetPortProfile.url,
        (_, res, ctx) => res(ctx.json(EthernetPortProfileOpenData))
      )
    )

    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const mockedCallBack = jest.fn()
    const apSerialNumber = '123456789012'
    const venueId = '14ef8a8eea324fdb99d3f86390b280cc'

    const portData = {
      apName: 'AP Name',
      serialNumber: apSerialNumber,
      detailVisible: true,
      portId: '1',
      venueId: venueId
    }

    render(<Provider>
      <LanPortProfileDetailsDrawer
        visible={true}
        setVisible={mockedCallBack}
        portData={portData}
      />
    </Provider>, { route: { params } })

    expect(await screen.findByText('AP Name - LAN 1')).toBeInTheDocument()
    expect(await screen.findByText('Ethernet Port Profile')).toBeInTheDocument()
    expect(await screen.findByText('Port Type')).toBeInTheDocument()
    expect(await screen.findByText('VLAN Untag ID')).toBeInTheDocument()
    expect(await screen.findByText('VLAN Members')).toBeInTheDocument()
    expect(await screen.findAllByText('--')).toHaveLength(6)
    expect(await screen.findByText('Ethernet Port Profile')).toBeInTheDocument()
    expect(await screen.findByText('802.1X')).toBeInTheDocument()
    expect(await screen.findByText('802.1X Role')).toBeInTheDocument()
    expect(await screen.findByText('Authentication Service')).toBeInTheDocument()
    expect(await screen.findByText('Proxy Service (Auth)')).toBeInTheDocument()
    expect(await screen.findByText('Accounting Service')).toBeInTheDocument()
    expect(await screen.findByText('Proxy Service (Accounting)')).toBeInTheDocument()
    expect(screen.queryByText('MAC Auth Bypass')).not.toBeInTheDocument()
    expect(screen.queryByText('Dynamic VLAN')).not.toBeInTheDocument()
    expect(screen.queryByText('Guest VLAN')).not.toBeInTheDocument()
    expect(await screen.findByText('SoftGRE Tunnel')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'softgre-1' })).toBeVisible()
    expect(await screen.findByText('IPsec')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'IPsec-1' })).toBeVisible()
    expect(await screen.findByText('Client Isolation')).toBeInTheDocument()
    expect(await screen.findAllByText('On')).toHaveLength(2)
    expect(await screen.findByText('Client Isolation Allowlist')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'clientIsolationProfile1' })).toBeVisible()
  })
})