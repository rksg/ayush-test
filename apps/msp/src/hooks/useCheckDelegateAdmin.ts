import { useIntl } from 'react-intl'

import { showActionModal }                     from '@acx-ui/components'
import { useLazyGetMspEcDelegatedAdminsQuery } from '@acx-ui/msp/services'
import { useDelegateToMspEcPath }              from '@acx-ui/msp/services'

export function useCheckDelegateAdmin (isRbacEnabled: boolean) {
  const { $t } = useIntl()
  const [getDelegatedAdmins] = useLazyGetMspEcDelegatedAdminsQuery()
  const { delegateToMspEcPath } = useDelegateToMspEcPath()
  const checkDelegateAdmin = async (ecTenantId: string, adminId: string) => {
    try {
      const admins = await getDelegatedAdmins({
        params: { mspEcTenantId: ecTenantId },
        enableRbac: isRbacEnabled
      }).unwrap()
      const allowDelegate = admins.find(admin => admin.msp_admin_id === adminId)
      if (allowDelegate) {
        delegateToMspEcPath(ecTenantId)
      } else {
        showActionModal({
          type: 'error',
          title: $t({ defaultMessage: 'Error' }),
          content: $t({ defaultMessage: 'You are not authorized to manage this customer' })
        })
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }
  return { checkDelegateAdmin }
}
