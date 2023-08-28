
import { useEffect, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Alert, Button }                  from '@acx-ui/components'
import {
  useLazyGetSwitchVenueVersionListQuery
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
  const linkToAdministration = useTenantLink('/administration/')
  const dismissUpgradeSchedule = 'COMMON$dismiss-upgrade-schedule'

  const [version, setVersion] = useState({} as unknown as CloudVersion)
  const [newWifiScheduleExists, setNewWifiScheduleExists] = useState(false)
  const [newSwitchScheduleExists, setNewSwitchScheduleExists] = useState(false)

  const { data } = useGetPlmMessageBannerQuery({ params })
  const { data: userSettings } = useGetAllUserSettingsQuery({ params })
  const { data: cloudVersion } = useGetCloudVersionQuery({ params })
  const [getCloudScheduleVersion] = useLazyGetCloudScheduleVersionQuery()
  const [getSwitchVenueVersionList] = useLazyGetSwitchVenueVersionListQuery()
  const showMessageBanner = !!(data && data.description)

  useEffect(() => {
    if (cloudVersion && userSettings) {
      setVersion(version)
      checkWifiScheduleExists()
      if (!hasRoles(RolesEnum.DPSK_ADMIN))
        checkSwitchScheduleExists()
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
          dismissUpgradeSchedule)
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

  const setGlobalCSSProperty = (isShow: boolean) => {
    document.documentElement.style.setProperty(
      '--acx-has-cloudmessagebanner', isShow ? '1' : '0'
    )
  }

  /* eslint-disable max-len */
  const MessageBanner = () => {
    if (showMessageBanner) {
      setGlobalCSSProperty(true)
      return <Alert message={data?.description}
        type='info'
        showIcon
        closable
        onClose={()=>{
          setGlobalCSSProperty(false)
        }}/>
    } else {
      const showUpgradeSchedule = (newWifiScheduleExists || newSwitchScheduleExists) && !showMessageBanner
      const upgradeMessageTitle = showUpgradeSchedule
        ? $t({ defaultMessage: 'An upgrade schedule for the new firmware version is available.' })
        : ''

      const showVScheduleInfo = () => {
        if (newWifiScheduleExists) {
          navigate(`${linkToAdministration.pathname}/fwVersionMgmt/apFirmware`)
        } else if (newSwitchScheduleExists) {
          navigate(`${linkToAdministration.pathname}/fwVersionMgmt/switchFirmware`)
        }
      }

      if (upgradeMessageTitle) {
        setGlobalCSSProperty(true)
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
    setGlobalCSSProperty(false)
    return null
  }
  /* eslint-enable max-len */

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
