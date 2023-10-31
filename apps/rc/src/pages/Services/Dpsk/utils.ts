import { PolicyDefaultAccess, defaultAccessLabelMapping } from '@acx-ui/rc/utils'
import { getIntl }                                        from '@acx-ui/utils'


export function displayDefaultAccess (defaultAccess: boolean | undefined) {
  const { $t } = getIntl()
  return $t(defaultAccessLabelMapping[
    defaultAccess === false
      ? PolicyDefaultAccess.REJECT
      : PolicyDefaultAccess.ACCEPT
  ])
}
