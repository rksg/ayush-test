import { useIntl } from 'react-intl'

import { Button, PageHeader }                    from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import MacRegistrationListTabs from './MacRegistrationListTabs'


function MacRegistrationListPageHeader () {
  const { $t } = useIntl()
  const { macRegistrationListId } = useParams()

  const navigate = useNavigate()
  const basePath = useTenantLink(`/policies/mac-registration-lists/${macRegistrationListId}`)

  return (
    <PageHeader
      title=''
      breadcrumb={[
        { text: $t({ defaultMessage: 'Policies & Profiles > MAC Registration Lists' }),
          link: 'policies/mac-registration-lists' }
      ]}
      extra={[
        <Button
          key='configure'
          type='primary'
          onClick={() =>
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/edit`
            })
          }>{ $t({ defaultMessage: 'Configure' }) }</Button>
      ]}
      footer={<MacRegistrationListTabs />}
    />
  )
}

export default MacRegistrationListPageHeader
