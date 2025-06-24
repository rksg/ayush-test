import _ from 'lodash'

import { TenantNavigate } from '@acx-ui/react-router-dom'
import { AccountTier }    from '@acx-ui/utils'

import { UserSettingsUIModel, UserSettingsValuePath } from './types'

export const USER_SETTINGS_SEP_CHAR = '$'

export const getUserSettingsByPath = (
  settings: UserSettingsUIModel,
  path: UserSettingsValuePath
): string | undefined => {
  const pathArray = path.split(USER_SETTINGS_SEP_CHAR)
  return _.cloneDeep(_.get(settings, pathArray))
}

export const setDeepUserSettings = (
  settings: UserSettingsUIModel,
  path: UserSettingsValuePath,
  value: unknown
): UserSettingsUIModel => {
  const pathArray = path.split(USER_SETTINGS_SEP_CHAR)
  let newSettings = _.cloneDeep(settings)
  _.set(newSettings, pathArray, value)
  return newSettings
}

export const getProductKey = (path: UserSettingsValuePath): string => {
  return path.split(USER_SETTINGS_SEP_CHAR)[0]
}

export function goToNotFound () {
  return <TenantNavigate replace to='/not-found' />
}

export function goToNoPermission () {
  return <TenantNavigate replace to='/no-permissions' />
}

export function isCoreTier (tier: string | undefined) {
  return tier === AccountTier.CORE
}

export function isProfessionalTier (tier: string | undefined) {
  return tier === AccountTier.PLATINUM
}