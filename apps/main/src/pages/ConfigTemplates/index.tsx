import { ConfigTemplateView, ConfigTemplateViewProps, isTemplateTypeAllowed } from '@acx-ui/main/components'
import { ConfigTemplate, ConfigTemplateType }                                 from '@acx-ui/rc/utils'
import { getIntl }                                                            from '@acx-ui/utils'

import { ApplyTemplateDrawer } from './Templates/ApplyTemplateDrawer'
import { ShowDriftsDrawer }    from './Templates/ShowDriftsDrawer'


export function ConfigTemplatePage () {
  return <ConfigTemplateView
    ApplyTemplateView={ApplyTemplateDrawer}
    ShowDriftsView={ShowDriftsDrawer}
    appliedToColumn={getAppliedToColumn()}
    canApplyTemplate={canApplyTemplate}
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
  return isTemplateTypeAllowed(template.type)
    && (template.type === ConfigTemplateType.VENUE || template.appliedOnTenants?.length === 0)
}
