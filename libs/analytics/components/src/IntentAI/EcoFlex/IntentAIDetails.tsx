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

import { ComparisonDonutChart }    from './ComparisonDonutChart'
import { useIntentAIEcoFlexQuery } from './ComparisonDonutChart/services'
import * as SideNotes              from './IntentAIForm/SideNotes'

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
    const { intent } = useIntentContext()
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
          <DetailsSection data-testid='Benefits'>
            <DetailsSection.Title children={$t({ defaultMessage: 'Benefits' })} />
          </DetailsSection>

          <DetailsSection data-testid='Key Performance Indications'>
            <DetailsSection.Title
              children={$t({ defaultMessage: 'Key Performance Indications' })} />
            <ComparisonDonutChart kpiQuery={kpiQuery} isDetail/>
          </DetailsSection>

          <GridRow>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Why the intent'>
                <DetailsSection.Title
                  children={$t(SideNotes.title)} />
                <Card>{$t(SideNotes.benefits)}</Card>
              </DetailsSection>
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Potential trade-off'>
                <DetailsSection.Title children={$t({ defaultMessage: 'Potential trade-off' })} />
                <Card>{$t(SideNotes.tradeoff)}</Card>
              </DetailsSection>
            </GridCol>
          </GridRow>

          <DetailsSection data-testid='Status Trail'>
            <DetailsSection.Title children={$t({ defaultMessage: 'Status Trail' })} />
            <StatusTrail intent={intent}/>
          </DetailsSection>
        </GridCol>
      </GridRow>
    </>
  }
}
