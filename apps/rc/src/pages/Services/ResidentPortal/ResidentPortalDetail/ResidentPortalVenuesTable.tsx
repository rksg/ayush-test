import { useIntl }         from 'react-intl'
import { useParams } from 'react-router-dom'

import { useNavigate } from '@acx-ui/react-router-dom'

export default function ResidentPortalVenuesTable () {
  const params = useParams()
  const { $t } = useIntl()
  const navigate = useNavigate()
  
  return (
    <>
      VENUES TABLE
      {/* <Typography.Title level={2}>
                {$t({ defaultMessage: 'Instances ({count})' },
                  { count: 0 })}
              </Typography.Title>
              <Table
                columns={columns}
                rowKey='id'
                // rowActions={filterByAccess(rowActions)}
                rowSelection={{ type: 'checkbox' }}
              /> */}
    </>
  )
}
