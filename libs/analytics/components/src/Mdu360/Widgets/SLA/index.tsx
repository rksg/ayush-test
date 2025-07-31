import { useState, useEffect, useMemo } from 'react'

import { isEqual } from 'lodash'
import { useIntl } from 'react-intl'

import { Button, Card, Loader, showToast } from '@acx-ui/components'
import { UseQueryResult }                  from '@acx-ui/types'

import { useUpdateSlaThresholdsMutation } from '../../services'
import { SLAKeys }                        from '../../types'

import { slaConfigWithData } from './config'
import SLAStepSlider         from './SLAStepSlider'
import {
  ButtonsContainer,
  SLAContentContainer,
  SubContentContainer,
  TextContainer,
  UnsyncedWarningText,
  WarningTriangleSolidIcon
} from './styledComponents'
import { SLAData } from './types'

interface SLAProps {
  mspEcIds: string[];
  queryResults: UseQueryResult<SLAData>;
}

const SLA = ({ mspEcIds, queryResults }: SLAProps) => {
  const { $t } = useIntl()
  const initialSLAs = useMemo(
    () => queryResults.data ?? ({} as SLAData),
    [queryResults.data]
  )
  const [currentSLAs, setCurrentSLAs] = useState<SLAData>(initialSLAs)
  const [updateSlaThresholds, { isLoading: isUpdating }] =
    useUpdateSlaThresholdsMutation()

  useEffect(() => {
    setCurrentSLAs(initialSLAs)
  }, [initialSLAs])

  const onSliderChange = (key: SLAKeys, index: number, splits: number[]) => {
    const value = splits[index]
    setCurrentSLAs({
      ...currentSLAs,
      [key]: { ...currentSLAs[key], value }
    })
  }

  const slasToUpdate = Object.fromEntries(
    Object.entries(currentSLAs)
      .filter(
        ([key, { value, isSynced }]) =>
          !isSynced ||
          !isEqual(value, initialSLAs[key as SLAKeys]?.value)
      )
      .map(([key, { value }]) => [key, value])
  )
  const hasValuesChanged = !isEqual(currentSLAs, initialSLAs)

  const haveChanges = Object.keys(slasToUpdate).length > 0
  const resetCurrentSLAs = () => setCurrentSLAs(initialSLAs)
  const applyCurrentSLAs = () =>
    updateSlaThresholds({ mspEcIds, slasToUpdate })
      .unwrap()
      .then((resp) => {
        const firstSLAWithError = Object.values(resp).find(
          ({ error }) => error
        )
        if (firstSLAWithError) {
          showToast({
            type: 'error',
            content: $t(
              {
                defaultMessage:
                  'An error occurred while updating SLA thresholds{error}'
              },
              { error: `: ${firstSLAWithError.error}` }
            )
          })
        }
      })

  return (
    <Loader
      states={[queryResults, { isLoading: false, isFetching: isUpdating }]}
    >
      <Card title={$t({ defaultMessage: 'Service Level Agreement' })}>
        <SLAContentContainer>
          <div>
            {slaConfigWithData(currentSLAs).map((config) => {
              const { slaKey, splits, value } = config
              if (!splits || value == null) return null
              const index = splits.indexOf(value)
              return (
                <SLAStepSlider
                  key={slaKey}
                  slaConfig={config}
                  onSliderChange={(value: number) =>
                    onSliderChange(slaKey, value, splits)
                  }
                  splits={splits}
                  sliderValue={index}
                />
              )
            })}
          </div>
          <SubContentContainer>
            {haveChanges && (
              <TextContainer>
                <UnsyncedWarningText>
                  <WarningTriangleSolidIcon />
                  <span>
                    {$t({
                      defaultMessage:
                        'Configurations on selected properties are not synced.'
                    })}
                    <br />
                    <br />
                    {$t({
                      defaultMessage:
                        'Click the Apply button to sync all parameters on the selected properties.'
                    })}
                  </span>
                </UnsyncedWarningText>
                <div></div>
              </TextContainer>
            )}
            <ButtonsContainer>
              <Button
                disabled={!haveChanges}
                type='primary'
                onClick={applyCurrentSLAs}
              >
                {$t({ defaultMessage: 'Apply' })}
              </Button>
              <Button disabled={!hasValuesChanged} onClick={resetCurrentSLAs}>
                {$t({ defaultMessage: 'Reset' })}
              </Button>
            </ButtonsContainer>
          </SubContentContainer>
        </SLAContentContainer>
      </Card>
    </Loader>
  )
}

export default SLA
