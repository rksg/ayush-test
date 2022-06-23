/* eslint-disable */
export const rcToastTemplates:any = {
  DefaultMethod: {
    messages: {
      PENDING: 'Action on "${attributes.name}" is in progress',
      SUCCESS: 'Action on "${attributes.name}" finished successfully',
      FAIL: 'Action on "${attributes.name}" failed',
      WAITING: 'Pending action on "${attributes.name}"'
    }
  },
  UpdateVenueDeep: {
    messages: {
      PENDING: 'Saving LTE settings for the "${attributes.name}" venue',
      SUCCESS: 'LTE settings for the "${attributes.name}" venue was saved',
      FAIL: 'LTE settings for the "${attributes.name}" venue was not saved'
    }
  },
  AddSasAccount: {
    messages: {
      PENDING: 'Adding SAS Account "${attributes.name}"',
      SUCCESS: 'SAS Account "${attributes.name}" was added',
      FAIL: 'SAS Account "${attributes.name}" was not added'
    }
  },
  UpdateSasAccount: {
    messages: {
      PENDING: 'Updating SAS Account "${attributes.name}"',
      SUCCESS: 'SAS Account "${attributes.name}" was updated',
      FAIL: 'SAS Account "${attributes.name}" was not updated'
    }
  },
  DeleteSasAccount: {
    messages: {
      PENDING: 'Deleting ${count} SAS Account)',
      SUCCESS: '${count} SAS Account was deleted',
      FAIL: '${count} SAS Account was not deleted'
    }
  },
  DeleteSasAccounts: {
    messages: {
      PENDING: 'Deleting ${count} SAS Accounts)',
      SUCCESS: '${count} SAS Accounts were deleted',
      FAIL: '${count} SAS Accounts were not deleted'
    }
  },
  AddEcgiRecord: {
    messages: {
      PENDING: 'Adding ECGI Record "${attributes.name}"',
      SUCCESS: 'ECGI Record "${attributes.name}" was added',
      FAIL: 'ECGI Record "${attributes.name}" was not added'
    }
  },
  UpdateEcgiRecord: {
    messages: {
      PENDING: 'Updating ECGI Record "${attributes.name}"',
      SUCCESS: 'ECGI Record "${attributes.name}" was updated',
      FAIL: 'ECGI Record "${attributes.name}" was not updated'
    }
  },
  DeleteEcgiRecord: {
    messages: {
      PENDING: 'Deleting ${count} ECGI Record)',
      SUCCESS: '${count} ECGI Record was deleted',
      FAIL: '${count} ECGI Record was not deleted'
    }
  },
  DeleteEcgiRecords: {
    messages: {
      PENDING: 'Deleting ${count} ECGI Records)',
      SUCCESS: '${count} ECGI Records were deleted',
      FAIL: '${count} ECGI Records were not deleted'
    }
  },
  AddAp: {
    messages: {
      PENDING: 'Adding AP "${attributes.name}"',
      SUCCESS: 'AP "${attributes.name}" was added',
      FAIL: 'AP "${attributes.name}" was not added'
    },
    link: '/t/${tenantId}/aps/${entityId}/details/overview'
  },
  AddAps: {
    messages: {
      PENDING: 'Adding AP "${attributes.name}"',
      SUCCESS: 'AP "${attributes.name}" was added',
      FAIL: 'AP "${attributes.name}" was not added'
    },
    link: '/t/${tenantId}/aps/${entityId}/details/overview'
  },
  UpdateAp: {
    messages: {
      PENDING: 'Updating AP "${attributes.name}"',
      SUCCESS: 'AP "${attributes.name}" was updated',
      FAIL: 'AP "${attributes.name}" was not updated'
    },
    link: '/t/${tenantId}/aps/${entityId}/details/overview'
  },
  DeleteAp: {
    messages: {
      PENDING: 'Deleting ${count} AP',
      SUCCESS: '${count} AP was deleted',
      FAIL: '${count} AP was not deleted'
    }
  },
  DeleteAps: {
    messages: {
      PENDING: 'Deleting ${count} APs',
      SUCCESS: '${count} APs were deleted',
      FAIL: '${count} APs were not deleted'
    }
  },
  ImportApsBulk: {
    messages: {
      PENDING: 'Importing APs...',
      SUCCESS: 'APs were imported successfully',
      FAIL: 'Import Failed'
    }
  },
  REBOOT: {
    messages: {
      PENDING: 'Rebooting AP ${attributes.name}',
      SUCCESS: 'AP ${attributes.name} has rebooted',
      FAIL: 'AP ${attributes.name} failed to reboot'
    }
  },
  FACTORY_RESET: {
    messages: {
      PENDING: '${attributes.name}: Resetting to factory defaults',
      SUCCESS: '${attributes.name} was successfully reset to factory defaults',
      FAIL: '${attributes.name} was not reset to factory defaults'
    }
  },
  AddApGroup: {
    messages: {
      PENDING: 'Adding AP group "${attributes.name}"',
      SUCCESS: 'AP group "${attributes.name}" was added',
      FAIL: 'AP group "${attributes.name}" was not added'
    },
    link: ''
  },
  UpdateApGroup: {
    messages: {
      PENDING: 'Updating AP group "${attributes.name}"',
      SUCCESS: 'AP group "${attributes.name}" was updated',
      FAIL: 'AP group "${attributes.name}" was not updated'
    },
    link: ''
  },
  DeleteApGroup: {
    messages: {
      PENDING: 'Deleting AP group "${attributes.name}"',
      SUCCESS: 'AP group "${attributes.name}" was deleted',
      FAIL: 'AP group "${attributes.name}" was not deleted'
    }
  },
  DeleteApGroups: {
    messages: {
      PENDING: 'Deleting ${count} AP groups',
      SUCCESS: '${count} AP groups were deleted',
      FAIL: '${count} AP groups were not deleted'
    }
  },
  AddVenue: {
    messages: {
      PENDING: 'Adding venue "${attributes.name}"',
      SUCCESS: 'Venue "${attributes.name}" was added',
      FAIL: 'Venue "${attributes.name}" was not added'
    },
    link: '/t/${tenantId}/venues/${entityId}/overview'
  },
  UpdateVenue: {
    messages: {
      PENDING: 'Updating venue "${attributes.name}"',
      SUCCESS: 'Venue "${attributes.name}" was updated',
      FAIL: 'Venue "${attributes.name}" was not updated'
    },
    link: '/t/${tenantId}/venues/${entityId}/overview'
  },
  DeleteVenue: {
    messages: {
      PENDING: 'Deleting venue "${attributes.name}"',
      SUCCESS: 'Venue "${attributes.name}" was deleted',
      FAIL: 'Venue "${attributes.name}" was not deleted'
    }
  },
  DeleteVenues: {
    messages: {
      PENDING: 'Deleting ${count} venues',
      SUCCESS: '${count} venues were deleted',
      FAIL: '${count} venues were not deleted'
    }
  },
  AddNetworkDeep: {
    messages: {
      PENDING: 'Adding network "${attributes.name}"',
      SUCCESS: 'Network "${attributes.name}" was added',
      FAIL: 'Network "${attributes.name}" was not added'
    },
    link: '/t/${tenantId}/networks/${entityId}/network-details/overview'
  },
  UpdateNetworkDeep: {
    messages: {
      PENDING: 'Updating network "${attributes.name}"',
      SUCCESS: 'Network "${attributes.name}" was updated',
      FAIL: 'Network "${attributes.name}" was not updated'
    },
    link: '/t/${tenantId}/networks/${entityId}/network-details/overview'
  },
  UpdateNetwork: {
    messages: {
      PENDING: 'Updating network "${attributes.name}"',
      SUCCESS: 'Network "${attributes.name}" was updated',
      FAIL: 'Network "${attributes.name}" was not updated'
    },
    link: '/t/${tenantId}/networks/${entityId}/network-details/overview'
  },
  DeleteNetwork: {
    messages: {
      PENDING: 'Deleting network "${attributes.name}"',
      SUCCESS: 'Network "${attributes.name}" was deleted',
      FAIL: 'Network "${attributes.name}" was not deleted'
    }
  },
  DeleteNetworks: {
    messages: {
      PENDING: 'Deleting ${count} networks',
      SUCCESS: '${count} networks were deleted',
      FAIL: 'Network ${count} were not deleted'
    }
  },
  AddVlanPool: {
    messages: {
      PENDING: 'Adding VLAN pool "${attributes.name}"',
      SUCCESS: 'VLAN pool "${attributes.name}" was added',
      FAIL: 'VLAN pool "${attributes.name}" was not added'
    }
  },
  UpdateVlanPool: {
    messages: {
      PENDING: 'Updating VLAN pool "${attributes.name}"',
      SUCCESS: 'VLAN pool "${attributes.name}" was updated',
      FAIL: 'VLAN pool "${attributes.name}" was not updated'
    }
  },
  DeleteVlanPool: {
    messages: {
      PENDING: 'Deleting VLAN pool "${attributes.name}"',
      SUCCESS: 'VLAN pool "${attributes.name}" was deleted',
      FAIL: 'VLAN pool "${attributes.name}" was not deleted'
    }
  },
  DeleteVlanPools: {
    messages: {
      PENDING: 'Deleting ${count} VLAN pools',
      SUCCESS: '${count} VLAN pools were deleted',
      FAIL: '${count} VLAN pools were not deleted'
    }
  },
  AddApplicationPolicy: {
    messages: {
      PENDING: 'Adding Application policy "${attributes.name}"',
      SUCCESS: 'Application policy "${attributes.name}" was added',
      FAIL: 'Application policy "${attributes.name}" was not added'
    }
  },
  UpdateApplicationPolicy: {
    messages: {
      PENDING: 'Updating Application policy "${attributes.name}"',
      SUCCESS: 'Application policy "${attributes.name}" was updated',
      FAIL: 'Application policy "${attributes.name}" was not updated'
    }
  },
  DeleteApplicationPolicy: {
    messages: {
      PENDING: 'Deleting Application policy "${attributes.name}"',
      SUCCESS: 'Application policy "${attributes.name}" was deleted',
      FAIL: 'Application policy "${attributes.name}" was not deleted'
    }
  },
  DeleteApplicationPolicies: {
    messages: {
      PENDING: 'Deleting ${count} Application policies',
      SUCCESS: '${count} Application policies were deleted',
      FAIL: '${count} Application policies were not deleted'
    }
  },
  AddAccessControlProfile: {
    messages: {
      PENDING: 'Adding access control profile "${attributes.name}"',
      SUCCESS: 'Access control profile "${attributes.name}" was added',
      FAIL: 'Access control profile "${attributes.name}" was not added'
    }
  },
  UpdateAccessControlProfile: {
    messages: {
      PENDING: 'Updating access control profile "${attributes.name}"',
      SUCCESS: 'Access control profile "${attributes.name}" was updated',
      FAIL: 'Access control profile "${attributes.name}" was not updated'
    }
  },
  DeleteAccessControlProfile: {
    messages: {
      PENDING: 'Deleting access control profile "${attributes.name}"',
      SUCCESS: 'Access control profile "${attributes.name}" was deleted',
      FAIL: 'Access control profile "${attributes.name}" was not deleted'
    }
  },
  DeleteBulkAccessControlProfiles: {
    messages: {
      PENDING: 'Deleting ${count} access control profiles',
      SUCCESS: '${count} access control profiles were deleted',
      FAIL: '${count} access control profiles were not deleted'
    }
  },
  AddCloudpathServer: {
    messages: {
      PENDING: 'Adding cloudpath server "${attributes.name}"',
      SUCCESS: 'Cloudpath server "${attributes.name}" was added',
      FAIL: 'Cloudpath server "${attributes.name}" was not added'
    }
  },
  UpdateCloudpathServer: {
    messages: {
      PENDING: 'Updating cloudpath server "${attributes.name}"',
      SUCCESS: 'Cloudpath server "${attributes.name}" was updated',
      FAIL: 'Cloudpath server "${attributes.name}" was not updated'
    }
  },
  DeleteCloudpathServer: {
    messages: {
      PENDING: 'Deleting cloudpath server "${attributes.name}"',
      SUCCESS: 'Cloudpath server "${attributes.name}" was deleted',
      FAIL: 'Cloudpath server "${attributes.name}" was not deleted'
    }
  },
  DeleteCloudpathServers: {
    messages: {
      PENDING: 'Deleting ${count} cloudpath servers',
      SUCCESS: '${count} cloudpath servers were deleted',
      FAIL: '${count} cloudpath servers were not deleted'
    }
  },
  CloudpathServerPositionUpdateUnfloor: {
    messages: {
      PENDING: 'Removing cloudpath server from floor plan',
      SUCCESS: 'Cloudpath server was removed from Floor plan',
      FAIL: 'Cloudpath server was not removed on Floor plan'
    }
  },
  UpdateCloudpathServerPosition: {
    messages: {
      PENDING: 'Placing cloudpath server on floor plan',
      SUCCESS: 'Cloudpath server was placed on Floor plan',
      FAIL: 'Cloudpath server was not placed on Floor plan'
    }
  },
  UpdateMeshOptions: {
    messages: {
      WAITING: 'Pending switching Mesh On/Off',
      PENDING: 'Venue "${attributes.name}": Switching Mesh On/Off',
      SUCCESS: 'Venue "${attributes.name}": Mesh was switched On/Off',
      FAIL: 'Venue "${attributes.name}": Mesh was not switched On/Off'
    },
    link: '/t/${tenantId}/venues/${entityId}/${link}'
  },
  AddNetworkVenue: {
    messages: {
      PENDING: 'Activating network "${attributes.name}"',
      SUCCESS: 'Network "${attributes["network.name"]}" was activated',
      FAIL: 'Network "${attributes["network.name"]}" was not activated'
    }
  },
  UpdateNetworkVenue: {
    messages: {
      PENDING: 'Updating network "${attributes.name}"',
      SUCCESS: 'Network "${attributes["network.name"]}" was updated',
      FAIL: 'Network "${attributes["network.name"]}" was not updated'
    }
  },
  DeleteNetworkVenue: {
    messages: {
      PENDING: 'Deactivating network "${attributes.name}"',
      SUCCESS: 'Network "${attributes["network.name"]}" was deactivated',
      FAIL: 'Network "${attributes["network.name"]}" was not deactivated'
    }
  },
  AcceptOrRejectDelegation: {
    messages: {
      PENDING: 'Updating invitation of "${attributes.name}"',
      SUCCESS: 'Invitation of "${attributes.name}" was updated',
      FAIL: 'Invitation of "${attributes.name}" was not updated'
    }
  },
  UpdateUserProfile: {
    messages: {
      PENDING: 'Updating user profile',
      SUCCESS: 'User profile was updated',
      FAIL: 'User profile was not updated'
    }
  },
  InviteVar: {
    messages: {
      PENDING: 'Sending invitation to 3rd party administrator',
      SUCCESS: 'Invitation sent to 3rd party administrator',
      FAIL: 'Sending invitation to 3rd party administrator failed'
    },
    link: '/t/${tenantId}/administration/administrators'
  },
  UpdateOrderOfMembers: {
    messages: {
      PENDING: 'Updating Stack members...',
      SUCCESS: 'Stack members was updated',
      FAIL: 'Stack members was not updated'
    }
  },
  AddSwitch: {
    messages: {
      PENDING: 'Adding Switch "${attributes.name}"',
      SUCCESS: 'Switch "${attributes.id}" was added',
      FAIL: 'Switch "${attributes.id}" was not added'
    },
    link: '/t/${tenantId}/switches/${entityId}/details/overview'
  },
  ConvertToStack: {
    messages: {
      PENDING: 'Adding Switch "${attributes.name}"',
      SUCCESS: 'Switch "${attributes.serialNumber}" was added',
      FAIL: 'Switch "${attributes.serialNumber}" was not added'
    },
    link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/overview'
  },
  UpdateSwitch: {
    messages: {
      PENDING: 'Updating Switch "${attributes.name}"',
      SUCCESS: 'Switch "${attributes.id}" was updated',
      FAIL: 'Switch "${attributes.id}" was not updated'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${entityId}/details/config/history'
    }
  },
  DeleteSwitches: {
    messages: {
      PENDING: 'Deleting ${count} Switch(es)',
      SUCCESS: '${count} Switch(es) were deleted',
      FAIL: '${count} Switch(es) were not deleted'
    }
  },
  Ack: { //AcknowledgeSwitch
    messages: {
      PENDING: 'Acknowledging Switch',
      SUCCESS: 'Switch was acknowledged',
      FAIL: 'Switch was not acknowledged'
    }
  },
  ImportSwitchesCSV: {
    messages: {
      PENDING: 'Importing Switches...',
      SUCCESS: 'Switches were imported successfully',
      FAIL: 'Import Failed "${attributes.error}"'
    }
  },
  AddMember: {
    messages: {
      PENDING: 'Adding Stack member...',
      SUCCESS: 'Stack member was added',
      FAIL: 'Stack member was not added'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  UpdateVenueSettings: {
    messages: {
      PENDING: 'Updating Venue settings...',
      SUCCESS: 'Venue settings were updated',
      FAIL: 'Venue settings were not updated'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/venues/${entityId}/network-devices/switch',
      tabView: 'config'
    }
  },
  UpdateAaaSetting: {
    messages: {
      PENDING: 'Updating AAA settings...',
      SUCCESS: 'AAA settings were updated',
      FAIL: 'AAA settings were not updated'
    }
  },
  AddDhcpServer: {
    messages: {
      PENDING: 'Adding DHCP server...',
      SUCCESS: 'DHCP server was added',
      FAIL: 'DHCP server were not added'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  UpdateDhcpServer: {
    messages: {
      PENDING: 'Updating DHCP server...',
      SUCCESS: 'DHCP server was updated',
      FAIL: 'DHCP server were not updated'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  DeleteDhcpServer: {
    messages: {
      PENDING: 'Deleting DHCP server...',
      SUCCESS: 'DHCP server was deleted',
      FAIL: 'DHCP server were not deleted'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  DeleteDhcpServers: {
    messages: {
      PENDING: 'Deleting DHCP server(s)...',
      SUCCESS: 'DHCP server(s) was deleted',
      FAIL: 'DHCP server(s) were not deleted'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  UpdateDhcpServerState: {
    messages: {
      PENDING: 'Updaing DHCP server state...',
      SUCCESS: 'DHCP server state was updated',
      FAIL: 'DHCP server state were not updated'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  AddStaticRoute: {
    messages: {
      PENDING: 'Adding static route...',
      SUCCESS: 'Static route was added',
      FAIL: 'Static route were not added'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  UpdateStaticRoute: {
    messages: {
      PENDING: 'Updating static route...',
      SUCCESS: 'Static route was updated',
      FAIL: 'Static route were not updated'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  DeleteStaticRoutes: {
    messages: {
      PENDING: 'Deleting ${count} static route(s)',
      SUCCESS: 'Static route(s) were deleted',
      FAIL: 'Static route(s) were not deleted'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  AddVePort: {
    messages: {
      PENDING: 'Adding VE port...',
      SUCCESS: 'VE port was added',
      FAIL: 'VE port were not added'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  UpdateVePort: {
    messages: {
      PENDING: 'Updating VE port...',
      SUCCESS: 'VE port was updated',
      FAIL: 'VE port were not updated'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  DeleteVePorts: {
    messages: {
      PENDING: 'Deleting ${count} VE port(s)',
      SUCCESS: 'VE port(s) were deleted',
      FAIL: 'VE port(s) were not deleted'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  AddSwitchAcl: {
    messages: {
      PENDING: 'Adding ACL "${attributes.name}"',
      SUCCESS: 'ACL "${attributes.name}" was added',
      FAIL: 'ACL "${attributes.name}" was not added'
    }
  },
  UpdateSwitchAcl: {
    messages: {
      PENDING: 'Updating ACL "${attributes.name}"',
      SUCCESS: 'ACL "${attributes.name}" was updated',
      FAIL: 'ACL "${attributes.name}" was not updated'
    }
  },
  DeleteSwitchAcls: {
    messages: {
      PENDING: 'Deleting ACL(s)...',
      SUCCESS: 'ACL(s) was deleted',
      FAIL: 'ACL(s) was not deleted'
    }
  },
  AddIpPort: {
    messages: {
      PENDING: 'Adding IP port...',
      SUCCESS: 'IP port was added',
      FAIL: 'IP port were not added'
    }
  },
  UpdateIpPort: {
    messages: {
      PENDING: 'Updating IP port...',
      SUCCESS: 'IP port was updated',
      FAIL: 'IP port were not updated'
    }
  },
  DeleteIpPorts: {
    messages: {
      PENDING: 'Deleting ${count} IP port(s)',
      SUCCESS: 'IP port(s) were deleted',
      FAIL: 'IP port(s) were not deleted'
    }
  },
  DeleteRoutedInterfaces: {
    messages: {
      PENDING: 'Deleting ${count} routed interface(s)',
      SUCCESS: 'Routed interface(s) were deleted',
      FAIL: 'Routed interface(s) were not deleted'
    }
  },
  AddSwitchVlan: {
    messages: {
      PENDING: 'Adding VLAN...',
      SUCCESS: 'VLAN was added',
      FAIL: 'VLAN were not added'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  UpdateSwitchVlan: {
    messages: {
      PENDING: 'Updating VLAN...',
      SUCCESS: 'VLAN was updated',
      FAIL: 'VLAN were not updated'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  DeleteSwitchVlans: {
    messages: {
      PENDING: 'Deleting VLAN(s)',
      SUCCESS: 'VLAN(s) were deleted',
      FAIL: 'VLAN(s) were not deleted'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  AddLag: {
    messages: {
      PENDING: 'Adding LAG...',
      SUCCESS: 'LAG was added',
      FAIL: 'LAG was not added'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  UpdateLag: {
    messages: {
      PENDING: 'Updating LAG...',
      SUCCESS: 'LAG was updated',
      FAIL: 'LAG was not updated'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  DeleteLag: {
    messages: {
      PENDING: 'Deleting LAG...',
      SUCCESS: 'LAG was deleted',
      FAIL: 'LAG was not deleted'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  DeleteConfigBackups: {
    messages: {
      PENDING: 'Deleting Backup(s)...',
      SUCCESS: 'Backup(s) was deleted',
      FAIL: 'Backup(s) was not deleted'
    }
  },
  DeleteDelegation: {
    messages: {
      PENDING: 'Revoking access rights of 3rd party administrator',
      SUCCESS: 'Access rights of 3rd party administrator were revoked',
      FAIL: 'Access rights of 3rd party administrator were not revoked'
    },
    link: '/t/${tenantId}/administration/administrators'
  },
  AllowAccessSupport: {
    messages: {
      PENDING: 'Enabling support access',
      SUCCESS: 'Support access was enabled',
      FAIL: 'Support access was not disabled'
    }
  },
  InviteSupport: {
    messages: {
      PENDING: 'Enabling support access',
      SUCCESS: 'Support access was enabled',
      FAIL: 'Support access was not disabled'
    }
  },
  DeleteSupportDelegation: {
    messages: {
      PENDING: 'Disabling support access',
      SUCCESS: 'Support access was disabled',
      FAIL: 'Support access was not enabled'
    }
  },
  DisableAccessSupport: {
    messages: {
      PENDING: 'Disabling support access',
      SUCCESS: 'Support access was disabled',
      FAIL: 'Support access was not enabled'
    }
  },
  UpdateVenueLanPorts: {
    messages: {
      WAITING: 'Pending updating LAN port settings',
      PENDING: 'Updating LAN port settings',
      SUCCESS: 'LAN port settings were updated',
      FAIL: 'LAN port settings were not updated'
    }
  },
  UpdateVenueRogueAp: {
    messages: {
      WAITING: 'Pending updating Rogue Ap settings',
      PENDING: 'Venue "${attributes.name}": Updating Rogue AP settings',
      SUCCESS: 'Venue "${attributes.name}": Rogue AP settings were updated',
      FAIL: 'Venue "${attributes.name}": Rogue AP settings were not updated'
    }
  },
  UpdateVenueExternalAntenna: {
    messages: {
      WAITING: 'Pending updating External Antenna settings',
      PENDING: 'Updating External Antenna settings',
      SUCCESS: 'External Antenna settings were updated',
      FAIL: 'External Antenna settings were not updated'
    }
  },
  UpdateApCustomization: {
    messages: {
      PENDING: 'AP "${attributes.name}": Customizing Wifi AP settings',
      SUCCESS: 'AP "${attributes.name}": Wifi AP settings were customized',
      FAIL: 'AP "${attributes.name}": Wifi AP settings were not customized'
    }
  },
  ResetApCustomization: {
    messages: {
      PENDING: 'AP "${attributes.name}": Resetting Wifi AP settings',
      SUCCESS: 'AP "${attributes.name}": Wifi AP settings were reset',
      FAIL: 'AP "${attributes.name}": Wifi AP settings were not reset'
    }
  },
  ImportApsCSV: {
    messages: {
      PENDING: 'Importing APs...',
      SUCCESS: 'APs were imported successfully',
      FAIL: 'Import Failed "${attributes.error}"'
    },
    link: '${link}'
  },
  AddFloorPlan: {
    messages: {
      PENDING: 'Adding floor plan',
      SUCCESS: 'Floor plan was added',
      FAIL: 'Floor plan was not added'
    }
  },
  UpdateFloorPlan: {
    messages: {
      PENDING: 'Updating floor plan',
      SUCCESS: 'Floor plan was updated',
      FAIL: 'Floor plan was not updated'
    }
  },
  UpdateCalibrationsPoints: {
    messages: {
      PENDING: 'Updating floor plan calibration',
      SUCCESS: 'Floor plan calibration was updated',
      FAIL: 'Floor plan calibration was not updated'
    }
  },
  DeleteFloorPlan: {
    messages: {
      PENDING: 'Deleting floor plan',
      SUCCESS: 'Floor plan was deleted',
      FAIL: 'Floor plan was not deleted'
    }
  },
  UpdateApPosition: {
    messages: {
      PENDING: 'Placing AP on floor plan',
      SUCCESS: 'AP was placed on Floor plan',
      FAIL: 'AP was not placed on Floor plan'
    }
  },
  PositionUpdateUnfloor: {
    messages: {
      PENDING: 'Removing AP from floor plan',
      SUCCESS: ' AP was removed from Floor plan',
      FAIL: 'AP was not placed on Floor plan'
    }
  },
  UpdateSwitchPosition: {
    messages: {
      PENDING: 'Placing Switch on floor plan',
      SUCCESS: 'Switch was placed on Floor plan',
      FAIL: 'Switch was not placed on Floor plan'
    }
  },
  SwitchPositionUpdateUnfloor: {
    messages: {
      PENDING: 'Removing Switch from floor plan',
      SUCCESS: 'Switch was removed from Floor plan',
      FAIL: 'Switch was not placed on Floor plan'
    }
  },
  InviteAdmin: {
    messages: {
      PENDING: 'Adding administrator',
      SUCCESS: 'Administrator was added',
      FAIL: 'Administrator was not added'
    },
    link: ''
  },
  UpdateAdmin: {
    messages: {
      PENDING: 'Updating administrator',
      SUCCESS: 'Administrator was updated',
      FAIL: 'Administrator was not updated'
    },
    link: ''
  },
  DeleteAdmin: {
    messages: {
      PENDING: 'Deleting Administrator',
      SUCCESS: 'Administrator was deleted',
      FAIL: 'Administrator was not deleted'
    }
  },
  DeleteAdmins: {
    messages: {
      PENDING: 'Deleting ${count} Administrators',
      SUCCESS: '${count} Administrators were deleted',
      FAIL: '${count} Administrators were not deleted'
    }
  },
  UpdateVenueTriBandRadioCustomization: {
    messages: {
      WAITING: 'Pending updating tri-band radio settings',
      PENDING: 'Venue "${attributes.name}": Updating tri-band radio settings',
      SUCCESS: 'Venue "${attributes.name}": Tri-band radio settings were updated',
      FAIL: 'Venue" "${attributes.name}": Tri-band radio settings were not updated'
    }
  },
  UpdateVenueRadioCustomization: {
    messages: {
      WAITING: 'Pending updating radio settings',
      PENDING: 'Venue "${attributes.name}": Updating radio settings',
      SUCCESS: 'Venue "${attributes.name}": Radio settings were updated',
      FAIL: 'Venue "${attributes.name}": Radio settings were not updated'
    }
  },
  UpdateVenueApModelCellular: {
    messages: {
      WAITING: 'Pending updating cellular radio settings',
      PENDING: 'Venue "${attributes.name}": Updating cellular radio settings',
      SUCCESS: 'Venue "${attributes.name}": Cellular radio settings were updated',
      FAIL: 'Venue "${attributes.name}": Cellular radio settings were not updated'
    }
  },
  UpdateVenueSyslog: {
    messages: {
      PENDING: 'Venue "${attributes.name}": Updating syslog server settings',
      SUCCESS: 'Venue "${attributes.name}": Syslog server settings were updated',
      FAIL: 'Venue "${attributes.name}": Syslog server settings were not updated'
    }
  },
  BindVenueVspot: {
    messages: {
      WAITING: 'Pending: Venue "${attributes.name}": Switching vSPoT server On',
      PENDING: 'Venue "${attributes.name}": Switching vSPoT server On',
      SUCCESS: 'Venue "${attributes.name}": vSPoT server was switched On',
      FAIL: 'Venue "${attributes.name}": vSPoT server was not switched On'
    }
  },
  UnbindVenueVspot: {
    messages: {
      WAITING: 'Pending: Venue "${attributes.name}": Switching vSPoT server Off',
      PENDING: 'Venue "${attributes.name}": Switching vSPoT server Off',
      SUCCESS: 'Venue "${attributes.name}": vSPoT server was switched Off',
      FAIL: 'Venue "${attributes.name}": vSPoT server was not switched Off'
    }
  },
  AddVspot: {
    messages: {
      PENDING: 'Adding vSPoT server',
      SUCCESS: 'vSPoT server was added',
      FAIL: 'vSPoT server was not added'
    }
  },
  UpdateVspot: {
    messages: {
      PENDING: 'Updating vSPoT server',
      SUCCESS: 'vSPoT server was updated',
      FAIL: 'vSPoT server was not updated'
    }
  },
  DeleteVspot: {
    messages: {
      PENDING: 'Deleteing vSPoT server',
      SUCCESS: 'vSPoT server was deleted',
      FAIL: 'vSPoT server was not deleted'
    }
  },
  AddDevicePolicy: {
    messages: {
      PENDING: 'Adding Device policy "${attributes.name}"',
      SUCCESS: 'Device policy "${attributes.name}" was added',
      FAIL: 'Device policy  "${attributes.name}" was not added'
    }
  },
  UpdateDevicePolicy: {
    messages: {
      PENDING: 'Updating Device policy "${attributes.name}"',
      SUCCESS: 'Device policy "${attributes.name}" was updated',
      FAIL: 'Device policy "${attributes.name}" was not updated'
    }
  },
  DeleteDevicePolicy: {
    messages: {
      PENDING: 'Deleting Device policy "${attributes.name}"',
      SUCCESS: 'Device policy "${attributes.name}" was deleted',
      FAIL: 'Device policy "${attributes.name}" was not deleted'
    }
  },
  AddDpskPassphrase: {
    messages: {
      PENDING: 'Adding DPSK passphrase',
      SUCCESS: 'DPSK passphrase was added',
      FAIL: 'DPSK passphrase was not added'
    }
  },
  DeleteDpskPassphrase: {
    messages: {
      PENDING: 'Deleting DPSK passphrase',
      SUCCESS: 'DPSK passphrase was deleted',
      FAIL: 'DPSK passphrase was not deleted'
    }
  },
  DeleteDpskPassphrases: {
    messages: {
      PENDING: 'Deleting ${count} DPSK passphrases',
      SUCCESS: '${count} DPSK passphrases were deleted',
      FAIL: '${count} DPSK passphrases were not deleted'
    }
  },
  ExportDPSKs: {
    messages: {
      PENDING: 'Exporting DPSK passphrases',
      SUCCESS: 'DPSK passphrases were exported',
      FAIL: 'DPSK passphrases were not exported'
    }
  },
  ImportDpskPassphrasesCSV: {
    messages: {
      PENDING: 'Importing DPSK passphrases',
      SUCCESS: 'DPSK passphrases were imported',
      FAIL: 'DPSK passphrases were not imported'
    }
  },
  DeleteBulkDevicePolicies: {
    messages: {
      PENDING: 'Deleting ${count} Device policies',
      SUCCESS: '${count} Device policies were deleted',
      FAIL: '${count} Device policies were not deleted'
    }
  },
  AddL3AclPolicy: {
    messages: {
      PENDING: 'Adding L3 policy "${attributes.name}"',
      SUCCESS: 'L3 policy "${attributes.name}" was added',
      FAIL: 'L3 policy  "${attributes.name}" was not added'
    }
  },
  UpdateL3AclPolicy: {
    messages: {
      PENDING: 'Updating L3 policy "${attributes.name}"',
      SUCCESS: 'L3 policy "${attributes.name}" was updated',
      FAIL: 'L3 policy "${attributes.name}" was not updated'
    }
  },
  DeleteL3AclPolicy: {
    messages: {
      PENDING: 'Deleting L3 policy "${attributes.name}"',
      SUCCESS: 'L3 policy "${attributes.name}" was deleted',
      FAIL: 'L3 policy "${attributes.name}" was not deleted'
    }
  },
  DeleteBulkL3AclPolicies: {
    messages: {
      PENDING: 'Deleting ${count} L3 policies',
      SUCCESS: '${count} L3 policies were deleted',
      FAIL: '${count} L3 policies were not deleted'
    }
  },
  AddL2AclPolicy: {
    messages: {
      PENDING: 'Adding L2 policy "${attributes.name}"',
      SUCCESS: 'L2 policy "${attributes.name}" was added',
      FAIL: 'L2 policy  "${attributes.name}" was not added'
    }
  },
  UpdateL2AclPolicy: {
    messages: {
      PENDING: 'Updating L2 policy "${attributes.name}"',
      SUCCESS: 'L2 policy "${attributes.name}" was updated',
      FAIL: 'L2 policy "${attributes.name}" was not updated'
    }
  },
  DeleteL2AclPolicy: {
    messages: {
      PENDING: 'Deleting L2 policy "${attributes.name}"',
      SUCCESS: 'L2 policy "${attributes.name}" was deleted',
      FAIL: 'L2 policy "${attributes.name}" was not deleted'
    }
  },
  DeleteBulkL2AclPolicies: {
    messages: {
      PENDING: 'Deleting ${count} L2 policies',
      SUCCESS: '${count} L2 policies were deleted',
      FAIL: '${count} L2 policies were not deleted'
    }
  },
  AddUrlFilteringPolicy: {
    messages: {
      PENDING: 'Adding profile "${attributes.name}"',
      SUCCESS: 'Profile "${attributes.name}" was added',
      FAIL: 'Profile  "${attributes.name}" was not added'
    }
  },
  UpdateUrlFilteringPolicy: {
    messages: {
      PENDING: 'Updating profile "${attributes.name}"',
      SUCCESS: 'Profile "${attributes.name}" was updated',
      FAIL: 'Profile "${attributes.name}" was not updated'
    }
  },
  DeleteUrlFilteringPolicy: {
    messages: {
      PENDING: 'Deleting profile "${attributes.name}"',
      SUCCESS: 'Profile "${attributes.name}" was deleted',
      FAIL: 'Profile "${attributes.name}" was not deleted'
    }
  },
  DeleteBulkUrlFilteringPolicies: {
    messages: {
      PENDING: 'Deleting ${count} profiles',
      SUCCESS: '${count} profiles were deleted',
      FAIL: '${count} profiles were not deleted'
    }
  },
  AddClientIsolationAllowlist: {
    messages: {
      PENDING: 'Adding client isolation allowlist "${attributes.name}"',
      SUCCESS: 'Client isolation allowlist "${attributes.name}" was added',
      FAIL: 'Client isolation allowlist "${attributes.name}" was not added'
    }
  },
  UpdateClientIsolationAllowlist: {
    messages: {
      PENDING: 'Updating client isolation allowlist "${attributes.name}"',
      SUCCESS: 'Client isolation allowlist "${attributes.name}" was updated',
      FAIL: 'Client isolation allowlist "${attributes.name}" was not updated'
    }
  },
  DeleteClientIsolationAllowlists: {
    messages: {
      PENDING: 'Deleting ${count} client isolation allowlists',
      SUCCESS: '${count} client isolation allowlists were deleted',
      FAIL: '${count} client isolation allowlists were not deleted'
    }
  },
  DeleteClientIsolationAllowlist: {
    messages: {
      PENDING: 'Deleting ${count} client isolation allowlist',
      SUCCESS: '${count} client isolation allowlist were deleted',
      FAIL: '${count} client isolation allowlist were not deleted'
    }
  },
  AddWiFiCallingProfile: {
    messages: {
      PENDING: 'Adding WiFi Calling profile "${attributes.name}"',
      SUCCESS: 'WiFi Calling profile "${attributes.profileName}" was added',
      FAIL: 'WiFi Calling profile "${attributes.profileName}" was not added'
    }
  },
  UpdateWiFiCallingProfile: {
    messages: {
      PENDING: 'Updating WiFi Calling profile "${attributes.name}"',
      SUCCESS: 'WiFi Calling profile "${attributes.profileName}" was updated',
      FAIL: 'WiFi Calling profile "${attributes.profileName}" was not updated'
    }
  },
  DeleteWiFiCallingProfile: {
    messages: {
      PENDING: 'Deleting WiFi Calling profile "${attributes.name}"',
      SUCCESS: 'WiFi Calling profile "${attributes.profileName}" was deleted',
      FAIL: 'WiFi Calling profile "${attributes.profileName}" was not deleted'
    }
  },
  DeleteWiFiCallingProfiles: {
    messages: {
      PENDING: 'Deleting ${count} WiFi Calling profiles',
      SUCCESS: '${count} WiFi Calling profiles were deleted',
      FAIL: '${count} WiFi Calling profiles were not deleted'
    }
  },
  AddRoguePolicy: {
    messages: {
      PENDING: 'Adding Rogue profile',
      SUCCESS: 'Rogue profile was added',
      FAIL: 'Rogue profile was not added'
    }
  },
  UpdateRoguePolicy: {
    messages: {
      PENDING: 'Updating profile "${attributes.name}"',
      SUCCESS: '${count} profiles were updated',
      FAIL: 'Profile "${attributes.name}" was not updated'
    }
  },
  DeleteRoguePolicy: {
    messages: {
      PENDING: 'Deleting profile "${attributes.name}"',
      SUCCESS: 'Profile "${attributes.name}" was deleted',
      FAIL: 'Profile "${attributes.name}" was not deleted'
    }
  },
  DeleteRoguePolicies: {
    messages: {
      PENDING: 'Deleting ${count} profiles',
      SUCCESS: '${count} profiles were deleted',
      FAIL: '${count} profiles were not deleted'
    }
  },
  AddDhcpServiceProfile: {
    messages: {
      PENDING: 'Adding DHCP service profile "${attributes.name}"',
      SUCCESS: 'DHCP service profile "${attributes.name}" was added',
      FAIL: 'DHCP service profile "${attributes.name}" was not added'
    }
  },
  UpdateDhcpServiceProfile: {
    messages: {
      PENDING: 'Updating DHCP service profile "${attributes.name}"',
      SUCCESS: 'DHCP service profile "${attributes.name}" was updated',
      FAIL: 'DHCP service profile "${attributes.name}" was not updated'
    }
  },
  DeleteDhcpServiceProfile: {
    messages: {
      PENDING: 'Deleting DHCP service profile "${attributes.name}"',
      SUCCESS: 'DHCP service profile "${attributes.name}" was deleted',
      FAIL: 'DHCP service profile "${attributes.name}" was not deleted'
    }
  },
  DeleteDhcpServiceProfiles: {
    messages: {
      PENDING: 'Deleting ${count} DHCP service profiles',
      SUCCESS: '${count} DHCP service profiles were deleted',
      FAIL: '${count} DHCP service profiles were not deleted'
    }
  },
  UpdateDhcpServiceProfilesBindToVenue: {
    messages: {
      PENDING: 'Update DHCP service profiles',
      SUCCESS: 'DHCP service profiles were updated',
      FAIL: 'DHCP service profiles were not updated'
    }
  },
  UpdateVenueDhcpServiceApSetting: {
    messages: {
      PENDING: 'Update DHCP service setting',
      SUCCESS: 'DHCP service setting were updated',
      FAIL: 'DHCP service setting were not updated'
    }
  },
  UpdateVenueLedOn: {
    messages: {
      WAITING: 'Pending updating AP LEDs settings',
      PENDING: 'Updating AP LEDs settings',
      SUCCESS: '${count} AP LEDs settings were updated',
      FAIL: '${count} AP LEDs settings were not updated'
    }
  },
  UpdateDenialOfServiceProtection: {
    messages: {
      WAITING: 'Pending updating DoS Protection',
      PENDING: 'Updating WiFi DoS Protection',
      SUCCESS: 'WiFi DoS Protection were updated',
      FAIL: 'WiFi DoS Protection were not updated'
    }
  },
  UpdateApRadioCustomization: {
    messages: {
      PENDING: 'AP "${attributes.name}": Updating radio settings',
      SUCCESS: 'AP "${attributes.name}": Radio settings were updated',
      FAIL: 'AP "${attributes.name}": Radio settings were not updated'
    }
  },
  UpdateApLanPorts: {
    messages: {
      PENDING: 'AP "${attributes.name}": Customizing LAN port settings',
      SUCCESS: 'AP "${attributes.name}": LAN port settings were customized',
      FAIL: 'AP "${attributes.name}": LAN port settings were not customized'
    }
  },
  ResetApLanPorts: {
    messages: {
      PENDING: 'AP "${attributes.name}": Resetting LAN port settings',
      SUCCESS: 'AP "${attributes.name}": LAN port settings were reset',
      FAIL: 'AP "${attributes.name}": LAN port settings were not reset'
    }
  },
  UpdateApBonjourGateway: {
    messages: {
      PENDING: 'AP "${attributes.name}": Updating bonjour gateway settings',
      SUCCESS: 'AP "${attributes.name}": Bonjour gateway settings were updated',
      FAIL: 'AP "${attributes.name}": Bonjour gateway settings were not updated'
    }
  },
  UpdatePort: {
    messages: {
      PENDING: 'Updating port(s)...',
      SUCCESS: 'Port(s) was updated successfully',
      FAIL: 'Port(s) was not updated'
    }
  },
  UpdatePortsAmongSwitches: {
    messages: {
      PENDING: 'Updating port(s)...',
      SUCCESS: 'Port(s) was updated successfully',
      FAIL: 'Port(s) was not updated'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/switches/${attributes.serialNumber}/details/config/history'
    }
  },
  AddProfile: {
    messages: {
      PENDING: 'Adding switch profile "${attributes.name}"',
      SUCCESS: 'Switch profile "${attributes.name}" was added',
      FAIL: 'Switch profile "${attributes.name}" was not added'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/venues/${attributes.venueId}/network-devices/switch',
      tabView: 'config'
    }
  },
  UpdateProfile: {
    messages: {
      PENDING: 'Updating switch profile "${attributes.name}"',
      SUCCESS: 'Switch profile "${attributes.name}" was updated',
      FAIL: 'Switch profile "${attributes.name}" was not updated'
    },
    isSwitchConfig: {
      link: '/t/${tenantId}/venues/${attributes.venueId}/network-devices/switch',
      tabView: 'config'
    }
  },
  DeleteProfiles: {
    messages: {
      PENDING: 'Deleting profile(s)...',
      SUCCESS: 'Profile(s) was deleted',
      FAIL: 'Profile(s) were not deleted'
    }
  },
  AddCliTemplate: {
    messages: {
      PENDING: 'Adding CLI template "${attributes.name}"',
      SUCCESS: 'CLI template "${attributes.name}" was added',
      FAIL: 'CLI template "${attributes.name}" was not added'
    }
  },
  UpdateCliTemplate: {
    messages: {
      PENDING: 'Updating CLI template "${attributes.name}"',
      SUCCESS: 'CLI template "${attributes.name}" was updated',
      FAIL: 'CLI template "${attributes.name}" was not updated'
    }
  },
  DeleteCliTemplates: {
    messages: {
      PENDING: 'Deleting CLI template(s)...',
      SUCCESS: 'CLI template(s) was deleted',
      FAIL: 'CLI template(s) were not deleted'
    }
  },
  AddVlan: {
    messages: {
      PENDING: 'Adding VLAN "${attributes.name}"',
      SUCCESS: 'VLAN "${attributes.name}" was added',
      FAIL: 'VLAN "${attributes.name}" was not added'
    }
  },
  AddCliProfile: {
    messages: {
      PENDING: 'Adding CLI profile "${attributes.name}"',
      SUCCESS: 'CLI profile "${attributes.name}" was added',
      FAIL: 'CLI profile "${attributes.name}" was not added'
    }
  },
  UpdateCliProfile: {
    messages: {
      PENDING: 'Updating CLI profile "${attributes.name}"',
      SUCCESS: 'CLI profile "${attributes.name}" was updated',
      FAIL: 'CLI profile "${attributes.name}" was not updated'
    }
  },
  DeleteCliProfile: {
    messages: {
      PENDING: 'Deleting CLI profile(s)...',
      SUCCESS: 'CLI profile(s) was deleted',
      FAIL: 'CLI profile(s) were not deleted'
    }
  },
  AddAcl: {
    messages: {
      PENDING: 'Adding ACL "${attributes.name}"',
      SUCCESS: 'ACL "${attributes.name}" was added',
      FAIL: 'ACL "${attributes.name}" was not added'
    }
  },
  AddConfigBackup: {
    messages: {
      PENDING: 'Adding Backup "${attributes.name}"',
      SUCCESS: 'Backup "${attributes.name}" was added',
      FAIL: 'Backup "${attributes.name}" was not added'
    }
  },
  AddGuest: {
    messages: {
      PENDING: 'Adding Guest "${attributes.name}"',
      SUCCESS: 'Guest "${attributes.name}" was added',
      FAIL: 'Guest "${attributes.name}" was not added'
    },
    link: '${link}'
  },
  UpdateGuestStatus: {
    messages: {
      PENDING: 'Updating Guest "${attributes.name} status"',
      SUCCESS: 'Guest "${attributes.name}" was updated',
      FAIL: 'Guest "${attributes.name}" was not updated'
    },
    link: ''
  },
  DeleteGuest: {
    messages: {
      PENDING: 'Deleting Guest',
      SUCCESS: 'Guest was deleted',
      FAIL: 'Guest was not deleted'
    }
  },
  DeleteGuests: {
    messages: {
      PENDING: 'Deleting ${count} Guests',
      SUCCESS: '${count} Guests were deleted',
      FAIL: '${count} Guests were not deleted'
    }
  },
  EnableGuest: {
    messages: {
      PENDING: 'Enabling Guest',
      SUCCESS: 'Guest was enabled',
      FAIL: 'Guest was not enabled'
    }
  },
  DisableGuest: {
    messages: {
      PENDING: 'Disabling Guest',
      SUCCESS: 'Guest was disabled',
      FAIL: 'Guest was not disabled'
    }
  },
  ImportGuests: {
    messages: {
      PENDING: 'Importing guests...',
      SUCCESS: 'Guests were imported successfully',
      FAIL: 'Import Failed '
    },
    link: '${link}'
  },
  GenerateNewGuestPassword: {
    messages: {
      PENDING: 'Generating new password',
      SUCCESS: 'New password was generated',
      FAIL: 'New password was not generated'
    }
  },
  deactivateMspEc: {
    messages: {
      PENDING: 'Deactivating MSP-EC "${attributes.name}"',
      SUCCESS: 'Deactivate MSP-EC successfully',
      FAIL: 'Deactivate MSP-EC failed'
    }
  },
  reactivateMspEc: {
    messages: {
      PENDING: 'Reactivating MSP-EC "${attributes.name}"',
      SUCCESS: 'Reactivate MSP-EC successfully',
      FAIL: 'Reactivate MSP-EC failed'
    }
  },
  activateMspEcDevice: {
    messages: {
      PENDING: 'Updating MSP-EC "${attributes.name}"',
      SUCCESS: 'Update MSP-EC "${attributes.name}" successfully',
      FAIL: 'Update MSP-EC "${attributes.name}" failed'
    }
  },
  CreateDp: {
    messages: {
      PENDING: 'Adding DP "${attributes.name}"',
      SUCCESS: 'DP "${attributes.name}" was added',
      FAIL: 'DP "${attributes.name}" was not added'
    }
    // 'link': '/t/${tenantId}/dps/${entityId}/details/overview'
  },
  UpdateRecoveryPsk: {
    messages: {
      PENDING: 'Updating recovery passphrase',
      SUCCESS: 'Recovery passphrase was updated',
      FAIL: 'Recovery passphrase was not updated'
    },
    link: ''
  },
  AddAaaServer: {
    messages: {
      PENDING: 'Adding AAA server "${attributes.name}"',
      SUCCESS: 'AAA server "${attributes.name}" was added',
      FAIL: 'AAA server "${attributes.name}" was not added'
    }
  },
  UpdateAaaServer: {
    messages: {
      PENDING: 'Updating AAA server "${attributes.name}"',
      SUCCESS: 'AAA server "${attributes.name}" was updated',
      FAIL: 'AAA server "${attributes.name}" was not updated'
    }
  },
  DeleteAaaServer: {
    messages: {
      PENDING: 'Deleting AAA server "${attributes.name}"',
      SUCCESS: 'AAA server "${attributes.name}" was deleted',
      FAIL: 'AAA server "${attributes.name}" was not deleted'
    }
  },
  BulkDeleteAaaServers: {
    messages: {
      PENDING: 'Deleting ${count} AAA servers',
      SUCCESS: '${count} AAA servers were deleted',
      FAIL: '${count} AAA servers were not deleted'
    }
  }
}