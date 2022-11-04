import React, { useEffect, useRef, useState } from 'react'

import { Col, Form, Input, Row, Select, Transfer } from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  Loader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { TransferItem } from 'antd/lib/transfer'
import {
  useLazyApGroupListQuery,
  useVenuesListQuery,
  useApListQuery,
  useApGroupListQuery
} from '@acx-ui/rc/services'
import {
  ApGroup,
  ApDeep,
  DeviceGps,
  apNameRegExp,
  checkObjectNotExists,
  checkValuesNotEqual,
  hasGraveAccentAndDollarSign,
  serialNumberRegExp,
  VenueExtended,
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

const defaultPayload = {
  fields: ['name', 'country', 'latitude', 'longitude', 'dhcp', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}


export function ApGroupForm() {
  const { $t } = useIntl()
  const { tenantId, action } = useParams()
  const formRef = useRef<StepsFormInstance<ApDeep>>()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')
  const venuesList = useVenuesListQuery({ params: { tenantId: tenantId }, payload: defaultPayload })

  const [selectedVenue, setSelectedVenue] = useState({} as VenueExtended)
  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])


  useEffect(() => {
    if (!venuesList.isLoading) {
      setVenueOption(venuesList?.data?.data?.map(item => ({
        label: item.name, value: item.id
      })) ?? [])
    }
  }, [venuesList])

  const handleAddApGroup = async (values: ApGroup) => {
    try {
      if (action === 'add') {

      } else {

      }
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleVenueChange = async (value: string) => {
    const selected = venuesList?.data?.data?.filter(item => item.id === value)[0] ?? {}
    setSelectedVenue(selected as VenueExtended)
  }


  return <>
    {action === 'add' && <PageHeader
      title={$t({ defaultMessage: 'Add AP Group' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Access Points' }), link: '/devices/aps' }
      ]}
    />}
    <StepsForm
      formRef={formRef}
      onFinish={handleAddApGroup}
      onCancel={() => navigate({
        ...basePath,
        pathname: `${basePath.pathname}/aps`
      })}
      buttonLabel={{
        submit: action === 'add'
          ? $t({ defaultMessage: 'Add' })
          : $t({ defaultMessage: 'Apply' })
      }}
    >
      <StepsForm.StepForm>
        <Row gutter={20}>
          <Col span={8}>
            <Loader states={[{
              isLoading: venuesList.isLoading
            }]}>
              <StepsForm.Title>{$t({ defaultMessage: 'Group Details' })}</StepsForm.Title>
              <Form.Item
                name='name'
                label={$t({ defaultMessage: 'Group Name' })}
                rules={[
                  { required: true },
                  { min: 2, transform: (value) => value.trim() },
                  { max: 64, transform: (value) => value.trim() },
                  // {
                  //   validator: (_, value) => {
                  //     const nameList = apGroupList?.data?.data?.map(item => item.name) ?? []
                  //     return checkObjectNotExists(nameList, value,
                  //       $t({ defaultMessage: 'Group Name' }), 'value')
                  //   }
                  // }
                ]}
                validateFirst
                hasFeedback
                children={<Input />}
              />
              <Form.Item
                name='venueId'
                label={<>
                  {$t({ defaultMessage: 'Venue' })}
                </>}
                initialValue={null}
                rules={[{
                  required: true
                }]}
                children={<Select
                  options={[
                    { label: $t({ defaultMessage: 'Select venue...' }), value: null },
                    ...venueOption
                  ]}
                  onChange={async (value) => await handleVenueChange(value)}
                />}
              />
              <Form.Item
                name='selectedLoginServers'
                // label={$t({ defaultMessage: 'Set Priority' })}
                valuePropName='targetKeys'
                rules={[
                  // { required: true, message: $t({ defaultMessage: 'The Selected Order must be configured.' }) },
                  // { validator: (_, value) => orderValidator(value, AUTHEN_SERVERS_OBJ.NONE_TYPE) }
                ]}
              >
                <StepsForm.Title>{$t({ defaultMessage: 'Group Member' })}</StepsForm.Title>
                <Transfer
                  // {...defaultTransferProps}
                  showSearch
                  showSelectAll={false}
                  dataSource={
                    [
                      {
                        key: '1',
                        name: '1'
                      }
                    ]}
                  render={item => item.name}
                  operations={['Add', 'Remove']}
                  titles={[$t({ defaultMessage: 'Available APs' }),
                    $t({ defaultMessage: 'Selected APs' })]}
                />
              </Form.Item>
            </Loader>
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  </>
}
