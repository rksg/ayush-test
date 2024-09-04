import { sumBy }   from 'lodash'
import { useIntl } from 'react-intl'

import { Table, TableProps }   from '@acx-ui/components'
import { EntityCompatibility } from '@acx-ui/rc/utils'

interface EdgeCompatibilityDetailTableData {
  featureName: string,
  requiredFw: string,
  incompatible?: number,
}

interface EdgeCompatibilityDetailTableProps {
  data: EntityCompatibility['incompatibleFeatures'],
  requirementOnly?: boolean,
}

const useColumns = () => {
  const { $t } = useIntl()

  const defaultColumns: TableProps<EdgeCompatibilityDetailTableData>['columns'] = [{
    title: $t({ defaultMessage: 'Incompatible Feature' }),
    key: 'featureName',
    dataIndex: 'featureName',
    defaultSortOrder: 'ascend'
  }, {
    title: $t({ defaultMessage: 'Incompatible SmartEdges' }),
    key: 'incompatible',
    dataIndex: 'incompatible',
    align: 'center'
  }, {
    title: $t({ defaultMessage: 'Min. Required Version' }),
    key: 'requiredFw',
    dataIndex: 'requiredFw'
  }]

  return defaultColumns
}

export const EdgeCompatibilityDetailTable = (props: EdgeCompatibilityDetailTableProps) => {
  const { data, requirementOnly = false } = props

  const columns = useColumns()

  const transformed = data.map(feature => ({
    ...feature.featureRequirement,
    incompatible: sumBy(feature.incompatibleDevices, (d) => d.count)
  })) as EdgeCompatibilityDetailTableData[]

  return <Table
    rowKey='featureName'
    columns={columns.filter(i => requirementOnly ? i.dataIndex !== 'incompatible' : true)}
    dataSource={transformed}
  />
}