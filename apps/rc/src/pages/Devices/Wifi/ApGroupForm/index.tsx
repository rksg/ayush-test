import React, { useEffect, useRef, useState } from 'react'

import { Col, Form, Input, Row, Select, Transfer } from 'antd'
import { DefaultOptionType }                       from 'antd/lib/select'
import { TransferItem }                            from 'antd/lib/transfer'
import { useIntl }                                 from 'react-intl'

import {
  PageHeader,
  Loader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useVenuesListQuery,
  useLazyVenueDefaultApGroupQuery,
  useAddApGroupMutation,
  useLazyApGroupsListQuery,
  useGetApGroupQuery,
  useUpdateApGroupMutation
} from '@acx-ui/rc/services'
import {
  ApDeep,
  AddApGroup,
  checkObjectNotExists,
  trailingNorLeadingSpaces
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

const defaultPayload = {
  fields: ['name', 'country', 'latitude', 'longitude', 'dhcp', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export function ApGroupForm () {
  const { $t } = useIntl()
  const { tenantId, action, apGroupId } = useParams()
  const navigate = useNavigate()
  const params = useParams()
  const formRef = useRef<StepsFormLegacyInstance<AddApGroup>>()
  const basePath = useTenantLink('/devices/')
  const venuesList = useVenuesListQuery({ params: { tenantId: tenantId }, payload: defaultPayload })
  const isEditMode = action === 'edit'
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const [venueDefaultApGroup] = useLazyVenueDefaultApGroupQuery()
  const [apGroupsList] = useLazyApGroupsListQuery()
  const [addApGroup] = useAddApGroupMutation()
  const [updateApGroup] = useUpdateApGroupMutation()
  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [apsOption, setApsOption] = useState([] as TransferItem[])

  const { data: apGroupData, isLoading: isApGroupDataLoading } =
  useGetApGroupQuery({ params: { tenantId, apGroupId } }, { skip: !isEditMode })

  const apGroupsListPayload = {
    searchString: '',
    fields: ['name', 'id'],
    searchTargetFields: ['name'],
    filters: {},
    pageSize: 10000
  }

  useEffect(() => {
    if (!venuesList.isLoading) {
      setVenueOption(venuesList?.data?.data?.map(item => ({
        label: item.name, value: item.id
      })) ?? [])
    }
  }, [venuesList])

  useEffect(() => {
    if (isEditMode && !isApGroupDataLoading && apGroupData) {
      let extraMemberList: { name: string; key: string }[] | undefined = []
      if (Array.isArray(apGroupData.aps)) {
        extraMemberList = apGroupData.aps.map((item: ApDeep) => ({
          name: item.name.toString(), key: item.serialNumber
        }))
      }

      handleVenueChange(apGroupData.venueId, extraMemberList)
      formRef?.current?.setFieldsValue({
        name: apGroupData.name,
        venueId: apGroupData.venueId,
        apSerialNumbers: Array.isArray(apGroupData.aps) ?
          apGroupData.aps.map(i => i.serialNumber) : []
      })
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

  const handleAddApGroup = async (values: AddApGroup) => {
    const venueId = formRef.current?.getFieldValue('venueId')
    try {
      if (values.apSerialNumbers) {
        values.apSerialNumbers = values.apSerialNumbers.map(i => { return { serialNumber: i } })
      }
      const payload = {
        ...values
      }
      if (isEditMode) {
        await updateApGroup({ params: { tenantId, apGroupId }, payload }).unwrap()
      } else {
        await addApGroup({ params: { tenantId, venueId }, payload }).unwrap()
      }

      navigate(`${basePath.pathname}/wifi`, { replace: true })
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
      const list = (await apGroupsList({ params, payload }, true)
        .unwrap()).data
        .filter(n => n.id !== params.apGroupId)
        .map(n => ({ name: n.name }))
      return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'Group' }))
    } else {
      return false
    }
  }

  return <>
    <PageHeader
      title={!isEditMode ? $t({ defaultMessage: 'Add AP Group' }) :
        $t({ defaultMessage: 'Edit AP Group' })}
      breadcrumb={isNavbarEnhanced ? [
        { text: $t({ defaultMessage: 'Wi-Fi' }) },
        { text: $t({ defaultMessage: 'Access Points' }) },
        { text: $t({ defaultMessage: 'AP List' }), link: '/devices/wifi' }
      ] : [
        { text: $t({ defaultMessage: 'Access Points' }), link: '/devices/wifi' }
      ]}
    />
    <StepsFormLegacy
      formRef={formRef}
      onFinish={handleAddApGroup}
      onCancel={() => navigate({
        ...basePath,
        pathname: `${basePath.pathname}/wifi`
      })}
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
              <StepsFormLegacy.Title children={$t({ defaultMessage: 'Group Details' })} />
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
                  disabled={isEditMode}
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
  </>
}
