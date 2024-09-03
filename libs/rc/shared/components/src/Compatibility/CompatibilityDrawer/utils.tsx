import { FormattedMessage } from 'react-intl'

import { useGetVenueQuery }                                                                                        from '@acx-ui/rc/services'
import { CompatibilityDeviceEnum, CompatibilityType, getCompatibilityFeatureDisplayName, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                              from '@acx-ui/react-router-dom'
import { getIntl }                                                                                                 from '@acx-ui/utils'

import { messageMapping } from './messageMapping'

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
    { $t({ defaultMessage: 'Administration > Version Management > SmartEdge Firmware' }) }
  </TenantLink>
}

export const getFirmwareLinkByDeviceType = (deviceType: CompatibilityDeviceEnum) => {
  const apFwLink = getApFirmwareLink()
  const edgeFwLink = getEdgeFirmwareLink()

  switch(deviceType) {
    case CompatibilityDeviceEnum.AP:
      return apFwLink
    case CompatibilityDeviceEnum.EDGE:
      return edgeFwLink
    default:
      return null
  }
}

// eslint-disable-next-line max-len
export const useDescription = (props: Pick<CompatibilityDrawerProps, 'compatibilityType'|'deviceType'|'featureName'|'venueId'|'venueName'>) => {
  const {
    compatibilityType,
    deviceType = CompatibilityDeviceEnum.AP,
    venueId, venueName } = props
  // eslint-disable-next-line max-len
  const featureName = getCompatibilityFeatureDisplayName(props.featureName as IncompatibilityFeatures)
  const isVenueLevel = compatibilityType === CompatibilityType.VENUE
  const isFeatureLevel = compatibilityType === CompatibilityType.FEATURE

  const apFwLink = getApFirmwareLink()
  const edgeFwLink = getEdgeFirmwareLink()

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
      ? (deviceType === CompatibilityDeviceEnum.AP ? messageMapping.multipleFromVenueAp : messageMapping.multipleFromVenueEdge)
    // eslint-disable-next-line max-len
      : (deviceType === CompatibilityDeviceEnum.AP ? messageMapping.multipleFromAp : messageMapping.multipleFromEdge))}
    values={{
      b: (txt) => <b>{txt}</b>,
      apFwLink,
      edgeFwLink
    }}/>

  return (!isVenueLevel && !!featureName) ? singleFeatureTitle : multipleTitle
}