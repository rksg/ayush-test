import { Col, Form, Row, Space }     from 'antd'
import { omit, sumBy }               from 'lodash'
import { useIntl, FormattedMessage } from 'react-intl'

import { useGetVenueQuery }                                                                           from '@acx-ui/rc/services'
import { ApIncompatibleFeature, CompatibilityDeviceEnum, IncompatibilityFeatures, CompatibilityType } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                 from '@acx-ui/react-router-dom'

import { FeatureItem }    from './FeatureItem'
import { messageMapping } from './messageMapping'

export type CompatibilityItemProps = {
  compatibilityType: CompatibilityType,
  deviceType: CompatibilityDeviceEnum,
  data: ApIncompatibleFeature[],
  totalDevices?: number,
  venueId?: string,
  venueName?: string,
  featureName?: IncompatibilityFeatures,
}

export const CompatibilityItem = (props: CompatibilityItemProps) => {
  const {
    deviceType,
    data = [],
    totalDevices = 0,
    featureName
  } = props

  const description = useDescription(omit(props, 'data'))

  const getFeatures = (items: ApIncompatibleFeature[]) => {
    const isMultipleFeatures = items.length > 1
    return items?.map((itemDetail) => {
      const incompatible = sumBy(itemDetail.incompatibleDevices, (d) => d.count)

      return <FeatureItem
        key={itemDetail.featureName}
        isMultiple={!featureName || isMultipleFeatures}
        deviceType={deviceType}
        data={itemDetail}
        incompatible={incompatible}
        total={totalDevices}
      />
    })
  }

  return (
    <Row>
      <Col span={24}>
        <Form.Item>
          {description}
        </Form.Item>
        <Space size='large' direction='vertical'>
          {getFeatures(data)}
        </Space>
      </Col>
    </Row>
  )
}

const useDescription = (props: Omit<CompatibilityItemProps, 'data'>) => {
  const { $t } = useIntl()
  const { compatibilityType, deviceType, featureName, venueId, venueName } = props
  const isVenueLevel = compatibilityType === CompatibilityType.VENUE
  const isFeatureLevel = compatibilityType === CompatibilityType.FEATURE

  const apFwLink = <TenantLink to='/administration/fwVersionMgmt/apFirmware'>
    { $t({ defaultMessage: 'Administration > Version Management > AP Firmware' }) }
  </TenantLink>
  const edgeFwLink = <TenantLink to='/administration/fwVersionMgmt/edgeFirmware'>
    { $t({ defaultMessage: 'Administration > Version Management > SmartEdge Firmware' }) }
  </TenantLink>

  const { data: venueData } = useGetVenueQuery({ params: { venueId } },
    { skip: !isFeatureLevel || !featureName || !venueId || !!venueName })

  const singleFeatureOnDevice = <FormattedMessage
    // eslint-disable-next-line max-len
    {...(deviceType === CompatibilityDeviceEnum.AP ? messageMapping.singleApFeature : messageMapping.singleEdgeFeature)}
    values={{
      b: (txt) => <b>{txt}</b>,
      featureName: featureName ?? '',
      apFwLink,
      edgeFwLink
    }}/>

  const singleApFeatureOnVenue = <FormattedMessage
    {...messageMapping.singleFromVenueAp}
    values={{
      b: (txt) => <b>{txt}</b>,
      featureName: featureName ?? '',
      venueName: venueData?.name || venueName,
      apFwLink
    }}/>

  const singleFeatureTitle = (venueId || venueName) ? singleApFeatureOnVenue : singleFeatureOnDevice

  const multipleTitle = <FormattedMessage
    {...(isVenueLevel
    // eslint-disable-next-line max-len
      ? (deviceType === CompatibilityDeviceEnum.AP ? messageMapping.multipleFromVenueAp : messageMapping.multipleFromVenueEdge)
    // eslint-disable-next-line max-len
      : (deviceType === CompatibilityDeviceEnum.AP ? messageMapping.multipleFromAp : messageMapping.multipleFromEdge))}
    values={{
      b: (txt) => <b>{txt}</b>,
      apFwLink,
      edgeFwLink
    }}/>

  return (!isVenueLevel && !!featureName) ? singleFeatureTitle : multipleTitle
}