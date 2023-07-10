import { useEffect, useState } from 'react'

import { Col, Form, Input, Row, Typography } from 'antd'
import _                                     from 'lodash'
import { useIntl }                           from 'react-intl'

import { cssStr, Loader, StepsForm, Table, TableProps, Tooltip, useStepFormContext } from '@acx-ui/components'
import { useVenuesListQuery, useGetCliFamilyModelsQuery }                            from '@acx-ui/rc/services'
import { CliConfiguration, Venue, useTableQuery }                                    from '@acx-ui/rc/utils'
import { useParams }                                                                 from '@acx-ui/react-router-dom'
import { hasAccess }                                                                 from '@acx-ui/user'

import { cliFormMessages } from './'

interface VenueExtend extends Venue {
  models: string[],
  inactiveRow?: boolean
  inactiveTooltip?: string
}

export function CliStepVenues () {
  const { $t } = useIntl()
  const params = useParams()

  const { form, initialValues } = useStepFormContext()
  const data = (form?.getFieldsValue(true) as CliConfiguration)
  const { data: cliFamilyModels } = useGetCliFamilyModelsQuery({ params })
  const [selectedRows, setSelectedRows] = useState<React.Key[]>([])

  const columns: TableProps<Venue>['columns'] = [{
    title: $t({ defaultMessage: 'Venue' }),
    key: 'name',
    dataIndex: 'name',
    sorter: true,
    defaultSortOrder: 'ascend'
  },
  {
    title: $t({ defaultMessage: 'City' }),
    key: 'city',
    dataIndex: 'city',
    sorter: true
  },
  {
    title: $t({ defaultMessage: 'Country' }),
    key: 'country',
    dataIndex: 'country',
    sorter: true
  },
  {
    title: $t({ defaultMessage: 'No. of Switches' }),
    key: 'switches',
    dataIndex: 'switches',
    sorter: true,
    render: function (data) {
      return (
        data ? data : 0
      )
    }
  },
  {
    title: $t({ defaultMessage: 'Models' }),
    key: 'id',
    dataIndex: 'id',
    sorter: true,
    width: 180,
    ellipsis: true,
    render: (data, row) => (row as VenueExtend)?.models?.join(', ') ?? ''
  }]

  const tableQuery = useTableQuery<Venue>({
    useQuery: useVenuesListQuery,
    defaultPayload: {
      pageSize: 10,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const onChangeVenues = (values?: React.Key[] | string[]) => {
    setSelectedRows(values as React.Key[])
    form?.setFieldValue('venues', values)
  }

  const transformData = (list?: Venue[], models?: string[], selectedVenues?: React.Key[]) => {
    return list?.map(venue => {
      const venueApplyModels = cliFamilyModels
        ?.find(familyModel => familyModel.venueId === venue.id)?.familyModels
        ?.map(familyModels => familyModels.models).flat()
        ?.map(m => m.model)

      const isModelOverlap =
        (!selectedVenues?.includes(venue.id)
        && !(initialValues as CliConfiguration)?.venues?.includes(venue.id))
        && _.intersection(models, venueApplyModels)?.length > 0

      return {
        ...venue,
        models: venueApplyModels,
        inactiveRow: isModelOverlap,
        inactiveTooltip: $t(cliFormMessages.OVERLAPPING_MODELS_TOOLTIP)
      }
    })
  }

  useEffect(() => {
    onChangeVenues(data?.venues)
  }, [data])

  useEffect(() => {
    const list = transformData(tableQuery?.data?.data, data?.models, selectedRows)
    const venues = form?.getFieldValue('venues')
    const updateVenues = venues?.filter((vId:string) => {
      const venueApplyModels = list?.find(v => v.id === vId)?.models
      const excludeApplyingModels = venueApplyModels?.filter(m => !data?.models?.includes(m))
      const isModelOverlap = _.intersection(data?.models, excludeApplyingModels)?.length > 0
      return !isModelOverlap
    })
    setSelectedRows(updateVenues as React.Key[])
    form?.setFieldValue('venues', updateVenues)
  }, [data?.models])

  return <Row gutter={24}>
    <Col span={24}>
      <StepsForm.Title>{$t({ defaultMessage: 'Venues' })}</StepsForm.Title>
      <Typography.Text style={{
        fontWeight: 600,
        display: 'block',
        fontSize: cssStr('--acx-body-3-font-size')
      }}>
        {$t({ defaultMessage: 'Select venues:' })}
      </Typography.Text>
      <Typography.Text style={{
        display: 'block', margin: '4px 0 12px',
        fontSize: cssStr('--acx-body-3-font-size')
      }}>
        {$t(cliFormMessages.VENUE_STEP_DESP)}
      </Typography.Text>
      <Form.Item
        hidden={true}
        name='venues'
        children={<Input />}
      />

      <Loader states={[{ isLoading: tableQuery.isLoading || tableQuery.isFetching }]}>
        <Table
          columns={columns}
          dataSource={transformData(tableQuery?.data?.data, data?.models, selectedRows)}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowSelection={hasAccess() ? {
            type: 'checkbox',
            selectedRowKeys: selectedRows,
            renderCell: (checked, record, index, originNode) => {
              const data = record as VenueExtend
              return data?.inactiveRow
                ? <Tooltip title={data?.inactiveTooltip}>{originNode}</Tooltip>
                : originNode
            },
            getCheckboxProps: (record) => ({
              disabled: (record as VenueExtend)?.inactiveRow
            }),
            onChange: onChangeVenues
          } : undefined}
        />
      </Loader>

    </Col>
  </Row>
}
