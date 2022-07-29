const commonRecommendations = [
  'If the problem does not resolve on its own, check the infrastructure and client population for recent changes likely to produce this failure:',
  'Were new clients or APs introduced in the environment?',
  'Were the impacted client OS types recently upgraded?',
  'Was the AP firmware recently upgraded?',
  'Were the AP radio or WLAN settings recently modified?'
]

export const rootCauseRecommendationMap = {
  assoc: {
    CCD_REASON_NOT_AUTHED: {
      rootCauses: [
        'Clients are failing to connect during the 802.11 open authentication, but the exact reason for the failures is unclear.'
      ],
      recommendations: commonRecommendations
    },
    CCD_REASON_NOT_ASSOCED: {
      rootCauses: [
        'Clients are failing to connect during the association stage, but the exact reason for the failures is unclear.'
      ],
      recommendations: commonRecommendations
    },
    CCD_REASON_AUTH_ALG: {
      rootCauses: [
        'Clients are failing in the 802.11 open authentication stage because the authentication algorithm in the authentication request is not supported by the WLAN/AP.'
      ],
      recommendations: [
        'Though this issue is uncommon, it may occur due to unexpected configuration changes or incompatibilities:',
        'Are the impacted clients configured to use a WLAN type that mismatches the AP/SSID settings?',
        'Were devices recently upgraded with new firmware that may be introducing bugs?',
        'Was the WLAN configuration changed on the infrastructure?'
      ]
    },
    // to verify that any incident with this reason code does not show up
    CCD_REASON_AUTH_WITHHELD: {
      rootCauses: ['n/a'],
      recommendations: []
    },
    CCD_REASON_AUTH_FILTERED_BY_ACL: {
      rootCauses: [
        'Clients are failing to associate due to one of the following permission features:',
        'The L2 MAC ACL settings do not permit this client (client MAC exists in denial list, or does not exist in permitted list).',
        'The client MAC is included in the blocked client list configured by the admin.'
      ],
      recommendations: [
        'This issue is typically the result of an intended policy configuration. No action may be needed, but if this behavior is creating unwanted user disruption, consider modifying the policy configurations:',
        'Confirm the L2 MAC ACL policy.',
        'Confirm the Blocked Client List.'
      ]
    },
    CCD_REASON_AUTH_FILTERED_BY_TCM: {
      rootCauses: [
        'Client connections are temporarily suppressed by Transient Client Management behavior configured on the WLAN.'
      ],
      recommendations: [
        'This issue is typically the result of an intended policy configuration. No action may be needed, but if this behavior is creating unwanted user disruption, consider disabling Transient Client Management or make the logic more conservative.'
      ]
    },
    CCD_REASON_AUTH_MDID_MISMATCH: {
      rootCauses: [
        'Clients are failing 802.11r roaming due to a mismatch in the mobility domain ID (MDID) in the 802.11r connection request.'
      ],
      recommendations: [
        'This may be caused if the roaming boundary for an SSID crosses two AP zones, venues, or groups in which the same SSID exists, but the MDID does not match on the SSIDs. Double check the deployment to identify if the failing AP(s) represent a roaming boundary between two WLANs that have the same SSID, but different MDIDs (usually between AP zones or venue). \\nThis issue may be observed when client 802.11r implementations are unreliable, which usually points to firmware or driver issues. Check the impacted client list to see if this is only affecting a specific OS type.'
      ]
    },
    CCD_REASON_ASSOC_DOS_ATTACK: {
      rootCauses: [
        'Impacted clients are failing association because of a DoS prevention feature that temporarily blocks their connections after they have excessive authentication failures in a short period of time.'
      ],
      recommendations: [
        'This issue is caused by a DoS protection feature, which can be enabled/disabled in the RUCKUS UI. If the behavior is having an undesirable impact on valid clients, the feature can be disabled or optimized to make the prevention logic more conservative.'
      ]
    },
    CCD_REASON_ASSOC_TOOMANY: {
      rootCauses: [
        'Client associations are failing on the AP due to one of several possible capacity conditions:',
        'The AP radio has reached its max client limit (fixed limit of HW/SW).',
        'The AP has reached its total client limit for both radios (fixed limit of HW/SW).',
        'The AP radio has reached its max allowed client limit, as specified by the admin in the configuration.'
      ],
      recommendations: [
        'This behavior may be a desirable consequence of the admin\'s configuration–to prevent any one AP from serving too many clients. If so, no action is needed.\\nIf this issue is having an undesirable client impact, there are a few possible recommendations:',
        'If the max configured limit is too low, change the SSID or AP radio settings to increase the max number of allowed clients.',
        'If there is a very high amount of client transience and the SSID\'s client inactivity timeout is set too high, the AP may be honoring clients that are no longer connected. Reduce the inactivity timeout on the SSID.',
        'If band or load balancing are disabled, consider enabling them to more proactively spread client load across service sets.',
        'If the RF design allows for it, add APs to supplement capacity.'
      ]
    },
    CCD_REASON_ASSOC_NOT_AUTHED: {
      rootCauses: [
        'Clients are attempting to associate without first performing 802.11 open authentication, or if the prior open authentication has expired. Typically this happens when the client/AP state machine is out of sync.'
      ],
      recommendations: [
        'This state machine mismatch problem happens somewhat regularly in Wi-Fi as a transient problem, but is usually self-corrected by the client/AP. If the problem is having a noticeable impact on user connectivity, double-check the common situations that introduce misbehavior like this:',
        'Was the firmware recently updated on the infrastructure or impacted clients?',
        'Were new client types recently introduced into the environment, and are they Wi-Fi certified?'
      ]
    },
    CCD_REASON_ASSOC_RSN_REQUIRED: {
      rootCauses: [
        'Clients are failing association because the association request is missing the WPA/RSN information element(s), which typically indicates interoperability issues.'
      ],
      recommendations: [
        'This behavior is uncommon in Wi-Fi and represents a protocol incompatibility. If clients are exhibiting this behavior, double-check the common situations that introduce interoperability problems like this:',
        'Were the firmware or drivers recently updated on the infrastructure or impacted clients?',
        'Were new client types recently introduced into the environment, and are they able to support the AP’s WLAN security types?'
      ]
    },
    CCD_REASON_ASSOC_IE_INVALID: {
      rootCauses: [
        'Clients are failing association because the association request has unsupported or malformed security information in the WPA/RSN information element(s), which typically indicates interoperability issues.'
      ],
      recommendations: [
        'This behavior is uncommon in Wi-Fi and represents a protocol incompatibility. If clients are exhibiting this behavior, double-check the common situations that introduce interoperability problems like this:',
        'Were the firmware or drivers recently updated on impacted clients?',
        'Were new client types recently introduced into the environment?'
      ]
    },
    DEFAULT: {
      rootCauses: ['No specific root cause.'],
      recommendations: ['No recommendation.']
    },
    VARIOUS_REASONS: {
      rootCauses: ['Users are failing to successfully connect at the 802.11 association stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.'],
      recommendations: [
        'In these multi-issue failures, there are a few general recommendations to check:',
        ...commonRecommendations.slice(1),
        'Check for high levels of RF performance interference, which may be causing high error rates.',
        'Compare the configuration and operating deployment of the affected WLAN or network scope (AP, AP group, etc) with others to identify any unique settings that may be causing issues.'
      ]
    }
  },
  auth: {
    CCD_REASON_AUTH_FT_ROAM_FAILURE: {
      rootCauses: [
        'Clients are failing at the authentication stage of an 802.11r (Fast Transition) roam. The client is including PMKID information from its roam-from AP, but the roam-to AP does not have the key.\\n\\nThis scenario is most commonly caused in the following scenarios:',
        'The roam-from and roam-to APs cannot share keys with one another, which happens if they are not RF neighbors or if they do not have IP connectivity for AP-to-AP communication.',
        'The roam-from and roam-to APs are not RF neighbors. Clients may assume that all APs sharing an SSID will have the key, but the key may only be shared with RF neighbors.'
      ],
      recommendations: ['In most cases, clients will immediately fall back to a "slow roam" if 802.11r (FT) roams fail.\\n\\nTo enable 802.11r roaming, make sure that APs are able to communicate with their RF neighbors via the IP (wired) infrastructure.']
    },
    CCD_REASON_NOT_AUTHED: {
      rootCauses: [
        'Clients are failing to connect during the 802.11 open authentication, but the exact reason for the failures is unclear.'
      ],
      recommendations: commonRecommendations
    },
    CCD_REASON_NOT_ASSOCED: {
      rootCauses: [
        'Clients are failing to connect during the association stage, but the exact reason for the failures is unclear.'
      ],
      recommendations: commonRecommendations
    },
    CCD_REASON_AUTH_ALG: {
      rootCauses: [
        'Clients are failing in the 802.11 open authentication stage because the authentication algorithm in the authentication request is not supported by the WLAN/AP.'
      ],
      recommendations: [
        'Though this issue is uncommon, it may occur due to unexpected configuration changes or incompatibilities:',
        'Are the impacted clients configured to use a WLAN type that mismatches the AP/SSID settings?',
        'Were devices recently upgraded with new firmware?',
        'Was the WLAN configuration changed on the infrastructure?'
      ]
    },
    CCD_REASON_AUTH_WITHHELD: {
      rootCauses: ['n/a'],
      recommendations: []
    },
    CCD_REASON_AUTH_FILTERED_BY_ACL: {
      rootCauses: [
        'Clients are failing to associate due to one of the following permission features:',
        'The L2 MAC ACL settings do not permit this client (client MAC exists in denial list, or does not exist in permitted list).',
        'The client MAC is included in the blocked client list configured by the admin.'
      ],
      recommendations: [
        'This issue is typically the result of an intended policy configuration. No action may be needed, but if this behavior is creating unwanted user disruption, consider modifying the policy configurations:',
        'Confirm the L2 MAC ACL policy.',
        'Confirm the Blocked Client List.'
      ]
    },
    CCD_REASON_AUTH_FILTERED_BY_TCM: {
      rootCauses: [
        'Client connections are temporarily suppressed by Transient Client Management behavior configured on the WLAN.'
      ],
      recommendations: [
        'This issue is typically the result of an intended policy configuration. No action may be needed, but if this behavior is creating unwanted user disruption, consider disabling Transient Client Management or make the logic more conservative.'
      ]
    },
    CCD_REASON_AUTH_MDID_MISMATCH: {
      rootCauses: [
        'Clients are failing 802.11r roaming due to a mismatch in the mobility domain ID (MDID) in the 802.11r connection request.'
      ],
      recommendations: [
        'This may be caused if the roaming boundary for an SSID crosses two AP zones, venues, or groups in which the same SSID exists, but the MDID does not match on the SSIDs. Double check the deployment to identify if the failing AP(s) represent a roaming boundary between two WLANs that have the same SSID, but different MDIDs (usually between AP zones or venue). \\nThis issue may be observed when client 802.11r implementations are unreliable, which usually points to firmware or driver issues. Check the impacted client list to see if this is only affecting a specific OS type.'
      ]
    },
    CCD_REASON_ASSOC_DOS_ATTACK: {
      rootCauses: [
        'Impacted clients are failing association because of a DoS prevention feature that temporarily blocks their connections after they have excessive authentication failures in a short period of time.'
      ],
      recommendations: [
        'This issue is caused by a DoS protection feature, which can be enabled/disabled in the RUCKUS UI. If the behavior is having an undesirable impact on valid clients, the feature can be disabled or optimized to make the prevention logic more conservative.'
      ]
    },
    CCD_REASON_ASSOC_TOOMANY: {
      rootCauses: [
        'Client associations are failing on the AP due to one of several possible capacity conditions:',
        'The AP radio has reached its max client limit (fixed limit of HW/SW).',
        'The AP has reached its total client limit for both radios (fixed limit of HW/SW).',
        'The AP radio has reached its max allowed client limit, as specified by the admin in the configuration.'
      ],
      recommendations: [
        'This behavior may be a desirable consequence of the admin\'s configuration–to prevent any one AP from serving too many clients. If so, no action is needed.\\nIf this issue is having an undesirable client impact, there are a few possible recommendations:',
        'If the max configured limit is too low, change the SSID or AP radio settings to increase the max number of allowed clients.',
        'If there is a very high amount of client transience and the SSID\'s client inactivity timeout is set too high, the AP may be honoring clients that are no longer connected. Reduce the inactivity timeout on the SSID.',
        'If band or load balancing are disabled, consider enabling them to more proactively spread client load across service sets.',
        'If the RF design allows for it, add APs to supplement capacity.'
      ]
    },
    CCD_REASON_ASSOC_NOT_AUTHED: {
      rootCauses: [
        'Clients are attempting to associate without first performing 802.11 open authentication. Typically this happens when the client/AP state machine is out of sync.'
      ],
      recommendations: [
        'This state machine mismatch problem happens somewhat regularly in Wi-Fi as a transient problem, but is usually self-corrected by the client/AP. If the problem is having a noticeable impact on user connectivity, double-check the common situations that introduce misbehavior like this:',
        'Was the firmware recently updated on impacted clients?',
        'Were new client types recently introduced into the environment?'
      ]
    },
    CCD_REASON_ASSOC_RSN_REQUIRED: {
      rootCauses: [
        'Clients are failing association because the association request is missing the WPA/RSN information element(s), which typically indicates interoperability issues.'
      ],
      recommendations: [
        'This behavior is uncommon in Wi-Fi and represents a protocol incompatibility. If clients are exhibiting this behavior, double-check the common situations that introduce interoperability problems like this:',
        'Were the firmware or drivers recently updated on the infrastructure or impacted clients?',
        'Were new client types recently introduced into the environment, and are they able to support the AP’s WLAN security types?'
      ]
    },
    CCD_REASON_ASSOC_IE_INVALID: {
      rootCauses: [
        'Clients are failing association because the association request has unsupported or malformed security information in the WPA/RSN information element(s), which typically indicates interoperability issues.'
      ],
      recommendations: [
        'This behavior is uncommon in Wi-Fi and represents a protocol incompatibility. If clients are exhibiting this behavior, double-check the common situations that introduce interoperability problems like this:',
        'Were the firmware or drivers recently updated on impacted clients?',
        'Were new client types recently introduced into the environment?'
      ]
    },
    DEFAULT: {
      rootCauses: ['No specific root cause.'],
      recommendations: ['No recommendation.']
    },
    VARIOUS_REASONS: {
      rootCauses: ['Users are failing to successfully connect at the 802.11 authentication stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.'],
      recommendations: [
        'In these multi-issue failures, there are a few general recommendations to check:',
        ...commonRecommendations.slice(1),
        'Check for high levels of RF performance interference, which may be causing high error rates.',
        'Compare the configuration and operating deployment of the affected WLAN or network scope (AP, AP group, etc) with others to identify unique settings that may be causing issues.'
      ]
    }
  },
  eap: {
    CCD_REASON_EAPOL_STATE_INVALID: {
      rootCauses: [
        'Clients are failing authentication (4-way handshake) because the AP is receiving EAPOL keys (typically msg2 or msg4) from clients in an incorrect sequence.'
      ],
      recommendations: [
        'This invalid key sequence issue happens in Wi-Fi as a transient problem, but is usually self-corrected by the client/AP. If the problem is having a noticeable impact on user connectivity, double-check the common situations that introduce misbehavior like this:',
        'Was the AP\'s airtime utilization excessively high during the failure window? Busy RF conditions may manifest in this way.',
        'Was the firmware recently updated on impacted clients so as to introduce interoperability issues?',
        'Were new client types recently introduced into the environment?'
      ]
    },
    CCD_REASON_EAPOL_KEY_INVALID: {
      rootCauses: [
        'Clients are failing authentication because of key data errors in msg2 of the 4-way handshake (sent from client to AP). This may be caused by cipher/key incompatibilities or invalid key data.'
      ],
      recommendations: [
        'Invalid key data is an uncommon issue in the 4-way handshake. If this is happening, packet captures may be required to investigate the nature of invalid keys.\\nIf the problem persists, check common situations that may have introduced this interoperability behavior:',
        'Are the impacted clients using problematic drivers or firmware?',
        'Was the firmware recently updated on impacted clients so as to introduce interoperability issues?',
        'Were new client types recently introduced into the environment?'
      ]
    },
    CCD_REASON_RSN_INCONSISTENT: {
      rootCauses: [
        'Clients are failing authentication because the WPA Information Element in msg2 of the 4-way handshake (sent from client to AP) does not match the WPA Information Element sent in the Association Request.'
      ],
      recommendations: [
        'This WPA Information Element mismatch issue is an uncommon issue in the 4-way handshake. If this is happening, packet captures may be required to investigate the nature of Information Element mismatches.\\nIf the problem persists, check common situations that may have introduced this interoperability behavior:',
        'Are the impacted clients using problematic drivers or firmware?',
        'Was the firmware recently updated on impacted clients so as to introduce interoperability issues?',
        'Were new client types recently introduced into the environment?'
      ]
    },
    CCD_REASON_MIC_FAILURE: {
      rootCauses: [
        'Clients are failing authentication because the passphrase (PSK) does not match the AP/SSID configuration.'
      ],
      recommendations: [
        'This is a common problem in networks where passphrase authentication (e.g. WPA2-Personal) is used. To resolve the issue, check the following:',
        'Was the passphrase recently changed on the infrastructure, while client devices still used the old passphrase?',
        'Was there a spike of new users who may have been provided with the wrong passphrase?',
        'Were client devices provisioned automatically with device management software with the wrong passphrase?'
      ]
    },
    CCD_REASON_TIMEOUT: {
      rootCauses: [
        'Client authentication is failing because of a timeout in the authentication exchange with the client. This is commonly caused by the following reasons:',
        'EAP Request timeout waiting for client EAP Response.',
        '4-way handshake timeout waiting for the client response.'
      ],
      recommendations: [
        'To diagnose this issue further, check the following situations:',
        'High RF interference, airtime utilization, or other poor RF conditions, which disrupts normal channel access.',
        'Were the impacted client OS types recently upgraded?',
        'Were the WLAN settings (especially DPSK) recently modified?'
      ]
    },
    CCD_REASON_EAP_IDENTIFIER_MISMATCH: {
      rootCauses: [
        'This is an uncommon client authentication failure type, which happens when the client sends a different Identifier in the Response and Request messages.'
      ],
      recommendations: [
        'If this issue does not resolve on its own, this is often a case of client compatibility issues, which may be caused by:',
        'Client software issues or upgrades.',
        'Recent configuration changes on the client authentication settings (username/password or identity settings).'
      ]
    },
    DEFAULT: {
      rootCauses: ['No specific root cause.'],
      recommendations: ['No recommendation.']
    },
    VARIOUS_REASONS: {
      rootCauses: ['Users are failing to successfully connect at the authentication stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.'],
      recommendations: [
        'In many cases with authentication failure, each client device behaves differently, which causes a variety of unique failure symptoms. If the problem is affecting many users or lasting for a long time, it may be helpful to double-check any recent changes:',
        'Credential changes.',
        'Bulk expiry of passwords.',
        'Certificate changes.',
        'Infrastructure changes.',
        'Introduction of new client device types, or software upgrades of existing clients.'
      ]
    }
  },
  dhcp: {
    DEFAULT: {
      rootCauses: ['No specific root cause.'],
      recommendations: ['No recommendation.']
    },
    VARIOUS_REASONS: {
      rootCauses: ['Users are failing to successfully connect at the DHCP stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.'],
      recommendations: [
        'In many cases with DHCP failure, each client device behaves differently, which causes a variety of unique failure symptoms. If the problem is affecting many users or lasting for a long time, it may be helpful to validate the end-to-end DHCP setup:',
        'Check DHCP server IP scopes are configured and enabled with available addresses.',
        'Check the network infrastructure is configured with proper VLANs (to the AP), IP helpers, or DHCP Proxy in place.',
        'Check for availability of DHCP servers and IP reachability by client devices.',
        'Check any recent changes in the DHCP infrastructure that may be leading to issues.'
      ]
    },
    CCD_REASON_NACK: {
      rootCauses: [
        'The user\'s connectivity is failing at DHCP because the server is unable to satisfy the client\'s request. This may be caused by one of several reasons:',
        'The server received duplicate DHCP requests from the same client.',
        'The client is requesting an address on an incorrect subnet.',
        'There may be more than one DHCP server replying to the same client.'
      ],
      recommendations: [
        'Some modest DHCP NAKs are normal in every network (e.g. client device sent duplicate DHCP Requests), but excessive DHCP failures with a NAK may be resolved by checking common DHCP server configuration or network design problems:',
        'Did the WLAN\'s IP subnet recently change, and is now causing DHCP renewal failures?',
        'Is there a new L3 network boundary where devices are roaming and failing to renew their prior IP address?',
        'If two DHCP servers are serving the same subnet, ensure they are properly configured for load balancing or passive standby.'
      ]
    },
    CCD_REASON_TIMEOUT: {
      rootCauses: [
        'The DHCP exchange is failing because of a timeout waiting for a response from the DHCP server. This is typically caused by the following reasons:',
        'The DHCP server is offline.',
        'The DHCP server is unreachable on the LAN (a network path issue) or there is high network latency.',
        'The VLAN/DVLAN infrastructure is not properly configured on the SSID, AP, or switch ports.',
        'The DHCP server is overloaded and unable to reply.',
        'The DHCP helper IP address is not configured on the subnet.'
      ],
      recommendations: [
        'DHCP timeouts will be resolved by isolating the DHCP server issue or network implementation problem:',
        'Is the DHCP server online with scopes configured and available addresses?',
        'Is the DHCP server available and reachable by clients with minimal latency?',
        'Are the APs (where failures are happening) and their switch ports properly configured with VLANs?',
        'Is the DHCP helper IP address properly configured on the subnet gateway?'
      ]
    }
  },
  radius: {
    DEFAULT: {
      rootCauses: ['No specific root cause.'],
      recommendations: ['No recommendation.']
    },
    VARIOUS_REASONS: {
      rootCauses: ['Users are failing to successfully connect at the RADIUS stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.'],
      recommendations: [
        'In many cases with RADIUS failure, each client device or RADIUS server behaves differently, which causes a variety of unique failure symptoms. If the problem is affecting many users or lasting for a long time, it may be helpful to validate the end-to-end RADIUS setup and network performance:',
        'Check the RADIUS server and controller settings to identify matching configurations (IP address, port, and shared secret).',
        'Check for RADIUS reachability by the controller/APAP (network reliability issues, like congestion, drops, flapping links, etc).',
        'Check for recent changes in the RADIUS infrastructure that may be leading to issues.',
        'Check RADIUS performance metrics to ensure it has sufficient capacity and is not overloaded.',
        'Check the wireless link for high congestion, retries/errors, or other unreliability issues.'
      ]
    },
    CCD_REASON_AAA_SERVER_UNAVAILABLE: {
      rootCauses: [
        'The RADIUS server is offline or unreachable from the Controller/AP (message from Controller/AP to RADIUS is failing), which is often caused by:',
        'AP/SZ misconfiguration (Bad IP, bad port).',
        'The RADIUS server is offline.',
        'The RADIUS server is unreachable on the network (e.g. network path or routing issues).'
      ],
      recommendations: [
        'To fix this issue, it may be necessary to check the RADIUS server availability as well as the link between the Controller/AP and the RADIUS server.\\nIf all services are up and functional, double-check the RADIUS configuration on the Controller/AP.'
      ]
    },
    CCD_REASON_AAA_AUTH_FAIL: {
      rootCauses: [
        'Clients are failing 802.1X/EAP authentication, which is typically caused by:',
        'Invalid EAP (PEAP or TTLS) username and password.',
        'Invalid EAP certificates.',
        'Expired or untrusted server certificates.'
      ],
      recommendations: [
        'To resolve this issue, you may need to check RADIUS log details for authentication reject messages.\\nRecent changes in the authentication infrastructure may cause a sudden spike of EAP failures like this:',
        'RADIUS server certificate changes or expiration.',
        'Mass user password changes or credential expiry.',
        'Client onboarding or provisioning with wrong our outdated trust or credential profiles.'
      ]
    },
    CCD_REASON_TIMEOUT: {
      rootCauses: [
        'The RADIUS authentication exchange is failing because of a timeout waiting for a response from the RADIUS server. This is typically caused by the following reasons:',
        'The RADIUS server is offline.',
        'The RADIUS server is unreachable by the controller/APAP (network reliability issues, like congestion, drops, flapping links, etc).',
        'The RADIUS server is overloaded and unable to reply.',
        'The wireless link is experiencing high congestion, retries/errors, or other unreliability issues.'
      ],
      recommendations: [
        'RADIUS timeouts are most likely to be resolved by investigating the RADIUS server health directly, typically by focusing on load or service availability metrics and logs:',
        'Is the RADIUS server reliable and reachable (by ping from the AP or controller)?',
        'Is the RADIUS server experiencing high load?',
        'Is the RADIUS hardware infrastructure (CPU, Memory, IO) over-loaded or otherwise suffering a service outage?',
        'Do the RADIUS logs indicate unusual failures messages or reasons?',
        'Is the wireless link showing symptoms of congestion (high airtime utilization or interference)?'
      ]
    }
  }
}