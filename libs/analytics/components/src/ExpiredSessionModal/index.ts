import { showActionModal }                                from '@acx-ui/components'
import { getIntl, setUpIntl, IntlSetUpError, userLogout } from '@acx-ui/utils'

export function showExpiredSessionModal () {
  const isDevModeOn = window.location.hostname === 'localhost'
  try {
    getIntl()
  } catch (error) {
    if (!(error instanceof IntlSetUpError)) throw error
    setUpIntl({ locale: 'en-US' })
  }
  const { $t } = getIntl()
  showActionModal({
    type: 'info',
    title: $t({ defaultMessage: 'Session Expired' }),
    content: $t({ defaultMessage: 'Your session has expired. Please login again.' }),
    onOk: () => { if (!isDevModeOn) userLogout() }
  })
}
