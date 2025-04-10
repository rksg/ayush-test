import { useMemo } from 'react'

import { Row, Col, Form }            from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { StepsForm, Tooltip, useStepFormContext } from '@acx-ui/components'
import { get }                                    from '@acx-ui/config'
import { useEnhanceVenueTableQuery }              from '@acx-ui/rc/services'

import { KPIFields }            from '../../common/KPIs'
import { richTextFormatValues } from '../../common/richTextFormatValues'
import { ScheduleTiming }       from '../../common/ScheduleTiming'
import { useIntentContext }     from '../../IntentContext'
import { IntentDetail }         from '../../useIntentDetailsQuery'

import { StyledFormItem, StyledLoader } from './styledComponents'

import type { Wlan } from './WlanSelection'

const payload = {
  fields: ['networks', 'name'],
  filters: {},
  sortField: 'name',
  sortOrder: 'ASC'
}

export function Summary () {
  const { $t } = useIntl()
  const isRAI = Boolean(get('IS_MLISA_SA'))
  const { form } = useStepFormContext<IntentDetail>()
  const wlans = form.getFieldValue('wlans') as Wlan[]
  const { intent: { sliceValue: currentVenue } } = useIntentContext()
  const isEnabled = form.getFieldValue('preferences').enable
  const { data: venues, isLoading } = useEnhanceVenueTableQuery({ payload, skip: isRAI })

  const affectedVenueNames = useMemo(() => {
    if (!venues || wlans.length === 0) {
      return []
    }
    const affectedVenues =
      venues?.data
        .filter(
          ({ name: venueName, networks }) =>
            currentVenue !== venueName &&
            wlans.some(({ name }) => networks?.names?.includes(name))
        )
        .map(({ name }) => name) || []

    return affectedVenues
  }, [currentVenue, venues, wlans])

  return (
    <Row gutter={20}>
      <Col span={16}>
        <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
        {isEnabled ? (
          <>
            <KPIFields />
            <ScheduleTiming.FieldSummary />
            <Form.Item
              style={{ marginBottom: 0 }}
              name='networks'
              label={$t({ defaultMessage: 'Networks' })}
              rules={[{
                validator: () => {
                  if (!wlans || wlans.length === 0) {
                    return Promise.reject(
                      $t({
                        defaultMessage:
                          'Please select at least one network in Settings'
                      })
                    )
                  }
                  return Promise.resolve()
                }
              }]}
            >
              <Tooltip
                placement='top'
                title={wlans?.map((wlan) => wlan.name).join(', ')}
                dottedUnderline
              >
                {$t(
                  {
                    defaultMessage: `{count} {count, plural,
                      one {network}
                      other {networks}
                    } selected`
                  },
                  { count: wlans?.length || 0 }
                )}
              </Tooltip>
            </Form.Item>
            {!isRAI &&
              <StyledLoader states={[{ isLoading }]} style={{ height: 40 }}>
                <StyledFormItem name='venues' hidden={!affectedVenueNames.length}>
                  <>
                    {$t(
                      {
                        defaultMessage: `The intent will affect {affectedVenueText} where {
                        affectedNetworksCount, plural,
                        one {this selected network is}
                        other {these selected networks are}
                      } active`
                      },
                      {
                        affectedVenueText: (
                          <Tooltip
                            placement='top'
                            title={affectedVenueNames.join(', ')}
                            dottedUnderline
                          >
                            {$t(
                              {
                                defaultMessage: `{affectedVenuesCount} {affectedVenuesCount, plural,
                                  one {<venueSingular></venueSingular>}
                                  other {<venuePlural></venuePlural>}
                                }`
                              },
                              { affectedVenuesCount: affectedVenueNames.length }
                            )}
                          </Tooltip>
                        ),
                        affectedNetworksCount: wlans?.length
                      }
                    )}
                  </>
                </StyledFormItem>
              </StyledLoader>
            }
          </>
        ) : (
          <FormattedMessage
            values={richTextFormatValues}
            /* eslint-disable max-len */
            defaultMessage={`
              <p>IntentAI will maintain the existing network configuration and will cease automated monitoring of configuration for handling probe request/response in the network.</p>
              <p>For manual control, you may directly change the network configurations.</p>
              <p>For automated monitoring and control, you can select the "Resume" action, after which IntentAI will resume overseeing the network for this Intent.</p>
            `}
          />
        )}
      </Col>
    </Row>
  )
}
