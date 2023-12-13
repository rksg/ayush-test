import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Input, Row, Select }       from 'antd'
import { DefaultOptionType }                   from 'antd/lib/select'
import { TransferItem }                        from 'antd/lib/transfer'
import _                                       from 'lodash'
import { useIntl }                             from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { Loader, StepsFormLegacy, StepsFormLegacyInstance, Transfer }                                                                                         from '@acx-ui/components'
import { useAddApGroupMutation, useGetApGroupQuery, useLazyApGroupsListQuery, useLazyVenueDefaultApGroupQuery, useUpdateApGroupMutation, useVenuesListQuery } from '@acx-ui/rc/services'
import { AddApGroup, ApDeep, checkObjectNotExists, trailingNorLeadingSpaces }                                                                                 from '@acx-ui/rc/utils'
import { useTenantLink }                                                                                                                                      from '@acx-ui/react-router-dom'

import { ApGroupEditContext } from '..'

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

export function ApGroupGeneralTab () {
  const { $t } = useIntl()
  const { tenantId, action, apGroupId } = useParams()
  const { isEditMode, isApGroupTableFlag, setEditContextData } = useContext(ApGroupEditContext)

  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink('/devices/')
  const navigatePathName = (isApGroupTableFlag)?
    `${basePath.pathname}/wifi/apgroups` :
    `${basePath.pathname}/wifi`

  const formRef = useRef<StepsFormLegacyInstance<AddApGroup>>()
  const oldFormDataRef = useRef<AddApGroup>()
  const venuesList = useVenuesListQuery({
    params: { tenantId: tenantId },
    payload: defaultVenuePayload })


  const [venueDefaultApGroup] = useLazyVenueDefaultApGroupQuery()
  const [apGroupsList] = useLazyApGroupsListQuery()
  const [addApGroup] = useAddApGroupMutation()
  const [updateApGroup] = useUpdateApGroupMutation()
  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [apsOption, setApsOption] = useState([] as TransferItem[])

  const { data: apGroupData, isLoading: isApGroupDataLoading } =
  useGetApGroupQuery({ params: { tenantId, apGroupId } }, { skip: !isEditMode })

  const locationState = location.state as { venueId?: string, history?: string }

  const venueIdFromNavigate = locationState?.venueId
  const historyUrl = locationState?.history

  useEffect(() => {
    if (!venuesList.isLoading) {
      setVenueOption(venuesList?.data?.data?.map(item => ({
        label: item.name, value: item.id
      })) ?? [])
    }
  }, [venuesList])

  useEffect(() => {
    if (isEditMode) {
      if (!isApGroupDataLoading && apGroupData) {
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
  }, [isEditMode, apGroupData, isApGroupDataLoading])


  const handleVenueChange = async (value: string,
    extraMemberList?: { name: string; key: string; }[]) => {
    const defaultApGroupOption: { name: string, key: string }[] = []

    if (value) {
      (await venueDefaultApGroup({ params: { tenantId: tenantId, venueId: value } }))
        .data?.map(x => x.aps?.map((item: ApDeep) =>
          defaultApGroupOption.push({ name: item.name.toString(), key: item.serialNumber }))
        )
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
    const { venueId } = formData
    const payload: AddApGroup = {
      ...formData
    }
    try {
      if (payload.apSerialNumbers) {
        payload.apSerialNumbers = payload.apSerialNumbers.map(i => { return { serialNumber: i } })
      }

      if (isEditMode) {
        await updateApGroup({ params: { tenantId, apGroupId }, payload }).unwrap()
      } else {
        await addApGroup({ params: { tenantId, venueId }, payload }).unwrap()
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
    const venueId = formRef.current?.getFieldValue('venueId')
    if (venueId) {
      const payload = {
        ...apGroupsListPayload,
        searchString: value, filters: { venueId: [venueId] }
      }
      const list = (await apGroupsList({ params: { tenantId, action, apGroupId }, payload }, true)
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
          isLoading: venuesList.isLoading
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
                  { validator: (_, value) => nameValidator(value) }
                ]}
                validateFirst
                hasFeedback
                children={<Input disabled={apGroupData?.isDefault} />}
                validateTrigger={'onBlur'}
              />
              <Form.Item
                name='venueId'
                label={<>
                  {$t({ defaultMessage: 'Venue' })}
                </>}
                initialValue={null}
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please select venue' })
                }]}
                children={<Select
                  disabled={isEditMode || !!venueIdFromNavigate}
                  options={venueOption}
                  onChange={async (value) => await handleVenueChange(value)}
                />}
                validateTrigger={'onBlur'}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <StepsFormLegacy.Title
                style={{ padding: '10px 0px' }}>
                {$t({ defaultMessage: 'Group Member' })}
              </StepsFormLegacy.Title>
              <Form.Item
                name='apSerialNumbers'
                valuePropName='targetKeys'
              >
                <Transfer
                  listStyle={{ width: 250, height: 316 }}
                  showSearch
                  showSelectAll={false}
                  filterOption={(inputValue, item) =>
                    (item.name && item.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1)
                  }
                  dataSource={apsOption}
                  render={item => item.name}
                  operations={['Add', 'Remove']}
                  titles={[$t({ defaultMessage: 'Available APs' }),
                    $t({ defaultMessage: 'Selected APs' })]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Loader>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}