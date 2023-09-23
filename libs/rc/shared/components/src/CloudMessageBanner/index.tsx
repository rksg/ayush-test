
import { useEffect, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Alert, Button, useLayoutContext }          from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  useLazyGetSwitchVenueVersionListQuery,
  useLazyGetVenueEdgeFirmwareListQuery
} from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                             from '@acx-ui/types'
import {
  CloudVersion,
  getUserSettingsByPath,
  useGetPlmMessageBannerQuery,
  useGetAllUserSettingsQuery,
  useGetCloudVersionQuery,
  useLazyGetCloudScheduleVersionQuery,
  UserSettingsUIModel,
  hasRoles
} from '@acx-ui/user'

export function CloudMessageBanner () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const isScheduleUpdateReady = useIsSplitOn(Features.EDGES_SCHEDULE_UPGRADE_TOGGLE)
  const layout = useLayoutContext()

  const linkToAdministration = useTenantLink('/administration/')
  const dismissUpgradeSchedule = 'COMMON$dismiss-upgrade-schedule'

  const [version, setVersion] = useState({} as unknown as CloudVersion)
  const [newWifiScheduleExists, setNewWifiScheduleExists] = useState(false)
  const [newSwitchScheduleExists, setNewSwitchScheduleExists] = useState(false)
  const [newEdgeScheduleExists, setNewEdgeScheduleExists] = useState(false)
  const [upgradeMessageTitle, setUpgradeMessageTitle] = useState('')

  const { data } = useGetPlmMessageBannerQuery({ params })
  const { data: userSettings } = useGetAllUserSettingsQuery({ params })
  const { data: cloudVersion } = useGetCloudVersionQuery({ params })
  const [getCloudScheduleVersion] = useLazyGetCloudScheduleVersionQuery()
  const [getSwitchVenueVersionList] = useLazyGetSwitchVenueVersionListQuery()
  const [getVenueEdgeFirmwareList] = useLazyGetVenueEdgeFirmwareListQuery()
  const plmMessageExists = !!(data && data.description)

  useEffect(() => {
    if (cloudVersion && userSettings) {
      setVersion(version)
      checkWifiScheduleExists()
      if (!hasRoles(RolesEnum.DPSK_ADMIN))
        checkSwitchScheduleExists()
      if(isEdgeEnabled && isScheduleUpdateReady)
        checkEdgeScheduleExists()
    }
  }, [cloudVersion, userSettings])

  const checkWifiScheduleExists = async () => {
    return await getCloudScheduleVersion({ params }).unwrap()
      .then(cloudScheduleVersion => {
        if (cloudScheduleVersion) {
          const updateVersion = {
            ...version,
            scheduleVersionList: cloudScheduleVersion?.scheduleVersionList
          }
          setVersion(updateVersion)
          setNewWifiScheduleExists(
            isThereNewSchedule(
              updateVersion as CloudVersion,
              userSettings as UserSettingsUIModel,
              dismissUpgradeSchedule
            )
          )
        }
      }).catch((error) => {
        console.log(error) // eslint-disable-line no-console
      })
  }

  const checkSwitchScheduleExists = async () => {
    return await getSwitchVenueVersionList({ params })
      .unwrap()
      .then(result => {
        const upgradeVenueViewList = result?.data ?? []
        setNewSwitchScheduleExists(upgradeVenueViewList.filter(
          item => item.nextSchedule).length > 0
        )
      }).catch((error) => {
        console.log(error) // eslint-disable-line no-console
      })
  }

  const checkEdgeScheduleExists = async () => {
    return await getVenueEdgeFirmwareList({})
      .unwrap()
      .then(result => {
        const upgradeVenueViewList = result ?? []
        setNewEdgeScheduleExists(upgradeVenueViewList.some(
          item => item.nextSchedule))
      }).catch((error) => {
        console.log(error) // eslint-disable-line no-console
      })
  }

  useEffect(() => {
    const showUpgradeSchedule = (
      newWifiScheduleExists ||
      newSwitchScheduleExists ||
      newEdgeScheduleExists
    ) && !plmMessageExists
    setUpgradeMessageTitle(showUpgradeSchedule
      ? $t({ defaultMessage: 'An upgrade schedule for the new firmware version is available.' })
      : '')
  }, [$t, newWifiScheduleExists, newSwitchScheduleExists, newEdgeScheduleExists, plmMessageExists])

  useEffect(() => {
    if (layout.showMessageBanner === undefined && (upgradeMessageTitle || plmMessageExists)) {
      layout.setShowMessageBanner(true)
    }
  }, [layout, plmMessageExists, upgradeMessageTitle])

  const MessageBanner = () => {
    if (!layout.showMessageBanner) return null
    if (plmMessageExists) {
      return <Alert message={data?.description}
        type='info'
        showIcon
        closable
        onClose={()=>{
          layout.setShowMessageBanner(false)
        }}/>
    } else {
      const showVScheduleInfo = () => {
        if (newWifiScheduleExists) {
          navigate(`${linkToAdministration.pathname}/fwVersionMgmt/apFirmware`)
        } else if (newSwitchScheduleExists) {
          navigate(`${linkToAdministration.pathname}/fwVersionMgmt/switchFirmware`)
        } else if(newEdgeScheduleExists) {
          navigate(`${linkToAdministration.pathname}/fwVersionMgmt/edgeFirmware`)
        }
      }
      if (upgradeMessageTitle) {
        return <Alert
          message={<Space>{upgradeMessageTitle}
            <Button type='link'
              size='small'
              onClick={showVScheduleInfo}>
              { $t({ defaultMessage: 'More details' }) }
            </Button>
          </Space>}
          type='info'
          showIcon
        />
      }
    }
    return null
  }

  return <MessageBanner />
}

const isThereNewSchedule = (
  version: CloudVersion,
  userSettings: UserSettingsUIModel,
  dismissUpgradeSchedule: string
) => {
  const dismissedUpgradeVersionInDB = getUserSettingsByPath(userSettings, dismissUpgradeSchedule)
  return version?.scheduleVersionList
  && version?.scheduleVersionList.length > 0
  && !dismissedUpgradeVersionInDB
}
