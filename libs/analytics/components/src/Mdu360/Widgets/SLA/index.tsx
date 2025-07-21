import { useState, useEffect, useMemo } from 'react'

import { isEqual } from 'lodash'
import { useIntl } from 'react-intl'

import { Button, Card, Loader, NoData } from '@acx-ui/components'
import { UseQueryResult }               from '@acx-ui/types'

import { useUpdateSlaThresholdsMutation } from '../../services'
import { SLAKeys }                        from '../../types'

import { slaConfig }         from './constants'
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
        ([key, { value, isDefault, isSynced }]) =>
          !isSynced ||
          isDefault ||
          !isEqual(value, initialSLAs[key as SLAKeys]?.value)
      )
      .map(([key, { value }]) => [key, value])
  )
  const hasValuesChanged = !isEqual(currentSLAs, initialSLAs)

  const haveChanges = Object.keys(slasToUpdate).length > 0
  const resetCurrentSLAs = () => setCurrentSLAs(initialSLAs)
  const applyCurrentSLAs = () =>
    updateSlaThresholds({ mspEcIds, slasToUpdate })

  return (
    <Loader
      states={[queryResults, { isLoading: false, isFetching: isUpdating }]}
    >
      <Card title={$t({ defaultMessage: 'Service Level Agreement' })}>
        {Object.keys(currentSLAs).length > 0 ? (
          <SLAContentContainer>
            <>
              <div>
                {Object.keys(currentSLAs).map((name) => {
                  const key = name as SLAKeys
                  const sla = currentSLAs[key]
                  const splits = slaConfig[key].splits
                  if (!sla || !splits) {
                    return null
                  }

                  const index = splits.indexOf(sla.value)

                  return (
                    <SLAStepSlider
                      key={key}
                      slaConfig={slaConfig[key]}
                      onSliderChange={(value: number) =>
                        onSliderChange(key, value, splits)
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
                        Configurations on selected properties are not synced.
                        <br />
                        <br />
                        Click the Apply button to sync all parameters on the
                        selected properties.
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
                    Apply
                  </Button>
                  <Button
                    disabled={!hasValuesChanged}
                    onClick={resetCurrentSLAs}
                  >
                    Reset
                  </Button>
                </ButtonsContainer>
              </SubContentContainer>
            </>
          </SLAContentContainer>
        ) : (
          <NoData style={{ marginTop: '16px' }} />
        )}
      </Card>
    </Loader>
  )
}

export default SLA
