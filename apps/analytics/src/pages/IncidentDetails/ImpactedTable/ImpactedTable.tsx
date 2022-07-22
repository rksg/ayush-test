import { Input }   from 'antd'
import { useIntl } from 'react-intl'

import { Table, TableProps } from '@acx-ui/components'
import { SearchOutlined }    from '@acx-ui/icons'

export function ImpactedTable <RecordType extends object> (
  props: TableProps<RecordType>
) {
  const { $t } = useIntl()
  return<>
    <Input placeholder={$t({ defaultMessage: 'Search' })} prefix={<SearchOutlined />} />
    <Table dataSource={props.dataSource} columns={props.columns}/>
  </>
}
