import { Divider, Form, Row, Space } from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { ApCompatibility, CompatibilityDeviceEnum, IncompatibilityFeatures, getCompatibilityDeviceTypeDisplayName, getCompatibilityFeatureDisplayName } from '@acx-ui/rc/utils'

import { CompatibilityItem }           from './CompatibilityItem'
import { messageMapping }              from './messageMapping'
import { StyledDeviceTypeTitle }       from './styledComponents'
import { getFirmwareLinkByDeviceType } from './utils'

interface FeatureCrossDeviceTypeCompatibilityProps {
  data: Record<string, ApCompatibility>
  featureName: IncompatibilityFeatures,
}

// eslint-disable-next-line max-len
export const FeatureCrossDeviceTypeCompatibility = (props: FeatureCrossDeviceTypeCompatibilityProps) => {
  const { $t } = useIntl()
  const { data, ...others } = props

  const deviceTypes = Object.keys(data)
  const hasEdge = deviceTypes.includes(CompatibilityDeviceEnum.EDGE)
  const hasAp = deviceTypes.includes(CompatibilityDeviceEnum.AP)

  const isAllHas = hasEdge && hasAp

  const deviceTypesString = $t({
    defaultMessage: '{hasEdge} {hasAnd} {hasAp}' },
  {
    hasEdge: (hasEdge ? $t({ defaultMessage: 'RUCKUS Edges' }) : ''),
    hasAnd: (isAllHas ? $t({ defaultMessage: 'and' }) : ''),
    hasAp: (hasAp ? $t({ defaultMessage: 'access points' }) : '')
  })

  const description = <FormattedMessage
    {...messageMapping.singleFeatureCrossDeviceType}
    values={{
      b: (txt) => <b>{txt}</b>,
      featureName: getCompatibilityFeatureDisplayName(others.featureName),
      deviceTypes: deviceTypesString
    }}
  />

  const isCrossDeviceType = deviceTypes.length > 1

  return <>
    <Form.Item>
      {description}
    </Form.Item>
    <Space direction='vertical' split={<Divider />}>
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