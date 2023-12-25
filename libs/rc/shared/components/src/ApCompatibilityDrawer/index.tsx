/* eslint-disable max-len */
import { useState, useEffect } from 'react'

import { Form, Typography }          from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Tooltip, Drawer, Button, Loader, cssStr } from '@acx-ui/components'
import { QuestionMarkCircleOutlined }              from '@acx-ui/icons'
import { useLazyGetApCompatibilitiesVenueQuery }   from '@acx-ui/rc/services'
import { ApCompatibility }                         from '@acx-ui/rc/utils'
import { TenantLink }                              from '@acx-ui/react-router-dom'


import { StyledWrapper, CheckMarkCircleSolidIcon, WarningTriangleSolidIcon, UnknownIcon } from './styledComponents'

export enum InCompatibilityFeatures {
  AP_70 = 'WIFI7 302MHz',
  BETA_DPSK3 = 'DSAE',
  AP_NEIGHBORS = 'AP Neighbors'
}

export enum ApCompatibilityQueryTypes {
  CHECK_VENUE='CHECK_VENUE',
  CHECK_VENUE_WITH_FEATURE='CHECK_VENUE_WITH_FEATURE',
  CHECK_VENUE_WITH_APS='CHECK_VENUE_WITH_APS',
  CHECK_NETWORKS_OF_VENUE='CHECK_NETWORKS_OF_VENUE'
}

export type ApCompatibilityToolTipProps = {
  visible: boolean,
  title: string,
  onClick: () => void
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
  const { visible, title, onClick } = props

  const compatibilityToolTipInfo = $t({
    defaultMessage:
      'See the compatibility requirements.'
  })

  return (<Tooltip
    title={
      <FormattedMessage
        defaultMessage={
          '{title}<compatibilityToolTip></compatibilityToolTip>'
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
    placement='right'>
    <QuestionMarkCircleOutlined
      style={{ height: '18px', marginBottom: -3 }}
    />
  </Tooltip>)
}

export type ApFeatureCompatibilityProps = {
  count?: number,
  onClick: () => void
}

export function ApFeatureCompatibility (props: ApFeatureCompatibilityProps) {
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
      <WarningTriangleSolidIcon
        style={{ height: '18px', marginBottom: -3 }}
      />
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
  isMultiple?: boolean,
  venueId?: string,
  apName?: string,
  featureName?: InCompatibilityFeatures,
  networkIds?: string[],
  apIds?: string[],
  venueName?: string,
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
    venueId={venueId}
    featureName={InCompatibilityFeatures.BETA_DPSK3}
    venueName={venueData?.name ?? ''}
    queryType={ApCompatibilityQueryTypes.CHECK_VENUE_WITH_FEATURE}
    onClose={() => setDrawerVisible(false)}
  />

Sample 2: Display data on drawer
  <ApCompatibilityDrawer
    isMultiple
    visible={drawerVisible}
    data={apCompatibility}
    onClose={() => setDrawerVisible(false)}
  />
*/
export function ApCompatibilityDrawer (props: ApCompatibilityDrawerProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { visible, isMultiple = false, venueName, featureName='', apName, apIds=[], networkIds=[], venueId, queryType, data=[] } = props
  const [ isInitializing, setIsInitializing ] = useState(data.length === 0)
  const [ apCompatibilities, setApCompatibilities ] = useState<ApCompatibility[]>(data)
  const [ getApCompatibilitiesVenue ] = useLazyGetApCompatibilitiesVenueQuery()

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

  const multipleFromFeature = $t({
    defaultMessage:
    'Some features are not enabled on specific access points in this venue due to ' +
    'firmware or device incompatibility. Please see the minimum firmware versions required below. ' +
    'Also note that not all features are available on all access points. You may upgrade your firmware from '
  })

  const multipleTitle = (apName) ? multipleFromAp : multipleFromFeature

  const contentTxt = isMultiple ? multipleTitle : $t(
    {
      defaultMessage:
            'To utilize the {featureName}, ensure that the access points on the venue ' +
            '({venueName}) meet the minimum required version and AP model support list below. You may upgrade your firmware from '
    },
    { featureName, venueName }
  )

  useEffect(() => {
    if (visible && data.length === 0 && apCompatibilities?.length === 0) {
      const fetchApCompatibilities = async () => {
        try {
          const apCompatibilitiesResponse = await getApCompatibilitiesVenue({
            params: { venueId },
            payload: { filters: { apIds, networkIds }, feature: InCompatibilityFeatures.BETA_DPSK3, queryType }
          }).unwrap()

          setApCompatibilities(apCompatibilitiesResponse)
          setIsInitializing(false)
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
      }
      fetchApCompatibilities()
    }
  }, [visible, apCompatibilities])


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
        <Form.Item
          key={`minfw_${index}`}
          label={$t({ defaultMessage: 'Minimum required version' })}
          style={detailStyle}
          className='ApCompatibilityDrawerFormItem'
        >
          {itemDetail?.requiredFw}
        </Form.Item>
        <Form.Item
          key={`model_${index}`}
          label={$t({ defaultMessage: 'Supported AP Model Family' })}
          style={detailStyle}
          className='ApCompatibilityDrawerFormItem'
        >
          {itemDetail?.requiredModel}
        </Form.Item>
        {!apName &&
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
