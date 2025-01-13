import React from 'react'

import { useIntl } from 'react-intl'

import { generateBreadcrumb } from './utils'
import { GridRow, GridCol, StepsForm, PageHeader } from '@acx-ui/components'
import { useNavigate } from '@acx-ui/react-router-dom'


type DataSubscriptionsFormProps = {
  editMode?: boolean
  isRAI?: boolean
}

const CloudStorage = () => <div>Cloud Storage</div>
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
        title={$t({ defaultMessage: 'Introduction' })}
        children={<CloudStorage />}
      />
      <StepsForm.StepForm
        title={$t({ defaultMessage: 'Intent Priority' })}
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