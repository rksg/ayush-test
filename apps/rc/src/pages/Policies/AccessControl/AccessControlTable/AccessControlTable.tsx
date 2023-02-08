import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader } from '@acx-ui/components'
import { usePolicyListQuery }                            from '@acx-ui/rc/services'
import {
  PolicyType,
  useTableQuery,
  getPolicyDetailsLink,
  PolicyOperation,
  Policy,
  getPolicyListRoutePath,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import AccessControlTabs from './AccessControlTabs';

export default function AccessControlTable () {
  const { $t } = useIntl()

  return (
    <PageHeader
      title={
        $t({
          defaultMessage: 'Access Control'
        })
      }
      breadcrumb={[
        // eslint-disable-next-line max-len
        { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) }
      ]}
      extra={[
        // eslint-disable-next-line max-len
        <TenantLink to={getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.CREATE })} key='add'>
          <Button type='primary'>{$t({ defaultMessage: 'Add Access Control Set' })}</Button>
        </TenantLink>
      ]}
      footer={<AccessControlTabs />}
    />
  )
}

