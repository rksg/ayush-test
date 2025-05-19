import { TreeDataNode } from 'antd'
import { IntlShape }    from 'react-intl'

export function useScopeHierarchy ($t: IntlShape['$t']) {
  return [
    {
      title: $t({ defaultMessage: 'Wi-Fi' }),
      key: 'wifi',
      children: [
        {
          title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
          key: 'wifi.venue',
          children: [
            {
              title: $t({ defaultMessage: 'Wi-Fi' }),
              key: 'wifi.venue.wifi'
            },
            {
              title: $t({ defaultMessage: '<VenueSingular></VenueSingular> Management' }),
              key: 'wifi.venue.venue_management'
            },
            {
              title: $t({ defaultMessage: 'Property Management' }),
              key: 'wifi.venue.property_management'
            },
            {
              title: $t({ defaultMessage: 'Property Management - Units' }),
              key: 'wifi.venue.property_management_units'
            }
          ]
        },
        {
          title: $t({ defaultMessage: 'Wi-Fi' }),
          key: 'wifi.wifi',
          children: [
            {
              title: $t({ defaultMessage: 'Access Points' }),
              key: 'wifi.wifi.access_points'
            },
            {
              title: $t({ defaultMessage: 'Wi-Fi Networks' }),
              key: 'wifi.wifi.wifi_networks'
            }
          ]
        },
        {
          title: $t({ defaultMessage: 'Clients' }),
          key: 'wifi.clients',
          children: [
            {
              title: $t({ defaultMessage: 'Wireless' }),
              key: 'wifi.clients.wireless'
            },
            {
              title: $t({ defaultMessage: 'Identity Management' }),
              key: 'wifi.clients.identity_management'
            }
          ]
        },
        {
          title: $t({ defaultMessage: 'Network Control (Services)' }),
          key: 'wifi.network_control_services',
          children: [
            {
              title: $t({ defaultMessage: 'DPSK' }),
              key: 'wifi.network_control_services.dpsk'
            },
            {
              title: $t({ defaultMessage: 'DPSK Passphrases' }),
              key: 'wifi.network_control_services.dpsk_passphrases'
            },
            {
              title: $t({ defaultMessage: 'Wi-Fi Calling' }),
              key: 'wifi.network_control_services.wifi_calling'
            },
            {
              title: $t({ defaultMessage: 'Guest Portal' }),
              key: 'wifi.network_control_services.guest_portal'
            },
            {
              title: $t({ defaultMessage: 'Resident Portal' }),
              key: 'wifi.network_control_services.resident_portal'
            },
            {
              title: $t({ defaultMessage: 'MDNS Proxy' }),
              key: 'wifi.network_control_services.mdns_proxy'
            },
            {
              title: $t({ defaultMessage: 'DHCP' }),
              key: 'wifi.network_control_services.dhcp'
            }
          ]
        },
        {
          title: $t({ defaultMessage: 'Network Control (Policies)' }),
          key: 'wifi.network_control_policies',
          children: [
            {
              title: $t({ defaultMessage: 'Access Control' }),
              key: 'wifi.network_control_policies.access_control'
            },
            {
              title: $t({ defaultMessage: 'Adaptive Policy' }),
              key: 'wifi.network_control_policies.adaptive_policy'
            },
            {
              title: $t({ defaultMessage: 'Client Isolation' }),
              key: 'wifi.network_control_policies.client_isolation'
            },
            {
              title: $t({ defaultMessage: 'Certificate Authority' }),
              key: 'wifi.network_control_policies.certificate_authority'
            },
            {
              title: $t({ defaultMessage: 'Certificate Templates' }),
              key: 'wifi.network_control_policies.certificate_templates'
            },
            {
              title: $t({ defaultMessage: 'Identity Provider' }),
              key: 'wifi.network_control_policies.identity_provider'
            },
            {
              title: $t({ defaultMessage: 'MAC Registration List' }),
              key: 'wifi.network_control_policies.mac_registration_list'
            },
            {
              title: $t({ defaultMessage: 'Location Based Service' }),
              key: 'wifi.network_control_policies.location_based_service'
            },
            {
              title: $t({ defaultMessage: 'RADIUS Server' }),
              key: 'wifi.network_control_policies.radius_server'
            },
            {
              title: $t({ defaultMessage: 'Rogue AP Detection' }),
              key: 'wifi.network_control_policies.rogue_ap_detection'
            },
            {
              title: $t({ defaultMessage: 'SNMP Agent' }),
              key: 'wifi.network_control_policies.snmp_agent'
            },
            {
              title: $t({ defaultMessage: 'Syslog Server' }),
              key: 'wifi.network_control_policies.syslog_server'
            },
            {
              title: $t({ defaultMessage: 'Tunnelling' }),
              key: 'wifi.network_control_policies.tunnelling'
            },
            {
              title: $t({ defaultMessage: 'VLAN Pool' }),
              key: 'wifi.network_control_policies.vlan_pool'
            },
            {
              title: $t({ defaultMessage: 'Wi-Fi Operator' }),
              key: 'wifi.network_control_policies.wifi_operator'
            },
            {
              title: $t({ defaultMessage: 'Workflow' }),
              key: 'wifi.network_control_policies.workflow'
            }
          ]
        }
      ]
    } as TreeDataNode,
    {
      title: $t({ defaultMessage: 'Wired' }),
      key: 'switch',
      children: [
        {
          title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
          key: 'wired.venue',
          children: [
            {
              title: $t({ defaultMessage: 'Switch' }),
              key: 'wired.venue.switch'
            }
          ]
        },
        {
          title: $t({ defaultMessage: 'Wired' }),
          key: 'wired.wired',
          children: [
            {
              title: $t({ defaultMessage: 'Switches' }),
              key: 'wired.wired.switches'
            },
            {
              title: $t({ defaultMessage: 'Wired Network Profile' }),
              key: 'wired.wired.wired_network_profile'
            }
          ]
        },
        {
          title: $t({ defaultMessage: 'Clients' }),
          key: 'wired.clients',
          children: [
            {
              title: $t({ defaultMessage: 'Wired' }),
              key: 'wired.clients.wired'
            }
          ]
        },
        {
          title: $t({ defaultMessage: 'Network Control (Services)' }),
          key: 'wired.network_control_services',
          children: [
            {
              title: $t({ defaultMessage: 'PIN Portal for Switch' }),
              key: 'wired.network_control_services.web.authority'
            }
          ]
        }

      ]
    } as TreeDataNode,
    {
      title: $t({ defaultMessage: 'Gateways' }),
      key: 'edge',
      children: [
        {
          title: $t({ defaultMessage: 'RUCKUS Edge' }),
          key: 'gateways.ruckus_edge',
          children: [
            {
              title: $t({ defaultMessage: 'Edge Management' }),
              key: 'gateways.ruckus_edge.edge_management'
            },
            {
              title: $t({ defaultMessage: 'RWG' }),
              key: 'gateways.ruckus_edge.rwg'
            }
          ]
        },
        {
          title: $t({ defaultMessage: 'Network Control (Services)' }),
          key: 'gateways.network_control_services)',
          children: [
            {
              title: $t({ defaultMessage: 'DHCP' }),
              key: 'gateways.network_control_services.dhcp'
            },
            {
              title: $t({ defaultMessage: 'QoS' }),
              key: 'gateways.network_control_services.qos'
            },
            {
              title: $t({ defaultMessage: 'PIN' }),
              key: 'gateways.network_control_services.pin'
            },
            {
              title: $t({ defaultMessage: 'SDLAN' }),
              key: 'gateways.network_control_services.sdlan'
            },
            {
              title: $t({ defaultMessage: 'MDNS Proxy' }),
              key: 'gateways.network_control_services.mdns_proxy'
            }
          ]
        }
      ]
    } as TreeDataNode,
    {
      title: $t({ defaultMessage: 'Analytics' }),
      key: 'analytics',
      children: [
        {
          title: $t({ defaultMessage: 'AI Assurance' }),
          key: 'analytics.ai_assurance',
          children: [
            {
              title: $t({ defaultMessage: 'AI Analytics' }),
              key: 'analytics.ai_assurance.ai_analytics'
            },
            {
              title: $t({ defaultMessage: 'Network Assurance' }),
              key: 'analytics.ai_assurance.network_assurance'
            }
          ]
        }
      ]
    } as TreeDataNode,
    {
      title: $t({ defaultMessage: 'Admin' }),
      key: 'admin',
      children: [
        {
          title: $t({ defaultMessage: 'Administration' }),
          key: 'admin.administration',
          children: [
            {
              title: $t({ defaultMessage: 'Timeline' }),
              key: 'admin.administration.timeline'
            },
            {
              title: $t({ defaultMessage: 'Account Management' }),
              key: 'admin.administration.account_management'
            },
            {
              title: $t({ defaultMessage: 'Account Setup' }),
              key: 'admin.administration.account_setup'
            }
          ]
        }
      ]
    } as TreeDataNode,
    {
      title: $t({ defaultMessage: 'MSP' }),
      key: 'msp',
      children: [
        {
          title: $t({ defaultMessage: 'MSP' }),
          key: 'msp.msp',
          children: [
            {
              title: $t({ defaultMessage: 'MSP Tenant Management' }),
              key: 'msp.msp.msp_tenant_management'
            },
            {
              title: $t({ defaultMessage: 'Device Inventory' }),
              key: 'msp.msp.device_inventory'
            },
            {
              title: $t({ defaultMessage: 'Subscription' }),
              key: 'msp.msp.subscriptions'
            },
            {
              title: $t({ defaultMessage: 'Templates' }),
              key: 'msp.msp.templates'
            },
            {
              title: $t({ defaultMessage: 'MSP Portal' }),
              key: 'msp.msp.msp_portal'
            }
          ]
        }
      ]
    } as TreeDataNode
  ]}
