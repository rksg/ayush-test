import { ApplicationConfirmType } from '@acx-ui/rc/utils'

import { ChangedAppsInfoMap } from './useSigPackDetails'

export interface UpdateConfirmsProps {
  changedAppsInfoMap: ChangedAppsInfoMap
  confirmationType: ApplicationConfirmType
}

export interface ConfirmContentProps {
  changedAppsInfoMap: ChangedAppsInfoMap
  confirmationType: ApplicationConfirmType
  onOk: () => void
  onCancel: () => void
}

export interface DialogFooterProps {
  changedAppsInfoMap: ChangedAppsInfoMap
  onOk: () => void
  onCancel: () => void
  okDisabled: boolean
}

export interface ImpactedRulesDetailsProps {
  changedAppsInfoMap: ChangedAppsInfoMap
}
