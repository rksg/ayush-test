export const GuestList = {
  totalCount: 34,
  page: 1,
  data: [
    {
      name: 'test1',
      id: '865c88e0-7bae-47a1-9247-508a027a9500',
      creationDate: '2022-11-14T08:51:36.499Z',
      expiryDate: '0',
      emailAddress: '',
      guestType: 'type',
      wifiNetworkId: 'tenant-id',
      passDurationHours: 1,
      guestStatus: 'Expired',
      notes: '',
      maxNumberOfClients: -1,
      devicesMac: []
    },
    {
      name: 'test2',
      id: '16bcc049-6f38-47b9-8ad1-daf803c4e8b9',
      creationDate: '2022-11-15T08:57:50.392Z',
      expiryDate: '',
      mobilePhoneNumber: '+12015550123',
      emailAddress: '',
      guestType: 'SelfSign',
      wifiNetworkId: 'tenant-id',
      passDurationHours: '',
      guestStatus: 'Not Applicable',
      notes: '',
      maxNumberOfClients: '',
      devicesMac: []
    },
    {
      name: 'test3',
      id: '37a626e9-5d97-4349-b7a5-8822c62d3bf3',
      creationDate: '2022-11-28T08:15:14.690Z',
      expiryDate: '2022-12-28T08:15:14.695Z',
      emailAddress: '',
      guestType: 'HostGuest',
      wifiNetworkId: 'tenant-id',
      passDurationHours: 720,
      guestStatus: 'Offline',
      notes: '',
      maxNumberOfClients: 3,
      devicesMac: []
    },
    {
      name: 'test4',
      id: '99fbe8f0-bc9c-4f95-ac07-54146cf5c117',
      creationDate: '2022-11-20T08:57:12.338Z',
      mobilePhoneNumber: '+886933222333',
      emailAddress: 'a@email.com',
      guestType: 'GuestPass',
      wifiNetworkId: 'tenant-id',
      passDurationHours: 168,
      guestStatus: 'Online (1)',
      notes: '',
      maxNumberOfClients: 2,
      devicesMac: ['AA:AA:AA:AA:AA:AA'],
      clients: [{
        osType: 'ios',
        healthCheckStatus: 'good',
        clientMac: 'AA:AA:AA:AA:AA:AA',
        ipAddress: '1.1.1.1',
        username: 'user',
        hostname: 'host',
        venueId: '0004e252a9d04180855813131d007aca',
        venueName: 'testVenue',
        apMac: 'BB:BB:BB:BB:BB:BB',
        apSerialNumber: '422039000038',
        apName: 'testAp',
        switchSerialNumber: '',
        switchName: '',
        networkId: 'tenant-id',
        networkName: 'guest pass wlan',
        networkSsid: 'guest pass wlan',
        connectSince: '2022-11-28T14:55:15.924Z'
      }]
    },
    {
      name: 'disable_client',
      id: '37a626e9-5d97-4349-b7a5-8822c62d3000',
      creationDate: '2022-11-27T08:15:14.690Z',
      expiryDate: '2022-12-28T08:15:14.695Z',
      emailAddress: '',
      guestType: 'GuestPass',
      wifiNetworkId: '3f04e252a9d04180855813131d007000',
      passDurationHours: 168,
      guestStatus: 'Disabled',
      notes: '',
      maxNumberOfClients: 3,
      devicesMac: []
    },
    {
      name: 'test5',
      id: '37a626e9-5d97-4349-b7a5-8822c62d3bf5',
      creationDate: '2022-11-28T08:15:14.690Z',
      expiryDate: '2025-12-28T08:15:14.695Z',
      mobilePhoneNumber: '+12015550321',
      emailAddress: '',
      guestType: 'GuestPass',
      wifiNetworkId: 'tenant-id',
      passDurationHours: 720,
      guestStatus: 'Offline',
      notes: '',
      maxNumberOfClients: 3,
      devicesMac: []
    }
  ]
}

export const AllowedNetworkList = {
  fields: ['name', 'id', 'defaultGuestCountry', 'captiveType'],
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'guest pass wlan1',
      id: 'tenant-id',
      defaultGuestCountry: 'United States',
      captiveType: 'GuestPass'
    },
    {
      name: 'guest pass wlan2',
      id: 'dasjk12359552a9d041813131d007aca',
      defaultGuestCountry: 'United States',
      captiveType: 'GuestPass'
    }
  ]
}

export const AllowedNetworkSingleList = {
  fields: ['name', 'id', 'defaultGuestCountry', 'captiveType'],
  totalCount: 1,
  page: 1,
  data: [
    {
      name: 'guest pass wlan1',
      id: 'tenant-id',
      defaultGuestCountry: 'United States',
      captiveType: 'GuestPass'
    }
  ]
}