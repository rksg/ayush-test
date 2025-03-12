import { Divider, Form, Row, Space } from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { ApCompatibility, CompatibilityDeviceEnum, IncompatibilityFeatures, getCompatibilityDeviceTypeDisplayName, getCompatibilityFeatureDisplayName } from '@acx-ui/rc/utils'

import { CompatibilityItem }           from './CompatibilityItem'
import { messageMapping }              from './messageMapping'
import { StyledDeviceTypeTitle }       from './styledComponents'
import { getFirmwareLinkByDeviceType } from './utils'

interface FeatureCrossDeviceTypeCompatibilityProps {
  data: Record<CompatibilityDeviceEnum, ApCompatibility>
  featureName: IncompatibilityFeatures,
}

// eslint-disable-next-line max-len
export const FeatureCrossDeviceTypeCompatibility = (props: FeatureCrossDeviceTypeCompatibilityProps) => {
  const { $t, formatList } = useIntl()
  const { data, ...others } = props
  const typeDeviceMap = {
    [CompatibilityDeviceEnum.AP]: $t({ defaultMessage: 'access points' }),
    [CompatibilityDeviceEnum.EDGE]: $t({ defaultMessage: 'RUCKUS Edges' }),
    [CompatibilityDeviceEnum.SWITCH]: $t({ defaultMessage: 'switches' })
  }

  const deviceTypes = Object.keys(data) as CompatibilityDeviceEnum[]
  const deviceTypesDeviceName = deviceTypes.map((key) => typeDeviceMap[key])

  const description = <FormattedMessage
    {...messageMapping.singleFeatureCrossDeviceType}
    values={{
      b: (txt) => <b>{txt}</b>,
      featureName: getCompatibilityFeatureDisplayName(others.featureName),
      deviceTypes: formatList(deviceTypesDeviceName, { type: 'conjunction' })
    }}
  />

  const isCrossDeviceType = deviceTypes.length > 1

  return <>
    <Form.Item>
      {description}
    </Form.Item>
    <Space direction='vertical' size={0} split={<Divider style={{ margin: '20px 0 0' }}/>}>
      {deviceTypes.map((typeName) => {
        const typeData = data[typeName]
        const hasValidData = !!typeData?.incompatibleFeatures?.length
        const firmwareLink = getFirmwareLinkByDeviceType(typeName as CompatibilityDeviceEnum)

        return hasValidData && <div key={typeName}>
          { isCrossDeviceType && <Row>
            <StyledDeviceTypeTitle>
              {getCompatibilityDeviceTypeDisplayName(typeName as CompatibilityDeviceEnum)}
            </StyledDeviceTypeTitle>
          </Row>
          }
          <CompatibilityItem
            description=''
            data={typeData.incompatibleFeatures ?? []}
            deviceType={typeName as CompatibilityDeviceEnum}
            totalDevices={typeData.total}
            isCrossDeviceType={isCrossDeviceType}
            {...others}
          />
          <FormattedMessage
            defaultMessage={'You may upgrade your firmware from {firmwareLink}'}
            values={{
              firmwareLink
            }}
          />
        </div>
      })}
    </Space>
  </>
}
