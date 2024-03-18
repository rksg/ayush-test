/* eslint-disable max-len */
import { useState, useEffect } from 'react'

import { Form, Typography }          from 'antd'
import { TooltipPlacement }          from 'antd/lib/tooltip'
import { FormattedMessage, useIntl } from 'react-intl'

import { Tooltip, Drawer, Button, Loader, cssStr } from '@acx-ui/components'
import { QuestionMarkCircleOutlined }              from '@acx-ui/icons'
import {
  useGetVenueQuery,
  useLazyGetApCompatibilitiesVenueQuery,
  useLazyGetApCompatibilitiesNetworkQuery,
  useLazyGetApFeatureSetsQuery
}   from '@acx-ui/rc/services'
import { ApCompatibility, ApCompatibilityResponse, ApIncompatibleFeature } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                           from '@acx-ui/react-router-dom'

import { ApCompatibilityType, InCompatibilityFeatures, ApCompatibilityQueryTypes }        from './constants'
import { StyledWrapper, CheckMarkCircleSolidIcon, WarningTriangleSolidIcon, UnknownIcon } from './styledComponents'

export * from './constants'

export type ApCompatibilityToolTipProps = {
  visible: boolean,
  title: string,
  onClick: () => void,
  placement?: TooltipPlacement
}

/*
Sample:
<ApCompatibilityToolTip
  title={clientAdmissionControlTitleInfo}
  visible={supportApCompatibleCheck}
  onClick={() => setDrawerVisible(true)}/>
*/
export function ApCompatibilityToolTip (props: ApCompatibilityToolTipProps) {
  const { $t } = useIntl()
  const { visible, title, onClick, placement } = props

  const compatibilityToolTipInfo = $t({
    defaultMessage:
      'See the compatibility requirements.'
  })

  return (<Tooltip
    title={
      <FormattedMessage
        defaultMessage={
          '{title}  <compatibilityToolTip></compatibilityToolTip>'
        }
        values={{
          title,
          compatibilityToolTip: ()=> (visible?<Button
            type='link'
            data-testid='tooltip-button'
            style={{ fontSize: cssStr('--acx-body-4-font-size') }}
            onClick={onClick}>
            {compatibilityToolTipInfo}
          </Button>:[])
        }}
      />
    }
    placement={placement ?? 'right'}>
    <QuestionMarkCircleOutlined
      style={{ height: '16px', width: '16px', marginBottom: -3 }}
    />
  </Tooltip>)
}

export type ApCompatibilityFeatureProps = {
  count?: number,
  onClick: () => void
}

export const ApCompatibilityFeature = (props: ApCompatibilityFeatureProps) => {
  const { $t } = useIntl()
  const { count, onClick } = props

  const fullyCompatibleTxt = $t({
    defaultMessage:
      'Fully compatible'
  })

  const partiallyIncompatibleTxt = $t({
    defaultMessage:
      'Partially incompatible'
  })

  const unknownTxt = $t({
    defaultMessage:
      'Unknown'
  })

  if (count === undefined) {
    return (
      <>
        <UnknownIcon/> {unknownTxt}
      </>
    )

  } else if (count === 0) {
    return (
      <>
        <CheckMarkCircleSolidIcon/> {fullyCompatibleTxt}
      </>
    )
  }

  return (
    <>
      <WarningTriangleSolidIcon/>
      <Button
        type='link'
        style={{ fontSize: cssStr('--acx-body-4-font-size') }}
        onClick={onClick}>
        {partiallyIncompatibleTxt}
      </Button>
    </>
  )
}

export type ApCompatibilityDrawerProps = {
  visible: boolean,
  type?: ApCompatibilityType,
  isMultiple?: boolean,
  venueId?: string,
  venueName?: string,
  networkId?: string,
  apName?: string,
  featureName?: InCompatibilityFeatures,
  networkIds?: string[],
  apIds?: string[],
  venueIds?: string[],
  queryType?: ApCompatibilityQueryTypes,
  data?: ApCompatibility[],
  onClose: () => void
}

const featureNameStyle = { fontSize: cssStr('--acx-body-3-font-size'),
  fontWeight: cssStr('--acx-body-font-weight-bold'),
  color: cssStr('--acx-primary-black'),
  marginBottm: '11px'
}

const detailStyle = { fontSize: '13px',
  lineHeight: '13px',
  minHeight: '13px'
}

