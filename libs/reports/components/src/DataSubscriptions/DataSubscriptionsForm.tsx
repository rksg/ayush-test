import React from 'react'

import { useIntl } from 'react-intl'

import { generateBreadcrumb } from './utils'
import { GridRow, GridCol, StepsForm, PageHeader, Select } from '@acx-ui/components'
import { useNavigate } from '@acx-ui/react-router-dom'

import CloudStorage from './CloudStorageForm'

type DataSubscriptionsFormProps = {
  editMode?: boolean
  isRAI?: boolean
}


const Settings = () => <div>Settings</div>
const Summary = () => <div>Summary</div>
const DataSubscriptionsForm: React.FC<DataSubscriptionsFormProps> = ({ isRAI, editMode=false }) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  
  return (<>
    <PageHeader
        title={editMode? $t({ defaultMessage: 'Edit Subscription' }) :
          $t({ defaultMessage: 'New Subscription' })}
        breadcrumb={generateBreadcrumb({ isRAI })}
      />
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
      <StepsForm
        onCancel={() => { navigate(-1) }}
        onFinish={async (values) => { console.log(values) }}
        buttonLabel={{
          submit: $t({ defaultMessage: 'Apply' })
        }}
        initialValues={{}}
      >
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Cloud Storage' })}
        children={<CloudStorage />}
      />
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Settings' })}
        children={<Settings />}
      />
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Summary' })}
        children={<Summary />}
      />
    </StepsForm>
      </GridCol>
    </GridRow>
  </>)
}

export default DataSubscriptionsForm