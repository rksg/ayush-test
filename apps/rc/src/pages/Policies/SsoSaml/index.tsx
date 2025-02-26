/* eslint-disable max-len */

import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
import {
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import SsoSamlTable from './SsoSamlTable'

const SsoSaml = () => {
  const { $t } = useIntl()
  const [tableTotalCount, setTableTotalCount] = useState<number>(0)

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'SSO/SAML ({count})' },
            { count: tableTotalCount }
          )
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}

        extra={
          filterByAccessForServicePolicyMutation([
            <TenantLink
              scopeKey={getScopeKeyByPolicy(PolicyType.SSO_SAML, PolicyOperation.CREATE)}
              rbacOpsIds={getPolicyAllowedOperation(PolicyType.SSO_SAML, PolicyOperation.CREATE)}
              to={getPolicyRoutePath({ type: PolicyType.SSO_SAML , oper: PolicyOperation.CREATE })}
            >
              <Button type='primary'>{$t({ defaultMessage: 'Add SSO/SAML' })}</Button>
            </TenantLink>
          ])}
      />
      <SsoSamlTable setTableTotalCount={setTableTotalCount} />
    </>
  )
}

export default SsoSaml