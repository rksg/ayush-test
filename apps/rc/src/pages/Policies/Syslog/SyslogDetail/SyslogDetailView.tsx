import React, { createContext, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  GridRow,
  GridCol,
  Button,
  PageHeader
} from '@acx-ui/components'
import { getPolicyRoutePath, PolicyType, SyslogConstant, SyslogDetailContextType } from '@acx-ui/rc/utils'
import { getPolicyDetailsLink, PolicyOperation }                                   from '@acx-ui/rc/utils'
import { TenantLink }                                                              from '@acx-ui/react-router-dom'
import { hasAccesses }                                                             from '@acx-ui/user'


import SyslogDetailContent from './SyslogDetailContent'
import SyslogVenueDetail   from './SyslogVenueDetail'

export const SyslogDetailContext = createContext({} as SyslogDetailContextType)

const SyslogDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [filtersId, setFiltersId] = useState([] as string[])
  const [policyName, setPolicyName] = useState('' as string)

  return (
    <SyslogDetailContext.Provider value={{ filtersId, setFiltersId, policyName, setPolicyName }}>
      <PageHeader
        title={policyName}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Syslog' }),
            link: getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.LIST }) }
        ]}
        extra={policyName !== SyslogConstant.DefaultProfile ? hasAccesses([
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.SYSLOG,
            oper: PolicyOperation.EDIT,
            policyId: params.policyId as string
          })}>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button>
          </TenantLink>
        ]) : []}
      />

      <GridRow>
        <GridCol col={{ span: 24 }}>
          <SyslogDetailContent />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          { (filtersId.length > 0) && <SyslogVenueDetail /> }
        </GridCol>
      </GridRow>
    </SyslogDetailContext.Provider>
  )
}

export default SyslogDetailView
