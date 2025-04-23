import React, { useContext, useEffect, useRef, useState } from 'react'

import { Button, Col, Form, Input, Row, Select, Tag } from 'antd'
import { TransferItem }                               from 'antd/lib/transfer'
import _                                              from 'lodash'
import { useIntl }                                    from 'react-intl'
import { useLocation, useNavigate, useParams }        from 'react-router-dom'

import { Loader, StepsFormLegacy, StepsFormLegacyInstance, Transfer } from '@acx-ui/components'
import { Features, useIsSplitOn }                                     from '@acx-ui/feature-toggle'
import {
  useAddApGroupMutation, useAddApGroupTemplateMutation,
  useGetApGroupQuery,
  useGetApGroupTemplateQuery,
  useGetVenuesTemplateListQuery,
  useLazyApGroupsListQuery, useLazyGetApGroupsTemplateListQuery,
  useLazyGetVenueTemplateDefaultApGroupQuery,
  useLazyVenueDefaultApGroupQuery, useNewApListQuery,
  useUpdateApGroupMutation, useUpdateApGroupTemplateMutation,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  AddApGroup,
  ApDeep,
  checkObjectNotExists,
  hasGraveAccentAndDollarSign, NewAPModel,
  TableResult,
  trailingNorLeadingSpaces, useConfigTemplate,
  useConfigTemplateLazyQueryFnSwitcher,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher, useTableQuery,
  validateByteLength,
  Venue
} from '@acx-ui/rc/utils'

import { usePathBasedOnConfigTemplate } from '../../configTemplates'
import { ApGroupEditContext }           from '../context'

import type { TransferProps } from 'antd'


