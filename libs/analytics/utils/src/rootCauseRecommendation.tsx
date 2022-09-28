/* eslint-disable max-len */
import _                                    from 'lodash'
import { defineMessage, MessageDescriptor } from 'react-intl'

import { IncidentCode }               from './constants'
import { Incident, IncidentMetadata } from './types/incidents'

interface RootCauseAndRecommendation {
  rootCauses: MessageDescriptor
  recommendations: MessageDescriptor
}

const commonRecommendations = defineMessage({
  defaultMessage: `
  <p>If the problem does not resolve on its own, check the infrastructure and client population for recent changes likely to produce this failure:</p>
  <ol>
    <li>Were new clients or APs introduced in the environment?</li>
    <li>Were the impacted client OS types recently upgraded?</li>
    <li>Was the AP firmware recently upgraded?</li>
    <li>Were the AP radio or WLAN settings recently modified?</li>
  </ol>`
})

const ccd80211CommonRecommendations = defineMessage({
  defaultMessage: `
  <p>This problem should resolve on its own, but if it persists, check the infrastructure and client population for recent changes likely to produce this failure:</p>
  <ol>
    <li>Were new clients or APs introduced in the environment?</li>
    <li>Were the impacted client OS types recently upgraded?</li>
    <li>Was the AP firmware recently upgraded?</li>
    <li>Were the AP radio or WLAN settings recently modified?</li>
  </ol>`
})

export const codeToFailureTypeMap: Record<IncidentCode, string> = {
  'ttc': 'ttc',
  'radius-failure': 'radius',
  'eap-failure': 'eap',
  'dhcp-failure': 'dhcp',
  'auth-failure': 'auth',
  'assoc-failure': 'assoc',
  'p-cov-clientrssi-low': 'rss',
  'p-load-sz-cpu-load': 'sz-cpu-load',
  'p-switch-memory-high': 'switch-memory-high',
  'i-net-time-future': 'time-future',
  'i-net-time-past': 'time-past',
  'i-net-sz-net-latency': 'sz-net-latency',
  'i-apserv-high-num-reboots': 'ap-reboot',
  'i-apserv-continuous-reboots': 'ap-reboot',
  'i-apserv-downtime-high': 'ap-sz-conn-failure',
  'i-switch-vlan-mismatch': 'vlan-mismatch',
  'i-switch-poe-pd': 'poe-pd',
  'i-apinfra-poe-low': 'ap-poe-low',
  'i-apinfra-wanthroughput-low': 'ap-wanthroughput-low'
}

const ttcFailureCodes = ['assoc', 'auth', 'dhcp', 'eap', 'radius']

const extractFailureCode = (
  checks: Exclude<IncidentMetadata['rootCauseChecks'], undefined>['checks']
) => {
  return checks.length === 0
    ? 'DEFAULT'
    : checks.length > 1
      ? 'VARIOUS_REASONS'
      : Object.keys(checks[0]).filter(
        code => code.startsWith('CCD_REASON') || ttcFailureCodes.includes(code))[0]
}


