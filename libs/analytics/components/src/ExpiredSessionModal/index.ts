import { showActionModal }                                from '@acx-ui/components'
import { getIntl, setUpIntl, IntlSetUpError, userLogout } from '@acx-ui/utils'

let isModalShown = false

export function showExpiredSessionModal () {
  const isDevModeOn = window.location.hostname === 'localhost'
  try {
    getIntl()
  } catch (error) {
    if (!(error instanceof IntlSetUpError)) throw error
    setUpIntl({ locale: 'en-US' })
  }
  const { $t } = getIntl()
  if (!isModalShown) {
    isModalShown = true
    showActionModal({
      type: 'info',
      title: $t({ defaultMessage: 'Session Expired' }),
      content: $t({ defaultMessage: 'Your session has expired. Please login again.' }),
      onOk: () => {
        isModalShown = false
        if (!isDevModeOn) userLogout()
      }
    })
  }
}
