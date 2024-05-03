import { useEffect, useState } from 'react'

import { Col, Form, Input, Row, Select } from 'antd'
import { useWatch }                      from 'antd/lib/form/Form'
import TextArea                          from 'antd/lib/input/TextArea'
import { useIntl }                       from 'react-intl'

import { Alert, Loader, useStepFormContext }              from '@acx-ui/components'
import { Features, useIsSplitOn }                         from '@acx-ui/feature-toggle'
import { useGetEdgeClusterListQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import { EdgeGeneralSetting, edgeSerialNumberValidator }  from '@acx-ui/rc/utils'
import { useParams }                                      from '@acx-ui/react-router-dom'


interface EdgeSettingFormProps {
  isEdit?: boolean
  isFetching?: boolean
}

const venueOptionsDefaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  pageSize: 10000
}
const clusterOptionsDefaultPayload = {
  searchString: '',
  fields: [
    'name',
    'clusterId'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  pageSize: 10000
}

export const EdgeSettingForm = (props: EdgeSettingFormProps) => {

  const { $t } = useIntl()
  const params = useParams()
  const isEdgeHaEnabled = useIsSplitOn(Features.EDGE_HA_TOGGLE)
  const [showOtpMessage, setShowOtpMessage] = useState(false)
  // const [addClusterDrawerVisible, setAddClusterDrawerVisible] = useState(false)
  const { form } = useStepFormContext<EdgeGeneralSetting>()
  const serialNumber = useWatch('serialNumber', form)
  // const venueId = useWatch('venueId', form)
  const { venueOptions, isLoading: isVenuesListLoading } = useVenuesListQuery({ params:
    { tenantId: params.tenantId }, payload: venueOptionsDefaultPayload }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        venueOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
        isLoading
      }
    }
  })
  const { clusterOptions, isLoading: isClusterListLoading } = useGetEdgeClusterListQuery(
    { payload: clusterOptionsDefaultPayload },
    {
      skip: !isEdgeHaEnabled,
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterOptions: data?.data.map(item => ({ label: item.name, value: item.clusterId })),
          isLoading
        }
      }
    })

  useEffect(() => {
    setShowOtpMessage(!!serialNumber?.startsWith('96') && !!!props.isEdit)
  }, [serialNumber])

  return (
    <Loader states={[{
      isLoading: isVenuesListLoading || isClusterListLoading,
      isFetching: props.isFetching
    }]}>
      <Row gutter={9} align='middle'>
        <Col span={23}>
          <Form.Item
            name='venueId'
            label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
            rules={[{
              required: true
            }]}
          >
            <Select options={venueOptions} disabled={props.isEdit}/>
          </Form.Item>
        </Col>

        {
          isEdgeHaEnabled &&
          <>
            <Col span={23}>
              <Form.Item
                name='clusterId'
                label={$t({ defaultMessage: 'Cluster' })}
              >
                <Select options={[
                  {
                    label: $t({ defaultMessage: 'Select...' }),
                    value: null
                  },
                  ...(clusterOptions ? clusterOptions : [])
                ]}
                disabled={props.isEdit}
                />
              </Form.Item>
            </Col>
            {
              // !props.isEdit &&
              // <Col span={1}>
              //   <Button
              //     type='link'
              //     children={$t({ defaultMessage: 'Add' })}
              //     onClick={() => setAddClusterDrawerVisible(true)}
              //   />
              // </Col>
            }
            {/* <AddClusterDrawer
              visible={addClusterDrawerVisible}
              setVisible={setAddClusterDrawerVisible}
              venueId={venueId}
            /> */}
          </>
        }
        <Col span={23}>
          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'SmartEdge Name' })}
            rules={[
              { required: true },
              { max: 64 }
            ]}
            children={<Input />}
            validateFirst
          />
        </Col>
        <Col span={23}>
          <Form.Item
            name='serialNumber'
            label={$t({ defaultMessage: 'Serial Number' })}
            rules={[
              {
                required: true,
                message: $t({ defaultMessage: 'Please enter Serial Number' })
              },
              props.isEdit ? {} : { validator: (_, value) => edgeSerialNumberValidator(value) }
            ]}
            children={<Input disabled={props.isEdit} />}
            validateFirst
          />
        </Col>
        <Col span={23}>
          <Form.Item
            name='description'
            label={$t({ defaultMessage: 'Description' })}
            children={<TextArea rows={4} maxLength={255} />}
          />
        </Col>
        {/* <Form.Item
        name='tags'
        label={$t({ defaultMessage: 'Tags' })}
        children={<Select mode='tags' />}
      /> */}
      </Row>
      {showOtpMessage ?
        <Alert message={
          $t({ defaultMessage: `The one-time-password (OTP) will be automatically sent to
          your email address or via SMS for verification when you add a virtual SmartEdge.
          The password will expire in 10 minutes and you must complete the authentication
          process before using it.` })
        }
        type='info'
        showIcon /> :
        null
      }
    </Loader>
  )
}
