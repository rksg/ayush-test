import { useEffect, useState } from 'react'

import { Row, Col, Form, Input, Select } from 'antd'
import { DefaultOptionType }             from 'antd/lib/select'
import { useIntl }                       from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  PasswordInput,
  StepsForm
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
  notAllDigitsRegExp,
  excludeQuoteRegExp,
  URLProtocolRegExp
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

  const { tenantId, gatewayId, action } = useParams()
  const { data } = useGetRwgQuery({ params: { tenantId, gatewayId } }, { skip: !gatewayId })
  const basePath = useTenantLink(`/ruckus-wan-gateway/${gatewayId}/gateway-details`)
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
    const list = (await gatewayList({ params, payload }, true)
      .unwrap()).data.filter(n => n.id !== data?.id).map(n => ({ name: n.name }))
    return checkObjectNotExists(list, { name: value } , $t({ defaultMessage: 'Gateway' }))
  }

  const handleAddGateway = async (values: RWG) => {
    try {
      const formData = { ...values }
      await addGateway({ params, payload: formData }).unwrap()

      navigate(linkToGateways, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleEditGateway = async (values: RWG) => {
    try {
      const formData = { ...values, rwgId: data?.id } // rwg update API use post method where rwgId is required to pass
      await updateGateway({ params, payload: formData }).unwrap()
      // TODO: after update need to redirect to gateway detail page
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      {<PageHeader
        title={action !== 'edit'
          ? $t({ defaultMessage: 'Add Gateway' })
          : data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'RUCKUS WAN Gateway' }), link: '/ruckus-wan-gateway' }
        ]}
        extra={action === 'edit' ? [
          <Button
            type='primary'
            disabled={true} // TODO
            onClick={() =>
              navigate({
                ...basePath,
                pathname: basePath.pathname
              })
            }>{ $t({ defaultMessage: 'Back to Gateway details' }) }</Button>
        ] : []}
      />}
      <StepsForm
        onFinish={action === 'edit' ? handleEditGateway : handleAddGateway}
        onCancel={() =>
          redirectPreviousPage(navigate, '', linkToGateways) // TODO: set previousPath while gateway details implementation
        }
        buttonLabel={{ submit: action === 'edit' ?
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
                    {$t({ defaultMessage: 'Venue' })}
                  </>}
                  initialValue={data?.venueId}
                  rules={[{
                    required: true,
                    message: $t({ defaultMessage: 'Please select Venue' })
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
                    }
                  ]}
                  validateFirst
                  hasFeedback
                  children={<Input />}
                  validateTrigger={'onBlur'}
                />
                <Form.Item
                  name='loginUrl'
                  initialValue={data?.loginUrl}
                  label={$t({ defaultMessage: 'Hostname' })}
                  rules={[
                    { type: 'string', required: true },
                    { min: 2, transform: (value) => value.trim() },
                    { max: 64, transform: (value) => value.trim() },
                    { validator: (_, value) => URLProtocolRegExp(value) }
                  ]}
                  children={<Input />}
                />
                <Form.Item
                  name='username'
                  initialValue={data?.username}
                  rules={[{ required: true },
                    { min: 2 },
                    { max: 48 },
                    { validator: (_, value) => excludeQuoteRegExp(value) },
                    { validator: (_, value) => excludeSpaceRegExp(value) }]}
                  label={$t({ defaultMessage: 'Username' })}
                  children={<Input />}
                />
                <Form.Item
                  name='password'
                  initialValue={data?.password}
                  label={$t({ defaultMessage: 'Password' })}
                  rules={[
                    { required: true },
                    { validator: (_, value) =>
                    {
                      if(value?.length < 8) {
                        return Promise.reject(
                          `${$t({ defaultMessage:
                            'Password must be more 8 or more characters long' })} `
                        )
                      }
                      return Promise.resolve()
                    }
                    },
                    { validator: (_, value) => excludeSpaceRegExp(value) },
                    { validator: (_, value) => notAllDigitsRegExp(value),
                      message: $t({ defaultMessage:
            'Secret must include letters or special characters; numbers alone are not accepted.' })
                    }
                  ]}
                  children={<PasswordInput />}
                />
              </Col>
            </Row>
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