export const rootCauseRecommendationMap = {
  'assoc': {
    CCD_REASON_NOT_AUTHED: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing to connect during the 802.11 open authentication, but the exact reason for the failures is unclear.</p>' }),
      recommendations: commonRecommendations
    },
    CCD_REASON_NOT_ASSOCED: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing to connect during the association stage, but the exact reason for the failures is unclear.</p>' }),
      recommendations: commonRecommendations
    },
    CCD_REASON_AUTH_ALG: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing in the 802.11 open authentication stage because the authentication algorithm in the authentication request is not supported by the WLAN/AP.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>Though this issue is uncommon, it may occur due to unexpected configuration changes or incompatibilities:</p>
        <ol>
          <li>Are the impacted clients configured to use a WLAN type that mismatches the AP/SSID settings?</li>
          <li>Were devices recently upgraded with new firmware that may be introducing bugs?</li>
          <li>Was the WLAN configuration changed on the infrastructure?</li>
        </ol>`
      })
    },
    // to verify that any incident with this reason code does not show up
    CCD_REASON_AUTH_WITHHELD: {
      rootCauses: defineMessage({ defaultMessage: '<p>n/a</p>' }),
      recommendations: defineMessage({ defaultMessage: '<p>n/a</p>' })
    },
    CCD_REASON_AUTH_FILTERED_BY_ACL: {
      rootCauses: defineMessage({
        defaultMessage: `
        <p>Clients are failing to associate due to one of the following permission features:</p>
        <ol>
          <li>The L2 MAC ACL settings do not permit this client (client MAC exists in denial list, or does not exist in permitted list).</li>
          <li>The client MAC is included in the blocked client list configured by the admin.</li>
        </ol>`
      }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This issue is typically the result of an intended policy configuration. No action may be needed, but if this behavior is creating unwanted user disruption, consider modifying the policy configurations:</p>
        <ol>
          <li>Confirm the L2 MAC ACL policy.</li>
          <li>Confirm the Blocked Client List.</li>
        </ol>`
      })
    },
    CCD_REASON_AUTH_FILTERED_BY_TCM: {
      rootCauses: defineMessage({ defaultMessage: '<p>Client connections are temporarily suppressed by Transient Client Management behavior configured on the WLAN.</p>' }),
      recommendations: defineMessage({ defaultMessage: '<p>This issue is typically the result of an intended policy configuration. No action may be needed, but if this behavior is creating unwanted user disruption, consider disabling Transient Client Management or make the logic more conservative.</p>' })
    },
    CCD_REASON_AUTH_MDID_MISMATCH: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing 802.11r roaming due to a mismatch in the mobility domain ID (MDID) in the 802.11r connection request.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This may be caused if the roaming boundary for an SSID crosses two AP zones, venues, or groups in which the same SSID exists, but the MDID does not match on the SSIDs. Double check the deployment to identify if the failing AP(s) represent a roaming boundary between two WLANs that have the same SSID, but different MDIDs (usually between AP zones or venue).</p>
        <p>This issue may be observed when client 802.11r implementations are unreliable, which usually points to firmware or driver issues. Check the impacted client list to see if this is only affecting a specific OS type.</p>`
      })
    },
    CCD_REASON_ASSOC_DOS_ATTACK: {
      rootCauses: defineMessage({ defaultMessage: '<p>Impacted clients are failing association because of a DoS prevention feature that temporarily blocks their connections after they have excessive authentication failures in a short period of time.</p>' }),
      recommendations: defineMessage({ defaultMessage: '<p>This issue is caused by a DoS protection feature, which can be enabled/disabled in the RUCKUS UI. If the behavior is having an undesirable impact on valid clients, the feature can be disabled or optimized to make the prevention logic more conservative.</p>' })
    },
    CCD_REASON_ASSOC_TOOMANY: {
      rootCauses: defineMessage({
        defaultMessage: `
        <p>Client associations are failing on the AP due to one of several possible capacity conditions:</p>
        <ol>
          <li>The AP radio has reached its max client limit (fixed limit of HW/SW).</li>
          <li>The AP has reached its total client limit for both radios (fixed limit of HW/SW).</li>
          <li>The AP radio has reached its max allowed client limit, as specified by the admin in the configuration.</li>
        </ol>`
      }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This behavior may be a desirable consequence of the admin's configuration-to prevent any one AP from serving too many clients. If so, no action is needed.</p>
        <p>If this issue is having an undesirable client impact, there are a few possible recommendations:</p>
        <ol>
          <li>If the max configured limit is too low, change the SSID or AP radio settings to increase the max number of allowed clients.</li>
          <li>If there is a very high amount of client transience and the SSID's client inactivity timeout is set too high, the AP may be honoring clients that are no longer connected. Reduce the inactivity timeout on the SSID.</li>
          <li>If band or load balancing are disabled, consider enabling them to more proactively spread client load across service sets.</li>
          <li>If the RF design allows for it, add APs to supplement capacity.</li>
        </ol>`
      })
    },
    CCD_REASON_ASSOC_NOT_AUTHED: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are attempting to associate without first performing 802.11 open authentication, or if the prior open authentication has expired. Typically this happens when the client/AP state machine is out of sync.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This state machine mismatch problem happens somewhat regularly in Wi-Fi as a transient problem, but is usually self-corrected by the client/AP. If the problem is having a noticeable impact on user connectivity, double-check the common situations that introduce misbehavior like this:</p>
        <ol>
          <li>Was the firmware recently updated on the infrastructure or impacted clients?</li>
          <li>Were new client types recently introduced into the environment, and are they Wi-Fi certified?</li>
        </ol>`
      })
    },
    CCD_REASON_ASSOC_RSN_REQUIRED: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing association because the association request is missing the WPA/RSN information element(s), which typically indicates interoperability issues.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This behavior is uncommon in Wi-Fi and represents a protocol incompatibility. If clients are exhibiting this behavior, double-check the common situations that introduce interoperability problems like this:</p>
        <ol>
          <li>Were the firmware or drivers recently updated on the infrastructure or impacted clients?</li>
          <li>Were new client types recently introduced into the environment, and are they able to support the AP's WLAN security types?</li>
        </ol>`
      })
    },
    CCD_REASON_ASSOC_IE_INVALID: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing association because the association request has unsupported or malformed security information in the WPA/RSN information element(s), which typically indicates interoperability issues.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This behavior is uncommon in Wi-Fi and represents a protocol incompatibility. If clients are exhibiting this behavior, double-check the common situations that introduce interoperability problems like this:</p>
        <ol>
          <li>Were the firmware or drivers recently updated on impacted clients?</li>
          <li>Were new client types recently introduced into the environment?</li>
        </ol>`
      })
    },
    DEFAULT: {
      rootCauses: defineMessage({ defaultMessage: '<p>No specific root cause.</p>' }),
      recommendations: defineMessage({ defaultMessage: '<p>No recommendation.</p>' })
    },
    VARIOUS_REASONS: {
      rootCauses: defineMessage({ defaultMessage: '<p>Users are failing to successfully connect at the 802.11 association stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>In these multi-issue failures, there are a few general recommendations to check:</p>
        <ol>
          <li>Were new clients or APs introduced in the environment?</li>
          <li>Were the impacted client OS types recently upgraded?</li>
          <li>Was the AP firmware recently upgraded?</li>
          <li>Were the AP radio or WLAN settings recently modified?</li>
          <li>Check for high levels of RF performance interference, which may be causing high error rates.</li>
          <li>Compare the configuration and operating deployment of the affected WLAN or network scope (AP, AP group, etc) with others to identify any unique settings that may be causing issues.</li>
        </ol>`
      })
    }
  },
  'auth': {
    CCD_REASON_AUTH_FT_ROAM_FAILURE: {
      rootCauses: defineMessage({
        defaultMessage: `
        <p>Clients are failing at the authentication stage of an 802.11r (Fast Transition) roam. The client is including PMKID information from its roam-from AP, but the roam-to AP does not have the key.</p>
        <p>This scenario is most commonly caused in the following scenarios:</p>
        <ol>
          <li>The roam-from and roam-to APs cannot share keys with one another, which happens if they are not RF neighbors or if they do not have IP connectivity for AP-to-AP communication.</li>
          <li>The roam-from and roam-to APs are not RF neighbors. Clients may assume that all APs sharing an SSID will have the key, but the key may only be shared with RF neighbors.</li>
        </ol>`
      }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>In most cases, clients will immediately fall back to a "slow roam" if 802.11r (FT) roams fail.</p>
        <p>To enable 802.11r roaming, make sure that APs are able to communicate with their RF neighbors via the IP (wired) infrastructure.</p>`
      })
    },
    CCD_REASON_NOT_AUTHED: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing to connect during the 802.11 open authentication, but the exact reason for the failures is unclear.</p>' }),
      recommendations: commonRecommendations
    },
    CCD_REASON_NOT_ASSOCED: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing to connect during the association stage, but the exact reason for the failures is unclear.</p>' }),
      recommendations: commonRecommendations
    },
    CCD_REASON_AUTH_ALG: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing in the 802.11 open authentication stage because the authentication algorithm in the authentication request is not supported by the WLAN/AP.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>Though this issue is uncommon, it may occur due to unexpected configuration changes or incompatibilities:</p>
        <ol>
          <li>Are the impacted clients configured to use a WLAN type that mismatches the AP/SSID settings?</li>
          <li>Were devices recently upgraded with new firmware?</li>
          <li>Was the WLAN configuration changed on the infrastructure?</li>
        </ol>`
      })
    },
    CCD_REASON_AUTH_WITHHELD: {
      rootCauses: defineMessage({ defaultMessage: '<p>n/a</p>' }),
      recommendations: defineMessage({ defaultMessage: '<p>n/a</p>' })
    },
    CCD_REASON_AUTH_FILTERED_BY_ACL: {
      rootCauses: defineMessage({
        defaultMessage: `
        <p>Clients are failing to associate due to one of the following permission features:</p>
        <ol>
          <li>The L2 MAC ACL settings do not permit this client (client MAC exists in denial list, or does not exist in permitted list).</li>
          <li>The client MAC is included in the blocked client list configured by the admin.</li>
        </ol>`
      }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This issue is typically the result of an intended policy configuration. No action may be needed, but if this behavior is creating unwanted user disruption, consider modifying the policy configurations:</p>
        <ol>
          <li>Confirm the L2 MAC ACL policy.</li>
          <li>Confirm the Blocked Client List.</li>
        </ol>`
      })
    },
    CCD_REASON_AUTH_FILTERED_BY_TCM: {
      rootCauses: defineMessage({ defaultMessage: '<p>Client connections are temporarily suppressed by Transient Client Management behavior configured on the WLAN.</p>' }),
      recommendations: defineMessage({ defaultMessage: '<p>This issue is typically the result of an intended policy configuration. No action may be needed, but if this behavior is creating unwanted user disruption, consider disabling Transient Client Management or make the logic more conservative.</p>' })
    },
    CCD_REASON_AUTH_MDID_MISMATCH: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing 802.11r roaming due to a mismatch in the mobility domain ID (MDID) in the 802.11r connection request.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This may be caused if the roaming boundary for an SSID crosses two AP zones, venues, or groups in which the same SSID exists, but the MDID does not match on the SSIDs. Double check the deployment to identify if the failing AP(s) represent a roaming boundary between two WLANs that have the same SSID, but different MDIDs (usually between AP zones or venue).</p>
        <p>This issue may be observed when client 802.11r implementations are unreliable, which usually points to firmware or driver issues. Check the impacted client list to see if this is only affecting a specific OS type.</p>`
      })
    },
    CCD_REASON_ASSOC_DOS_ATTACK: {
      rootCauses: defineMessage({ defaultMessage: '<p>Impacted clients are failing association because of a DoS prevention feature that temporarily blocks their connections after they have excessive authentication failures in a short period of time.</p>' }),
      recommendations: defineMessage({ defaultMessage: '<p>This issue is caused by a DoS protection feature, which can be enabled/disabled in the RUCKUS UI. If the behavior is having an undesirable impact on valid clients, the feature can be disabled or optimized to make the prevention logic more conservative.</p>' })
    },
    CCD_REASON_ASSOC_TOOMANY: {
      rootCauses: defineMessage({
        defaultMessage: `
        <p>Client associations are failing on the AP due to one of several possible capacity conditions:</p>
        <ol>
          <li>The AP radio has reached its max client limit (fixed limit of HW/SW).</li>
          <li>The AP has reached its total client limit for both radios (fixed limit of HW/SW).</li>
          <li>The AP radio has reached its max allowed client limit, as specified by the admin in the configuration.</li>
        </ol>`
      }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This behavior may be a desirable consequence of the admin's configuration-to prevent any one AP from serving too many clients. If so, no action is needed.</p>
        <p>If this issue is having an undesirable client impact, there are a few possible recommendations:</p>
        <ol>
          <li>If the max configured limit is too low, change the SSID or AP radio settings to increase the max number of allowed clients.</li>
          <li>If there is a very high amount of client transience and the SSID's client inactivity timeout is set too high, the AP may be honoring clients that are no longer connected. Reduce the inactivity timeout on the SSID.</li>
          <li>If band or load balancing are disabled, consider enabling them to more proactively spread client load across service sets.</li>
          <li>If the RF design allows for it, add APs to supplement capacity.</li>
        </ol>`
      })
    },
    CCD_REASON_ASSOC_NOT_AUTHED: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are attempting to associate without first performing 802.11 open authentication. Typically this happens when the client/AP state machine is out of sync.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This state machine mismatch problem happens somewhat regularly in Wi-Fi as a transient problem, but is usually self-corrected by the client/AP. If the problem is having a noticeable impact on user connectivity, double-check the common situations that introduce misbehavior like this:</p>
        <ol>
          <li>Was the firmware recently updated on impacted clients?</li>
          <li>Were new client types recently introduced into the environment?</li>
        </ol>`
      })
    },
    CCD_REASON_ASSOC_RSN_REQUIRED: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing association because the association request is missing the WPA/RSN information element(s), which typically indicates interoperability issues.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This behavior is uncommon in Wi-Fi and represents a protocol incompatibility. If clients are exhibiting this behavior, double-check the common situations that introduce interoperability problems like this:</p>
        <ol>
          <li>Were the firmware or drivers recently updated on the infrastructure or impacted clients?</li>
          <li>Were new client types recently introduced into the environment, and are they able to support the AP's WLAN security types?</li>
        </ol>`
      })
    },
    CCD_REASON_ASSOC_IE_INVALID: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing association because the association request has unsupported or malformed security information in the WPA/RSN information element(s), which typically indicates interoperability issues.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This behavior is uncommon in Wi-Fi and represents a protocol incompatibility. If clients are exhibiting this behavior, double-check the common situations that introduce interoperability problems like this:</p>
        <ol>
          <li>Were the firmware or drivers recently updated on impacted clients?</li>
          <li>Were new client types recently introduced into the environment?</li>
        </ol>`
      })
    },
    DEFAULT: {
      rootCauses: defineMessage({ defaultMessage: '<p>No specific root cause.</p>' }),
      recommendations: defineMessage({ defaultMessage: '<p>No recommendation.</p>' })
    },
    VARIOUS_REASONS: {
      rootCauses: defineMessage({ defaultMessage: '<p>Users are failing to successfully connect at the 802.11 authentication stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>In these multi-issue failures, there are a few general recommendations to check:</p>
        <ol>
          <li>Were new clients or APs introduced in the environment?</li>
          <li>Were the impacted client OS types recently upgraded?</li>
          <li>Was the AP firmware recently upgraded?</li>
          <li>Were the AP radio or WLAN settings recently modified?</li>
          <li>Check for high levels of RF performance interference, which may be causing high error rates.</li>
          <li>Compare the configuration and operating deployment of the affected WLAN or network scope (AP, AP group, etc) with others to identify unique settings that may be causing issues.</li>
        </ol>`
      })
    }
  },
  'eap': {
    CCD_REASON_EAPOL_STATE_INVALID: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing authentication (4-way handshake) because the AP is receiving EAPOL keys (typically msg2 or msg4) from clients in an incorrect sequence.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This invalid key sequence issue happens in Wi-Fi as a transient problem, but is usually self-corrected by the client/AP. If the problem is having a noticeable impact on user connectivity, double-check the common situations that introduce misbehavior like this:</p>
        <ol>
          <li>Was the AP's airtime utilization excessively high during the failure window? Busy RF conditions may manifest in this way.</li>
          <li>Was the firmware recently updated on impacted clients so as to introduce interoperability issues?</li>
          <li>Were new client types recently introduced into the environment?</li>
        </ol>`
      })
    },
    CCD_REASON_EAPOL_KEY_INVALID: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing authentication because of key data errors in msg2 of the 4-way handshake (sent from client to AP). This may be caused by cipher/key incompatibilities or invalid key data.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>Invalid key data is an uncommon issue in the 4-way handshake. If this is happening, packet captures may be required to investigate the nature of invalid keys.</p>
        <p>If the problem persists, check common situations that may have introduced this interoperability behavior:</p>
        <ol>
          <li>Are the impacted clients using problematic drivers or firmware?</li>
          <li>Was the firmware recently updated on impacted clients so as to introduce interoperability issues?</li>
          <li>Were new client types recently introduced into the environment?</li>
        </ol>`
      })
    },
    CCD_REASON_RSN_INCONSISTENT: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing authentication because the WPA Information Element in msg2 of the 4-way handshake (sent from client to AP) does not match the WPA Information Element sent in the Association Request.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This WPA Information Element mismatch issue is an uncommon issue in the 4-way handshake. If this is happening, packet captures may be required to investigate the nature of Information Element mismatches.</p>
        <p>If the problem persists, check common situations that may have introduced this interoperability behavior:</p>
        <ol>
          <li>Are the impacted clients using problematic drivers or firmware?</li>
          <li>Was the firmware recently updated on impacted clients so as to introduce interoperability issues?</li>
          <li>Were new client types recently introduced into the environment?</li>
        </ol>`
      })
    },
    CCD_REASON_MIC_FAILURE: {
      rootCauses: defineMessage({ defaultMessage: '<p>Clients are failing authentication because the passphrase (PSK) does not match the AP/SSID configuration.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>This is a common problem in networks where passphrase authentication (e.g. WPA2-Personal) is used. To resolve the issue, check the following:</p>
        <ol>
          <li>Was the passphrase recently changed on the infrastructure, while client devices still used the old passphrase?</li>
          <li>Was there a spike of new users who may have been provided with the wrong passphrase?</li>
          <li>Were client devices provisioned automatically with device management software with the wrong passphrase?</li>
        </ol>`
      })
    },
    CCD_REASON_TIMEOUT: {
      rootCauses: defineMessage({
        defaultMessage: `
        <p>Client authentication is failing because of a timeout in the authentication exchange with the client. This is commonly caused by the following reasons:</p>
        <ol>
          <li>EAP Request timeout waiting for client EAP Response.</li>
          <li>4-way handshake timeout waiting for the client response.</li>
        </ol>`
      }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>To diagnose this issue further, check the following situations:</p>
        <ol>
          <li>High RF interference, airtime utilization, or other poor RF conditions, which disrupts normal channel access.</li>
          <li>Were the impacted client OS types recently upgraded?</li>
          <li>Were the WLAN settings (especially DPSK) recently modified?</li>
        </ol>`
      })
    },
    CCD_REASON_EAP_IDENTIFIER_MISMATCH: {
      rootCauses: defineMessage({ defaultMessage: '<p>This is an uncommon client authentication failure type, which happens when the client sends a different Identifier in the Response and Request messages.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>If this issue does not resolve on its own, this is often a case of client compatibility issues, which may be caused by:</p>
        <ol>
          <li>Client software issues or upgrades.</li>
          <li>Recent configuration changes on the client authentication settings (username/password or identity settings).</li>
        </ol>`
      })
    },
    DEFAULT: {
      rootCauses: defineMessage({ defaultMessage: '<p>No specific root cause.</p>' }),
      recommendations: defineMessage({ defaultMessage: '<p>No recommendation.</p>' })
    },
    VARIOUS_REASONS: {
      rootCauses: defineMessage({ defaultMessage: '<p>Users are failing to successfully connect at the authentication stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>In many cases with authentication failure, each client device behaves differently, which causes a variety of unique failure symptoms. If the problem is affecting many users or lasting for a long time, it may be helpful to double-check any recent changes:</p>
        <ol>
          <li>Credential changes.</li>
          <li>Bulk expiry of passwords.</li>
          <li>Certificate changes.</li>
          <li>Infrastructure changes.</li>
          <li>Introduction of new client device types, or software upgrades of existing clients.</li>
        </ol>`
      })
    }
  },
  'dhcp': {
    DEFAULT: {
      rootCauses: defineMessage({ defaultMessage: '<p>No specific root cause.</p>' }),
      recommendations: defineMessage({ defaultMessage: '<p>No recommendation.</p>' })
    },
    VARIOUS_REASONS: {
      rootCauses: defineMessage({ defaultMessage: '<p>Users are failing to successfully connect at the DHCP stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>In many cases with DHCP failure, each client device behaves differently, which causes a variety of unique failure symptoms. If the problem is affecting many users or lasting for a long time, it may be helpful to validate the end-to-end DHCP setup:</p>
        <ol>
          <li>Check DHCP server IP scopes are configured and enabled with available addresses.</li>
          <li>Check the network infrastructure is configured with proper VLANs (to the AP), IP helpers, or DHCP Proxy in place.</li>
          <li>Check for availability of DHCP servers and IP reachability by client devices.</li>
          <li>Check any recent changes in the DHCP infrastructure that may be leading to issues.</li>
        </ol>`
      })
    },
    CCD_REASON_NACK: {
      rootCauses: defineMessage({
        defaultMessage: `
        <p>The user's connectivity is failing at DHCP because the server is unable to satisfy the client's request. This may be caused by one of several reasons:</p>
        <ol>
          <li>The server received duplicate DHCP requests from the same client.</li>
          <li>The client is requesting an address on an incorrect subnet.</li>
          <li>There may be more than one DHCP server replying to the same client.</li>
        </ol>`
      }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>Some modest DHCP NAKs are normal in every network (e.g. client device sent duplicate DHCP Requests), but excessive DHCP failures with a NAK may be resolved by checking common DHCP server configuration or network design problems:</p>
        <ol>
          <li>Did the WLAN's IP subnet recently change, and is now causing DHCP renewal failures?</li>
          <li>Is there a new L3 network boundary where devices are roaming and failing to renew their prior IP address?</li>
          <li>If two DHCP servers are serving the same subnet, ensure they are properly configured for load balancing or passive standby.</li>
        </ol>`
      })
    },
    CCD_REASON_TIMEOUT: {
      rootCauses: defineMessage({
        defaultMessage: `
        <p>The DHCP exchange is failing because of a timeout waiting for a response from the DHCP server. This is typically caused by the following reasons:</p>
        <ol>
          <li>The DHCP server is offline.</li>
          <li>The DHCP server is unreachable on the LAN (a network path issue) or there is high network latency.</li>
          <li>The VLAN/DVLAN infrastructure is not properly configured on the SSID, AP, or switch ports.</li>
          <li>The DHCP server is overloaded and unable to reply.</li>
          <li>The DHCP helper IP address is not configured on the subnet.</li>
        </ol>`
      }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>DHCP timeouts will be resolved by isolating the DHCP server issue or network implementation problem:</p>
        <ol>
          <li>Is the DHCP server online with scopes configured and available addresses?</li>
          <li>Is the DHCP server available and reachable by clients with minimal latency?</li>
          <li>Are the APs (where failures are happening) and their switch ports properly configured with VLANs?</li>
          <li>Is the DHCP helper IP address properly configured on the subnet gateway?</li>
        </ol>`
      })
    }
  },
  'radius': {
    DEFAULT: {
      rootCauses: defineMessage({ defaultMessage: '<p>No specific root cause.</p>' }),
      recommendations: defineMessage({ defaultMessage: '<p>No recommendation.</p>' })
    },
    VARIOUS_REASONS: {
      rootCauses: defineMessage({ defaultMessage: '<p>Users are failing to successfully connect at the RADIUS stage. This connection failure issue is comprised of multiple failure types and reasons, making it difficult to pin down the exact cause.</p>' }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>In many cases with RADIUS failure, each client device or RADIUS server behaves differently, which causes a variety of unique failure symptoms. If the problem is affecting many users or lasting for a long time, it may be helpful to validate the end-to-end RADIUS setup and network performance:</p>
        <ol>
          <li>Check the RADIUS server and RUCKUS Cloud settings to identify matching configurations (IP address, port, and shared secret).</li>
          <li>Check for RADIUS reachability by RUCKUS Cloud/APAP (network reliability issues, like congestion, drops, flapping links, etc).</li>
          <li>Check for recent changes in the RADIUS infrastructure that may be leading to issues.</li>
          <li>Check RADIUS performance metrics to ensure it has sufficient capacity and is not overloaded.</li>
          <li>Check the wireless link for high congestion, retries/errors, or other unreliability issues.</li>
        </ol>`
      })
    },
    CCD_REASON_AAA_SERVER_UNAVAILABLE: {
      rootCauses: defineMessage({
        defaultMessage: `
        <p>The RADIUS server is offline or unreachable from RUCKUS Cloud/AP (message from RUCKUS Cloud/AP to RADIUS is failing), which is often caused by:</p>
        <ol>
          <li>AP/SZ misconfiguration (Bad IP, bad port).</li>
          <li>The RADIUS server is offline.</li>
          <li>The RADIUS server is unreachable on the network (e.g. network path or routing issues).</li>
        </ol>`
      }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>To fix this issue, it may be necessary to check the RADIUS server availability as well as the link between RUCKUS Cloud/AP and the RADIUS server.</p>
        <p>If all services are up and functional, double-check the RADIUS configuration on RUCKUS Cloud/AP.</p>`
      })
    },
    CCD_REASON_AAA_AUTH_FAIL: {
      rootCauses: defineMessage({
        defaultMessage: `
        <p>Clients are failing 802.1X/EAP authentication, which is typically caused by:</p>
        <ol>
          <li>Invalid EAP (PEAP or TTLS) username and password.</li>
          <li>Invalid EAP certificates.</li>
          <li>Expired or untrusted server certificates.</li>
        </ol>`
      }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>To resolve this issue, you may need to check RADIUS log details for authentication reject messages.</p>
        <p>Recent changes in the authentication infrastructure may cause a sudden spike of EAP failures like this:</p>
        <ol>
          <li>RADIUS server certificate changes or expiration.</li>
          <li>Mass user password changes or credential expiry.</li>
          <li>Client onboarding or provisioning with wrong our outdated trust or credential profiles.</li>
        </ol>`
      })
    },
    CCD_REASON_TIMEOUT: {
      rootCauses: defineMessage({
        defaultMessage: `
        <p>The RADIUS authentication exchange is failing because of a timeout waiting for a response from the RADIUS server. This is typically caused by the following reasons:</p>
        <ol>
          <li>The RADIUS server is offline.</li>
          <li>The RADIUS server is unreachable by RUCKUS Cloud/APAP (network reliability issues, like congestion, drops, flapping links, etc).</li>
          <li>The RADIUS server is overloaded and unable to reply.</li>
          <li>The wireless link is experiencing high congestion, retries/errors, or other unreliability issues.</li>
        </ol>`
      }),
      recommendations: defineMessage({
        defaultMessage: `
        <p>RADIUS timeouts are most likely to be resolved by investigating the RADIUS server health directly, typically by focusing on load or service availability metrics and logs:</p>
        <ol>
          <li>Is the RADIUS server reliable and reachable (by ping from the AP or RUCKUS Cloud)?</li>
          <li>Is the RADIUS server experiencing high load?</li>
          <li>Is the RADIUS hardware infrastructure (CPU, Memory, IO) over-loaded or otherwise suffering a service outage?</li>
          <li>Do the RADIUS logs indicate unusual failures messages or reasons?</li>
          <li>Is the wireless link showing symptoms of congestion (high airtime utilization or interference)?</li>
        </ol>`
      })
    }
  },
  'ttc': {
    DEFAULT: {
      rootCauses: `
        <p>Users are experiencing a higher time to connect compared to the configured SLA goal. User's Wi-Fi connection process goes through several stages. Delays in any of the stages will result in a higher time to connect for the user.</p>
        <ol>
          <li>802.11 authentication, association.</li>
          <li>802.11 re-association in case of roaming</li>
          <li>L2/L3 authentication - Typical with 802.1x WLAN when RADIUS server is configured</li>
          <li>DHCP</li>
        </ol>
      `,
      recommendations: `
        <p>To remediate the problems identified above, follow the corresponding recommended actions:</p>
        <ol>
          <li>This stage typically does not contribute to delays. Delays in this stage might indicates RF issues. Try changing channel or band.</li>
          <li>Delays in this stage might indicate roaming issues. User device may be trying to connect to far off APs. Try changing channel or band.</li>
          <li>(Typical) Delays in this stage might indicate high latency to the RADIUS server or an overloaded RADIUS server. Inspect RADIUS server configuration, isolate the component with high network latency or try dedicating CPU, memory, and disk to the RADIUS server if it is hosted on a shared VM.</li>
          <li>(Typical) If there is high latency in receiving the DHCP response or if the DHCP response is not received it can add significant delays to the connection process. Common causes are overloaded DHCP server - DHCP server IP pool exhaustion or DHCP server not able to keep up with the rate of incoming DHCP requests. Inspect DHCP server configuration and assign dedicated CPU, memory, disk space to the DHCP server.</li>
        </ol>
      `
    },
    VARIOUS_REASONS: {
      rootCauses: `
        <p>Users are experiencing a higher time to connect compared to the configured SLA goal. User's Wi-Fi connection process goes through several stages. Delays in any of the stages will result in a higher time to connect for the user.</p>
        <ol>
          <li>802.11 authentication, association.</li>
          <li>802.11 re-association in case of roaming</li>
          <li>L2/L3 authentication - Typical with 802.1x WLAN when RADIUS server is configured</li>
          <li>DHCP</li>
        </ol>
      `,
      recommendations: `
        <p>To remediate the problems identified above, follow the corresponding recommended actions:</p>
        <ol>
          <li>This stage typically does not contribute to delays. Delays in this stage might indicates RF issues. Try changing channel or band.</li>
          <li>Delays in this stage might indicate roaming issues. User device may be trying to connect to far off APs. Try changing channel or band.</li>
          <li>(Typical) Delays in this stage might indicate high latency to the RADIUS server or an overloaded RADIUS server. Inspect RADIUS server configuration, isolate the component with high network latency or try dedicating CPU, memory, and disk to the RADIUS server if it is hosted on a shared VM.</li>
          <li>(Typical) If there is high latency in receiving the DHCP response or if the DHCP response is not received it can add significant delays to the connection process. Common causes are overloaded DHCP server - DHCP server IP pool exhaustion or DHCP server not able to keep up with the rate of incoming DHCP requests. Inspect DHCP server configuration and assign dedicated CPU, memory, disk space to the DHCP server.</li>
        </ol>
      `
    }
  },
  'rss': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: `
          <p>Client uplink RSSI is unusually low, which can have several root causes. Consider the following common behavior and design issues:</p>
          <ol>
            <li>General under-coverage (insufficient APs), localized coverage holes, or sub-optimal AP placement.</li>
            <li>Conservative roaming behavior, also known as sticky clients (clients will not roam until their RSSI is very low).</li>
            <li>If this problem is only affecting certain client types or OS versions, client firmware or configuration settings may be leading to aggressive power save measures that decrease transmit power.</li>
          </ol>
        `
      }),
      recommendations: defineMessage({
        defaultMessage: `
          <p>Given the broad set of potential reasons for low RSSI, the recommendation will be based on the actual root cause, including some of the following possibilities:</p>
          <ol>
            <li>In cases of general or localized under-coverage (all clients have low RSSI), add APs as needed.</li>
            <li>In cases of sub-optimal AP placement (sufficient APs, but localized coverage issues), consider re-locating APs based on RF design best practices or adding APs to supplement.</li>
            <li>In cases of sticky clients, consider utilizing features like SmartRoam to assist clients with proactive roaming guidance (first, double-check to see if clients support 802.11v, or if the sticky client issue is affecting application performance).</li>
            <li>In cases where low tx power is affecting only a subset of clients, check for unique configuration settings regarding power save, or potentially firmware upgrades that resolve client-side tx issues.</li>
          </ol>
        `
      })
    }
  },
  'time-future': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: '<p>Incorrect data timestamps are typically caused by NTP issues either on the controller or the underlying infrastructure.</p>'
      }),
      recommendations: defineMessage({
        defaultMessage: `
          <p>To resolve data timestamp issues, check the controller time for accuracy:</p>
          <ol>
            <li>Ensure that the NTP server is online and reachable.</li>
            <li>Execute a manual NTP sync to update the time.</li>
            <li>Check the underlying infrastructure (in a VM environment) to ensure the hypervisor is providing the correct time.</li>
          </ol>
        `
      })
    }
  },
  'time-past': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: '<p>Incorrect data timestamps are typically caused by NTP issues either on the controller or the underlying infrastructure.</p>'
      }),
      recommendations: defineMessage({
        defaultMessage: `
          <p>To resolve data timestamp issues, check the controller time for accuracy:</p>
          <ol>
            <li>Ensure that the NTP server is online and reachable.</li>
            <li>Execute a manual NTP sync to update the time.</li>
            <li>Check the underlying infrastructure (in a VM environment) to ensure the hypervisor is providing the correct time.</li>
          </ol>
        `
      })
    }
  },
  'sz-net-latency': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: '<p>Might be caused by network stability issues.</p>'
      }),
      recommendations: defineMessage({
        defaultMessage: '<p>Please check the network routing, NIC to the switch, cable/medium between SZ nodes, upstream device interface hardware settings (duplex, speed, etc.) or interface errors, saturation status and upstream device port status as well.</p>'
      })
    }
  },
  'sz-cpu-load': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: `
          <p>High CPU usage can occur due to many reasons. CPU spikes can also occur for short duration under normal operation. This incident is raised when sustained high CPU usage is detected. Smartzone CPU is used by multiple processes, services and applications. There are approximately 5 groups of applications.</p>
          <ol>
            <li>Messaging group: This consists of applications that process, store, distribute and export stats.</li>
            <li>Web group: This consists of the web server and other applications that process internal and external APIs.</li>
            <li>Event group: This mainly consists of services that handle events and alarms.</li>
            <li>WISPRr group: This consists of services that process user login/logout, session management etc.</li>
            <li>Device group: This mainly consists of AP and switch connection status management.</li>
          </ol>
          <p>Sometimes memory intensive processes like downloading files or uploading firmwares might cause high CPU usage</p>
        `
      }),
      recommendations: defineMessage({
        defaultMessage: `
          <p>For each group of reasons, corresponding recommendations are below:</p>
          <ol>
            <li>Turn off unused features - AVC, Wi-Fi Calling, Mesh, URL Filtering, Rogue client etc.</li>
            <li>Check the rate and volume of data requested through public API calls.</li>
            <li>Consider removing unnecessary events or reducing the duration of event storage.</li>
            <li>Check the rate and volume of user login requests.</li>
            <li>Address any alarms related to AP or switch connection status.</li>
          </ol>
          <p>Generally memory and I/O intensive process are transient. If a sustained high memory usage is observed, please work with Ruckus customer team.</p>
        `
      })
    }
  },
  'ap-reboot': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: `
          <p>System has detected an abnormally high number of AP reboots. This can occur due to the following reasons:</p>
          <ol>
            <li>Insufficient power from the Power over Ethernet (PoE) switch or PoE injector device aka. Power Sourcing Equipment (PSE).</li>
            <li>Configuration download failures.</li>
            <li>Firmware update failures.</li>
            <li>System initiated reboots.</li>
          </ol>
        `
      }),
      recommendations: defineMessage({
        defaultMessage: `
          <p>To remediate the problems identified above, follow the corresponding recommended actions:</p>
          <ol>
            <li>Ensure that PSE - PoE switch or PoE injector capacity and cumulative power requirements of all APs for full operation are appropriately matched.</li>
            <li>(Typical) Check the connectivity to the AP gateway and latency to the controller. In rare cases it might indicate configuration corruption.</li>
            <li>(Typical) Check the connectivity to the AP gateway and latency to the controller. Download time out is the main cause.</li>
            <li>Controller can reboot the AP for multiple reasons. There could be an mishandled exception or catastrophic failure in a process, causing controller to reboot the AP. In these cases, an alarm is raised. Use controller alarm message, Alarm code: 302 and attribute field to understand and isolate this issue further.</li>
          </ol>
        `
      })
    }
  },
  'ap-sz-conn-failure': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: `
          <p>System has detected high number of AP-controller connection failures. This can occur due to following reasons:</p>
          <ol>
            <li>Intermittent or permanent loss of connectivity between AP and controller. Losing consecutive heartbeat/keepalive messages from the AP will result in AP-controller connection failures.</li>
            <li>Improperly configured Firewall or NAT device or a network switch can cause the AP-controller communication failure.</li>
            <li>Lack of reachability from AP to controller over a WAN connection or cloud would cause APs to disconnect from controller.</li>
            <li>In rare cases, AP certificate is invalid which forces controller to deny the incoming connection from the AP.</li>
          </ol>
        `
      }),
      recommendations: defineMessage({
        defaultMessage: `
          <p>To remediate the problems identified above, follow the corresponding recommended actions:</p>
          <ol>
            <li>Test network connection between AP and controller.</li>
            <li>Ensure that there is clear communication on all required ports.</li>
            <li>Test WAN connection health to ensure there is a route from AP to the controller and there is no or acceptable packet loss.</li>
            <li>Ensure that AP certificate is valid. Work with Ruckus customer support to identify and resolve this condition.</li>
          </ol>
        `
      })
    }
  },
  'channel-dist-24g': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: `
          <p>This incident can be caused due to the following reasons:</p>
          <ol>
            <li>An incorrect static channel configuration in Zone/AP Group may lead to APs in overlapping channels.</li>
            <li>High number of rogue APs in the RF environment may cause APs to select overlapping channels.</li>
          </ol>
        `
      }),
      recommendations: defineMessage({
        defaultMessage: `
          <p>To remediate the problems identified above, follow the corresponding recommended actions:</p>
          <ol>
            <li>Consider turning on auto channel selection algorithms - Background scan or ChannelFly.</li>
            <li>If ChannelFly is selected it is mandatory to turn ON background scan.</li>
            <li>Scan your environments for rogue APs and remove them if possible.</li>
          </ol>
        `
      })
    }
  },
  'channel-dist-5g': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: `
          <p>This incident can be caused due to the following reasons:</p>
          <ol>
            <li>An incorrect static channel configuration in Zone/AP Group may lead to APs in overlapping channels.</li>
            <li>High number of rogue APs in the RF environment may cause APs to select overlapping channels.</li>
            <li>In 5 GHz band, APs might select overlapping channels to avoid channels with DFS events.</li>
          </ol>
        `
      }),
      recommendations: defineMessage({
        defaultMessage: `
          <p>To remediate the problems identified above, follow the corresponding recommended actions:</p>
          <ol>
            <li>Consider turning on auto channel selection algorithms - Background scan or ChannelFly.</li>
            <li>If ChannelFly is selected it is mandatory to turn ON background scan.</li>
            <li>If static channel assignment is desired consider reducing  Channelization to 20MHz / 40MHz.</li>
            <li>Scan your environments for rogue APs and remove them if possible.</li>
            <li>In the Zone/ AP group configuration, remove DFS channels with excessive DFS events.</li>
          </ol>
        `
      })
    }
  },
  'vlan-mismatch': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: '<p>System has detected VLAN mismatches in your network. This is usually caused by misses during the VLAN configuration process.</p>'
      }),
      recommendations: defineMessage({
        defaultMessage: '<p>Check and configure missing VLAN, or ensure type (untagged/tagged) match on both ends of the connection.</p>'
      })
    }
  },
  'switch-memory-high': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: '<p>System has detected abnormally high memory utilization in the switch. At the current rate, the switch will reach threshold limit* soon, as indicated in the graph.\\n\\nSwitch might run out of memory if the memory usage rate continues. This is typically indicative of a memory leak in the switch.\\n\\n*Note: Threshold limit is auto-calculated by the system.</p>'
      }),
      recommendations: defineMessage({
        defaultMessage: '<p>P3 - Contact RUCKUS Support.\\nP2 - Schedule a maintenance window and reboot the switch if the memory utilization continues to increase. Contact RUCKUS Support.\\nP1 - Schedule a maintenance window and reboot the switch if the memory utilization continues to increase. Contact RUCKUS Support.</p>'
      })
    }
  },
  'poe-pd': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: '<p>PoE power has been denied due to power exhaustion or because another high priority device is plugged in.</p>'
      }),
      recommendations: defineMessage({
        defaultMessage: `
          <p>Increase power capacity by adding a second power supply or add additional switches if the switch doesn't have pluggable power supply. If the switch is part of a stack, connect the device to a different switch in the stack based on proximity.</p>
          <p>If there is no more room for adding power supplies either due to the switch type or all the power supply slots are used, increase power capacity by adding additional switches because there is no room to add more power supplies.</p>
          <p>If the switch has room for more power supplies, increase power capacity by adding a second power supply.</p>
        `
      })
    }
  },
  'ap-poe-low': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: `
          <p>System has detected the AP(s) are underperforming w.r.t WiFi Radio spatial streams due to insufficient power available on PoE port. This can occur due to following reasons:</p>
          <ol>
            <li>Insufficient power from the Power over Ethernet (PoE) switch or PoE injector device aka. Power Sourcing Equipment (PSE).</li>
            <li>Faulty cables, Wrong cable types and very long cables can lead to power deterioration supplied to AP.</li>
          </ol>
        `
      }),
      recommendations: defineMessage({
        defaultMessage: `
          <p>To remediate the problems identified above, follow the corresponding recommended actions:</p>
          <ol>
            <li>Ensure that PSE (PoE switch or PoE injector) capacity is appropriately matching with deployed AP models power requirement.</li>
            <li>Check the cable length, cable type for good PoE use.</li>
          </ol>
        `
      })
    }
  },
  'ap-wanthroughput-low': {
    DEFAULT: {
      rootCauses: defineMessage({
        defaultMessage: `
          <p>System has detected the AP(s) are underperforming due to low WAN bandwidth availability. This can occur due to following reasons:</p>
          <ol>
            <li>Upstream peer device configuration is wrong and not matching as per AP Ethernet WAN port capacity.</li>
            <li>Upstream peer device cannnot support multi gig throughput needed by APs.</li>
            <li>Faulty cables and incorrect cable types can lead to Ethernet link not negotiated properly.</li>
          </ol>
        `
      }),
      recommendations: defineMessage({
        defaultMessage: `
          <p>To remediate the problems identified above, follow the corresponding recommended actions:</p>
          <ol>
            <li>Check the peer device configuration. It should match with AP WAN Port capacity.</li>
            <li>Check the peer device capacity for supporting multi gig throughput.</li>
            <li>Check the cable for good Ethernet link negotiation.</li>
          </ol>
        `
      })
    }
  }
} as Readonly<Record<string, Record<string, RootCauseAndRecommendation>>>

