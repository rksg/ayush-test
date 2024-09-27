import { useEffect, useState } from 'react'

import { Col, Form, Input, Row, Select } from 'antd'
import { useWatch }                      from 'antd/lib/form/Form'
import TextArea                          from 'antd/lib/input/TextArea'
import { useIntl }                       from 'react-intl'

import { Alert, Loader, useStepFormContext } from '@acx-ui/components'
import { Features }                          from '@acx-ui/feature-toggle'
import {
  useGetEdgeClusterListQuery,
  useGetEdgeFeatureSetsQuery,
  useGetVenueEdgeFirmwareListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import { EdgeGeneralSetting, edgeSerialNumberValidator, isOtpEnrollmentRequired } from '@acx-ui/rc/utils'
import { useParams }                                                              from '@acx-ui/react-router-dom'
import { compareVersions }                                                        from '@acx-ui/utils'

import { FwDescription, FwVersion } from '../EdgeFormItem/EdgeClusterSettingForm/styledComponents'
import { useIsEdgeFeatureReady }    from '../useEdgeActions'


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
const haAaFeatureRequirementPayload = {
  filters: {
    featureNames: ['HA-AA']
  }
}

export const EdgeSettingForm = (props: EdgeSettingFormProps) => {

  const { $t } = useIntl()
  const params = useParams()
  const isEdgeHaEnabled = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
  const isEdgeHaAaEnabled = useIsEdgeFeatureReady(Features.EDGE_HA_AA_TOGGLE)
  const [showOtpMessage, setShowOtpMessage] = useState(false)
  // const [addClusterDrawerVisible, setAddClusterDrawerVisible] = useState(false)
  const { form } = useStepFormContext<EdgeGeneralSetting>()
  const serialNumber = useWatch('serialNumber', form)
  const venueId = useWatch('venueId', form) as string
  const { venueOptions, isLoading: isVenuesListLoading } = useVenuesListQuery({ params:
    { tenantId: params.tenantId }, payload: venueOptionsDefaultPayload }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        venueOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
        isLoading
      }
    }
  })
  const { requiredFw } = useGetEdgeFeatureSetsQuery({
    params: { tenantId: params.tenantId }, payload: haAaFeatureRequirementPayload }, {
    selectFromResult: ({ data }) => {
      return {
        requiredFw: data?.featureSets?.find(item => item.featureName === 'HA-AA')?.requiredFw
      }
    }
  })
  const { data: venueFirmwareList } = useGetVenueEdgeFirmwareListQuery({})
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

  const getVenueFirmware = (venueId: string) => {
    return venueFirmwareList?.find(item => item.id === venueId)?.versions?.[0]?.id
  }

  const isAaSupportedByVenue = () => {
    let venueVersion = getVenueFirmware(venueId)
    return Boolean(requiredFw && venueVersion && compareVersions(venueVersion, requiredFw) >= 0)
  }

  useEffect(() => {
    setShowOtpMessage(isOtpEnrollmentRequired(serialNumber ?? '') && !!!props.isEdit)
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
            extra={
              <div>
                <FwDescription>
                  {$t({ defaultMessage:
                    '<VenueSingular></VenueSingular> firmware version for RUCKUS Edge:'
                  })}
                </FwDescription> <FwVersion>{getVenueFirmware(venueId)}</FwVersion>
              </div>
            }
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
                extra={isEdgeHaAaEnabled ?
                  $t({
                    // eslint-disable-next-line max-len
                    defaultMessage: 'If no cluster is chosen, it automatically sets up an {haMode} HA mode cluster using RUCKUS Edge’s name by default. HA mode defaults are based on the <venueSingular></venueSingular>\'s firmware version.'
                  }, {
                    haMode: isAaSupportedByVenue() ?
                      <b>{$t({ defaultMessage: 'active-active' })}</b> :
                      <b>{$t({ defaultMessage: 'active-standby' })}</b>
                  }) :
                  // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'If no cluster is chosen, it automatically sets up a default cluster using RUCKUS Edge’s name by default.' })
                }
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
            label={$t({ defaultMessage: 'RUCKUS Edge Name' })}
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
          your email address or via SMS for verification when you add a virtual RUCKUS Edge.
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
