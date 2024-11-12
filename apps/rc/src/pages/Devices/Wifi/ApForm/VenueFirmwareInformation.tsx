import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Features, useIsSplitOn }                                                                  from '@acx-ui/feature-toggle'
import { useGetVenueApModelFirmwaresQuery, useGetVenueVersionListQuery, useWifiCapabilitiesQuery } from '@acx-ui/rc/services'
import { FirmwareType, FirmwareVenue, VenueExtended }                                              from '@acx-ui/rc/utils'
import { TenantLink }                                                                              from '@acx-ui/react-router-dom'
import { compareVersions }                                                                         from '@acx-ui/utils'

import { VersionChangeAlert } from './VersionChangeAlert'


const BASE_VERSION = '6.2.1'

interface VenueInformationProps {
  isEditMode: boolean
  venue: VenueExtended
  apModel: string
  currentApFirmware: string
}

export function VenueFirmwareInformation (props: VenueInformationProps) {
  const { isEditMode, venue, apModel, currentApFirmware } = props
  const { $t } = useIntl()
  const supportUpgradeByModel = useIsSplitOn(Features.AP_FW_MGMT_UPGRADE_BY_MODEL)
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  const { triApModels } = useWifiCapabilitiesQuery({ enableRbac: isUseWifiRbacApi }, {
    skip: supportUpgradeByModel,
    selectFromResult: ({ data }) => ({
      triApModels: data?.apModels
        .filter(apModel => apModel.supportTriRadio)
        .map(apModel => apModel.model) ?? []
    })
  })

  const { venueFirmware } = useGetVenueVersionListQuery({}, {
    skip: supportUpgradeByModel,
    selectFromResult: ({ data }) => {
      const targetFirmwareVenue = data?.data.find(item => item.id === venue?.id)

      return {
        venueFirmware: targetFirmwareVenue && getApVersion(targetFirmwareVenue)
      }
    }
  })

  // eslint-disable-next-line max-len
  const { apFirmwareInVenue } = useGetVenueApModelFirmwaresQuery({ params: { venueId: venue.id } }, {
    skip: !supportUpgradeByModel || !venue.id,
    selectFromResult: ({ data }) => ({
      apFirmwareInVenue: data?.find(item => item.apModel === apModel)?.firmware
    })
  })

  const targetDisplayFirmware = supportUpgradeByModel ? apFirmwareInVenue : venueFirmware

  const contentInfo = $t({
    defaultMessage: 'If you are adding an <b>{apModels} or {lastApModel}</b> AP, ' +
      // eslint-disable-next-line max-len
      'please update the firmware in this <venueSingular></venueSingular> to latest version. ' +
      'This can be accomplished in the Administration\'s {fwManagementLink} section.' }, {
    b: chunks => <strong>{chunks}</strong>,
    apModels: triApModels.length > 1 ? triApModels.slice(0, -1).join(',') : 'R560',
    lastApModel: triApModels.length > 1 ? triApModels.slice(-1) : 'R760',
    fwManagementLink: (<TenantLink to={'/administration/fwVersionMgmt'}>
      { $t({ defaultMessage: 'Firmware Management' }) }
    </TenantLink>)
  })

  const checkTriApModelsAndBaseFwVersion = (version: string | undefined) => {
    if (!version) return false

    if (isEditMode && apModel) {
      if (!triApModels.includes(apModel)) return false
    }
    return compareVersions(version, BASE_VERSION) < 0
  }

  return <Space direction='vertical' style={{ margin: '8px 0' }}>
    { !supportUpgradeByModel &&
      // eslint-disable-next-line max-len
      $t({ defaultMessage: '<VenueSingular></VenueSingular> Firmware Version: {fwVersion}' }, { fwVersion: venueFirmware ?? '-' })
    }
    { !supportUpgradeByModel && checkTriApModelsAndBaseFwVersion(venueFirmware) &&
      <span>{contentInfo}</span>
    }
    { isEditMode && currentApFirmware && targetDisplayFirmware &&
      // eslint-disable-next-line max-len
      <VersionChangeAlert targetVersion={targetDisplayFirmware} existingVersion={currentApFirmware}/>
    }
  </Space>
}

const getApVersion = (venue: FirmwareVenue): string | undefined => {
  if (!venue.versions) return undefined

  const apVersionList = venue.versions.filter(v => v?.type === FirmwareType.AP_FIRMWARE_UPGRADE)
  return apVersionList.length > 0 ? apVersionList[0].version : undefined
}
