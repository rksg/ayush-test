/* eslint-disable max-len */
import { useState, useEffect } from 'react'

import { Divider, Form }             from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Drawer,  Loader }                        from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import {
  useGetApModelFamiliesQuery,
  useGetVenueQuery,
  useLazyGetEnhanceApFeatureSetsQuery,
  useLazyGetVenuePreCheckApCompatibilitiesQuery
} from '@acx-ui/rc/services'
import {
  ApCompatibility,
  ApRequirement,
  Compatibility,
  CompatibilityResponse,
  IncompatibleFeature,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { ApModelFamiliesItem } from '../../Compatibility/CompatibilityDrawer/CompatibilityItem/ApModelFamiliesItem'
import {
  StyledFeatureName,
  StyledRequirementWrapper,
  StyledFormItem
} from '../../Compatibility/CompatibilityDrawer/styledComponents'
import { getApFirmwareLink }                            from '../../Compatibility/CompatibilityDrawer/utils'
import { SpaceWrapper }                                 from '../../SpaceWrapper'
import { ApCompatibilityType, InCompatibilityFeatures } from '../constants'

export type ApModelCompatibilityDrawerProps = {
  visible: boolean,
  type?: ApCompatibilityType,
  isMultiple?: boolean,
  isRequirement?: boolean,
  venueId?: string,
  venueName?: string,
  networkId?: string,
  apName?: string,
  featureNames?: InCompatibilityFeatures[],
  networkIds?: string[],
  apIds?: string[],
  venueIds?: string[],
  data?: ApCompatibility[] | Compatibility[],
  onClose: () => void
}

/*
Sample 1: Open drawer and then fetch data
  <ApModelCompatibilityDrawer
    visible={drawerVisible}
    type={ApCompatibilityType.VENUE}
    venueId={venueId}
    featureName={InCompatibilityFeatures.BETA_DPSK3}
    venueName={venueData?.name ?? ''}
    onClose={() => setDrawerVisible(false)}
  />

Sample 2: Display data on drawer
  <ApModelCompatibilityDrawer
    isMultiple
    type={ApCompatibilityType.VENUE}
    visible={drawerVisible}
    data={apCompatibility}
    onClose={() => setDrawerVisible(false)}
  />
*/

export const ApModelCompatibilityDrawer = (props: ApModelCompatibilityDrawerProps) => {
  const isBranchLevelSupportedModelsEnabled = useIsSplitOn(Features.WIFI_EDA_BRANCH_LEVEL_SUPPORTED_MODELS_TOGGLE)

  const {
    visible, type=ApCompatibilityType.VENUE, isMultiple=false,
    isRequirement=false,
    venueId, venueName, featureNames,
    apName, data=[]
  } = props

  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { tenantId } = useParams()
  const { isTemplate } = useConfigTemplate()
  const [ isInitializing, setIsInitializing ] = useState(data?.length === 0)
  const [ apCompatibilities, setApCompatibilities ] = useState<Compatibility[] | Compatibility[]>(data)
  const { data: venueData } = useGetVenueQuery({ params: { tenantId, venueId } }, { skip: !venueId })
  const { data: apModelFamilies } = useGetApModelFamiliesQuery({}, {
    skip: !isBranchLevelSupportedModelsEnabled,
    refetchOnMountOrArgChange: false
  })

  // old API
  //const [ getApCompatibilitiesVenue ] = useLazyGetApCompatibilitiesVenueQuery()
  //const [ getApCompatibilitiesNetwork ] = useLazyGetApCompatibilitiesNetworkQuery()
  //const [ getApFeatureSets ] = useLazyGetApFeatureSetsQuery()

  // new API
  const [ getVenuePerCheckApCompatibilities] = useLazyGetVenuePreCheckApCompatibilitiesQuery()
  const [ getApFeatureSets ] = useLazyGetEnhanceApFeatureSetsQuery()

  const currentType = isTemplate ? ApCompatibilityType.ALONE : type
  const apNameTitle = (apName) ? `: ${apName}` : ''

  const title = (!isMultiple || isRequirement)
    ? $t({ defaultMessage: 'Compatibility Requirement' })
    : ($t({ defaultMessage: 'Incompatibility Details' }) + apNameTitle)

  const multipleFromAp = <FormattedMessage
    defaultMessage={
      'The following features are not enabled on this access point due to <b>firmware</b> or <b>device ' +
      'incompatibility</b>. Please see the minimum firmware versions required below. Also note that ' +
      'not all features are available on all access points. You may upgrade your firmware from '
    }
    values={{
      b: (text: string) => <strong>{text}</strong>
    }} />

  const multipleFromVenue = $t({
    defaultMessage:
    'Some features are not enabled on specific access points in this <venueSingular></venueSingular> due to ' +
    'firmware or device incompatibility. Please see the minimum firmware versions required below. ' +
    'Also note that not all features are available on all access points. You may upgrade your firmware from '
  })

  const multipleFeatureFromVenueAp = <FormattedMessage
    defaultMessage={
      'Please ensure that the access points in the <venueSingular></venueSingular> (<b>{venueName}</b>) '+
      'meet the minimum required version and AP model support list below for both {featureNames} requirements. '+
      'You may upgrade your firmware from '
    }
    values={{
      b: (text: string) => <strong>{text}</strong>,
      venueName: venueData?.name ?? venueName,
      featureNames: featureNames?.join(' and ')
    }} />

  const singleFromNetwork= <FormattedMessage
    defaultMessage={
      'To use the <b>{featureName}</b> feature, ensure that the access points meet the minimum '+
      'required version and AP model support list below. You may upgrade your firmware from '
    }
    values={{
      b: (text: string) => <strong>{text}</strong>,
      featureName: featureNames?.join(', ')
    }} />

  const singleFromVenue = <FormattedMessage
    defaultMessage={
      'To use the <b>{featureName}</b> feature, ensure that the access points on the <venueSingular></venueSingular> ' +
      '(<b>{venueName}</b>) meet the minimum required version and AP model support list below. You may upgrade your firmware from '
    }
    values={{
      b: (text: string) => <strong>{text}</strong>,
      featureName: featureNames?.join(', '),
      venueName: venueData?.name ?? venueName
    }} />

  const multipleTitle = apName ? multipleFromAp :
    (isRequirement ? multipleFeatureFromVenueAp : multipleFromVenue)
  const singleTitle = (ApCompatibilityType.VENUE === currentType)
    ? singleFromVenue : singleFromNetwork

  const contentTxt = isMultiple ? multipleTitle : singleTitle

  const getCompatibilities = async () => {
    if (ApCompatibilityType.NETWORK === currentType) {
      /*
      return getApCompatibilitiesNetwork({
        params: { networkId },
        payload: { filters: { apIds, venueIds } }
      }).unwrap()
      */

    } else if (ApCompatibilityType.VENUE === currentType) {
      const venueApCompatibilities = await getVenuePerCheckApCompatibilities({
        params: { venueId },
        payload: {
          filters: {
            venueIds: [venueId],
            featureNames: featureNames
          },
          page: 1,
          pageSize: 10
        }
      }).unwrap()

      const incompatible = venueApCompatibilities?.compatibilities?.[0]?.incompatible ?? 0
      if (incompatible > 0) {
        return venueApCompatibilities
      }
    }

    const apFeatureSetsResponse = await getApFeatureSets({
      params: {},
      payload: {
        filters: {
          featureNames: featureNames
        },
        page: 1,
        pageSize: 10
      }
    }).unwrap()
    const apFeatureSets = apFeatureSetsResponse.featureSets
    const apIncompatibleFeatures = apFeatureSets.map((featureSet) => {
      return {
        ...featureSet,
        incompatibleDevices: []
      } as IncompatibleFeature
    })

    const compatibility = {
      id: 'ApFeatureSet',
      incompatibleFeatures: apIncompatibleFeatures,
      incompatible: 0,
      total: 0
    } as Compatibility
    return { compatibilities: [compatibility] } as CompatibilityResponse
  }

  useEffect(() => {
    if (visible && data?.length === 0 && apCompatibilities?.length === 0) {
      const fetchApCompatibilities = async () => {
        try {
          const compatibilitiesResponse = await getCompatibilities()
          setApCompatibilities(compatibilitiesResponse?.compatibilities)
          setIsInitializing(false)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('ApCompatibilityDrawer api error:', e)
        }
      }
      fetchApCompatibilities()
    }
  }, [visible, apCompatibilities])

  useEffect(() => {
    if (isInitializing && data?.length !== 0) {
      setIsInitializing(false)
      setApCompatibilities(data)
    }
  }, [data])

  const getItems = (items: Compatibility[]) => items?.map((item: Compatibility, index) => {
    const { incompatibleFeatures } = item
    return incompatibleFeatures?.map((itemDetail, id: number) => (
      <>
      {isRequirement && (id !== 0) && <Divider/>}
      <div key={`incompatibleFeatures_${item.id}`}>
        {isMultiple &&
          <Form.Item>
            <StyledFeatureName>
              {itemDetail?.featureName}
            </StyledFeatureName>
          </Form.Item>
        }
        {!apName && currentType !== ApCompatibilityType.ALONE &&
          <StyledFormItem
            label={$t({
              defaultMessage: 'Incompatible Access Points (Currently)'
            })}
          >
            {`${item?.incompatible}`}
          </StyledFormItem>
        }

        <SpaceWrapper size={8} direction='vertical' fullWidth>
          {itemDetail?.requirements?.map((requirement: ApRequirement, reqIndex) => (
            <StyledRequirementWrapper key={`requirements_${item.id}_${index}_${reqIndex}`}>
              <StyledFormItem
                label={$t({ defaultMessage: 'Minimum required version' })}
              >
                {requirement?.firmware}
              </StyledFormItem>
              <StyledFormItem
                label={$t({ defaultMessage: 'Supported AP Models' })}
              >
                {apModelFamilies && requirement?.models &&
                <ApModelFamiliesItem
                  apModelFamilies={apModelFamilies}
                  models={requirement.models}
                />
                }
              </StyledFormItem>
            </StyledRequirementWrapper>
          ))}
        </SpaceWrapper>
      </div>
      </>
    ))
  })

  const getContent = (items: Compatibility[]) => (
    <Loader
      states={[ { isLoading: isInitializing } ]}
    >
      <Form layout='vertical' form={form} data-testid='apCompatibility-form'>
        <Form.Item>
          {contentTxt} {getApFirmwareLink()}
        </Form.Item>
        {getItems(items)}
      </Form>
    </Loader>
  )

  return (
    <Drawer
      data-testid={'ap-compatibility-drawer'}
      title={title}
      visible={visible}
      closable={true}
      onClose={props.onClose}
      children={getContent(apCompatibilities)}
      destroyOnClose={true}
      width={'500px'}
    />
  )
}
