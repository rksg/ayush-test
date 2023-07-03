import { MessageDescriptor, defineMessage } from 'react-intl'

import { ApplicationConfirmType } from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
export const confirmationContentMap: Record<ApplicationConfirmType, MessageDescriptor | undefined> = {
  // eslint-disable-next-line max-len
  [ApplicationConfirmType.UPDATED_APPS]: defineMessage({ defaultMessage: 'Please note that there will be updates to {updatedCount} application policies/rules in access control on this tenant.' }),
  // eslint-disable-next-line max-len
  [ApplicationConfirmType.UPDATED_REMOVED_APPS]: defineMessage({ defaultMessage: 'Please note that there will be updates to {updatedCount} application policies/rules and the removal of {removedCount} rule in access control on this tenant.' }),
  // eslint-disable-next-line max-len
  [ApplicationConfirmType.UPDATED_APP_ONLY]: defineMessage({ defaultMessage: 'Please note that there will be updates to {updatedCount} application policies/rules in access control on this tenant.' }),
  // eslint-disable-next-line max-len
  [ApplicationConfirmType.REMOVED_APP_ONLY]: defineMessage({ defaultMessage: 'Please note that {removedCount} impacted application rules in access control will be removed on this tenant' }),
  [ApplicationConfirmType.NEW_APP_ONLY]: undefined
}

// eslint-disable-next-line max-len
export const cautionDescription = defineMessage({ defaultMessage: 'Are you sure you want to update the application under this tenant?' })
export const confirmationText = 'Update'
