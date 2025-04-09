import { useContext } from 'react'

import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { showActionModal, showToast, Table, TableProps, Tooltip }        from '@acx-ui/components'
import { useGetVenueRoguePolicyTemplateQuery, useVenueRoguePolicyQuery } from '@acx-ui/rc/services'
import {
  ConfigTemplateType,
  PoliciesConfigTemplateUrlsInfo,
  RogueAPDetectionActionPayload,
  RogueAPDetectionActionTypes, RogueApUrls, useActivativationPermission, useConfigTemplate,
  useTableQuery,
  VenueRoguePolicyType
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

import { useEnforcedStatus }          from '../../../configTemplates'
import { VENUE_IN_PROFILE_MAX_COUNT } from '../contentsMap'
import RogueAPDetectionContext        from '../RogueAPDetectionContext'

const defaultPayload = {
  fields: [
    'id', 'name', 'city', 'country', 'switches', 'aggregatedApStatus',
    'rogueDetection', 'status', 'isEnforced'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pagination: {
    pageSize: 25
  }
}

export const RogueVenueTable = () => {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const { state, dispatch } = useContext(RogueAPDetectionContext)
  const { hasEnforcedItem, getEnforcedActionMsg } = useEnforcedStatus(ConfigTemplateType.VENUE)
  const {
    activateOpsApi,
    deactivateOpsApi,
    hasFullActivationPermission
  } = useActivativationPermission({
    activateApiInfo: RogueApUrls.activateRoguePolicy,
    activateTemplateApiInfo: PoliciesConfigTemplateUrlsInfo.activateRoguePolicy,
    deactivateApiInfo: RogueApUrls.deactivateRoguePolicy,
    deactivateTemplateApiInfo: PoliciesConfigTemplateUrlsInfo.deactivateRoguePolicy
  })

  const activateVenue = (selectRows: VenueRoguePolicyType[]) => {
    if (selectRows.filter(row =>
      row.rogueDetection?.enabled && row.rogueDetection?.policyId !== state.id
    ).length > 0) {
      showActionModal({
        type: 'warning',
        title: $t({ defaultMessage: 'Change Rogue AP Profile?' }),
        // eslint-disable-next-line max-len
        content: $t({ defaultMessage: 'Only 1 rogue AP profile can be activate at a <venueSingular></venueSingular>. Are you sure you want to change the rogue AP profile to this <venueSingular></venueSingular>?' }),
        customContent: {
          action: 'CUSTOM_BUTTONS',
          buttons: [{
            text: $t({ defaultMessage: 'Cancel' }),
            type: 'link',
            key: 'cancel'
          }, {
            text: $t({ defaultMessage: 'OK' }),
            type: 'primary',
            key: 'ok',
            closeAfterAction: true,
            handler: () => {
              dispatch({
                type: RogueAPDetectionActionTypes.ADD_VENUES,
                payload: selectRows.map(row => {
                  return {
                    id: row.id,
                    name: row.name
                  }
                })
              } as RogueAPDetectionActionPayload)
            }
          }]
        }
      })
    } else {
      dispatch({
        type: RogueAPDetectionActionTypes.ADD_VENUES,
        payload: selectRows.map(row => {
          return {
            id: row.id,
            name: row.name
          }
        })
      } as RogueAPDetectionActionPayload)
    }
  }

  const deactivateVenue = (selectRows: VenueRoguePolicyType[]) => {
    dispatch({
      type: RogueAPDetectionActionTypes.REMOVE_VENUES,
      payload: selectRows.map(row => {
        return {
          id: row.id,
          name: row.name
        }
      })
    } as RogueAPDetectionActionPayload)
  }

  const basicColumns: TableProps<VenueRoguePolicyType>['columns'] = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aggregatedApStatus',
      key: 'aggregatedApStatus',
      disable: isTemplate,
      align: 'center',
      sorter: true,
      render: (_, row) => {
        return Object.values(row.aggregatedApStatus ?? {}).reduce((a, b) => a + b, 0)
      }
    },
    {
      title: $t({ defaultMessage: 'Switches' }),
      dataIndex: 'switches',
      key: 'switches',
      disable: isTemplate,
      align: 'center',
      sorter: true,
      render: (_, row) => {
        return row.switches ?? 0
      }
    },
    {
      title: $t({ defaultMessage: 'Rogue AP Detection' }),
      dataIndex: 'rogueDetection',
      key: 'rogueDetection',
      align: 'center',
      sorter: true,
      render: (_, row) => {
        if (row.rogueDetection?.enabled) {
          return <div style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }}>
            <div>{$t({ defaultMessage: 'ON' })}</div>
            <div>({row.rogueDetection.policyName})</div>
          </div>
        }
        return <div style={{ textAlign: 'center' }}>
          {$t({ defaultMessage: 'OFF' })}
        </div>
      }
    },
    {
      title: $t({ defaultMessage: 'Activate' }),
      dataIndex: 'activate',
      key: 'activate',
      align: 'center',
      render: (_, row) => {
        const isEnforcedByTemplate = hasEnforcedItem([row])
        const enforcedActionMsg = getEnforcedActionMsg([row])

        return <Tooltip
          title={enforcedActionMsg}
          placement='bottom'>
          <Switch
            data-testid={`switchBtn_${row.id}`}
            disabled={isEnforcedByTemplate || !hasFullActivationPermission}
            checked={
              state.venues
                ? state.venues.findIndex(venueExist => venueExist.id === row.id) !== -1
                : false
            }
            onClick={(_, e) => {
              e.stopPropagation()
              state.venues.findIndex(venueExist => venueExist.id === row.id) !== -1
                ? deactivateVenue([row])
                : activateVenue([row])
            }
            }
          />
        </Tooltip>
      }
    }
  ]

  const tableQuery = useTableQuery({
    useQuery: isTemplate ? useGetVenueRoguePolicyTemplateQuery :useVenueRoguePolicyQuery,
    defaultPayload
  })

  const basicData = tableQuery.data?.data.map((venue) => {
    return {
      id: venue.id,
      name: venue.name,
      aggregatedApStatus: venue.aggregatedApStatus,
      rogueDetection: venue.rogueDetection,
      activate: false,
      isEnforced: venue.isEnforced
    }
  })

  const rowActions: TableProps<VenueRoguePolicyType>['rowActions'] = [{
    label: $t({ defaultMessage: 'Activate' }),
    rbacOpsIds: [activateOpsApi],
    disabled: (selectedRows: VenueRoguePolicyType[]) => hasEnforcedItem(selectedRows),
    tooltip: (selectedRows: VenueRoguePolicyType[]) => getEnforcedActionMsg(selectedRows),
    onClick: (selectRows: VenueRoguePolicyType[], clearSelection: () => void) => {
      if (state.venues.length + selectRows.length >= VENUE_IN_PROFILE_MAX_COUNT) {
        showToast({
          type: 'info',
          duration: 10,
          // eslint-disable-next-line max-len
          content: $t({ defaultMessage: 'The max-number of <venuePlural></venuePlural> in a rogue ap policy profile is 64.' })
        })
      } else {
        activateVenue(selectRows)
        clearSelection()
      }
    }
  },{
    label: $t({ defaultMessage: 'Deactivate' }),
    rbacOpsIds: [deactivateOpsApi],
    disabled: (selectedRows: VenueRoguePolicyType[]) => hasEnforcedItem(selectedRows),
    tooltip: (selectedRows: VenueRoguePolicyType[]) => getEnforcedActionMsg(selectedRows),
    onClick: (selectRows: VenueRoguePolicyType[], clearSelection: () => void) => {
      deactivateVenue(selectRows)

      clearSelection()
    }
  }]

  const allowedRowActions = filterByAccess(rowActions)

  return (
    <Table
      columns={basicColumns}
      dataSource={basicData}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      rowKey='id'
      rowActions={allowedRowActions}
      rowSelection={allowedRowActions.length > 0 && { type: 'checkbox' }}
    />
  )
}
