import { useIntl } from 'react-intl'

import { useConfigTemplatePageHeaderTitle } from '@acx-ui/rc/utils'


export function useIdentityGroupPageHeaderTitle (props: { isEdit: boolean }) {
  const intl = useIntl()

  return useConfigTemplatePageHeaderTitle({
    isEdit: props.isEdit,
    instanceLabel: intl.$t({ defaultMessage: 'Identity Group' }),
    addLabel: intl.$t({ defaultMessage: 'Create' })
  })
}
