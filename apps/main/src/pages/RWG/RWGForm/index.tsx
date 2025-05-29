import { useEffect, useState } from 'react'

import { Row, Col, Form, Input, Select, Badge } from 'antd'
import { DefaultOptionType }                    from 'antd/lib/select'
import { useIntl }                              from 'react-intl'

import {
  Button,
  cssStr,
  Loader,
  PageHeader,
  PasswordInput,
  StepsForm,
  Tooltip
} from '@acx-ui/components'
import {
  useAddGatewayMutation,
  useGetRwgQuery,
  useLazyRwgListQuery,
  useUpdateGatewayMutation,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  redirectPreviousPage,
  whitespaceOnlyRegExp,
  RWG,
  excludeSpaceRegExp,
  domainNameRegExp,
  getRwgStatus,
  trailingNorLeadingSpaces
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { validationMessages } from '@acx-ui/utils'


const defaultPayload = {
  fields: ['name', 'country', 'countryCode', 'latitude', 'longitude', 'dhcp', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}


export function RWGForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()

  const linkToGateways = useTenantLink('/ruckus-wan-gateway')
  const [addGateway] = useAddGatewayMutation()
  const [updateGateway] = useUpdateGatewayMutation()

  const { tenantId, gatewayId, venueId, action } = useParams()
  const { data } = useGetRwgQuery({ params: { tenantId, gatewayId, venueId } },
    { skip: !gatewayId })
  const basePath = useTenantLink(`/ruckus-wan-gateway/${venueId}/${gatewayId}/gateway-details`)
  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const venuesList = useVenuesListQuery({ params: { tenantId: tenantId }, payload: defaultPayload })

  useEffect(() => {
    if (!venuesList.isLoading) {
      setVenueOption(venuesList?.data?.data?.map(item => ({
        label: item.name, value: item.id
      })) ?? [])
    }
  }, [venuesList])

  const gatewayListPayload = {
    searchString: '',
    fields: ['name', 'id'],
    searchTargetFields: ['name'],
    filters: {},
    pageSize: 10000
  }
  const [gatewayList] = useLazyRwgListQuery()
  const nameValidator = async (value: string) => {
    if ([...value].length !== JSON.stringify(value).normalize().slice(1, -1).length) {
      return Promise.reject($t(validationMessages.name))
    }
    const payload = { ...gatewayListPayload, searchString: value }
    const list = (await gatewayList({ params: { gatewayId, tenantId }, payload }, true)
      .unwrap()).data.filter(n => n.rwgId !== data?.rwgId).map(n => ({ name: n.name }))
    return checkObjectNotExists(list, { name: value } , $t({ defaultMessage: 'Gateway' }))
  }

  const handleAddGateway = async (values: RWG) => {
    try {
      const formData = { ...values }
      await addGateway({ params: { ...params, venueId: formData.venueId },
        payload: formData }).unwrap()

      navigate(linkToGateways, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleEditGateway = async (values: RWG) => {
    try {
      const formData = { ...values, rwgId: data?.rwgId } // rwg update API use post method where rwgId is required to pass
      await updateGateway({ params, payload: formData }).unwrap()

      navigate(linkToGateways, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const isEditMode: boolean = action === 'edit'

  const loadForm: boolean = isEditMode ? !!data : true

  return (
    <>
      <PageHeader
        title={!isEditMode
          ? $t({ defaultMessage: 'Add Gateway' })
          : data?.name}
        titleExtra={
          isEditMode &&
          <span>
            <Badge
              color={data?.status ? cssStr(getRwgStatus(data.status).color)
                : cssStr('--acx-neutrals-50')}
            />
          </span>
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'RUCKUS WAN Gateway' }), link: '/ruckus-wan-gateway' }
        ]}
        extra={isEditMode ? [
          <Button
            type='primary'
            disabled={!gatewayId}
            onClick={() =>
              navigate({
                ...basePath,
                pathname: `${basePath.pathname}/overview`
              })
            }>{ $t({ defaultMessage: 'Back to Gateway details' }) }</Button>
        ] : []}
      />
      { loadForm && <StepsForm
        onFinish={isEditMode ? handleEditGateway : handleAddGateway}
        onCancel={() =>
          redirectPreviousPage(navigate, '', linkToGateways) // TODO: set previousPath while gateway details implementation
        }
        buttonLabel={{ submit: isEditMode ?
          $t({ defaultMessage: 'Save' }):
          $t({ defaultMessage: 'Add' }) }}
      >
        <StepsForm.StepForm>
          <Loader states={[{
            isLoading: venuesList.isLoading
          }]}>
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item
                  name='venueId'
                  label={<>
                    {$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
                  </>}
                  initialValue={data?.venueId}
                  rules={[{
                    required: true,
                    message: $t({ defaultMessage: 'Please select <VenueSingular></VenueSingular>' })
                  }]}
                  children={<Select
                    options={venueOption}
                  />}
                />
                <Form.Item
                  name='name'
                  initialValue={data?.name}
                  label={$t({ defaultMessage: 'Gateway Name' })}
                  rules={[
                    { type: 'string', required: true },
                    { min: 2, transform: (value) => value.trim() },
                    { max: 32, transform: (value) => value.trim() },
                    { validator: (_, value) => whitespaceOnlyRegExp(value) },
                    {
                      validator: (_, value) => nameValidator(value)
                    },
                    { validator: (_, value) => trailingNorLeadingSpaces(value) }
                  ]}
                  validateFirst
                  hasFeedback
                  children={<Input />}
                  validateTrigger={'onBlur'}
                />
                <Form.Item
                  name='hostname'
                  initialValue={data?.hostname}
                  label={<>{$t({ defaultMessage: 'FQDN / IP' })}
                    <Tooltip.Question
                      title={$t({ defaultMessage:
                        'Fully qualified domain name or IP address of the RWG Device.' })}
                      placement='right'
                      iconStyle={{
                        width: 16,
                        height: 16
                      }}
                    />
                  </>}
                  rules={[
                    { type: 'string', required: true,
                      message: $t({ defaultMessage: 'Please enter FQDN / IP' })
                    },
                    { validator: (_, value) => domainNameRegExp(value),
                      message: $t({ defaultMessage: 'Please enter a valid FQDN / IP' })
                    }
                  ]}
                  children={<Input />}
                />
                <Form.Item
                  name='apiKey'
                  initialValue={data?.apiKey}
                  label={<>{$t({ defaultMessage: 'API Key' })}
                    <Tooltip.Question
                      title={$t({ defaultMessage:
                        // eslint-disable-next-line max-len
                        'API keys (80-character strings) can be generated and copied from the RWG Administrator UI. API Keys do not expire.' })}
                      placement='right'
                      iconStyle={{
                        width: 16,
                        height: 16
                      }}
                    />
                  </>}
                  rules={[
                    { required: true,
                      message: $t({ defaultMessage: 'Please enter API Key' }) },
                    { max: 80, min: 80,
                      message: $t({ defaultMessage: 'API key must be 80 characters long.' }) },
                    { validator: (_, value) => excludeSpaceRegExp(value) }
                  ]}
                  children={<PasswordInput />}
                />
              </Col>
            </Row>
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
      }
    </>
  )
}
