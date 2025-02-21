import { useEffect, useState, useCallback } from 'react'

import { Col, Form, Input, Row, Select } from 'antd'
import { useWatch }                      from 'antd/lib/form/Form'
import TextArea                          from 'antd/lib/input/TextArea'
import { find }                          from 'lodash'
import { useIntl }                       from 'react-intl'

import { Alert, Loader, useStepFormContext } from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import {
  useGetEdgeClusterListQuery,
  useGetEdgeFeatureSetsQuery,
  useGetVenueEdgeFirmwareListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  EdgeGeneralSetting,
  edgeSerialNumberValidator,
  isOtpEnrollmentRequired,
  IncompatibilityFeatures,
  ClusterHighAvailabilityModeEnum
} from '@acx-ui/rc/utils'
import { compareVersions } from '@acx-ui/utils'

import { EdgeCompatibilityDrawer, EdgeCompatibilityType } from '../Compatibility/Edge/EdgeCompatibilityDrawer'
import { HaModeRadioGroupFormItem }                       from '../EdgeFormItem/EdgeClusterSettingForm/HaModeRadioGroupFormItem'
import { FwDescription, FwVersion }                       from '../EdgeFormItem/EdgeClusterSettingForm/styledComponents'
import { useIsEdgeFeatureReady }                          from '../useEdgeActions'

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
    'clusterId',
    'venueId',
    'highAvailabilityMode'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  pageSize: 10000
}
const haAaFeatureRequirementPayload = {
  filters: {
    featureNames: [IncompatibilityFeatures.HA_AA]
  }
}

