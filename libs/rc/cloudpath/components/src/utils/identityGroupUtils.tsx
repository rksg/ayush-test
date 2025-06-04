import { useIntl } from 'react-intl'

import {
  generateConfigTemplateBreadcrumb,
  useConfigTemplate,
  useConfigTemplatePageHeaderTitle
} from '@acx-ui/rc/utils'
import { TenantType } from '@acx-ui/react-router-dom'
import { getIntl }    from '@acx-ui/utils'

export enum IdentityOperation {
  CREATE,
  EDIT,
  DETAIL,
  LIST
}

export function useIdentityGroupPageHeaderTitle (props: { isEdit: boolean }) {
  const intl = useIntl()

  return useConfigTemplatePageHeaderTitle({
    isEdit: props.isEdit,
    instanceLabel: intl.$t({ defaultMessage: 'Identity Group' }),
    addLabel: intl.$t({ defaultMessage: 'Create' })
  })
}

function getClientsPreBreadcrumbs () {
  const { $t } = getIntl()

  return ([
    {
      text: $t({ defaultMessage: 'Clients' })
    },
    {
      text: $t({ defaultMessage: 'Identity Management' })
    }
  ])
}

export function getIdentityGroupRoutePath (
  operation: IdentityOperation,
  isTemplate: boolean,
  groupId?: string
) {
  const basePath = 'users/identity-management/identity-group'
  const baseTemplatePath = 'identityManagement/identityGroups'

  switch (operation) {
    case IdentityOperation.CREATE:
      return isTemplate
        ? `${baseTemplatePath}/add`
        : `${basePath}/add`
    case IdentityOperation.EDIT:
      return isTemplate
        ? `${baseTemplatePath}/${groupId}/edit`
        : `${basePath}/${groupId}/edit`
    case IdentityOperation.DETAIL:
      return isTemplate
        ? `${baseTemplatePath}/${groupId}/detail`
        : `${basePath}/${groupId}`
    case IdentityOperation.LIST:
      return isTemplate
        ? `${baseTemplatePath}`
        : `${basePath}`
  }
}

export function useIdentityGroupBreadcrumbs (operation: IdentityOperation)
  : { text: string, link?: string, tenantType?: TenantType }[] {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()

  return isTemplate
    ? generateConfigTemplateBreadcrumb()
    : [
      ...getClientsPreBreadcrumbs(),
      {
        text: $t({ defaultMessage: 'Identity Groups' }),
        link: getIdentityGroupRoutePath(operation, isTemplate)
      }
    ]
}
