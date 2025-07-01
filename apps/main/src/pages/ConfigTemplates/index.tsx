import { ConfigTemplateView, ConfigTemplateViewProps, isTemplateTypeAllowed } from '@acx-ui/main/components'
import { ConfigTemplate, ConfigTemplateType, ConfigTemplateUrlsInfo }         from '@acx-ui/rc/utils'
import { getIntl, getOpsApi }                                                 from '@acx-ui/utils'

import { ApplyTemplateModal } from './Templates/ApplyTemplateDrawer'
import { ShowDriftsDrawer }   from './Templates/ShowDriftsDrawer'


export function ConfigTemplatePage () {
  return <ConfigTemplateView
    ApplyTemplateView={ApplyTemplateModal}
    ShowDriftsView={ShowDriftsDrawer}
    appliedToColumn={getAppliedToColumn()}
    canApplyTemplate={canApplyTemplate}
    actionRbacOpsIds={{
      apply: [getOpsApi(ConfigTemplateUrlsInfo.applyRecConfigTemplate)]
    }}
  />
}


function getAppliedToColumn (): ConfigTemplateViewProps['appliedToColumn'] {
  const { $t } = getIntl()

  return {
    key: 'appliedOnTenants',
    title: $t({ defaultMessage: 'Applied To' }),
    dataIndex: 'appliedOnTenants',
    sorter: true,
    align: 'center',
    customRender: function (row: ConfigTemplate) {
      return row.appliedOnTenants?.length ?? 0
    }
  }
}

function canApplyTemplate (template: ConfigTemplate): boolean {
  if (!isTemplateTypeAllowed(template.type)) {
    return false
  }

  if (template.type === ConfigTemplateType.VENUE) {
    return true
  }

  const hasAppliedTenants = (template.appliedOnTenants ?? []).length > 0
  return !hasAppliedTenants
}
