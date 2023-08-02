import { Fragment } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow, Tooltip } from '@acx-ui/components'

import { EnhancedRecommendation } from './services'
import {
  DetailsHeader,
  DetailsWrapper,
  Title,
  InfoIcon,
  ValueDetailsWithIcon,
  BulbOutlinedIcon,
  CrrmTitle,
  CrrmDiv,
  LabelSpan,
  CrrmDetailsWrapper
} from './styledComponents'
import { getRecommendationsText, getValues } from './values'

export const CrrmValues = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const {
    appliedOnce, status, original, current, recommended, tooltipContent
  } = getValues(details)
  const applied = appliedOnce && status !== 'reverted'
  const secondValue = applied ? current : recommended
  const recommendationText = getRecommendationsText(details, $t)
  const tooltipText = typeof tooltipContent === 'string'
    ? tooltipContent
    : typeof tooltipContent === 'undefined'
      ? null
      : $t(tooltipContent)

  const fields = [
    {
      label: applied
        ? $t({ defaultMessage: 'Original Configuration' })
        : $t({ defaultMessage: 'Current Configuration' }),
      value: applied ? original : current
    },
    {
      label: applied
        ? $t({ defaultMessage: 'Current Configuration' })
        : $t({ defaultMessage: 'Recommended Configuration' }),
      value: tooltipText
        ? <ValueDetailsWithIcon>
          {secondValue}
          {tooltipText && <Tooltip title={tooltipText}>
            <InfoIcon />
          </Tooltip>}
        </ValueDetailsWithIcon>
        : secondValue
    }
  ]

  return <>
    <CrrmDetailsWrapper style={{ height: 375 }}>
      <Card type='solid-bg'>
        <GridRow>
          <GridCol col={{ span: 12 }}>
            <DetailsWrapper>
              <Space align='start' size={6}>
                <BulbOutlinedIcon />
                <CrrmTitle>{$t({ defaultMessage: 'Insights' })}</CrrmTitle>
              </Space>
              <DetailsHeader>{$t({ defaultMessage: 'Recommendation Details' })}</DetailsHeader>
              {fields
                .filter(({ value }) => value !== null)
                .map(({ label, value }, ind) => <Fragment key={ind}>
                  <p><LabelSpan>{label}</LabelSpan>: {value}</p>
                </Fragment>)}
              <CrrmDiv>
                {recommendationText.actionText}
              </CrrmDiv>
            </DetailsWrapper>
          </GridCol>
          <GridCol col={{ span: 12 }}>
            <Title>{$t({ defaultMessage: 'Why is the recommendation?' })}</Title>
            {recommendationText.reasonText}
            <Title>{$t({ defaultMessage: 'Potential trade-off' })}</Title>
            {recommendationText.tradeoffText}
          </GridCol>
        </GridRow>
      </Card>
    </CrrmDetailsWrapper>
    <div>Crrm Graph</div>
  </>
}
