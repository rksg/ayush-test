import { useEffect, useState } from 'react'

import { Col, Form, Input, Row, Typography } from 'antd'
import _                                     from 'lodash'
import { useIntl }                           from 'react-intl'

import { cssStr, Loader, StepsForm, Table, TableProps, Tooltip, useStepFormContext } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                    from '@acx-ui/feature-toggle'
import {
  useVenuesListQuery,
  useGetCliFamilyModelsQuery,
  useGetVenuesTemplateListQuery,
  useGetSwitchTemplateCliFamilyModelsQuery
} from '@acx-ui/rc/services'
import {
  CliConfiguration,
  CliFamilyModels,
  SwitchCliMessages,
  SwitchViewModel,
  Venue,
  useConfigTemplate,
  useConfigTemplateQueryFnSwitcher,
  useTableQuery
}            from '@acx-ui/rc/utils'

import { getCustomizedSwitchVenues } from '../../SwitchCli/CliVariableUtils'

interface VenueExtend extends Venue {
  models: string[],
  inactiveRow?: boolean
  inactiveTooltip?: string
}

export function CliStepVenues (props: {
  allowedSwitchList?: SwitchViewModel[]
}) {
  const { $t } = useIntl()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSwitchLevelCliProfileEnabled = useIsSplitOn(Features.SWITCH_LEVEL_CLI_PROFILE)

  const { isTemplate } = useConfigTemplate()
  const { form, initialValues } = useStepFormContext()
  const data = (form?.getFieldsValue(true) as CliConfiguration)

  const { data: cliFamilyModels } = useConfigTemplateQueryFnSwitcher<CliFamilyModels[]>({
    useQueryFn: useGetCliFamilyModelsQuery,
    useTemplateQueryFn: useGetSwitchTemplateCliFamilyModelsQuery,
    enableRbac: isSwitchRbacEnabled
  })

  const [selectedRows, setSelectedRows] = useState<React.Key[]>([])
  const [customizedSwitchVenues, setCustomizedSwitchVenues] = useState<string[]>([])

  const columns: TableProps<Venue>['columns'] = [{
    title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
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
    render: function (_, { switches }) {
      return switches ? switches : 0
    }
  },
  {
    title: $t({ defaultMessage: 'Models' }),
    key: 'id',
    dataIndex: 'id',
    sorter: true,
    width: 180,
    render: (_, row) => (row as VenueExtend)?.models?.join(', ') ?? ''
  }]

  const tableQuery = useTableQuery<Venue>({
    useQuery: isTemplate ? useGetVenuesTemplateListQuery : useVenuesListQuery,
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

  const transformData = (
    list?: Venue[],
    models?: string[],
    selectedVenues?: React.Key[],
    customizedSwitchVenues?: string[]
  ) => {
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
        inactiveRow: isModelOverlap || customizedSwitchVenues?.includes(venue.id),
        inactiveTooltip: isModelOverlap
          ? $t(SwitchCliMessages.OVERLAPPING_MODELS_TOOLTIP)
          : $t(SwitchCliMessages.PRE_SELECT_VENUE_FOR_CUSTOMIZED)
      }
    })
  }

  useEffect(() => {
    const customizedSwitchVenues = getCustomizedSwitchVenues(
      data?.variables, props?.allowedSwitchList
    )
    setCustomizedSwitchVenues(customizedSwitchVenues)
  }, [data?.variables, props?.allowedSwitchList])

  useEffect(() => {
    onChangeVenues(data?.venues)
  }, [data])

  useEffect(() => {
    if (!tableQuery.isLoading) {
      // eslint-disable-next-line max-len
      const list = transformData(tableQuery?.data?.data, data?.models, selectedRows, customizedSwitchVenues)
      const venues = _.uniq([
        ...( form?.getFieldValue('venues') || []),
        ...customizedSwitchVenues
      ])

      const updateVenues = venues?.filter((vId:string) => {
        const venueApplyModels = list?.find(v => v.id === vId)?.models
        const excludeApplyingModels = venueApplyModels?.filter(m => !data?.models?.includes(m))
        const isModelOverlap = _.intersection(data?.models, excludeApplyingModels)?.length > 0
        return !isModelOverlap
      })
      setSelectedRows(updateVenues as React.Key[])
      form?.setFieldValue('venues', updateVenues)
    }
  }, [data?.models, tableQuery.isLoading, customizedSwitchVenues])

  return <Row gutter={24}>
    <Col span={24}>
      <StepsForm.Title>{$t({ defaultMessage: '<VenuePlural></VenuePlural>' })}</StepsForm.Title>
      <Typography.Text style={{
        fontWeight: 600,
        display: 'block',
        fontSize: cssStr('--acx-body-3-font-size')
      }}>
        {$t({ defaultMessage: 'Select <venuePlural></venuePlural>:' })}
      </Typography.Text>
      <Typography.Text style={{
        display: 'block', margin: '4px 0 12px',
        fontSize: cssStr('--acx-body-3-font-size')
      }}>
        {$t(SwitchCliMessages.VENUE_STEP_DESP)}
      </Typography.Text>
      <Form.Item
        hidden={true}
        name='venues'
        children={<Input />}
      />

      <Loader states={[{ isLoading: tableQuery.isLoading || tableQuery.isFetching }]}>
        <Table
          columns={columns}
          dataSource={transformData(
            tableQuery?.data?.data, data?.models, selectedRows, customizedSwitchVenues
          )}
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
          footer={() => isSwitchLevelCliProfileEnabled
            ? <Typography.Text style={{ fontSize: cssStr('--acx-body-5-font-size') }}>{
              // eslint-disable-next-line max-len
              $t({ defaultMessage: '* Switches from this <venuePlural></venuePlural> were selected during variable customization in the previous step.' })
            }</Typography.Text> : <></>
          }
        />
      </Loader>

    </Col>
  </Row>
}