export const EdgeSettingForm = (props: EdgeSettingFormProps) => {

  const { $t } = useIntl()
  const { isEdit, isFetching } = props

  const isEdgeHaEnabled = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
  const isEdgeHaAaEnabled = useIsEdgeFeatureReady(Features.EDGE_HA_AA_TOGGLE)
  // cannot use useIsEdgeFeatureReady(EDGE_PIN_ENHANCE_TOGGLE), it is tied to Platinum tier
  const isEdgePinEnhanceEnabled = useIsSplitOn(Features.EDGE_PIN_ENHANCE_TOGGLE)

  const [showOtpMessage, setShowOtpMessage] = useState(false)
  // eslint-disable-next-line max-len
  const [edgeCompatibilityFeature, setEdgeCompatibilityFeature] = useState<IncompatibilityFeatures | undefined>()

  const { form } = useStepFormContext<EdgeGeneralSetting>()
  const serialNumber = useWatch('serialNumber', form)
  const venueId = useWatch('venueId', form) as string

  const { venueOptions, isLoading: isVenuesListLoading } = useVenuesListQuery({
    payload: venueOptionsDefaultPayload }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        venueOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
        isLoading
      }
    }
  })
  const { requiredFw } = useGetEdgeFeatureSetsQuery({
    payload: haAaFeatureRequirementPayload }, {
    refetchOnMountOrArgChange: false,
    selectFromResult: ({ data }) => {
      return {
        // eslint-disable-next-line max-len
        requiredFw: data?.featureSets?.find(item => item.featureName === IncompatibilityFeatures.HA_AA)?.requiredFw
      }
    }
  })

  const { data: venueFirmwareList } = useGetVenueEdgeFirmwareListQuery({})
  const {
    clusterList,
    clusterOptions,
    isLoading: isClusterListLoading
  } = useGetEdgeClusterListQuery(
    { payload: clusterOptionsDefaultPayload },
    {
      skip: !isEdgeHaEnabled,
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterList: data?.data,
          clusterOptions: data?.data.map(item => ({
            label: item.name,
            value: item.clusterId,
            venueId: item.venueId
          })),
          isLoading
        }
      }
    })

  const getVenueFirmware = useCallback((vId: string) => {
    return venueFirmwareList?.find(item => item.id === vId)?.versions?.[0]?.id
  }, [venueFirmwareList])

  const isAaSupportedByVenue = (vId: string) => {
    let venueVersion = getVenueFirmware(vId)
    return Boolean(requiredFw && venueVersion && compareVersions(venueVersion, requiredFw) >= 0)
  }

  const getVenueHaMode = (vId: string) => {
    return isAaSupportedByVenue(vId)
      ? ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE
      : ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY
  }

  const onVenueChange = (selectedVenueId: string) => {
    // reset clusterId when venue is changed
    form.setFieldValue('clusterId', undefined)

    form.setFieldValue('highAvailabilityMode', getVenueHaMode(selectedVenueId))
  }

  const onClusterChnage = (selectedClusterId: string) => {
    const targetCluster = find(clusterList, { clusterId: selectedClusterId })
    let venueHaMode: ClusterHighAvailabilityModeEnum | undefined

    if (venueId) {
      venueHaMode = getVenueHaMode(venueId)
    } else {
      // default select cluster's venue when no venue is selected
      form.setFieldValue('venueId', targetCluster?.venueId)
    }

    // should apply cluster's ha mode
    const clusterHaMode = targetCluster?.highAvailabilityMode
    form.setFieldValue('highAvailabilityMode', clusterHaMode ?? venueHaMode)
  }

  useEffect(() => {
    setShowOtpMessage(isOtpEnrollmentRequired(serialNumber ?? '') && !!!isEdit)
  }, [serialNumber])

  return (<>
    <Loader states={[{
      isLoading: isVenuesListLoading || isClusterListLoading,
      isFetching: isFetching
    }]}>
      <Row gutter={9} align='middle'>
        <Col span={23}>
          <Form.Item
            name='venueId'
            label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
            rules={[{
              required: true
            }]}
            extra={<>
              <FwDescription>
                {$t({ defaultMessage:
                    '<VenueSingular></VenueSingular> firmware version for RUCKUS Edge:'
                })}
              </FwDescription>
              <FwVersion>{getVenueFirmware(venueId)}</FwVersion>
            </>}
          >
            <Select
              options={venueOptions}
              disabled={isEdit}
              onChange={isEdgePinEnhanceEnabled ? onVenueChange : undefined}
            />
          </Form.Item>
        </Col>

        {isEdgeHaEnabled &&
          <Col span={23}>
            <Form.Item
              name='clusterId'
              label={$t({ defaultMessage: 'Cluster' })}
              extra={isEdgeHaAaEnabled ?
                $t({
                  // eslint-disable-next-line max-len
                  defaultMessage: 'If no cluster is chosen, it automatically sets up an {haMode} HA mode cluster using RUCKUS Edge’s name by default. HA mode defaults are based on the <venueSingular></venueSingular>\'s firmware version.'
                }, {
                  haMode: isAaSupportedByVenue(venueId) ?
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
                  value: ''
                },
                ...((clusterOptions ? clusterOptions : []).filter(cluster =>
                  !venueId || cluster.venueId === venueId))
              ]}
              disabled={isEdit}
              onChange={isEdgePinEnhanceEnabled ? onClusterChnage : undefined}
              />
            </Form.Item>
          </Col>}

        {isEdgePinEnhanceEnabled &&
        <Row style={{ marginTop: 8, paddingLeft: '4.5px' }}>
          <Col span={24}>
            <Form.Item
              noStyle
              // `venueId` will be changed by useWatch()
              dependencies={['clusterId']}
            >
              {({ getFieldValue }) => {
                const disabled = !!getFieldValue('clusterId') || !isAaSupportedByVenue(venueId)

                return <HaModeRadioGroupFormItem
                  setEdgeCompatibilityModalFeature={setEdgeCompatibilityFeature}
                  disabled={disabled}
                  editMode={isEdit}
                />
              }}
            </Form.Item>
          </Col>
        </Row>}

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
              isEdit ? {} : { validator: (_, value) => edgeSerialNumberValidator(value) }
            ]}
            children={<Input disabled={isEdit} />}
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
          process before using it.` })}
        type='info'
        showIcon /> :
        null}
    </Loader>
    {edgeCompatibilityFeature && <EdgeCompatibilityDrawer
      visible
      type={EdgeCompatibilityType.ALONE}
      title={$t({ defaultMessage: 'Compatibility Requirement' })}
      featureName={edgeCompatibilityFeature}
      onClose={() => setEdgeCompatibilityFeature(undefined)}
    />}
  </>)
}