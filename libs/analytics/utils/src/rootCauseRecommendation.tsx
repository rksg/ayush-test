const commonRecommendations = `
  <p>If the problem does not resolve on its own, check the infrastructure and client population for recent changes likely to produce this failure:</p>
  <ol>
    <li>Were new clients or APs introduced in the environment?</li>
    <li>Were the impacted client OS types recently upgraded?</li>
    <li>Was the AP firmware recently upgraded?</li>
    <li>Were the AP radio or WLAN settings recently modified?</li>
  </ol>
`

const commonRecommendations2 = [
  'If the problem does not resolve on its own, check the infrastructure and client population for recent changes likely to produce this failure:',
  'Were new clients or APs introduced in the environment?',
  'Were the impacted client OS types recently upgraded?',
  'Was the AP firmware recently upgraded?',
  'Were the AP radio or WLAN settings recently modified?'
]

export const rootCauseRecommendationMap = {
  assoc: {
    CCD_REASON_NOT_AUTHED: {
      rootCauses: 'Clients are failing to connect during the 802.11 open authentication, but the exact reason for the failures is unclear.',
      recommendations: commonRecommendations
    },
    CCD_REASON_NOT_ASSOCED: {
      rootCauses: 'Clients are failing to connect during the association stage, but the exact reason for the failures is unclear.',
      recommendations: commonRecommendations
    },
    CCD_REASON_AUTH_ALG: {
      rootCauses: 'Clients are failing in the 802.11 open authentication stage because the authentication algorithm in the authentication request is not supported by the WLAN/AP.',
      recommendations: `
        <p>Though this issue is uncommon, it may occur due to unexpected configuration changes or incompatibilities:</p>
        <ol>
          <li>Are the impacted clients configured to use a WLAN type that mismatches the AP/SSID settings?</li>
          <li>Were devices recently upgraded with new firmware that may be introducing bugs?</li>
          <li>Was the WLAN configuration changed on the infrastructure?</li>
        </ol>
      `
    },
    // to verify that any incident with this reason code does not show up
    CCD_REASON_AUTH_WITHHELD: {
      rootCauses: ['n/a'],
      recommendations: []
    },
    CCD_REASON_AUTH_FILTERED_BY_ACL: {
      rootCauses: `
        <p>Clients are failing to associate due to one of the following permission features:</p>
        <ol>
          <li>The L2 MAC ACL settings do not permit this client (client MAC exists in denial list, or does not exist in permitted list).</li>
          <li>The client MAC is included in the blocked client list configured by the admin.</li>
        </ol>
      `,
      recommendations: `
        <p>This issue is typically the result of an intended policy configuration. No action may be needed, but if this behavior is creating unwanted user disruption, consider modifying the policy configurations:</p>
        <ol>
          <li>Confirm the L2 MAC ACL policy.</li>
          <li>Confirm the Blocked Client List.</li>
        </ol>
      `
    },
    CCD_REASON_AUTH_FILTERED_BY_TCM: {
      rootCauses: 'Client connections are temporarily suppressed by Transient Client Management behavior configured on the WLAN.',
      recommendations: 'This issue is typically the result of an intended policy configuration. No action may be needed, but if this behavior is creating unwanted user disruption, consider disabling Transient Client Management or make the logic more conservative.'
    },
    CCD_REASON_AUTH_MDID_MISMATCH: {
      rootCauses: 'Clients are failing 802.11r roaming due to a mismatch in the mobility domain ID (MDID) in the 802.11r connection request.',
      recommendations: 'This may be caused if the roaming boundary for an SSID crosses two AP zones, venues, or groups in which the same SSID exists, but the MDID does not match on the SSIDs. Double check the deployment to identify if the failing AP(s) represent a roaming boundary between two WLANs that have the same SSID, but different MDIDs (usually between AP zones or venue). \\nThis issue may be observed when client 802.11r implementations are unreliable, which usually points to firmware or driver issues. Check the impacted client list to see if this is only affecting a specific OS type.'
    },
    CCD_REASON_ASSOC_DOS_ATTACK: {
      rootCauses: 'Impacted clients are failing association because of a DoS prevention feature that temporarily blocks their connections after they have excessive authentication failures in a short period of time.',
      recommendations: 'This issue is caused by a DoS protection feature, which can be enabled/disabled in the RUCKUS UI. If the behavior is having an undesirable impact on valid clients, the feature can be disabled or optimized to make the prevention logic more conservative.'
    },
    CCD_REASON_ASSOC_TOOMANY: {
      rootCauses: `
        <p>Client associations are failing on the AP due to one of several possible capacity conditions:</p>
        <ol>
          <li>The AP radio has reached its max client limit (fixed limit of HW/SW).</li>
          <li>The AP has reached its total client limit for both radios (fixed limit of HW/SW).</li>
          <li>The AP radio has reached its max allowed client limit, as specified by the admin in the configuration.</li>
        </ol>
      `,
      recommendations: `
        <p>This behavior may be a desirable consequence of the admin\'s configuration-to prevent any one AP from serving too many clients. If so, no action is needed.\\nIf this issue is having an undesirable client impact, there are a few possible recommendations:</p>
        <ol>
          <li>If the max configured limit is too low, change the SSID or AP radio settings to increase the max number of allowed clients.</li>
          <li>If there is a very high amount of client transience and the SSID\'s client inactivity timeout is set too high, the AP may be honoring clients that are no longer connected. Reduce the inactivity timeout on the SSID.</li>
          <li>If band or load balancing are disabled, consider enabling them to more proactively spread client load across service sets.</li>
          <li>If the RF design allows for it, add APs to supplement capacity.</li>
        </ol>
      `
    },
    CCD_REASON_ASSOC_NOT_AUTHED: {
      rootCauses: 'Clients are attempting to associate without first performing 802.11 open authentication, or if the prior open authentication has expired. Typically this happens when the client/AP state machine is out of sync.',
      recommendations: `
        <p>This state machine mismatch problem happens somewhat regularly in Wi-Fi as a transient problem, but is usually self-corrected by the client/AP. If the problem is having a noticeable impact on user connectivity, double-check the common situations that introduce misbehavior like this:</p>
        <ol>
          <li>Was the firmware recently updated on the infrastructure or impacted clients?</li>
          <li>Were new client types recently introduced into the environment, and are they Wi-Fi certified?</li>
        </ol>
      `
    },
    CCD_REASON_ASSOC_RSN_REQUIRED: {
      rootCauses: 'Clients are failing association because the association request is missing the WPA/RSN information element(s), which typically indicates interoperability issues.',
      recommendations: `
        <p>This behavior is uncommon in Wi-Fi and represents a protocol incompatibility. If clients are exhibiting this behavior, double-check the common situations that introduce interoperability problems like this:</p>
        <ol>
          <li>Were the firmware or drivers recently updated on the infrastructure or impacted clients?</li>
          <li>Were new client types recently introduced into the environment, and are they able to support the AP's WLAN security types?</li>
        </ol>
      `
    },
    CCD_REASON_ASSOC_IE_INVALID: {
      rootCauses: 'Clients are failing association because the association request has unsupported or malformed security information in the WPA/RSN information element(s), which typically indicates interoperability issues.',
      recommendations: `
        <p>This behavior is uncommon in Wi-Fi and represents a protocol incompatibility. If clients are exhibiting this behavior, double-check the common situations that introduce interoperability problems like this:</p>
        <ol>
          <li>Were the firmware or drivers recently updated on impacted clients?</li>
          <li>Were new client types recently introduced into the environment?</li>
        </ol>
      `
    },
    DEFAULT: {
      rootCauses: 'No specific root cause.',
      recommendations: 'No recommendation.'
    },
    VARIOUS_REASONS: {
      rootCauses: 'Users are failing to successfully connect at the 802.11 association stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.',
      recommendations: `
        <p>In these multi-issue failures, there are a few general recommendations to check:</p>
        <ol>
        ${commonRecommendations2.slice(1).map((recommendation, i) => recommendation)}
        ...commonRecommendations.slice(1)
          <li>Check for high levels of RF performance interference, which may be causing high error rates.</li>
          <li>Compare the configuration and operating deployment of the affected WLAN or network scope (AP, AP group, etc) with others to identify any unique settings that may be causing issues.</li>
        </ol>
      `
    }
  },
  auth: {
    CCD_REASON_AUTH_FT_ROAM_FAILURE: {
      rootCauses: `
        <p>Clients are failing at the authentication stage of an 802.11r (Fast Transition) roam. The client is including PMKID information from its roam-from AP, but the roam-to AP does not have the key.\\n\\nThis scenario is most commonly caused in the following scenarios:</p>
        </ol>
          <li>The roam-from and roam-to APs cannot share keys with one another, which happens if they are not RF neighbors or if they do not have IP connectivity for AP-to-AP communication.</li>
          <li>The roam-from and roam-to APs are not RF neighbors. Clients may assume that all APs sharing an SSID will have the key, but the key may only be shared with RF neighbors.</li>
        </ol>
      `,
      recommendations: 'In most cases, clients will immediately fall back to a "slow roam" if 802.11r (FT) roams fail.\\n\\nTo enable 802.11r roaming, make sure that APs are able to communicate with their RF neighbors via the IP (wired) infrastructure.'
    },
    CCD_REASON_NOT_AUTHED: {
      rootCauses: 'Clients are failing to connect during the 802.11 open authentication, but the exact reason for the failures is unclear.',
      recommendations: commonRecommendations
    },
    CCD_REASON_NOT_ASSOCED: {
      rootCauses: 'Clients are failing to connect during the association stage, but the exact reason for the failures is unclear.',
      recommendations: commonRecommendations
    },
    CCD_REASON_AUTH_ALG: {
      rootCauses: 'Clients are failing in the 802.11 open authentication stage because the authentication algorithm in the authentication request is not supported by the WLAN/AP.',
      recommendations: `
        <p>Though this issue is uncommon, it may occur due to unexpected configuration changes or incompatibilities:</p>
        <ol>
          <li>Are the impacted clients configured to use a WLAN type that mismatches the AP/SSID settings?</li>
          <li>Were devices recently upgraded with new firmware?</li>
          <li>Was the WLAN configuration changed on the infrastructure?</li>
        </ol>
      `
    },
    CCD_REASON_AUTH_WITHHELD: {
      rootCauses: 'n/a',
      recommendations: ''
    },
    CCD_REASON_AUTH_FILTERED_BY_ACL: {
      rootCauses: `
        <p>Clients are failing to associate due to one of the following permission features:</p>
        <ol>
          <li>The L2 MAC ACL settings do not permit this client (client MAC exists in denial list, or does not exist in permitted list).</li>
          <li>The client MAC is included in the blocked client list configured by the admin.</li>
        </ol>
      `,
      recommendations: `
        <p>This issue is typically the result of an intended policy configuration. No action may be needed, but if this behavior is creating unwanted user disruption, consider modifying the policy configurations:</p>
        <ol>
          <li>Confirm the L2 MAC ACL policy.</li>
          <li>Confirm the Blocked Client List.</li>
        </ol>
      `
    },
    CCD_REASON_AUTH_FILTERED_BY_TCM: {
      rootCauses: 'Client connections are temporarily suppressed by Transient Client Management behavior configured on the WLAN.',
      recommendations: 'This issue is typically the result of an intended policy configuration. No action may be needed, but if this behavior is creating unwanted user disruption, consider disabling Transient Client Management or make the logic more conservative.'
    },
    CCD_REASON_AUTH_MDID_MISMATCH: {
      rootCauses: 'Clients are failing 802.11r roaming due to a mismatch in the mobility domain ID (MDID) in the 802.11r connection request.',
      recommendations: 'This may be caused if the roaming boundary for an SSID crosses two AP zones, venues, or groups in which the same SSID exists, but the MDID does not match on the SSIDs. Double check the deployment to identify if the failing AP(s) represent a roaming boundary between two WLANs that have the same SSID, but different MDIDs (usually between AP zones or venue). \\nThis issue may be observed when client 802.11r implementations are unreliable, which usually points to firmware or driver issues. Check the impacted client list to see if this is only affecting a specific OS type.'
    },
    CCD_REASON_ASSOC_DOS_ATTACK: {
      rootCauses: 'Impacted clients are failing association because of a DoS prevention feature that temporarily blocks their connections after they have excessive authentication failures in a short period of time.',
      recommendations: 'This issue is caused by a DoS protection feature, which can be enabled/disabled in the RUCKUS UI. If the behavior is having an undesirable impact on valid clients, the feature can be disabled or optimized to make the prevention logic more conservative.'
    },
    CCD_REASON_ASSOC_TOOMANY: {
      rootCauses: `
        <p>Client associations are failing on the AP due to one of several possible capacity conditions:</p>
        <ol>
          <li>The AP radio has reached its max client limit (fixed limit of HW/SW).</li>
          <li>The AP has reached its total client limit for both radios (fixed limit of HW/SW).</li>
          <li>The AP radio has reached its max allowed client limit, as specified by the admin in the configuration.</li>
        </ol>
      `,
      recommendations: `
        <p>This behavior may be a desirable consequence of the admin\'s configuration–to prevent any one AP from serving too many clients. If so, no action is needed.\\nIf this issue is having an undesirable client impact, there are a few possible recommendations:</p>
        <ol>
          <li>If the max configured limit is too low, change the SSID or AP radio settings to increase the max number of allowed clients.</li>
          <li>If there is a very high amount of client transience and the SSID\'s client inactivity timeout is set too high, the AP may be honoring clients that are no longer connected. Reduce the inactivity timeout on the SSID.</li>
          <li>If band or load balancing are disabled, consider enabling them to more proactively spread client load across service sets.</li>
          <li>If the RF design allows for it, add APs to supplement capacity.</li>
        </ol>
      `
    },
    CCD_REASON_ASSOC_NOT_AUTHED: {
      rootCauses: 'Clients are attempting to associate without first performing 802.11 open authentication. Typically this happens when the client/AP state machine is out of sync.',
      recommendations: `
        <p>This state machine mismatch problem happens somewhat regularly in Wi-Fi as a transient problem, but is usually self-corrected by the client/AP. If the problem is having a noticeable impact on user connectivity, double-check the common situations that introduce misbehavior like this:</p>
        <ol>
          <li>Was the firmware recently updated on impacted clients?</li>
          <li>Were new client types recently introduced into the environment?</li>
        </ol>
      `
    },
    CCD_REASON_ASSOC_RSN_REQUIRED: {
      rootCauses: 'Clients are failing association because the association request is missing the WPA/RSN information element(s), which typically indicates interoperability issues.',
      recommendations: `
        <p>This behavior is uncommon in Wi-Fi and represents a protocol incompatibility. If clients are exhibiting this behavior, double-check the common situations that introduce interoperability problems like this:</p>
        <ol>
          <li>Were the firmware or drivers recently updated on the infrastructure or impacted clients?</li>
          <li>Were new client types recently introduced into the environment, and are they able to support the AP's WLAN security types?</li>
        </ol>
      `
    },
    CCD_REASON_ASSOC_IE_INVALID: {
      rootCauses: 'Clients are failing association because the association request has unsupported or malformed security information in the WPA/RSN information element(s), which typically indicates interoperability issues.',
      recommendations: `
        <p>This behavior is uncommon in Wi-Fi and represents a protocol incompatibility. If clients are exhibiting this behavior, double-check the common situations that introduce interoperability problems like this:</p>
        <ol>
          <li>Were the firmware or drivers recently updated on impacted clients?</li>
          <li>Were new client types recently introduced into the environment?</li>
        </ol>
      `
    },
    DEFAULT: {
      rootCauses: 'No specific root cause.',
      recommendations: 'No recommendation.'
    },
    VARIOUS_REASONS: {
      rootCauses: 'Users are failing to successfully connect at the 802.11 authentication stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.',
      recommendations: `
        <p>In these multi-issue failures, there are a few general recommendations to check:</p>
        <ol>
          ...commonRecommendations.slice(1),
          <li>Check for high levels of RF performance interference, which may be causing high error rates.</li>
          <li>Compare the configuration and operating deployment of the affected WLAN or network scope (AP, AP group, etc) with others to identify unique settings that may be causing issues.</li>
        </ol>
      `
    }
  },
  eap: {
    CCD_REASON_EAPOL_STATE_INVALID: {
      rootCauses: 'Clients are failing authentication (4-way handshake) because the AP is receiving EAPOL keys (typically msg2 or msg4) from clients in an incorrect sequence.',
      recommendations: `
        <p>This invalid key sequence issue happens in Wi-Fi as a transient problem, but is usually self-corrected by the client/AP. If the problem is having a noticeable impact on user connectivity, double-check the common situations that introduce misbehavior like this:</p>
        <ol>
          <li>Was the AP\'s airtime utilization excessively high during the failure window? Busy RF conditions may manifest in this way.</li>
          <li>Was the firmware recently updated on impacted clients so as to introduce interoperability issues?</li>
          <li>Were new client types recently introduced into the environment?</li>
        </ol>
      `
    },
    CCD_REASON_EAPOL_KEY_INVALID: {
      rootCauses: 'Clients are failing authentication because of key data errors in msg2 of the 4-way handshake (sent from client to AP). This may be caused by cipher/key incompatibilities or invalid key data.',
      recommendations: `
        <p>Invalid key data is an uncommon issue in the 4-way handshake. If this is happening, packet captures may be required to investigate the nature of invalid keys.\\nIf the problem persists, check common situations that may have introduced this interoperability behavior:</p>
        <ol>
          <li>Are the impacted clients using problematic drivers or firmware?</li>
          <li>Was the firmware recently updated on impacted clients so as to introduce interoperability issues?</li>
          <li>Were new client types recently introduced into the environment?</li>
        </ol>
      `
    },
    CCD_REASON_RSN_INCONSISTENT: {
      rootCauses: 'Clients are failing authentication because the WPA Information Element in msg2 of the 4-way handshake (sent from client to AP) does not match the WPA Information Element sent in the Association Request.',
      recommendations: `
        <p>This WPA Information Element mismatch issue is an uncommon issue in the 4-way handshake. If this is happening, packet captures may be required to investigate the nature of Information Element mismatches.\\nIf the problem persists, check common situations that may have introduced this interoperability behavior:</p>
        <ol>
          <li>Are the impacted clients using problematic drivers or firmware?</li>
          <li>Was the firmware recently updated on impacted clients so as to introduce interoperability issues?</li>
          <li>Were new client types recently introduced into the environment?</li>
        </ol>
      `
    },
    CCD_REASON_MIC_FAILURE: {
      rootCauses: 'Clients are failing authentication because the passphrase (PSK) does not match the AP/SSID configuration.',
      recommendations: `
        <p>This is a common problem in networks where passphrase authentication (e.g. WPA2-Personal) is used. To resolve the issue, check the following:</p>
        <ol>
          <li>Was the passphrase recently changed on the infrastructure, while client devices still used the old passphrase?</li>
          <li>Was there a spike of new users who may have been provided with the wrong passphrase?</li>
          <li>Were client devices provisioned automatically with device management software with the wrong passphrase?</li>
        </ol>
      `
    },
    CCD_REASON_TIMEOUT: {
      rootCauses: `
        <p>Client authentication is failing because of a timeout in the authentication exchange with the client. This is commonly caused by the following reasons:</p>
        <ol>
          <li>EAP Request timeout waiting for client EAP Response.</li>
          <li>4-way handshake timeout waiting for the client response.</li>
        </ol>
      `,
      recommendations: `
        <p>To diagnose this issue further, check the following situations:</p>
        <ol>
          <li>High RF interference, airtime utilization, or other poor RF conditions, which disrupts normal channel access.</li>
          <li>Were the impacted client OS types recently upgraded?</li>
          <li>Were the WLAN settings (especially DPSK) recently modified?</li>
        </ol>
      `
    },
    CCD_REASON_EAP_IDENTIFIER_MISMATCH: {
      rootCauses: 'This is an uncommon client authentication failure type, which happens when the client sends a different Identifier in the Response and Request messages.',
      recommendations: `
        <p>If this issue does not resolve on its own, this is often a case of client compatibility issues, which may be caused by:</p>
        <ol>
          <li>Client software issues or upgrades.</li>
          <li>Recent configuration changes on the client authentication settings (username/password or identity settings).</li>
        </ol>
      `
    },
    DEFAULT: {
      rootCauses: 'No specific root cause.',
      recommendations: 'No recommendation.'
    },
    VARIOUS_REASONS: {
      rootCauses: 'Users are failing to successfully connect at the authentication stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.',
      recommendations: `
        <p>In many cases with authentication failure, each client device behaves differently, which causes a variety of unique failure symptoms. If the problem is affecting many users or lasting for a long time, it may be helpful to double-check any recent changes:</p>
        <ol>
          <li>Credential changes.</li>
          <li>Bulk expiry of passwords.</li>
          <li>Certificate changes.</li>
          <li>Infrastructure changes.</li>
          <li>Introduction of new client device types, or software upgrades of existing clients.</li>
        </ol>
      `
    }
  },
  dhcp: {
    DEFAULT: {
      rootCauses: 'No specific root cause.',
      recommendations: 'No recommendation.'
    },
    VARIOUS_REASONS: {
      rootCauses: 'Users are failing to successfully connect at the DHCP stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.',
      recommendations: `
        <p>In many cases with DHCP failure, each client device behaves differently, which causes a variety of unique failure symptoms. If the problem is affecting many users or lasting for a long time, it may be helpful to validate the end-to-end DHCP setup:</p>
        <ol>
          <li>Check DHCP server IP scopes are configured and enabled with available addresses.</li>
          <li>Check the network infrastructure is configured with proper VLANs (to the AP), IP helpers, or DHCP Proxy in place.</li>
          <li>Check for availability of DHCP servers and IP reachability by client devices.</li>
          <li>Check any recent changes in the DHCP infrastructure that may be leading to issues.</li>
        </ol>
      `
    },
    CCD_REASON_NACK: {
      rootCauses: `
        <p>The user\'s connectivity is failing at DHCP because the server is unable to satisfy the client\'s request. This may be caused by one of several reasons:</p>
        <ol>
          <li>The server received duplicate DHCP requests from the same client.</li>
          <li>The client is requesting an address on an incorrect subnet.</li>
          <li>There may be more than one DHCP server replying to the same client.</li>
        </ol>
      `,
      recommendations: `
        <p>Some modest DHCP NAKs are normal in every network (e.g. client device sent duplicate DHCP Requests), but excessive DHCP failures with a NAK may be resolved by checking common DHCP server configuration or network design problems:</p>
        <ol>
          <li>Did the WLAN\'s IP subnet recently change, and is now causing DHCP renewal failures?</li>
          <li>Is there a new L3 network boundary where devices are roaming and failing to renew their prior IP address?</li>
          <li>If two DHCP servers are serving the same subnet, ensure they are properly configured for load balancing or passive standby.</li>
        </ol>
      `
    },
    CCD_REASON_TIMEOUT: {
      rootCauses: `
        <p>The DHCP exchange is failing because of a timeout waiting for a response from the DHCP server. This is typically caused by the following reasons:</p>
        <ol>
          <li>The DHCP server is offline.</li>
          <li>The DHCP server is unreachable on the LAN (a network path issue) or there is high network latency.</li>
          <li>The VLAN/DVLAN infrastructure is not properly configured on the SSID, AP, or switch ports.</li>
          <li>The DHCP server is overloaded and unable to reply.</li>
          <li>The DHCP helper IP address is not configured on the subnet.</li>
        </ol>
      `,
      recommendations: `
        <p>DHCP timeouts will be resolved by isolating the DHCP server issue or network implementation problem:</p>
        <ol>
          <li>Is the DHCP server online with scopes configured and available addresses?'</li>
          <li>Is the DHCP server available and reachable by clients with minimal latency?'</li>
          <li>Are the APs (where failures are happening) and their switch ports properly configured with VLANs?'</li>
          <li>Is the DHCP helper IP address properly configured on the subnet gateway?</li>
        </ol>
      `
    }
  },
  radius: {
    DEFAULT: {
      rootCauses: 'No specific root cause.',
      recommendations: 'No recommendation.'
    },
    VARIOUS_REASONS: {
      rootCauses: 'Users are failing to successfully connect at the RADIUS stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.',
      recommendations: `
        <p>In many cases with RADIUS failure, each client device or RADIUS server behaves differently, which causes a variety of unique failure symptoms. If the problem is affecting many users or lasting for a long time, it may be helpful to validate the end-to-end RADIUS setup and network performance:</p>
        <ol>
          <li>Check the RADIUS server and controller settings to identify matching configurations (IP address, port, and shared secret).</li>
          <li>Check for RADIUS reachability by the controller/APAP (network reliability issues, like congestion, drops, flapping links, etc).</li>
          <li>Check for recent changes in the RADIUS infrastructure that may be leading to issues.</li>
          <li>Check RADIUS performance metrics to ensure it has sufficient capacity and is not overloaded.</li>
          <li>Check the wireless link for high congestion, retries/errors, or other unreliability issues.</li>
        </ol>
      `
    },
    CCD_REASON_AAA_SERVER_UNAVAILABLE: {
      rootCauses: `
        <p>The RADIUS server is offline or unreachable from the Controller/AP (message from Controller/AP to RADIUS is failing), which is often caused by:</p>
        <ol>
          <li>AP/SZ misconfiguration (Bad IP, bad port).</li>
          <li>The RADIUS server is offline.</li>
          <li>The RADIUS server is unreachable on the network (e.g. network path or routing issues).</li>
        </ol>
      `,
      recommendations: 'To fix this issue, it may be necessary to check the RADIUS server availability as well as the link between the Controller/AP and the RADIUS server.\\nIf all services are up and functional, double-check the RADIUS configuration on the Controller/AP.'
    },
    CCD_REASON_AAA_AUTH_FAIL: {
      rootCauses: `
        <p>Clients are failing 802.1X/EAP authentication, which is typically caused by:</p>
        <ol>
          <li>Invalid EAP (PEAP or TTLS) username and password.</li>
          <li>Invalid EAP certificates.</li>
          <li>Expired or untrusted server certificates.</li>
        </ol>
      `,
      recommendations: `
        <p>To resolve this issue, you may need to check RADIUS log details for authentication reject messages.\\nRecent changes in the authentication infrastructure may cause a sudden spike of EAP failures like this:</p>
        <ol>
          <li>RADIUS server certificate changes or expiration.</li>
          <li>Mass user password changes or credential expiry.</li>
          <li>Client onboarding or provisioning with wrong our outdated trust or credential profiles.</li>
        </ol>
      `
    },
    CCD_REASON_TIMEOUT: {
      rootCauses: `
        <p>The RADIUS authentication exchange is failing because of a timeout waiting for a response from the RADIUS server. This is typically caused by the following reasons:</p>
        <ol>
          <li>The RADIUS server is offline.</li>
          <li>The RADIUS server is unreachable by the controller/APAP (network reliability issues, like congestion, drops, flapping links, etc).</li>
          <li>The RADIUS server is overloaded and unable to reply.</li>
          <li>The wireless link is experiencing high congestion, retries/errors, or other unreliability issues.</li>
        </ol>
      `,
      recommendations: `
        <p>RADIUS timeouts are most likely to be resolved by investigating the RADIUS server health directly, typically by focusing on load or service availability metrics and logs:</p>
        <ol>
          <li>Is the RADIUS server reliable and reachable (by ping from the AP or controller)?</li>
          <li>Is the RADIUS server experiencing high load?</li>
          <li>Is the RADIUS hardware infrastructure (CPU, Memory, IO) over-loaded or otherwise suffering a service outage?</li>
          <li>Do the RADIUS logs indicate unusual failures messages or reasons?</li>
          <li>Is the wireless link showing symptoms of congestion (high airtime utilization or interference)?</li>
        </ol>
      `
    }
  }
}