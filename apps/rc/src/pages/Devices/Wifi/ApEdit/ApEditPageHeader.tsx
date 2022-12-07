import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
import { useGetApQuery }      from '@acx-ui/rc/services'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import ApEditTabs from './ApEditTabs'

function ApEditPageHeader () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const { data } = useGetApQuery({ params: { tenantId, serialNumber } })

  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/aps/${serialNumber}`)

  return (
    <PageHeader
      title={data?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Access Points' }), link: '/devices/aps' }
      ]}
      extra={[
        <Button
          key='back'
          type='primary'
          onClick={() =>
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/details/overview`
            })
          }>{ $t({ defaultMessage: 'Back to device details' }) }</Button>
      ]}
      footer={<ApEditTabs />}
    />
  )
}

export default ApEditPageHeader