import { Typography }                 from 'antd'
import moment                         from 'moment-timezone'
import { MessageDescriptor, useIntl } from 'react-intl'

import { Card, Descriptions, GridCol, GridRow } from '@acx-ui/components'
import { DateFormatEnum, formatter }            from '@acx-ui/formatter'
import { getIntl }                              from '@acx-ui/utils'

import { FixedAutoSizer }      from '../../DescriptionSection/styledComponents'
import { DetailsSection }      from '../common/DetailsSection'
import { getIntentStatus }     from '../common/getIntentStatus'
import { IntentDetailsHeader } from '../common/IntentDetailsHeader'
import { IntentIcon }          from '../common/IntentIcon'
import { StatusTrail }         from '../common/StatusTrail'
import { codes }               from '../config'
import { useIntentContext }    from '../IntentContext'

import * as SideNotes from './IntentAIForm/SideNotes'

export function createUseValuesText ({ action }: {
  action: {
    active: MessageDescriptor,
    inactive: MessageDescriptor
  }
}) {
  return function useValuesText () {
    const { $t } = getIntl()
    const { state } = useIntentContext()

    const actionText = state === 'active'
      ? action.active
      : action.inactive

    return {
      actionText: $t(actionText)
    }
  }
}

export function createIntentAIDetails (config: Parameters<typeof createUseValuesText>[0]) {
  const useValuesText = createUseValuesText(config)

  return function IntentAIDetails () {
    const { $t } = useIntl()
    const { intent } = useIntentContext()
    const valuesText = useValuesText()

    return <>
      <IntentDetailsHeader />
      <GridRow>
        <GridCol col={{ span: 6, xxl: 4 }}>
          <FixedAutoSizer>
            {({ width }) => (<div style={{ width }}>
              <IntentIcon size='large' />
              <Typography.Paragraph
                data-testid='Overview text'
                children={valuesText.actionText} />
              <Descriptions noSpace>
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Intent' })}
                  children={$t(codes[intent.code].intent)}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Category' })}
                  children={$t(codes[intent.code].category)}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
                  children={intent.sliceValue}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Status' })}
                  children={getIntentStatus(intent.displayStatus)}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Date' })}
                  children={formatter(DateFormatEnum.DateTimeFormat)(moment(intent.updatedAt))}
                />
              </Descriptions>
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
            <StatusTrail />
          </DetailsSection>
        </GridCol>
      </GridRow>
    </>
  }
}
