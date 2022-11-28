import { useIntl } from 'react-intl'

import { Button, PageHeader }    from '@acx-ui/components'
import { useGetMacRegListQuery } from '@acx-ui/rc/services'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import MacRegistrationListTabs from './MacRegistrationListTabs'


function MacRegistrationListPageHeader () {
  const { $t } = useIntl()
  const { macRegistrationListId } = useParams()

  const macRegistrationListQuery = useGetMacRegListQuery({ params: { macRegistrationListId } })

  return (
    <PageHeader
      title={macRegistrationListQuery.data?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Policies & Profiles > MAC Registration Lists' }),
          link: 'policies/mac-registration-lists' }
      ]}
      extra={[
        // eslint-disable-next-line max-len
        <TenantLink to={`/policies/mac-registration-lists/${macRegistrationListId}/edit`} key='edit'>
          <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
        </TenantLink>
      ]}
      footer={<MacRegistrationListTabs />}
    />
  )
}

export default MacRegistrationListPageHeader
