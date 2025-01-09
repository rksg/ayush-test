import { useIntl } from 'react-intl'

import { GridRow, GridCol, PageHeader } from '@acx-ui/components'

import { generateBreadcrumb } from './utils'

type DataSubscriptionsCloudStorageProps = {
  isRAI?: boolean
}

const DataSubscriptionsCloudStorage: React.FC<DataSubscriptionsCloudStorageProps> = ({ isRAI }) => {
  const { $t } = useIntl()
  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Cloud Storage Edit' })}
        breadcrumb={generateBreadcrumb({ isRAI })}
      />
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>

        </GridCol>
      </GridRow>
    </>
  )
}

export default DataSubscriptionsCloudStorage