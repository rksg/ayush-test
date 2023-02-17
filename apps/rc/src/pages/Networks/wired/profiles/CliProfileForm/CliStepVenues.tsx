import { useContext, useEffect, useState } from 'react'

import { Col, Form, Input, Row, Typography } from 'antd'
import _                                     from 'lodash'
import { useIntl }                           from 'react-intl'

import { cssStr, Loader, StepsForm, Table, TableProps, Tooltip } from '@acx-ui/components'
import { useVenuesListQuery, useGetCliFamilyModelsQuery }        from '@acx-ui/rc/services'
import { Venue, useTableQuery }                                  from '@acx-ui/rc/utils'
import { useParams }                                             from '@acx-ui/react-router-dom'

import CliTemplateFormContext from '../../onDemandCli/CliTemplateForm/CliTemplateFormContext'

import { cliFormMessages } from './'

interface VenueExtend extends Venue {
  models: string[],
  inactiveRow?: boolean
  inactiveTooltip?: string
}

export function CliStepVenues () {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()

  const { data, applyModels } = useContext(CliTemplateFormContext)
  const { data: cliFamilyModels } = useGetCliFamilyModelsQuery({ params })
  // const [transformedVenueData, setTransformedVenueData] = useState([] as Venue[])
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
    const selectedVenue = tableQuery?.data?.data.filter(v => values?.includes(v.id))
    setSelectedRows(values as React.Key[])
    form?.setFieldValue('venues', selectedVenue)
  }

  const transformData = (data?: Venue[], models?: string[], selectedVenues?: React.Key[]) => {
    return data?.map(venue => {
      const getAppliedCliVenues = (venueId: string) => {
        return !selectedVenues?.includes(venueId) && venueId === venue.id
      }
      const venueApplyModels = cliFamilyModels
        ?.filter(familyModel => getAppliedCliVenues(familyModel.venueId))?.[0]?.familyModels
        ?.map(familyModel => familyModel.models).flat()
        ?.map(familyModel => familyModel.model)

      const isModelOverlap = _.intersection(models, venueApplyModels)?.length > 0

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
    setSelectedRows(data?.venues as React.Key[])
  }, [data])

  // useEffect(() => {
  //   if (tableQuery?.data?.data) {
  //     const venueData = transformData(tableQuery?.data?.data, applyModels, selectedRows)
  //     console.log(venueData, applyModels, data?.venues)
  //     setTransformedVenueData(venueData as Venue[])
  //   }
  // }, [tableQuery?.data?.data])

  // useEffect(() => {
  //   const venues = form?.getFieldValue('venues')
  // }, [applyModels])

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

      <Loader states={[{ isLoading: false }]}>
        <Table
          columns={columns}
          dataSource={transformData(tableQuery?.data?.data, applyModels, data?.venues)}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowSelection={{
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
          }}
        />
      </Loader>

    </Col>
  </Row>
}
