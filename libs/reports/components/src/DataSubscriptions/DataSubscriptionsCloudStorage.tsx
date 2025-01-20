import { useIntl } from 'react-intl'

import { GridRow, GridCol, PageHeader } from '@acx-ui/components'

import { generateBreadcrumb } from './utils'

type DataSubscriptionsCloudStorageProps = {
  isRAI?: boolean
  editMode?: boolean
}

const DataSubscriptionsCloudStorage: React.FC<DataSubscriptionsCloudStorageProps> =
 ({ isRAI, editMode=false }) => {
   const { $t } = useIntl()
   return (
     <>
       <PageHeader
         title={editMode? $t({ defaultMessage: 'Cloud Storage Edit' }) :
           $t({ defaultMessage: 'New Cloud Storage' })}
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