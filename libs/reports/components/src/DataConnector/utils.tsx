import { defineMessage } from 'react-intl'

import { getUserName as getUserNameRAI, getUserProfile as getUserProfileRAI }                           from '@acx-ui/analytics/utils'
import { get }                                                                                          from '@acx-ui/config'
import { RolesEnum }                                                                                    from '@acx-ui/types'
import { getUserName as getUserNameR1, getUserProfile as getUserProfileR1, hasRaiPermission, hasRoles } from '@acx-ui/user'
import { getIntl }                                                                                      from '@acx-ui/utils'

import { DataConnector, Frequency } from './types'

export function generateBreadcrumb () {
  const { $t } = getIntl()
  return [
    { text: $t({ defaultMessage: 'Business Insights' }) },
    { text: $t({ defaultMessage: 'DataConnector' }), link: '/dataConnector' }
  ]
}

export const getUserName = () =>
  get('IS_MLISA_SA') ? getUserNameRAI() : getUserNameR1()

// For R1, mlisa-rbac uses externalId as x-mlisa-user-id
export const getUserId = () =>
  get('IS_MLISA_SA') ? getUserProfileRAI().userId : getUserProfileR1().profile.externalId

export enum Actions {
  Resume = 'resume',
  Pause = 'pause',
  Edit = 'edit',
  Delete = 'delete'
}

export const isPrimeAdmin = () => {
  return get('IS_MLISA_SA')
    ? hasRaiPermission('WRITE_DATA_STUDIO')
    : hasRoles(RolesEnum.PRIME_ADMIN)
}

export const isVisibleByAction = (rows: DataConnector[], action: Actions, userId:string) => {
  if (action !== Actions.Delete && !rows.every(row => row.userId === userId)) {
    return false
  }
  switch (action) {
    case Actions.Resume:
      return rows.every(row => !row.status)
    case Actions.Pause:
      return rows.every(row => row.status)
    case Actions.Edit:
      return rows.length === 1
    case Actions.Delete:
      return isPrimeAdmin()
    default:
      return false
  }
}

export const frequencyMap = {
  [Frequency.Daily]: defineMessage({ defaultMessage: 'Daily' })
}

export const dataSetMapping = {
  'apAlarms': defineMessage({ defaultMessage: 'AP Alarms' }),
  'apInventory': defineMessage({ defaultMessage: 'AP Inventory' }),
  'apEvents': defineMessage({ defaultMessage: 'AP Events' }),
  'apWiredClient': defineMessage({ defaultMessage: 'AP Wired Device' }),
  'binnedApTraffic': defineMessage({ defaultMessage: 'AP Info and Statistics' }),
  'binnedAvc': defineMessage({ defaultMessage: 'Applications' }),
  'binnedRadio': defineMessage({ defaultMessage: 'AP Airtime and Hardware' }),
  'binnedSessions': defineMessage({ defaultMessage: 'Client Info and Statistics' }),
  'controllerInventory': defineMessage({ defaultMessage: 'Controller Inventory' }),
  'mlisa-apAfc': defineMessage({ defaultMessage: 'AP AFC' }),
  'mlisa-apConnectionStats': defineMessage({ defaultMessage: 'Client Connection Counts' }),
  'mlisa-apMesh': defineMessage({ defaultMessage: 'AP Mesh' }),
  'mlisa-apPeer': defineMessage({ defaultMessage: 'AP Peer' }),
  'mlisa-clientConnectionStats': defineMessage({ defaultMessage: 'Client Connection Events' }),
  'mlisa-edgeAvc': defineMessage({ defaultMessage: 'Edge AVC' }),
  'rogueAp': defineMessage({ defaultMessage: 'AP Rogues' }),
  'sessionsSummary': defineMessage({ defaultMessage: 'Client Sessions' }),
  'switchInventory': defineMessage({ defaultMessage: 'Switch Inventory' }),
  'switchNetwork': defineMessage({ defaultMessage: 'Switch Network' }),
  'wifiCalling': defineMessage({ defaultMessage: 'AP WiFi Calling' })
}

export function connectorNameRegExp (value: string) {
  const { $t } = getIntl()
  // Max length is 128 (reserve file extension)
  const regexWithMaxLength = /^[A-Za-z0-9\s_-]{1,128}$/
  const isValid = regexWithMaxLength.test(value)
  return isValid ? Promise.resolve() : Promise.reject($t({
    defaultMessage:
      'Please enter a valid name (alphanumeric, spaces, _ and -) with max length of 128.'
  }))
}