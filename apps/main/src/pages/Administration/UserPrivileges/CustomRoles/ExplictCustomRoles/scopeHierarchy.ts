import { TreeDataNode } from 'antd'

export const scopeHierarchy: TreeDataNode[] = [
  {
    title: 'Wi-Fi',
    key: 'wi-fi',
    children: [
      {
        title: 'Venue',
        key: 'wi-fi.venue',
        children: [
          {
            title: 'Wi-Fi',
            key: 'wi-fi.venue.wi-fi'
          },
          {
            title: 'Property Management',
            key: 'wi-fi.venue.property_management'
          }
        ]
      },
      {
        title: 'Wi-Fi',
        key: '0-1',
        children: [
          {
            title: 'Access Points',
            key: 'wi-fi.wi-fi.access_points'
          },
          {
            title: 'Wi-Fi Networks',
            key: 'Wi-Fi Networks'
          }
        ]
      },
      {
        title: 'Clients',
        key: 'wi-fi.clients',
        children: [
          {
            title: 'Wireless',
            key: 'wi-fi.clients.wireless'
          },
          {
            title: 'Identity Management',
            key: 'wi-fi.clients.identity_management'
          }
        ]
      },
      {
        title: 'Network Control (Services)',
        key: 'wi-fi.network_control_services',
        children: [
          {
            title: 'DPSK',
            key: 'wi-fi.network_control_services.dpsk'
          },
          {
            title: 'DPSK Passphrases',
            key: 'wi-fi.network_control_services.dpsk_passphrases'
          },
          {
            title: 'Wi-Fi Calling',
            key: 'wi-fi.network_control_services.wi-fi_calling'
          },
          {
            title: 'Guest Portal',
            key: 'wi-fi.network_control_services.guest_portal'
          },
          {
            title: 'Resident Portal',
            key: 'wi-fi.network_control_services.resident_portal'
          }
        ]
      },
      {
        title: 'Network Control (Policies)',
        key: 'wi-fi.network_control_policies',
        children: [
          {
            title: 'Access Control',
            key: 'wi-fi.network_control_policies.access_control'
          },
          {
            title: 'Adaptive Policy',
            key: 'wi-fi.network_control_policies.adaptive_policy'
          },
          {
            title: 'Client Isolation',
            key: 'wi-fi.network_control_policies.client_isolation'
          },
          {
            title: 'Identity Provider',
            key: 'wi-fi.network_control_policies.identity_provider'
          },
          {
            title: 'MAC Registration List',
            key: 'wi-fi.network_control_policies.mac_registration_list'
          },
          {
            title: 'Location Based Service',
            key: 'wi-fi.network_control_policies.location_based_service'
          },
          {
            title: 'RADIUS Server',
            key: 'wi-fi.network_control_policies.radius_server'
          },
          {
            title: 'Rogue AP Detection',
            key: 'wi-fi.network_control_policies.rogue_ap_detection'
          },
          {
            title: 'SNMP Agent',
            key: 'wi-fi.network_control_policies.snmp_agent'
          },
          {
            title: 'Syslog Server',
            key: 'wi-fi.network_control_policies.syslog_server'
          },
          {
            title: 'VLAN Pool',
            key: 'wi-fi.network_control_policies.vlan_pool'
          },
          {
            title: 'Wi-Fi Operator',
            key: 'wi-fi.network_control_policies.wi-fi_operator'
          },
          {
            title: 'Workflow',
            key: 'wi-fi.network_control_policies.workflow'
          }
        ]
      }
    ]
  },
  {
    title: 'Wired',
    key: 'wired',
    children: [
      {
        title: 'Venue',
        key: 'wired.venue',
        children: [
          {
            title: 'Switch',
            key: 'wired.venue.switch'
          }
        ]
      },
      {
        title: 'Wired',
        key: 'wired.wired',
        children: [
          {
            title: 'Switches',
            key: 'wired.wired.switches'
          },
          {
            title: 'Wired Network Profile',
            key: 'wired.wired.wired_network_profile'
          }
        ]
      },
      {
        title: 'Clients',
        key: 'wired.clients',
        children: [
          {
            title: 'Wired',
            key: 'wired.clients.wired'
          }
        ]
      }
    ]
  },
  {
    title: 'SmartEdge',
    key: 'smartedge',
    children: [
      {
        title: 'Edge',
        key: 'smartedge.edge',
        children: [
          {
            title: 'RUCKUS Edge',
            key: 'smartedge.edge.ruckus_edge'
          },
          {
            title: 'Network Assurance',
            key: 'smartedge.edge.network_assurance'
          }
        ]
      }
    ]
  },
  {
    title: 'Analytics',
    key: 'analytics',
    children: [
      {
        title: 'AI Assurance',
        key: 'analytics.ai_assurance',
        children: [
          {
            title: 'AI Analytics',
            key: 'analytics.ai_assurance.ai_analytics'
          },
          {
            title: 'Network Assurance',
            key: 'analytics.ai_assurance.network_assurance'
          }
        ]
      }
    ]
  },
  {
    title: 'Admin',
    key: 'admin',
    children: [
      {
        title: 'Administration',
        key: 'admin.administration',
        children: [
          {
            title: 'Timeline',
            key: 'admin.administration.timeline'
          },
          {
            title: 'Account Management',
            key: 'admin.administration.account_management'
          },
          {
            title: 'Account Setup',
            key: 'admin.administration.account_setup'
          }
        ]
      }
    ]
  },
  {
    title: 'MSP',
    key: 'msp',
    children: [
      {
        title: 'MSP',
        key: 'msp.msp',
        children: [
          {
            title: 'MSP Tenant Management',
            key: 'msp.msp.msp_tenant_management'
          },
          {
            title: 'Device Inventory',
            key: 'msp.msp.device_inventory'
          },
          {
            title: 'Subscription',
            key: 'msp.msp.subscriptions'
          },
          {
            title: 'Tempates',
            key: 'msp.msp.templates'
          },
          {
            title: 'MSP Portal',
            key: 'msp.msp.msp_portal'
          }
        ]
      }
    ]
  }
]