import { Typography }                                   from 'antd'
import { FormattedMessage, MessageDescriptor, useIntl } from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'

import { DescriptionSection }   from '../../DescriptionSection'
import { FixedAutoSizer }       from '../../DescriptionSection/styledComponents'
import { useCommonFields }      from '../common/commonFields'
import { DetailsSection }       from '../common/DetailsSection'
import { IntentDetailsHeader }  from '../common/IntentDetailsHeader'
import { IntentIcon }           from '../common/IntentIcon'
import { richTextFormatValues } from '../common/richTextFormatValues'
import { StatusTrail }          from '../common/StatusTrail'
import { useIntentContext }     from '../IntentContext'
import { getStatusTooltip }     from '../services'

import { BenefitsGrid }            from './BenefitsGrid'
import { CustomizeKPIGrid }        from './CustomizeKPIGrid'
import * as SideNotes              from './IntentAIForm/SideNotes'
import { useIntentAIEcoFlexQuery } from './services'

export function createUseValuesText ({ action }: {
  action: {
    hasData: MessageDescriptor,
    noData: MessageDescriptor
  }
}) {
  return function useValuesText () {
    const { state } = useIntentContext()

    const actionText = state === 'no-data'
      ? action.noData
      : action.hasData

    return {
      actionText: actionText
    }
  }
}

export function createIntentAIDetails (config: Parameters<typeof createUseValuesText>[0]) {
  const useValuesText = createUseValuesText(config)

  return function IntentAIDetails () {
    const { $t } = useIntl()
    const { intent, state } = useIntentContext()
    const { displayStatus, sliceValue, metadata, updatedAt } = intent
    const valuesText = useValuesText()
    const fields = useCommonFields(intent)
    const kpiQuery = useIntentAIEcoFlexQuery()

    return <>
      <IntentDetailsHeader />
      <GridRow>
        <GridCol col={{ span: 6, xxl: 4 }}>
          <FixedAutoSizer>
            {({ width }) => (<div style={{ width }}>
              <IntentIcon size='large' />
              <Typography.Paragraph
                data-testid='Overview text'
                children={
                  <FormattedMessage {...valuesText.actionText} values={richTextFormatValues}/>
                }/>
              <DescriptionSection fields={fields}/>
              <br />
            </div>)}
          </FixedAutoSizer>
        </GridCol>
        <GridCol col={{ span: 18, xxl: 20 }}>
          {state !== 'no-data' ? <>
            <DetailsSection data-testid='Benefits'>
              <DetailsSection.Title children={$t(SideNotes.title)} />
              <BenefitsGrid kpiQuery={kpiQuery} />
            </DetailsSection>

            <DetailsSection data-testid='Key Performance Indications'>
              <DetailsSection.Title
                children={$t({ defaultMessage: 'Key Performance Indications' })} />
              <GridRow>
                <GridCol col={{ span: 24 }}>
                  <CustomizeKPIGrid kpiQuery={kpiQuery} isDetail/>
                </GridCol>
              </GridRow>
            </DetailsSection>
            <GridRow>
              <GridCol col={{ span: 12 }}>
                <DetailsSection data-testid='Recommendation'>
                  <DetailsSection.Title
                    children={$t(SideNotes.recommendationTitle)} />
                  <DetailsSection.Details
                    children={<Card>{$t(SideNotes.recommendationNote)}</Card>} />
                </DetailsSection>
              </GridCol>
              <GridCol col={{ span: 12 }}>
                <DetailsSection data-testid='Potential Trade-off'>
                  <DetailsSection.Title children={$t(SideNotes.tradeoffTitle)} />
                  <DetailsSection.Details
                    children={<Card>{$t(SideNotes.tradeoff)}</Card>} />
                </DetailsSection>
              </GridCol>
            </GridRow>
          </> : <GridRow>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Current Status'>
                <DetailsSection.Title children={$t({ defaultMessage: 'Current Status' })} />
                <DetailsSection.Details children={
                  <Card>{getStatusTooltip(
                    displayStatus, sliceValue, { ...metadata, updatedAt })}</Card>} />
              </DetailsSection>
            </GridCol>
          </GridRow>}

          <StatusTrail />
        </GridCol>
      </GridRow>
    </>
  }
}
