import { useEffect, useState } from 'react'

import { Form, FormInstance, Input, Select } from 'antd'
import { useIntl }                           from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import {
  useVenuesListQuery,
  useGetEdgeClusterListQuery
} from '@acx-ui/rc/services'
import {
  EdgeNokiaOltCreateFormData,
  LocationExtended,
  redirectPreviousPage,
  networkWifiIpRegExp
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

const venueOptionsDefaultPayload = {
  fields: [ 'name', 'id', 'edges' ],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const clusterDataDefaultPayload = {
  fields: ['name', 'clusterId', 'venueId'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const OltForm = (props: {
  editMode?: boolean
  data?: EdgeNokiaOltCreateFormData
  form: FormInstance
  onFinish: (values: EdgeNokiaOltCreateFormData) => Promise<boolean | void>

}) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { editMode, onFinish } = props
  const pageTitle = editMode
    ? $t({ defaultMessage: 'Edd Optical Switch' }) : $t({ defaultMessage: 'Add Optical Switch' })
  // const previousPath = 'devices/optical' //usePolicyPreviousPath(PolicyType.FLEX_AUTH, PolicyOperation.LIST)
  const [previousPath, setPreviousPath] = useState('')

  const location = useLocation()
  const basePath = useTenantLink('/devices/')

  useEffect(() => {
    setPreviousPath((location as LocationExtended)?.state?.from?.pathname)
  }, [])

  const {
    venueOptions, isVenueOptsLoading
  } = useVenuesListQuery(
    {
      payload: venueOptionsDefaultPayload
    }, {
      // skip: !visible,
      selectFromResult: ({ data, isLoading }) => {
        return {
          venueOptions: data?.data.filter(item => (item.edges ?? 0) > 0)
            .map(item => ({ label: item.name, value: item.id })),
          isVenueOptsLoading: isLoading
        }
      }
    })

  const { clusterOptions, isClusterOptsLoading } = useGetEdgeClusterListQuery(
    { payload: clusterDataDefaultPayload },
    {
      //skip: !visible,
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterOptions: data?.data
            .map(item => ({ label: item.name, value: item.clusterId, venueId: item.venueId })),
          isClusterOptsLoading: isLoading
        }
      }
    })

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Wired' }) },
          { text: $t({ defaultMessage: 'Switches' }) },
          { text: $t({ defaultMessage: 'Optical List' }), link: '/devices/optical' }
        ]}
      />

      <StepsForm
        form={form}
        onFinish={onFinish}
        onCancel={() =>
          redirectPreviousPage(navigate, previousPath, `${basePath.pathname}/optical`)
        }
        style={{ width: '280px' }}
        buttonLabel={{
          submit: editMode ?
            $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' }),
          cancel: $t({ defaultMessage: 'Cancel' })
        }}
      >
        <StepsForm.StepForm>
          <Loader
            states={[{
              isLoading: false
              // isLoading: editMode ? (!props.data || isProfileListLoading) : isProfileListLoading
            }]}
          >
            <StepsForm.Subtitle children={$t({ defaultMessage: 'Settings' })} />
            <Form.Item
              name='venueId'
              label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
              rules={[{
                required: true,
                message: $t({ defaultMessage: 'Please select a <VenueSingular></VenueSingular>' })
              }]}
              children={
                <Select
                  loading={isVenueOptsLoading}
                  placeholder={$t({ defaultMessage: 'Select <venueSingular></venueSingular>...' })}
                  options={venueOptions}
                  disabled={editMode}
                />
              }
            />
            <Form.Item
              name='serialNumber'
              label={$t({ defaultMessage: 'Serial Number' })}
              rules={[{
                required: true
                //message: $t({ defaultMessage: 'Please input serial number' })
              }]}
              children={<Input />}
            />
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'Device Name' })}
              rules={[{
                required: true
                //message: $t({ defaultMessage: 'Please input device name' })
              }]}
              children={<Input />}
            />
            <Form.Item
              name='ip'
              label={$t({ defaultMessage: 'IP Address' })}
              rules={[{
                required: true
                //message: $t({ defaultMessage: 'Please input IP address' })
              }, { validator: async (_, value) => {
                return networkWifiIpRegExp(value)
              } }]}
              children={<Input disabled={editMode} />}
            />
            <Form.Item noStyle dependencies={['venueId']}>
              {({ getFieldValue }) => {
                const venueId = getFieldValue('venueId')

                return <Form.Item
                  name='edgeClusterId'
                  label={$t({ defaultMessage: 'RUCKUS Edge' })}
                  rules={[{
                    required: true,
                    message: $t({ defaultMessage: 'Please select RUCKUS Edge' })
                  }]}
                  children={
                    <Select
                      loading={isClusterOptsLoading}
                      placeholder={$t({ defaultMessage: 'Select RUCKUS Edge...' })}
                      // eslint-disable-next-line max-len
                      options={venueId ? clusterOptions?.filter(item => item.venueId === venueId) : []}
                      disabled={!venueId || editMode}
                    />
                  }
                />
              }}
            </Form.Item>

            <StepsForm.Subtitle children={$t({ defaultMessage: 'Credential' })} />
            <Form.Item
              name='username'
              label={$t({ defaultMessage: 'Username' })}
              children={<Input disabled value='admin'/>}
            />
            <Form.Item
              name='password'
              label={$t({ defaultMessage: 'Password' })}
              children={<Input disabled type='password' value='admin'/>}
            />
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
