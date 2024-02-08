import moment                     from 'moment'
import { useIntl, defineMessage } from 'react-intl'

import { Card, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { get }                                from '@acx-ui/config'
import { DateFormatEnum, formatter }          from '@acx-ui/formatter'
import { useLocation }                        from '@acx-ui/react-router-dom'

import { DescriptionSection } from '../../DescriptionSection'
import { FixedAutoSizer }     from '../../DescriptionSection/styledComponents'
import { crrmStates }         from '../config'
import { OptimizedIcon }      from '../styledComponents'

import { DetailsHeader, DetailsWrapper } from './styledComponents'

const crrm = defineMessage({ defaultMessage: 'AI-Driven RRM' })

export const UnknownDetails = () => {
  const { $t } = useIntl()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const status = params.get('status')!
  const date = params.get('date')
  const sliceValue = params.get('sliceValue')
  const extra = params.get('extra')
  const link = 'analytics/recommendations/crrm'
  const isZone = get('IS_MLISA_SA')
  const fields = [
    {
      label: isZone
        ? $t({ defaultMessage: 'Zone RRM Health' })
        : $t({ defaultMessage: 'Venue RRM Health' }),
      children: <OptimizedIcon
        value={crrmStates[status as keyof typeof crrmStates]!.order}
        text={$t(crrmStates[status as keyof typeof crrmStates]!.label)}
      />
    },
    {
      label: $t({ defaultMessage: 'Date' }),
      children: formatter(DateFormatEnum.DateTimeFormat)(moment(date, moment.ISO_8601))
    }
  ]
  const value = isZone ? $t({ defaultMessage: 'zone' }) : $t({ defaultMessage: 'venue' })
  const Value = isZone ? $t({ defaultMessage: 'Zone' }) : $t({ defaultMessage: 'Venue' })

  const failureText = {
    insufficientLicenses: defineMessage({ defaultMessage:
      `RUCKUS AI will not be able to generate an RRM recommendation due to
      {Value} {sliceValue} license compliance being incomplete.
      Ensure you have sufficient license subscriptions and have assigned licenses
      for all your APs to your {value} to meet the 100% {value} license compliance.
      This is a prerequisite to enable RUCKUS AI to optimize your network RRM configuration.`
    }),
    verified: defineMessage({ defaultMessage:
      `Your {value} is already AI verified and in an optimal state.
      RUCKUS AI does not recommend any changes to your RRM configuration.
      The {value} will continue to be monitored and a recommendation will
      be raised if an improvement is needed.`
    }),
    unqualifiedZone: defineMessage({ defaultMessage: `
      More than 20% of the APs in this {value} have configurations with AP overrides.
      In such cases, RRM recommendations will not be generated.
    ` }),
    verificationError: defineMessage({ defaultMessage:
      'RUCKUS AI encountered an error while verifying this zone.' }),
    global_zone_checker: defineMessage({ defaultMessage:
      `RUCKUS AI will not be able to generate RRM recommendations as the controller
      version is below pre-requisite levels. Please upgrade your controller to v5.2.1 and above.`
    }),
    mesh: defineMessage({ defaultMessage:
      `RUCKUS AI has detected mesh configuration in your zone and
      this configuration is not supported for RRM recommendations.`
    }),
    noAps: defineMessage({ defaultMessage: 'There are no APs in this {value}.'
    })
  }

  const failureReason = failureText[extra === 'null'
    ? status as keyof typeof failureText
    : extra! as keyof typeof failureText
  ]

  return <>
    <PageHeader
      title={sliceValue}
      breadcrumb={[
        { text: $t({ defaultMessage: 'AI Assurance' }) },
        { text: $t({ defaultMessage: 'AI Analytics' }) },
        { text: $t(crrm), link }
      ]}
    />
    <GridRow>
      <GridCol col={{ span: 4 }}>
        <FixedAutoSizer>
          {({ width }) => (<div style={{ width }}>
            <DescriptionSection fields={fields} />
          </div>)}
        </FixedAutoSizer>
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <DetailsHeader>
          {status === 'insufficientLicenses'
            ? $t({ defaultMessage: 'Prerequisites Required' })
            : $t({ defaultMessage: 'Details' })}
        </DetailsHeader>
        <DetailsWrapper>
          <Card type='solid-bg'>
            {$t(failureReason, { value, Value, sliceValue })}
          </Card>
        </DetailsWrapper>
      </GridCol>
    </GridRow>
  </>
}
