import { Form, Row }              from 'antd'
import { omit, sumBy }            from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import { useGetVenueQuery }      from '@acx-ui/rc/services'
import { ApIncompatibleFeature } from '@acx-ui/rc/utils'
import { TenantLink }            from '@acx-ui/react-router-dom'

import { CompatibilityType, InCompatibilityFeatures } from '../constants'

import { CompatibilityRequiredItem } from './CompatibilityRequiredItem'

export type CompatibilityItemProps = {
  type: CompatibilityType,
  data: ApIncompatibleFeature[],
  totalDevices?: number,
  venueId?: string,
  venueName?: string,
  featureName?: InCompatibilityFeatures,
}

export const CompatibilityItem = (props: CompatibilityItemProps) => {
  const { $t } = useIntl()
  const {
    type = CompatibilityType.VENUE,
    data = [],
    totalDevices = 0,
    featureName
  } = props

  const description = useDescription(omit(props, 'data'))

  const getFeatures = (items: ApIncompatibleFeature[]) => {
    return items?.map((itemDetail) => {
      const incompatible = sumBy(itemDetail.incompatibleDevices, (d) => d.count)

      return <CompatibilityRequiredItem
        key={itemDetail.featureName}
        isMultiple={!featureName}
        type={type}
        data={itemDetail}
        incompatible={incompatible}
        total={totalDevices}
      />
    })
  }

  return (
    <Row>
      <Form.Item>
        {description}
        <TenantLink to='/administration/fwVersionMgmt'>
          { $t({ defaultMessage: 'Administration > Version Management > AP Firmware' }) }
        </TenantLink>
      </Form.Item>
      {getFeatures(data)}
    </Row>
  )
}


const messageMapping = {
  multipleFromAp: defineMessage({ defaultMessage:
  'The following features are not enabled on this access point due to firmware or device ' +
  'incompatibility. Please see the minimum firmware versions required below. Also note that ' +
  'not all features are available on all access points. You may upgrade your firmware from'
  }),
  multipleFromEdge: defineMessage({ defaultMessage:
    'The following features are not enabled on this SmartEdge due to firmware or device ' +
    'incompatibility. Please see the minimum firmware versions required below. Also note that ' +
    'not all features are available on all SmartEdges. You may upgrade your firmware from'
  }),
  multipleFromVenue: defineMessage({ defaultMessage:
  // eslint-disable-next-line max-len
  'Some features are not enabled on specific access points in this <venueSingular></venueSingular> due to ' +
  'firmware or device incompatibility. Please see the minimum firmware versions required below. ' +
  // eslint-disable-next-line max-len
  'Also note that not all features are available on all access points. You may upgrade your firmware from '
  }),
  singleApFeature: defineMessage({ defaultMessage:
  'To utilize the {featureName}, ensure that the access points meet the minimum '+
  'required version and AP model support list below. You may upgrade your firmware from'
  }),
  singleEdgeFeature: defineMessage({ defaultMessage:
    'To utilize the {featureName}, ensure that the SmartEdges meet the minimum '+
    'required version. You may upgrade your firmware from'
  }),
  singleFromVenue: defineMessage({ defaultMessage:
    // eslint-disable-next-line max-len
    'To utilize the {featureName}, ensure that the access points on the <venueSingular></venueSingular> ' +
    // eslint-disable-next-line max-len
    '({venueName}) meet the minimum required version and AP model support list below. You may upgrade your firmware from '
  })
}

const useDescription = (props: Omit<CompatibilityItemProps, 'data'>) => {
  const { $t } = useIntl()
  const { type, featureName, venueId, venueName } = props

  const { data: venueData } = useGetVenueQuery({ params: { venueId } }, { skip: !venueId })

  const singleFromFeature = $t(type === CompatibilityType.AP
    ? messageMapping.singleApFeature
    : messageMapping.singleEdgeFeature, { featureName: featureName ?? '' })

  const singleFromVenue = $t(messageMapping.singleFromVenue,
    { featureName: featureName ?? '', venueName: venueId ? venueData?.name : venueName })

  const multipleTitle = type === CompatibilityType.VENUE
    ? $t(messageMapping.multipleFromVenue)
    : $t(type === CompatibilityType.AP
      ? messageMapping.multipleFromAp
      : messageMapping.multipleFromEdge)

  const singleTitle = (CompatibilityType.VENUE === type)
    ? singleFromVenue : singleFromFeature

  return featureName ? singleTitle : multipleTitle
}