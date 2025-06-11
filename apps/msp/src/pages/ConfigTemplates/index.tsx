import { Button }                                      from '@acx-ui/components'
import { ConfigTemplateView, ConfigTemplateViewProps } from '@acx-ui/main/components'
import { MspUrlsInfo }                                 from '@acx-ui/msp/utils'
import { ConfigTemplate }                              from '@acx-ui/rc/utils'
import { hasAllowedOperations }                        from '@acx-ui/user'
import { getIntl, getOpsApi }                          from '@acx-ui/utils'

import { AppliedToTenantDrawer } from './Templates/AppliedToTenantDrawer'
import { ApplyTemplateDrawer }   from './Templates/ApplyTemplateDrawer'
import { ShowDriftsDrawer }      from './Templates/ShowDriftsDrawer'


export function ConfigTemplatePage () {
  return <ConfigTemplateView
    ApplyTemplateView={ApplyTemplateDrawer}
    AppliedToView={AppliedToTenantDrawer}
    ShowDriftsView={ShowDriftsDrawer}
    appliedToColumn={getAppliedToColumn()}
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
    customRender: function (row: ConfigTemplate, callback) {
      const count = row.appliedOnTenants?.length ?? 0

      if (count === 0) return 0

      if (!hasAllowedOperations([getOpsApi(MspUrlsInfo.getMspCustomersList)])) return count

      return <Button type='link' onClick={() => { callback() }}>{count}</Button>
    }
  }
}