export const ccd80211RootCauseRecommendations = {
  CCD_REASON_UNSPECIFIED: {
    rootCauses: defineMessage({ defaultMessage: '<p>Clients are disconnected during the connection sequence, but the reason is unknown and unspecified by the disconnecting device.</p>' }),
    recommendations: defineMessage({ defaultMessage: `
      <p>This disconnect reason can be difficult to troubleshoot because the reason is unspecified and may be initiated by the AP or client. Some high-level troubleshooting guidance follows:</p>
      <ol>
        <li>Check for isolated areas of impact in the network (e.g. a specific WLAN, client OS, AP model, AP group, etc) with unique settings or behavior that may be causing this.</li>
        <li>Check for recent OS upgrades or configuration changes that are having isolated impact.</li>
        <li>Check the client troubleshooting page for impacted clients (see Client Impact details below) to diagnose the failure stage in the connection flow.</li>
      </ol>`
    })
  },
  CCD_REASON_PREV_AUTH_NOT_VALID: {
    rootCauses: defineMessage({ defaultMessage: '<p>Client connection attempts are failing because the device is attempting to use a previously expired authentication key management (AKM) credential. This issue should be a transient problem in the network and should self-correct.</p>' }),
    recommendations: ccd80211CommonRecommendations
  },
  CCD_REASON_DEAUTH_LEAVING: {
    rootCauses: defineMessage({ defaultMessage: '<p>This issue happens when the client begins a connection attempt, but leaves the BSS before the connection is complete.</p>' }),
    recommendations: ccd80211CommonRecommendations
  },
  CCD_REASON_DISASSOC_DUE_TO_INACTIVITY: {
    rootCauses: defineMessage({ defaultMessage: '<p>This disconnect issue is happening because the device is being disassociated by the AP due to inactivity. The WLAN configuration includes an inactivity timeout, which allows the AP to disconnect client devices if it has not seen frames to/from the device for the duration of the timeout interval.</p>' }),
    recommendations: defineMessage({ defaultMessage: `
      <p>This problem should self-correct when the client device actively uses the Wi-Fi network again. If the issue appears to be affecting active clients and is posing connectivity problems for users, check the following possible issues:</p>
      <ol>
        <li>Were new clients or APs introduced in the environment?</li>
        <li>Were the impacted client OS types recently upgraded?</li>
        <li>Was the AP firmware recently upgraded?</li>
        <li>Were the AP radio or WLAN settings recently modified?</li>
      </ol>`
    })
  },
  CCD_REASON_DISASSOC_AP_BUSY: {
    rootCauses: defineMessage({ defaultMessage: '<p>This disconnect issue is very uncommon, but may be caused if the AP is suffering from excessive performance load and cannot satisfy the client\'s connection request.</p>' }),
    recommendations: defineMessage({ defaultMessage: '<p>If the issue does not resolve on its own, check the traffic and client load of the affected APs to see if there is a persistent load issue. Packet captures may also help to confirm the behavior is initiated by the AP. If that is the case, and clients cannot remain connected, an AP reboot may be necessary.</p>' })
  },
  CCD_REASON_CLASS2_FRAME_FROM_NONAUTH_STA: {
    rootCauses: defineMessage({ defaultMessage: '<p>This disconnect issue is happening because clients are disconnected because they are sending unsupported frames (i.e. Class2) before forming a valid open authentication.</p>' }),
    recommendations: ccd80211CommonRecommendations
  },
  CCD_REASON_CLASS3_FRAME_FROM_NONASSOC_STA: {
    rootCauses: defineMessage({ defaultMessage: '<p>This disconnect issue is happening because clients are sending unsupported frames (i.e. Class3) before forming a valid open association.</p>' }),
    recommendations: ccd80211CommonRecommendations
  },
  CCD_REASON_DISASSOC_STA_HAS_LEFT: {
    rootCauses: defineMessage({ defaultMessage: '<p>The connection was not completed because the client has left, or is leaving, the network.</p>' }),
    recommendations: defineMessage({ defaultMessage: '<p>This problem should be a transient issue in a network if many clients leave at the same time; but, it is usually associated with disconnect events, and should not impact connection attempts. If it does, this may be a data issue that can be reported to RUCKUS Support if it persists in your network.</p>' })
  },
  CCD_REASON_STA_REQ_ASSOC_WITHOUT_AUTH: {
    rootCauses: defineMessage({ defaultMessage: '<p>The connection is failing because of a mismatch in the connection state machine. Clients are attempting to associate prior to forming a successful open authentication.</p>' }),
    recommendations: ccd80211CommonRecommendations
  },
  CCD_REASON_ASSOC_BTM: {
    rootCauses: defineMessage({ defaultMessage: '<p>The client(s) was actively disconnected due to an 802.11v BSS Transition Management (BTM) action to improve client load distribution.</p>' }),
    recommendations: defineMessage({ defaultMessage: '<p>This event is a normal function of network load distribution and should not be a concern unless it persists in the network as a source of connection failures. A single incident of this type should not be a concern.</p>' })
  },
  CCD_REASON_IE_INVALID: {
    rootCauses: defineMessage({ defaultMessage: '<p>This failure typically represents a behavioral bug in which a frame includes an information element that does not conform to 802.11 specifications.</p>' }),
    recommendations: ccd80211CommonRecommendations
  },
  CCD_REASON_MICHAEL_MIC_FAILURE: {
    rootCauses: defineMessage({ defaultMessage: '<p>This failure happens when the message integrity check (MIC) of connection frames fails, typically due to keying errors or expiration, or during passphrase authentication failures.</p>' }),
    recommendations: defineMessage({ defaultMessage: `
      <p>This problem should be uncommon, and is most likely caused by transient security state machine mismatch. If the problem persists, check for these common issues that may introduce behavior issues:</p>
      <ol>
        <li>Were new clients or APs introduced in the environment?</li>
        <li>Were the impacted client OS types recently upgraded?</li>
        <li>Was the AP firmware recently upgraded?</li>
        <li>Were the AP radio or WLAN settings recently modified?</li>
      </ol>`
    })
  },
  CCD_REASON_KICKOUT: {
    rootCauses: defineMessage({ defaultMessage: '<p>The connection exchange is failing because the 4-way handshake is taking too long, typically because of busy RF environmental conditions, or possibly due to high latency if using an external PSK authentication mechanism (like external DPSK).</p>' }),
    recommendations: defineMessage({ defaultMessage: `
      <p>Check for common areas of PSK authentication delay in the network:</p>
      <ol>
        <li>If the WLAN is utilizing external DPSK, check the latency between the AP and the authentication store.</li>
        <li>If the WLAN is utilizing a normal PSK or internal DPSK, this problem should not occur under normal performance situations. Check for RF contention or interference to see if the environment is causing frame errors and delays.</li>
      </ol>`
    })
  },
  CCD_REASON_80211_RSN_INCONSISTENT: {
    rootCauses: defineMessage({ defaultMessage: '<p>The client connection exchange is failing because of a group key update timeout. Group keys are refreshed on a regular interval and should not typically interrupt the connection process.</p>' }),
    recommendations: ccd80211CommonRecommendations
  },
  CCD_REASON_MGMT_GROUP_CIPHER_NOT_VALID: {
    rootCauses: defineMessage({ defaultMessage: '<p>Connectivity is failing because the management frame information elements from the client are not valid or is not supported by the AP/WLAN. This problem may be caused by new 802.11 connection mechanisms that have incomplete or problematic client-side implementations that lead to compatibility issues.</p>' }),
    recommendations: ccd80211CommonRecommendations
  },
  CCD_REASON_GROUP_CIPHER_NOT_VALID: {
    rootCauses: defineMessage({ defaultMessage: '<p>Connectivity is failing because the security type (group cipher suite) from the client is not valid or is not supported by the AP/WLAN. This problem may be caused by new 802.11 connection mechanisms that have incomplete or problematic client-side implementations that lead to compatibility issues.</p>' }),
    recommendations: ccd80211CommonRecommendations
  },
  CCD_REASON_PAIRWISE_CIPHER_NOT_VALID: {
    rootCauses: defineMessage({ defaultMessage: '<p>Connectivity is failing because the security type (cipher suite) requested by the client is not valid or is not supported by the AP/WLAN. This problem may be caused by new 802.11 connection mechanisms that have incomplete or problematic client-side implementations that lead to compatibility issues.</p>' }),
    recommendations: ccd80211CommonRecommendations
  },
  CCD_REASON_AKMP_NOT_VALID: {
    rootCauses: defineMessage({ defaultMessage: '<p>Connectivity is failing because the security type (authentication and key management protocol (AKMP)) requested by the client is not valid or is not supported by the AP/WLAN. This problem may be caused by new 802.11 connection mechanisms that have incomplete or problematic client-side implementations that lead to compatibility issues.</p>' }),
    recommendations: ccd80211CommonRecommendations
  },
  CCD_REASON_UNSUPPORTED_RSN_IE_VERSION: {
    rootCauses: defineMessage({ defaultMessage: '<p>Connectivity is failing because the security type (Robust Security Network (RSN)) requested by the client is not valid or is not supported by the AP/WLAN. This problem may be caused by new 802.11 connection mechanisms that have incomplete or problematic client-side implementations that lead to compatibility issues.</p>' }),
    recommendations: ccd80211CommonRecommendations
  },
  CCD_REASON_INVALID_RSN_IE_CAPAB: {
    rootCauses: defineMessage({ defaultMessage: '<p>Connectivity is failing because the security type capabilities (Robust Security Network (RSN) Capabilities) requested by the client are not valid or are not supported by the AP/WLAN. This problem may be caused by new 802.11 connection mechanisms that have incomplete or problematic client-side implementations that lead to compatibility issues.</p>' }),
    recommendations: ccd80211CommonRecommendations
  },
  CCD_REASON_IEEE_802_1X_AUTH_FAILED: {
    rootCauses: defineMessage({ defaultMessage: `
      <p>Clients are failing 802.1X/EAP authentication, which is typically caused by:</p>
      <ol>
        <li>Invalid EAP (PEAP or TTLS) username and password.</li>
        <li>Invalid EAP certificates.</li>
        <li>Expired or untrusted server certificates.</li>
      </ol>`
    }),
    recommendations: defineMessage({ defaultMessage: `
      <p>To resolve this issue, you may need to check RADIUS log details for authentication reject messages.</p>
      <p>Recent changes in the authentication infrastructure may cause a sudden spike of EAP failures like this:</p>
      <ol>
        <li>RADIUS server certificate changes or expiration.</li>
        <li>Mass user password changes or credential expiry.</li>
        <li>Client onboarding or provisioning with wrong our outdated trust or credential profiles.</li>
      </ol>`
    })
  },
  CCD_REASON_CIPHER_SUITE_REJECTED: {
    rootCauses: defineMessage({ defaultMessage: '<p>Connectivity is failing because the security type (cipher suite) requested by the client is not valid or is not supported by the AP/WLAN.</p>' }),
    recommendations: ccd80211CommonRecommendations
  }
} as Readonly<Record<string, RootCauseAndRecommendation>>

const TBD = defineMessage({ defaultMessage: '<p>TBD</p>' })
const calculating = defineMessage({ defaultMessage: '<p>Calculating...</p>' })

export function getRootCauseAndRecommendations ({ code, metadata }: Incident) {
  const failureType = codeToFailureTypeMap[code]
  if (!metadata.rootCauseChecks) return [{ rootCauses: calculating, recommendations: calculating }]
  const { checks } = metadata.rootCauseChecks
  const failureCode = extractFailureCode(checks)
  const result = _.get(rootCauseRecommendationMap, [failureType, failureCode])
    ?? ccd80211RootCauseRecommendations[failureCode]
    ?? { rootCauses: TBD, recommendations: TBD }
  return [result]
}
