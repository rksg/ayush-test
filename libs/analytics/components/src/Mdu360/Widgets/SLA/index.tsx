import { useState, useEffect, useMemo } from 'react'

import { isEqual } from 'lodash'
import { useIntl } from 'react-intl'

import { Button, Card, Loader } from '@acx-ui/components'
import { UseQueryResult }       from '@acx-ui/types'

import { SLAKeys } from '../../types'

import { slaConfig }                               from './constants'
import { SLAData, useUpdateSlaThresholdsMutation } from './services'
import SLAStepSlider                               from './SLAStepSlider'
import {
  ButtonsContainer,
  SLAContentContainer,
  SubContentContainer,
  TextContainer,
  UnsyncedWarningText,
  WarningTriangleSolidIcon
} from './styledComponents'

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
    if (initialSLAs) {
      setCurrentSLAs(initialSLAs)
    }
  }, [initialSLAs])

  const hasValuesChanged = !isEqual(currentSLAs, initialSLAs)
  const hasUnsyncedOrDefault = Object.values(initialSLAs).some(
    ({ isSynced, isDefault }) => !isSynced || isDefault
  )
  const haveChanges = hasValuesChanged || hasUnsyncedOrDefault

  const onSliderChange = (key: SLAKeys, index: number, splits: number[]) => {
    const value = splits[index]
    setCurrentSLAs({
      ...currentSLAs,
      [key]: { ...currentSLAs[key], value }
    })
  }

  const resetCurrentSLAs = () => setCurrentSLAs(initialSLAs)
  const applyCurrentSLAs = () => {
    const slasToUpdate = Object.fromEntries(
      Object.entries(currentSLAs)
        .filter(([key, { value, isDefault, isSynced }]) =>
          !isSynced || isDefault || !isEqual(value, initialSLAs[key as SLAKeys]?.value)
        )
        .map(([key, { value }]) => [key, value])
    )

    if (Object.keys(slasToUpdate).length === 0) {
      return
    }

    updateSlaThresholds({ mspEcIds, slasToUpdate })
  }

  return (
    <Loader
      states={[queryResults, { isLoading: false, isFetching: isUpdating }]}
    >
      <Card title={$t({ defaultMessage: 'Service Level Agreement' })}>
        <SLAContentContainer>
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
              <Button disabled={!hasValuesChanged} onClick={resetCurrentSLAs}>
                Reset
              </Button>
            </ButtonsContainer>
          </SubContentContainer>
        </SLAContentContainer>
      </Card>
    </Loader>
  )
}

export default SLA
