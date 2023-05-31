import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, Dropdown, Loader, Table, TableProps } from '@acx-ui/components'
import { DateFormatEnum, formatter }                   from '@acx-ui/formatter'
import { ArrowExpand }                                 from '@acx-ui/icons'
import { TenantLink, useParams }                       from '@acx-ui/react-router-dom'
import { noDataDisplay }                               from '@acx-ui/utils'

import { useServiceGuardRelatedTests } from '../../services'

import * as UI from './styledComponents'

const TestRunTable = (
  { data }: { data: Record<string, number|string>[] }
) => {
  const { $t } = useIntl()

  const columns: TableProps<Record<string, number|string>>['columns'] = [
    {
      title: $t({ defaultMessage: 'Test Time' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_, value) =>
        <TenantLink to={`/analytics/serviceValidation/${value.specId}/tests/${value.id}`}>
          {formatter(DateFormatEnum.DateTimeFormatWithSeconds)(value.createdAt)}
        </TenantLink>
    },
    {
      title: $t({ defaultMessage: 'APs Under Test' }),
      dataIndex: 'apsTestedCount',
      key: 'apsTestedCount'
    },
    {
      title: $t({ defaultMessage: 'Pass' }),
      dataIndex: 'apsSuccessCount',
      key: 'apsSuccessCount'
    },
    {
      title: $t({ defaultMessage: 'Error' }),
      dataIndex: 'apsErrorCount',
      key: 'apsErrorCount'
    },
    {
      title: $t({ defaultMessage: 'Fail' }),
      dataIndex: 'apsFailureCount',
      key: 'apsFailureCount'
    }
  ]

  return <UI.OverlayContainer>
    <Table type={'form'} columns={columns} dataSource={data} rowKey='id' />
  </UI.OverlayContainer>
}

export const TestRunButton = () => {
  const { $t } = useIntl()
  const params = useParams<{ testId: string }>()
  const queryResults = useServiceGuardRelatedTests()
  return <Loader states={[queryResults]}>
    <Dropdown overlay={<TestRunTable data={queryResults.data || []}/>}>{() =>
      <Button>
        <Space>
          <UI.ButtonTitleWrapper>{$t({ defaultMessage: 'Test Time' })}</UI.ButtonTitleWrapper>
          {queryResults.data && queryResults.data?.length > 0
            ? formatter(DateFormatEnum.DateTimeFormatWithSeconds)(
              queryResults.data.find((test)=>test.id === parseInt(params.testId!, 10))?.createdAt)
            : noDataDisplay
          }
          <ArrowExpand />
        </Space>
      </Button>
    }</Dropdown>
  </Loader>
}
