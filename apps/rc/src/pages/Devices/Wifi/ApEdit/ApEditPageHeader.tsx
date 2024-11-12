import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import ApEditTabs from './ApEditTabs'

import { ApDataContext } from '.'

function ApEditPageHeader () {
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const { apData } = useContext(ApDataContext)

  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/wifi/${serialNumber}`)

  return (
    <PageHeader
      title={apData?.name || ''}
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
