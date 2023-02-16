import { useContext, useEffect } from 'react'

import { Col, Form, Input, Row, Typography } from 'antd'
import _                                     from 'lodash'
import { useIntl }                           from 'react-intl'

import { cssStr, Loader, StepsForm, Table, TableProps, Tooltip } from '@acx-ui/components'
import { useVenuesListQuery, useGetCliFamilyModelsQuery }        from '@acx-ui/rc/services'
import { Venue, useTableQuery }                                  from '@acx-ui/rc/utils'
import { useParams }                                             from '@acx-ui/react-router-dom'

import CliTemplateFormContext from '../../onDemandCli/CliTemplateForm/CliTemplateFormContext'
// import CliProfileFormContext  from '../../profiles/CliProfileForm/CliProfileFormContext'

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
      pageSize: 25,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const onChangeVenues = (values?: React.Key[] | string[]) => {
    const selectedVenue = tableQuery?.data?.data.filter(v => values?.includes(v.id))
    form?.setFieldValue('venues', selectedVenue)
  }

  const transformData = (data?: Venue[], models?: string[], selectedVenues?: string[]) => {
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
  }, [data])

  return <>
    <Row gutter={24}>
      <Col span={20}>
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
      </Col>
    </Row>

    <Row>
      <Col span={20}>
        <Loader states={[{ isLoading: false }]}>
          <Table
            columns={columns}
            dataSource={transformData(tableQuery?.data?.data, applyModels, data?.venues)}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
            rowKey='id'
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: data?.venues,
              renderCell: (checked, record, index, originNode) => {
                const data = record as VenueExtend
                return data?.inactiveRow
                  ? <Tooltip title={data?.inactiveTooltip}>{originNode}</Tooltip>
                  : originNode
              },
              getCheckboxProps: (record) => ({ disabled: (record as VenueExtend)?.inactiveRow }),
              onChange: onChangeVenues
            }}
          />
        </Loader>
      </Col>
    </Row>
  </>
}
