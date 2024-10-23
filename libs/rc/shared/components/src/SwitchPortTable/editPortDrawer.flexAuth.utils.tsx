import _ from 'lodash'

import {
  Descriptions
} from '@acx-ui/components'
import {
  FlexAuthMessages,
  FlexAuthVlanLabel,
  FlexibleAuthentication,
  SwitchPortViewModel
} from '@acx-ui/rc/utils'
import { getIntl, noDataDisplay } from '@acx-ui/utils'

import {
  authenticationTypeLabel,
  authFailActionTypeLabel,
  authTimeoutActionTypeLabel,
  portControlTypeLabel
} from '../FlexibleAuthentication'

import * as UI from './styledComponents'

/* eslint-disable max-len */
export const renderAuthProfile = (data?: FlexibleAuthentication) => {
  const { $t } = getIntl()
  return <UI.Card type='solid-bg'>
    <UI.Descriptions layout='vertical' colon={false} labelWidthPercent={100}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Type' })}
        children={data?.authenticationType
          ? $t(authenticationTypeLabel[data.authenticationType as keyof typeof authenticationTypeLabel])
          : noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: '802.1x Port Control' })}
        children={data?.dot1xPortControl
          ? $t(portControlTypeLabel[data.dot1xPortControl as keyof typeof portControlTypeLabel])
          : noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Auth Default VLAN' })}
        children={data?.authDefaultVlan ?? noDataDisplay} />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Fail Action' })}
        children={data?.authFailAction
          ? $t(authFailActionTypeLabel[data.authFailAction as keyof typeof authFailActionTypeLabel])
          : noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Restricted VLAN' })}
        children={data?.restrictedVlan} />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Timeout Action' })}
        children={data?.authTimeoutAction
          ? $t(authTimeoutActionTypeLabel[data.authTimeoutAction as keyof typeof authTimeoutActionTypeLabel])
          : noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Critical VLAN' })}
        children={data?.criticalVlan} />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Guest VLAN' })}
        children={data?.guestVlan} />
    </UI.Descriptions>
  </UI.Card>
}

export interface AggregatePortsData {
  taggedVlans: Record<string, string[]>
  untaggedVlans: Record<string, string[]>
  defaultVlan: Record<string, number | undefined>

  hasMultipleValue: string[]
  selectedPortIdentifier: Record<string, string[]>

  enableAuthPorts: Record<string, string[]>
  profileAuthDefaultVlan: Record<string, number | undefined>
  guestVlan: Record<string, number | undefined>
  restrictedVlan: Record<string, number | undefined>
  criticalVlan: Record<string, number | undefined>
  switchLevelAuthDefaultVlan: Record<string, number | undefined>
}

export const initAggregatePortsData: AggregatePortsData = {
  taggedVlans: {},
  untaggedVlans: {},
  defaultVlan: {},
  guestVlan: {},
  restrictedVlan: {},
  criticalVlan: {},
  switchLevelAuthDefaultVlan: {},
  hasMultipleValue: [],
  selectedPortIdentifier: {},
  enableAuthPorts: {},
  profileAuthDefaultVlan: {}
}

const getUnionValuesByKey = (
  key: keyof AggregatePortsData,
  aggregateData: AggregatePortsData
) => {
  const values = Object.values(aggregateData[key] ?? {})
  return _.uniq(_.flatten(values))
}

export const validateApplyProfile = (
  value: string,
  authProfiles: FlexibleAuthentication[],
  selectedPorts: SwitchPortViewModel[],
  aggregatePortsData: AggregatePortsData
) => {
  const { $t } = getIntl()
  const profile = authProfiles.find(p => p.profileId === value)
  const selectedPortsMatchAuthPorts = selectedPorts.filter(port => {
    const sortedSelectedPorts = (aggregatePortsData.selectedPortIdentifier[port.switchMac] || []).sort()
    const sortedAuthPorts = (aggregatePortsData.enableAuthPorts[port.switchMac] || []).sort()
    return _.isEqual(sortedSelectedPorts, sortedAuthPorts)
  })

  const allSelectedPortsMatch = selectedPortsMatchAuthPorts.length === selectedPorts.length
  const guestVlans = getUnionValuesByKey('guestVlan', aggregatePortsData)
  const profileDefaultVlans = getUnionValuesByKey('profileAuthDefaultVlan', aggregatePortsData)
  const switchDefaultVlans = getUnionValuesByKey('defaultVlan', aggregatePortsData)
  const switchAuthDefaultVlans = getUnionValuesByKey('switchLevelAuthDefaultVlan', aggregatePortsData)
  const taggedVlans = getUnionValuesByKey('taggedVlans', aggregatePortsData)

  const isDefaultVlanDuplicateWithSwitch = switchDefaultVlans.includes(profile?.authDefaultVlan)
  const isDefaultVlanDuplicateWithTagged = taggedVlans.includes(profile?.authDefaultVlan.toString())
  const isCriticalVlanDuplicateWithSwitch = switchDefaultVlans.includes(profile?.criticalVlan)
  const isRestrictedVlanDuplicateWithSwitch = switchDefaultVlans.includes(profile?.restrictedVlan)
  const isCriticalVlanDuplicateWithSwitchAuth = switchAuthDefaultVlans.includes(profile?.criticalVlan)
  const isRestrictedVlanDuplicateWithSwitchAuth = switchAuthDefaultVlans.includes(profile?.restrictedVlan)


  // TODO:
  // const statusMapping = {
  //   isDefaultVlanMismatch: () => {
  //     return $t(FlexAuthMessages.CANNOT_SET_DIFF_PROFILE_AUTH_DEFAULT_VLAN, {
  //       profileAuthDefaultVlan: profileDefaultVlans,
  //       applyProfileAuthDefaultVlan: profile?.authDefaultVlan
  //     });
  //   }
  // }

  if (!allSelectedPortsMatch) {
    const isDefaultVlanMismatch = profileDefaultVlans.length > 1 || !profileDefaultVlans.includes(profile?.authDefaultVlan)
    const isGuestVlanMismatch = guestVlans.length > 1 || !guestVlans.includes(profile?.guestVlan)

    if (isDefaultVlanMismatch) {
      return Promise.reject(
        $t(FlexAuthMessages.CANNOT_SET_DIFF_PROFILE_AUTH_DEFAULT_VLAN, {
          profileAuthDefaultVlan: profileDefaultVlans,
          applyProfileAuthDefaultVlan: profile?.authDefaultVlan
        })
      )
    } else if (isGuestVlanMismatch) {
      return Promise.reject(
        $t(FlexAuthMessages.CANNOT_SET_DIFF_GUEST_VLAN, {
          applyGuestVlan: profile?.guestVlan
        })
      )
    }
  } else if (isDefaultVlanDuplicateWithSwitch) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.DEFAULT_VLAN)
    }))
  } else if (isDefaultVlanDuplicateWithTagged) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.TAGGED_VLANS)
    }))
  } else if (isCriticalVlanDuplicateWithSwitch) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.CRITICAL_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.DEFAULT_VLAN)
    }))
  } else if (isRestrictedVlanDuplicateWithSwitch) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.RESTRICTED_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.DEFAULT_VLAN)
    }))
  } else if (isCriticalVlanDuplicateWithSwitchAuth) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.CRITICAL_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.SWITCH_AUTH_DEFAULT_VLAN)
    }))
  } else if (isRestrictedVlanDuplicateWithSwitchAuth) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.RESTRICTED_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.SWITCH_AUTH_DEFAULT_VLAN)
    }))
  }

  return Promise.resolve()
}
