import { FormattedMessage } from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useGetVenueQuery }       from '@acx-ui/rc/services'
import {
  ApModelFamilyType,
  CompatibilityDeviceEnum,
  CompatibilityType,
  IncompatibleFeatureTypeEnum
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'
import { getIntl }    from '@acx-ui/utils'

import { messageMapping }  from './messageMapping'
import {
  StyledApModelFamilyTypeWIFI11AC1,
  StyledApModelFamilyTypeWIFI11AC2,
  StyledApModelFamilyTypeWIFI6,
  StyledApModelFamilyTypeWIFI6E,
  StyledApModelFamilyTypeWIFI7,
  StyledFeatureTypeEdge,
  StyledFeatureTypeSwitch,
  StyledFeatureTypeWifi
} from './styledComponents'

import { CompatibilityDrawerProps } from '.'

export const getApFirmwareLink = () => {
  const { $t } = getIntl()
  return <TenantLink to='/administration/fwVersionMgmt/apFirmware'>
    { $t({ defaultMessage: 'Administration > Version Management > AP Firmware' }) }
  </TenantLink>
}

export const getEdgeFirmwareLink = () => {
  const { $t } = getIntl()
  return <TenantLink to='/administration/fwVersionMgmt/edgeFirmware'>
    { $t({ defaultMessage: 'Administration > Version Management > RUCKUS Edge Firmware' }) }
  </TenantLink>
}

export const getSwitchFirmwareLink = () => {
  const { $t } = getIntl()
  return <TenantLink to='/administration/fwVersionMgmt/switchFirmware'>
    { $t({ defaultMessage: 'Administration > Version Management > Switch Firmware' }) }
  </TenantLink>
}

export const getFirmwareLinkByDeviceType = (deviceType: CompatibilityDeviceEnum) => {
  const apFwLink = getApFirmwareLink()
  const edgeFwLink = getEdgeFirmwareLink()
  const switchFwLink = getSwitchFirmwareLink()

  switch(deviceType) {
    case CompatibilityDeviceEnum.AP:
      return apFwLink
    case CompatibilityDeviceEnum.EDGE:
      return edgeFwLink
    case CompatibilityDeviceEnum.SWITCH:
      return switchFwLink
    default:
      return null
  }
}

// eslint-disable-next-line max-len
export const useDescription = (props: Pick<CompatibilityDrawerProps, 'compatibilityType'|'deviceType'|'featureName'|'venueId'|'venueName'>) => {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const {
    compatibilityType,
    deviceType = CompatibilityDeviceEnum.AP,
    featureName,
    venueId, venueName } = props
  const isVenueLevel = compatibilityType === CompatibilityType.VENUE
  const isFeatureLevel = compatibilityType === CompatibilityType.FEATURE

  const apFwLink = getApFirmwareLink()
  const edgeFwLink = getEdgeFirmwareLink()
  const switchFwLink = getSwitchFirmwareLink()

  const { data: venueData } = useGetVenueQuery({ params: { venueId } },
    { skip: !isFeatureLevel || !featureName || !venueId || !!venueName })

  const singleFeatureOnDevice = <FormattedMessage
    // eslint-disable-next-line max-len
    {...(deviceType === CompatibilityDeviceEnum.AP ? messageMapping.singleApFeature : messageMapping.singleEdgeFeature)}
    values={{
      b: (txt) => <b>{txt}</b>,
      featureName: featureName ?? '',
      apFwLink,
      edgeFwLink
    }}/>

  const singleApFeatureOnVenue = <FormattedMessage
    {...messageMapping.singleFromVenueAp}
    values={{
      b: (txt) => <b>{txt}</b>,
      featureName: featureName ?? '',
      venueName: venueData?.name || venueName,
      apFwLink
    }}/>

  const singleFeatureTitle = (venueId || venueName) ? singleApFeatureOnVenue : singleFeatureOnDevice

  const multipleTitle = <FormattedMessage
    {...(isVenueLevel
    // eslint-disable-next-line max-len
      ? (deviceType === CompatibilityDeviceEnum.AP
        ? ((isApCompatibilitiesByModel)
          ? messageMapping.multipleFromVenueDevice
          : messageMapping.multipleFromVenueAp )
        : messageMapping.multipleFromVenueEdge)
    // eslint-disable-next-line max-len
      : (deviceType === CompatibilityDeviceEnum.AP ? messageMapping.multipleFromAp : messageMapping.multipleFromEdge))}
    values={{
      b: (txt) => <b>{txt}</b>,
      apFwLink,
      edgeFwLink,
      switchFwLink
    }}/>

  return (!isVenueLevel && !!featureName) ? singleFeatureTitle : multipleTitle
}

export const getFeatureTypeTag = (featureType: IncompatibleFeatureTypeEnum | undefined) => {
  switch (featureType) {
    case IncompatibleFeatureTypeEnum.WIFI:
      return <StyledFeatureTypeWifi children={'Wi-Fi'} />
    case IncompatibleFeatureTypeEnum.EDGE:
      return <StyledFeatureTypeEdge children={'RUCKUS Edge'} />
    case IncompatibleFeatureTypeEnum.SWITCH:
      return <StyledFeatureTypeSwitch children={'Switch'} />
  }
  return null
}

export const getApModelFamilyTag = (apModelFamily: ApModelFamilyType, displayName: string) => {
  switch (apModelFamily) {
    case ApModelFamilyType.WIFI_11AC_1:
      return <StyledApModelFamilyTypeWIFI11AC1 children={displayName} />
    case ApModelFamilyType.WIFI_11AC_2:
      return <StyledApModelFamilyTypeWIFI11AC2 children={displayName} />
    case ApModelFamilyType.WIFI_6:
      return <StyledApModelFamilyTypeWIFI6 children={displayName} />
    case ApModelFamilyType.WIFI_6E:
      return <StyledApModelFamilyTypeWIFI6E children={displayName} />
    case ApModelFamilyType.WIFI_7:
      return <StyledApModelFamilyTypeWIFI7 children={displayName} />
  }

  return null
}
