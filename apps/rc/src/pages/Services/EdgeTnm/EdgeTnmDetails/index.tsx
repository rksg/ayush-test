
import { find }    from 'lodash'
import { useIntl } from 'react-intl'

import { PageHeader }                    from '@acx-ui/components'
import { useGetEdgeTnmServiceListQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  ServiceOperation,
  getServiceListRoutePath,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { EdgeTnmHostTable } from './EdgeTnmHostTable'

export const EdgeTnmDetails = () => {
  const { $t } = useIntl()
  const { serviceId } = useParams()

  const { data } = useGetEdgeTnmServiceListQuery({}, {
    selectFromResult: ({ data }) => {
      return {
        data: find(data, { id: serviceId })
      }
    }
  })

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Thirdparty Network Management' }),
            // eslint-disable-next-line max-len
            link: getServiceRoutePath({ type: ServiceType.EDGE_TNM_SERVICE, oper: ServiceOperation.LIST })
          }
        ]}
      />
      <EdgeTnmHostTable serviceId={serviceId} />
    </>
  )
}