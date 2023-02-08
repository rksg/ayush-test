import React, { createContext, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  GridRow,
  GridCol,
  Button,
  PageHeader
} from '@acx-ui/components'
import { getPolicyListRoutePath, PolicyType, SyslogConstant, SyslogDetailContextType } from '@acx-ui/rc/utils'
import { getPolicyDetailsLink, PolicyOperation }                                       from '@acx-ui/rc/utils'
import { TenantLink }                                                                  from '@acx-ui/react-router-dom'


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
          { text: $t({ defaultMessage: 'Policies' }), link: getPolicyListRoutePath() }
        ]}
        extra={policyName !== SyslogConstant.DefaultProfile ? [
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.SYSLOG,
            oper: PolicyOperation.EDIT,
            policyId: params.policyId as string
          })}
          key='edit'>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button>
          </TenantLink>
        ]: []}
      />

      <GridRow>
        <GridCol col={{ span: 24 }}>
          <SyslogDetailContent />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          { filtersId.length && <SyslogVenueDetail /> }
        </GridCol>
      </GridRow>
    </SyslogDetailContext.Provider>
  )
}

export default SyslogDetailView
