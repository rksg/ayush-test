import React from 'react'

import { useIntl } from 'react-intl'

import { GridRow, GridCol, PageHeader } from '@acx-ui/components'

import { generateBreadcrumb } from './utils'


type DataSubscriptionsFormProps = {
  isRAI?:boolean
  editMode?: boolean
}

const DataSubscriptionsForm: React.FC<DataSubscriptionsFormProps> = ({ isRAI, editMode=false }) => {
  const { $t } = useIntl()
  return (
    <>
      <PageHeader
        title={editMode? $t({ defaultMessage: 'Edit Subscription' }) :
          $t({ defaultMessage: 'New Subscription' })}
        breadcrumb={generateBreadcrumb({ isRAI })}
      />
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>

        </GridCol>
      </GridRow>
    </>
  )
}

export default DataSubscriptionsForm