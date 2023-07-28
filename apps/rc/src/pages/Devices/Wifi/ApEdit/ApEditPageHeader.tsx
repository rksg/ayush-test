import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
import { useGetApQuery }      from '@acx-ui/rc/services'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import ApEditTabs from './ApEditTabs'

function ApEditPageHeader () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const { data } = useGetApQuery({ params: { tenantId, serialNumber } })

  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/wifi/${serialNumber}`)

  return (
    <PageHeader
      title={data?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Wi-Fi' }) },
        { text: $t({ defaultMessage: 'Access Points' }) },
        { text: $t({ defaultMessage: 'AP List' }), link: '/devices/wifi' }
      ]}
      extra={filterByAccess([
        <Button
          type='primary'
          onClick={() =>
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/details/overview`
            })
          }>{ $t({ defaultMessage: 'Back to device details' }) }</Button>
      ])}
      footer={<ApEditTabs />}
    />
  )
}

export default ApEditPageHeader