const defaultVenuePayload = {
  fields: ['name', 'country', 'latitude', 'longitude', 'dhcp', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const apGroupsListPayload = {
  searchString: '',
  fields: ['name', 'id'],
  searchTargetFields: ['name'],
  filters: {},
  pageSize: 10000
}

interface ApGroupOptionType {
  name: string,
  key: string,
  tags?: string[]
  apGroupName?: string
}

export function ApGroupGeneralTab () {
  const { $t } = useIntl()
  const { tenantId, apGroupId } = useParams()
  const { isTemplate } = useConfigTemplate()
  const {
    isEditMode,
    isApGroupTableFlag,
    isRbacEnabled,
    setEditContextData,
    venueId
  } = useContext(ApGroupEditContext)
  const [apsOption, setApsOption] = useState([] as TransferItem[])
  const [apInfos, setApInfos] = useState({} as Record<string, NewAPModel>)
  const [tableDataOption, setTableDataOption] = useState([] as TransferItem[])
  const [isHide, setIsHide] = useState(false)
  // eslint-disable-next-line max-len
  const isApGroupMoreParameterPhase1Enabled = useIsSplitOn(Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE1_TOGGLE)

  const navigate = useNavigate()
  const location = useLocation()
  const basePath = usePathBasedOnConfigTemplate('/devices/', '')
  const navigatePathName = isTemplate ? basePath.pathname : ((isApGroupTableFlag)
    ? `${basePath.pathname}/wifi/apgroups`
    : `${basePath.pathname}/wifi`)

  const formRef = useRef<StepsFormLegacyInstance<AddApGroup>>()
  const oldFormDataRef = useRef<AddApGroup>()

  const venuesList = useConfigTemplateQueryFnSwitcher<TableResult<Venue>>({
    useQueryFn: useVenuesListQuery,
    useTemplateQueryFn: useGetVenuesTemplateListQuery,
    skip: false,
    payload: defaultVenuePayload,
    enableRbac: isRbacEnabled
  })

  const [venueDefaultApGroup] = useConfigTemplateLazyQueryFnSwitcher({
    useLazyQueryFn: useLazyVenueDefaultApGroupQuery,
    useLazyTemplateQueryFn: useLazyGetVenueTemplateDefaultApGroupQuery
  })

  const [apGroupsList] = useConfigTemplateLazyQueryFnSwitcher({
    useLazyQueryFn: useLazyApGroupsListQuery,
    useLazyTemplateQueryFn: useLazyGetApGroupsTemplateListQuery
  })

  const [addApGroup] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddApGroupMutation,
    useTemplateMutationFn: useAddApGroupTemplateMutation
  })

  const [updateApGroup] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateApGroupMutation,
    useTemplateMutationFn: useUpdateApGroupTemplateMutation
  })

  const { data: apGroupData, isLoading: isApGroupDataLoading } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetApGroupQuery,
    useTemplateQueryFn: useGetApGroupTemplateQuery,
    skip: !isEditMode || (isRbacEnabled && !venueId),
    payload: null,
    extraParams: { tenantId, venueId, apGroupId },
    enableRbac: isRbacEnabled
  })

  const newApTableListQuery = useTableQuery({
    useQuery: useNewApListQuery,
    defaultPayload: {
      groupBy: 'apGroupId',
      fields: [
        'name', 'status', 'model', 'networkStatus', 'macAddress', 'venueName',
        'switchName', 'meshRole', 'clientCount', 'apGroupId', 'apGroupName',
        'lanPortStatuses', 'tags', 'serialNumber', 'radioStatuses',
        'venueId', 'poePort', 'firmwareVersion', 'uptime', 'afcStatus',
        'powerSavingStatus'
      ]
    },
    pagination: { pageSize: 10000 }
  })

  useEffect(() => {
    if (Object.keys(apInfos).length == 0) return
    if (newApTableListQuery.data?.data && Object.keys(apInfos).length === 0) {
      const apInfos = newApTableListQuery.data.data.reduce((acc, data) => {
        if ((data as { children?: NewAPModel[] }).children?.length) {
          (data as { children?: NewAPModel[] }).children?.forEach((ap) => {
            acc[(ap as NewAPModel).serialNumber] = ap
          })
        }
        return acc
      }, {} as Record<string, NewAPModel>)
      setApInfos(apInfos)
    }

  }, [newApTableListQuery])

  const locationState = location.state as { venueId?: string, history?: string }

  const venueIdFromNavigate = locationState?.venueId
  const historyUrl = locationState?.history

  const venueOptions = venuesList.data?.data
    .map((venue: Venue) => ({ label: venue.name, value: venue.id })) ?? []


  useEffect(() => {
    if (isEditMode) {
      if (!isApGroupDataLoading && apGroupData && venueId) {
        let extraMemberList: { name: string; key: string }[] | undefined = []
        if (Array.isArray(apGroupData.aps)) {
          extraMemberList = apGroupData.aps.map((item: ApDeep) => ({
            name: item.name.toString(), key: item.serialNumber
          }))
        }

        handleVenueChange(apGroupData.venueId, extraMemberList)

        const formData: AddApGroup = {
          name: apGroupData.name,
          venueId: apGroupData.venueId,
          apSerialNumbers: Array.isArray(apGroupData.aps) ?
            apGroupData.aps.map(i => i.serialNumber) : []
        }

        formRef?.current?.setFieldsValue(formData)

        if (oldFormDataRef) {
          oldFormDataRef.current = _.cloneDeep(formData)
        }
      }
    } else if (venueIdFromNavigate) {
      formRef?.current?.setFieldValue('venueId', venueIdFromNavigate)
      handleVenueChange(venueIdFromNavigate)
    }
  }, [isEditMode, apGroupData, isApGroupDataLoading, venueId, apInfos])

  const handleVenueChange = async (value: string,
    extraMemberList?: ApGroupOptionType[]) => {
    const defaultApGroupOption: ApGroupOptionType[] = []

    if (value) {
      // get venue default ap group and its members options
      if (isRbacEnabled) {
        // use ap group viewmodel API
        const payload = {
          fields: ['id', 'members'],
          filters: { venueId: [value] }
        }
        const list = (await apGroupsList({
          payload,
          enableRbac: isRbacEnabled
        }, true).unwrap())?.data ?? []

        defaultApGroupOption.push(...(list?.flatMap(item =>
          (item.aps ?? ([] as ApDeep[])).map((ap) => ({
            name: ap.name,
            key: ap.serialNumber,
            ...(isApGroupMoreParameterPhase1Enabled ? {
              apGroupName: apInfos[ap.serialNumber]?.apGroupName || '',
              tags: apInfos[ap.serialNumber]?.tags || []
            } : {})
          })))))
      } else {
        (await venueDefaultApGroup({ params: { tenantId: tenantId, venueId: value } }))
          .data?.map(x => x.aps?.map((item: ApDeep) => {
            defaultApGroupOption.push({
              name: item.name.toString(),
              key: item.serialNumber,
              ...(isApGroupMoreParameterPhase1Enabled ? {
                apGroupName: apInfos[item.serialNumber]?.apGroupName || '',
                tags: apInfos[item.serialNumber]?.tags || []
              } : {})
            })
          })
          )
      }
    }

    if (extraMemberList && defaultApGroupOption) {
      setApsOption(defaultApGroupOption.concat(extraMemberList)
        .filter((option, ind) => ind ===
          defaultApGroupOption.findIndex(elem => elem.name === option.name &&
            elem.key === option.key)
        ) as TransferItem[])
    } else {
      formRef.current?.validateFields(['name'])
      setApsOption(defaultApGroupOption as TransferItem[])
    }
  }

  const handleAddApGroup = async () => {
    const formData = formRef.current?.getFieldsValue() || {} as AddApGroup
    const { venueId: formVenueId } = formData
    const payload: AddApGroup = {
      ...formData
    }
    try {
      if (payload.apSerialNumbers) {
        payload.apSerialNumbers = payload.apSerialNumbers.map(i => { return { serialNumber: i } })
      }

      if (isEditMode) {
        await updateApGroup({
          params: {
            tenantId,
            venueId: formVenueId,
            apGroupId
          },
          payload,
          enableRbac: isRbacEnabled
        }).unwrap()
      } else {
        await addApGroup({
          params: { tenantId, venueId: formVenueId },
          payload,
          enableRbac: isRbacEnabled
        }).unwrap()
      }

      setEditContextData({
        tabTitle: $t({ defaultMessage: 'General' }),
        unsavedTabKey: 'general',
        isDirty: false
      })

      if (!isEditMode || !isApGroupTableFlag) {
        navigate(navigatePathName, { replace: true })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const nameValidator = async (value: string) => {
    if (value.trim() === '') {
      return trailingNorLeadingSpaces(value)
    }
    const formVenueId = formRef.current?.getFieldValue('venueId')
    if (formVenueId) {
      const payload = {
        ...apGroupsListPayload,
        searchString: value, filters: { venueId: [formVenueId] }
      }
      const list = (await apGroupsList({
        payload,
        enableRbac: isRbacEnabled
      }, true)
        .unwrap()).data
        .filter(n => n.id !== apGroupId)
        .map(n => ({ name: n.name }))
      return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'Group' }))
    } else {
      return false
    }
  }

  const handleFormChanged = async () => {
    if (isEditMode && isApGroupTableFlag) {
      const curFormData = formRef.current?.getFieldsValue()
      const oldFormData = oldFormDataRef.current

      if (!_.isEqual(curFormData, oldFormData)) {
        oldFormDataRef.current = _.cloneDeep(curFormData)

        setEditContextData({
          tabTitle: $t({ defaultMessage: 'General' }),
          unsavedTabKey: 'general',
          isDirty: true,
          updateChanges: () => handleAddApGroup()
        })
      }
    }
  }

  const handleDiscardChanges = async () => {
    setEditContextData({
      tabTitle: $t({ defaultMessage: 'General' }),
      unsavedTabKey: 'general',
      isDirty: false
    })

    navigate({
      ...basePath,
      pathname: (historyUrl)? historyUrl : navigatePathName
    })
  }

  const leftColumns = [
    {
      dataIndex: 'name',
      title: 'Name'
    },
    {
      dataIndex: 'apGroupName',
      title: 'Ap Group'
    },
    {
      dataIndex: 'tags',
      title: 'Tag',
      render: (tags: string[]) => {
        if (tags.filter(tag => tag !== '').length === 0) return <></>

        return (
          tags.map((tag: string) => (<Tag style={{ marginInlineEnd: 0 }} >
            {tag.toUpperCase()}
          </Tag>))
        )
      }
    }
  ]

  const rightColumns = [
    {
      dataIndex: 'name',
      title: 'Name'
    }
  ]

  const renderFooter: TransferProps<TransferItem>['footer'] = (_, info) => {
    if (info?.direction === 'left') {
      return (
        <Button
          size='small'
          style={{ display: 'flex', margin: 8, marginInlineEnd: 'auto', fontSize: '13px' }}
          type={'link'}
          onClick={() => {
            if (isHide) {
              setTableDataOption(apsOption)
            } else {
              setTableDataOption(apsOption.filter(option => option.name.includes('AP')))
            }
            setIsHide(!isHide)
          }}
        >
          {isHide
            ? $t({ defaultMessage: 'Show assigned APs' })
            : $t({ defaultMessage: 'Hide assigned APs' })
          }
        </Button>
      )
    }
    return <></>
  }

  return (
    <StepsFormLegacy
      formRef={formRef}
      onFormChange={handleFormChanged}
      onFinish={handleAddApGroup}
      onCancel={() => handleDiscardChanges()}
      buttonLabel={{
        submit: !isEditMode ? $t({ defaultMessage: 'Add' }) : $t({ defaultMessage: 'Apply' })
      }}
    >
      <StepsFormLegacy.StepForm>
        <Loader states={[{
          isLoading: (isEditMode && !venueId) || venuesList.isLoading
        }]}>
          <Row gutter={20}>
            <Col span={8}>
              {(!isApGroupTableFlag || !isEditMode) &&
                <StepsFormLegacy.Title children={$t({ defaultMessage: 'Group Details' })} />
              }
              <Form.Item
                name='name'
                label={$t({ defaultMessage: 'Group Name' })}
                rules={[
                  { required: true },
                  { min: 2, transform: (value) => value.trim() },
                  { max: 64, transform: (value) => value.trim() },
                  { validator: (_, value) => hasGraveAccentAndDollarSign(value) },
                  { validator: (_, value) => validateByteLength(value, 64) },
                  { validator: (_, value) => nameValidator(value) }
                ]}
                validateFirst
                hasFeedback
                children={<Input disabled={apGroupData?.isDefault} />}
              />
              <Form.Item
                name='venueId'
                label={<>
                  {$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
                </>}
                initialValue={null}
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please select <venueSingular></venueSingular>' })
                }]}
                children={<Select
                  disabled={isEditMode || !!venueIdFromNavigate}
                  options={venueOptions}
                  onChange={async (value) => await handleVenueChange(value)}
                />}
                validateTrigger={'onBlur'}
              />
            </Col>
          </Row>
          {!isTemplate && <Row>
            <Col>
              <StepsFormLegacy.Title
                style={{ padding: '10px 0px' }}>
                {$t({ defaultMessage: 'Group Member' })}
              </StepsFormLegacy.Title>
              <Form.Item
                name='apSerialNumbers'
                valuePropName='targetKeys'
              >
                { isApGroupMoreParameterPhase1Enabled
                  ? <Transfer
                    listStyle={{ width: 400, height: 400 }}
                    type={'table'}
                    tableData={tableDataOption}
                    leftColumns={leftColumns}
                    rightColumns={rightColumns}
                    showSearch
                    showSelectAll={false}
                    filterOption={(inputValue, item) =>
                      Object.keys(item).some(key => {
                        // eslint-disable-next-line max-len
                        return (item[key] && item[key].toString().toLowerCase().indexOf(inputValue.toLowerCase()) !== -1)
                      })
                    }
                    dataSource={apsOption}
                    render={item => item.name}
                    footer={renderFooter}
                    operations={['Add', 'Remove']}
                    titles={[$t({ defaultMessage: 'Available APs' }),
                      $t({ defaultMessage: 'Selected APs' })]}
                  />
                  : <Transfer
                    listStyle={{ width: 250, height: 316 }}
                    showSearch
                    showSelectAll={false}
                    filterOption={(inputValue, item) =>
                      // eslint-disable-next-line max-len
                      (item.name && item.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1)
                    }
                    dataSource={apsOption}
                    render={item => item.name}
                    operations={['Add', 'Remove']}
                    titles={[$t({ defaultMessage: 'Available APs' }),
                      $t({ defaultMessage: 'Selected APs' })]}
                  />
                }
              </Form.Item>
            </Col>
          </Row>}
        </Loader>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
