import { GridRow, GridCol } from '@acx-ui/components'

type DataSubscriptionsFormProps = {
  editMode?: boolean
}

const DataSubscriptionsForm: React.FC<DataSubscriptionsFormProps> = ({ editMode=false }) => {
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        {`editMode: ${editMode}`}
      </GridCol>
    </GridRow>
  )
}

export default DataSubscriptionsForm