/*
Sample 1: Open drawer and then fetch data
  <ApCompatibilityDrawer
    visible={drawerVisible}
    type={ApCompatibilityType.VENUE}
    venueId={venueId}
    featureName={InCompatibilityFeatures.BETA_DPSK3}
    venueName={venueData?.name ?? ''}
    queryType={ApCompatibilityQueryTypes.CHECK_VENUE_WITH_FEATURE}
    onClose={() => setDrawerVisible(false)}
  />

Sample 2: Display data on drawer
  <ApCompatibilityDrawer
    isMultiple
    type={ApCompatibilityType.VENUE}
    visible={drawerVisible}
    data={apCompatibility}
    onClose={() => setDrawerVisible(false)}
  />
*/
export const ApCompatibilityDrawer = (props: ApCompatibilityDrawerProps) => {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { tenantId } = useParams()
  const { visible, type=ApCompatibilityType.VENUE, isMultiple=false, venueId, venueName, networkId, featureName='', apName, apIds=[], networkIds=[], venueIds=[], data=[] } = props
  const [ isInitializing, setIsInitializing ] = useState(data?.length === 0)
  const [ apCompatibilities, setApCompatibilities ] = useState<ApCompatibility[]>(data)
  const { data: venueData } = useGetVenueQuery({ params: { tenantId, venueId } }, { skip: !venueId })
  const [ getApCompatibilitiesVenue ] = useLazyGetApCompatibilitiesVenueQuery()
  const [ getApCompatibilitiesNetwork ] = useLazyGetApCompatibilitiesNetworkQuery()
  const [ getApFeatureSets ] = useLazyGetApFeatureSetsQuery()

  const apNameTitle = (apName) ? `: ${apName}` : ''

  const title = isMultiple
    ? ($t({ defaultMessage: 'Incompatibility Details' }) + apNameTitle)
    : $t({ defaultMessage: 'Compatibility Requirement' })

  const multipleFromAp = $t({
    defaultMessage:
    'The following features are not enabled on this access point due to firmware or device ' +
    'incompatibility. Please see the minimum firmware versions required below. Also note that ' +
    'not all features are available on all access points. You may upgrade your firmware from'
  })

  const multipleFromVenue = $t({
    defaultMessage:
    'Some features are not enabled on specific access points in this venue due to ' +
    'firmware or device incompatibility. Please see the minimum firmware versions required below. ' +
    'Also note that not all features are available on all access points. You may upgrade your firmware from '
  })

  const singleFromNetwork= $t(
    {
      defaultMessage:
    'To utilize the {featureName}, ensure that the access points meet the minimum '+
    'required version and AP model support list below. You may upgrade your firmware from'
    },
    { featureName: featureName?.valueOf() ?? '' })

  const singleFromVenue = $t(
    {
      defaultMessage:
              'To utilize the {featureName}, ensure that the access points on the venue ' +
              '({venueName}) meet the minimum required version and AP model support list below. You may upgrade your firmware from '
    },
    { featureName: featureName?.valueOf() ?? '', venueName: venueData?.name ?? venueName })

  const multipleTitle = apName ? multipleFromAp : multipleFromVenue
  const singleTitle = (ApCompatibilityType.VENUE === type)
    ? singleFromVenue : singleFromNetwork

  const contentTxt = isMultiple ? multipleTitle : singleTitle

  const getApCompatibilities = async () => {
    if (ApCompatibilityType.NETWORK === type) {
      return getApCompatibilitiesNetwork({
        params: { networkId },
        payload: { filters: { apIds, venueIds }, feature: featureName }
      }).unwrap()
    } else if (ApCompatibilityType.VENUE === type) {
      return getApCompatibilitiesVenue({
        params: { venueId },
        payload: { filters: { apIds, networkIds }, feature: featureName }
      }).unwrap()
    }
    const apFeatureSets = await getApFeatureSets({
      params: { featureName: encodeURI(featureName) }
    }).unwrap()
    const apIncompatibleFeature = { ...apFeatureSets, incompatibleDevices: [] } as ApIncompatibleFeature
    const apCompatibility = {
      id: 'ApFeatureSet',
      incompatibleFeatures: [apIncompatibleFeature],
      incompatible: 0,
      total: 0
    } as ApCompatibility
    return { apCompatibilities: [apCompatibility] } as ApCompatibilityResponse
  }

  useEffect(() => {
    if (visible && data?.length === 0 && apCompatibilities?.length === 0) {
      const fetchApCompatibilities = async () => {
        try {
          const apCompatibilitiesResponse = await getApCompatibilities()
          setApCompatibilities(apCompatibilitiesResponse?.apCompatibilities)
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

  const getItems = (items: ApCompatibility[]) => items?.map((item: ApCompatibility, index) => {
    const { incompatibleFeatures } = item
    return incompatibleFeatures?.map((itemDetail) => (
      <StyledWrapper key={`Compatibility_${item.id}`}>
        {isMultiple &&
          <Form.Item
            key={`name_${index}`}
          >
            <Typography.Text style={featureNameStyle}>
              {itemDetail?.featureName}
            </Typography.Text>
          </Form.Item>
        }
        {itemDetail?.requiredFw &&
          <Form.Item
            key={`minfw_${index}`}
            label={$t({ defaultMessage: 'Minimum required version' })}
            style={detailStyle}
            className='ApCompatibilityDrawerFormItem'
          >
            {itemDetail?.requiredFw}
          </Form.Item>
        }
        {itemDetail?.requiredModel &&
          <Form.Item
            key={`model_${index}`}
            label={$t({ defaultMessage: 'Supported AP Model Family' })}
            style={detailStyle}
            className='ApCompatibilityDrawerFormItem'
          >
            {itemDetail?.requiredModel?.join(',')}
          </Form.Item>
        }
        {!apName && type !== ApCompatibilityType.ALONE &&
          <Form.Item
            key={`total_${index}`}
            label={$t({
              defaultMessage: 'Incompatible Access Points (Currently)'
            })}
            style={detailStyle}
            className='ApCompatibilityDrawerFormItem'
          >
            {`${item?.incompatible} / ${item?.total}`}
          </Form.Item>
        }
      </StyledWrapper>
    ))
  })

  const getContent = (items: ApCompatibility[]) => (
    <Loader
      states={[ { isLoading: isInitializing } ]}
    >
      <Form layout='vertical' form={form} data-testid='apCompatibility-form'>
        <Form.Item>
          {contentTxt}
          <TenantLink to='/administration/fwVersionMgmt'>
            <Button type='link'>{ $t({ defaultMessage: 'Administration > Version Management > AP Firmware' }) }</Button>
          </TenantLink>
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
