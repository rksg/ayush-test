import React, { useEffect, useState, useContext } from 'react'

import { Switch, Row, Col, Form, Input } from 'antd'
import { useIntl }                       from 'react-intl'

import {
  Loader,
  StepsFormLegacy,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { InformationSolid }       from '@acx-ui/icons'
import {
  useGetCliFamilyModelsQuery,
  useGetSwitchTemplateCliFamilyModelsQuery,
  useGetVenuesTemplateListQuery,
  useVenuesListQuery } from '@acx-ui/rc/services'
import {
  CliFamilyModels,
  ConfigTemplateType,
  useConfigTemplate,
  useConfigTemplateQueryFnSwitcher,
  useTableQuery,
  Venue
} from '@acx-ui/rc/utils'
import { filterByAccess, hasPermission } from '@acx-ui/user'

import { useEnforcedStatus } from '../configTemplates'

import { ConfigurationProfileFormContext } from './ConfigurationProfileFormContext'
import * as UI                             from './styledComponents'

const defaultPayload = {
  fields: ['check-all', 'name', 'city', 'country', 'switchProfileName',
    'switches', 'activated', 'switchProfileId', 'status', 'id', 'isEnforced'],
  page: 1,
  pageSize: 25,
  sortField: 'name',
  sortOrder: 'ASC',
  searchString: ''
}

const defaultArray: Venue[] = []

export function VenueSetting () {
  const profileOnboardOnlyEnabled = useIsSplitOn(Features.SWITCH_PROFILE_ONBOARD_ONLY)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { currentData } = useContext(ConfigurationProfileFormContext)
  const { isTemplate } = useConfigTemplate()
  const tableQuery = useTableQuery({
    useQuery: isTemplate ? useGetVenuesTemplateListQuery : useVenuesListQuery,
    defaultPayload
  })

  const { data: venueAppliedToCli } = useConfigTemplateQueryFnSwitcher<CliFamilyModels[]>({
    useQueryFn: useGetCliFamilyModelsQuery,
    useTemplateQueryFn: useGetSwitchTemplateCliFamilyModelsQuery,
    enableRbac: isSwitchRbacEnabled
  })
  const [tableData, setTableData] = useState(defaultArray)
  const [venueList, setVenueList] = useState<string[]>([])
  const { hasEnforcedItem, getEnforcedActionMsg } = useEnforcedStatus(ConfigTemplateType.VENUE)

  useEffect(()=>{
    if (tableQuery.data) {
      const data: React.SetStateAction<Venue[]> = []
      tableQuery.data.data.forEach(item => {
        const activatedVenue = item.deepVenue
        data.push({
          ...item,
          deepVenue: activatedVenue,
          // work around of read-only records from RTKQ
          activated: activatedVenue ? { isActivated: true } : { ...item.activated }
        })
      })
      setTableData(data)
    }
    if(currentData.venues){
      form.setFieldValue('venues', currentData.venues)
      setVenueList(currentData.venues || [])
    }
  }, [tableQuery.data, currentData])

  const rowActions: TableProps<Venue>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      disabled: (rows) => hasEnforcedItem(rows),
      tooltip: (rows) => getEnforcedActionMsg(rows),
      onClick: (rows) => {
        const tmpTableData = tableData.map(item => (
          { ...item, activated: { isActivated: rows.map(row => row.id).includes(item.id) } }))
        setTableData(tmpTableData)
        const mergedList = [
          ...venueList, ...rows.map(row => row.id).filter(item => !venueList.includes(item))]
        setVenueList(mergedList)
        form.setFieldValue('venues', mergedList)
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      disabled: (rows) => hasEnforcedItem(rows),
      tooltip: (rows) => getEnforcedActionMsg(rows),
      onClick: (rows) => {
        const tmpTableData = tableData.map(item => (
          { ...item, activated: { isActivated: rows.map(row => row.id).includes(item.id) } }))
        setTableData(tmpTableData)
        const filterList = venueList.filter(item => !rows.map(row=>row.id).includes(item))
        setVenueList(filterList)
        form.setFieldValue('venues', filterList)
      }
    }
  ]

  const columns: TableProps<Venue>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'name',
      defaultSortOrder: 'ascend',
      sorter: true
    },
    {
      key: 'city',
      title: $t({ defaultMessage: 'City' }),
      dataIndex: 'city',
      sorter: true
    },
    {
      key: 'country',
      title: $t({ defaultMessage: 'Country' }),
      dataIndex: 'country',
      sorter: true
    },
    {
      key: 'switches',
      title: $t({ defaultMessage: 'Switches' }),
      dataIndex: 'switches',
      align: 'center',
      sorter: true,
      render: function (_, { switches }) { return switches ? switches : 0 }
    },
    {
      key: 'activated',
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: ['activated', 'isActivated'],
      align: 'center',
      render: function (_, row) {
        const title = getEnforcedActionMsg([row]) ?? null
        const disabled = venueAppliedToCli?.map(item => item.venueId).includes(row.id)
          || hasEnforcedItem([row])

        return <Tooltip
          title={title}
          placement='bottom'>
          <Switch
            checked={form.getFieldValue('venues').includes(row.id)}
            onClick={(checked, event) => {
              if(checked){
                row.activated = { isActivated: true }
                const mergedList = [...venueList, row.id]
                setVenueList(mergedList)
                form.setFieldValue('venues', mergedList)
              }else{
                row.activated = { isActivated: false }
                const filterList = venueList.filter((item: string) => item !== row.id)
                setVenueList(filterList)
                form.setFieldValue('venues', filterList)
              }
              event.stopPropagation()
            }}
            disabled={disabled}
          />
        </Tooltip>
      }
    }
  ]

  const rowSelection = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getCheckboxProps: (record: any) => ({
      disabled: venueAppliedToCli?.map(item=>item.venueId).includes(record.id)
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderCell (checked: any, record: any, index: any, node: any) {
      if (venueAppliedToCli?.map(item => item.venueId).includes(record.id)) {
        // eslint-disable-next-line max-len
        return <Tooltip title={$t({ defaultMessage: 'A CLI configuration profile has been applied to this <venueSingular></venueSingular> so it cannot be selected.' })}>{node}</Tooltip>
      }
      return node
    }
  }

  return (
    <Loader states={[
      tableQuery
    ]}>
      <Row gutter={20}>
        <Col span={20}>
          <StepsFormLegacy.Title children={$t({ defaultMessage: '<VenuePlural></VenuePlural>' })} />
          {
            profileOnboardOnlyEnabled &&
              <Form.Item style={{ marginBottom: '0px' }}>
                <Form.Item
                  noStyle
                  name='applyOnboardOnly'
                  valuePropName='checked'
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>
                <UI.ApplyOnboardOnlySpan>
                  {$t({ defaultMessage: 'Apply profile updates to existing switches' })}
                </UI.ApplyOnboardOnlySpan>
                <UI.Hint>
                  <Tooltip
                    // eslint-disable-next-line max-len
                    title={$t({ defaultMessage: 'Turn off the toggle button to apply profile updates only to the newly added switches.' })}
                    overlayStyle={{ minWidth: '330px' }}
                  >
                    <InformationSolid />
                  </Tooltip>
                </UI.Hint>
              </Form.Item>
          }
          <Table
            rowKey='id'
            rowActions={filterByAccess(rowActions)}
            rowSelection={hasPermission() && {
              type: 'checkbox',
              ...rowSelection
            }}
            columns={columns}
            dataSource={tableData}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
          />
          <Form.Item
            name='venues'
            initialValue={[]}
            hidden={true}
            children={<Input />}
          />
        </Col>
      </Row>
    </Loader>
  )
}
