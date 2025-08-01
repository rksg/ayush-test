import { Button }                                      from '@acx-ui/components'
import { ConfigTemplateView, ConfigTemplateViewProps } from '@acx-ui/main/components'
import { MspUrlsInfo }                                 from '@acx-ui/msp/utils'
import { ConfigTemplate }                              from '@acx-ui/rc/utils'
import { hasAllowedOperations }                        from '@acx-ui/user'
import { getIntl, getOpsApi }                          from '@acx-ui/utils'

import { AppliedToTenantList }   from '../AppliedToListView'
import { AppliedToTenantDrawer } from '../AppliedToTenantDrawer'
import { ApplyTemplateDrawer }   from '../ApplyTemplateDrawer'
import { ShowDriftsDrawer }      from '../ShowDriftsDrawer'


export function ConfigTemplatePage () {
  return <ConfigTemplateView
    ApplyTemplateView={ApplyTemplateDrawer}
    AppliedToView={AppliedToTenantDrawer}
    AppliedToListView={AppliedToTenantList}
    ShowDriftsView={ShowDriftsDrawer}
    appliedToColumn={getAppliedToColumn()}
  />
}


export function getAppliedToColumn (): ConfigTemplateViewProps['appliedToColumn'] {
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

      if (!hasAllowedOperations([getOpsApi(MspUrlsInfo['getMspCustomersList'])])) return count

      return <Button type='link' onClick={() => { callback() }}>{count}</Button>
    }
  }
}
