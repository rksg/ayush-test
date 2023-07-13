import { useState } from 'react'

import { Input, Modal }      from 'antd'
import { useIntl }           from 'react-intl'
import { MessageDescriptor } from 'react-intl'

import { Button, Collapse }                 from '@acx-ui/components'
import { ExpandSquareDown, ExpandSquareUp } from '@acx-ui/icons'
import { useUpdateSigPackMutation }         from '@acx-ui/rc/services'
import { ApplicationUpdateType }            from '@acx-ui/rc/utils'
import { getIntl }                          from '@acx-ui/utils'

import * as UI                                                                                    from './styledComponents'
import { cautionDescription, confirmationContentMap, confirmationText }                           from './UpdateConfirmsConstants'
import { ConfirmContentProps, DialogFooterProps, ImpactedRulesDetailsProps, UpdateConfirmsProps } from './UpdateConfirmsTypes'
import { ChangedAppsInfoMap }                                                                     from './useSigPackDetails'

import { changedApplicationTypeTextMap } from '.'

export const UpdateConfirms = (props: UpdateConfirmsProps) => {
  const { changedAppsInfoMap } = props
  const { $t } = useIntl()
  const [ updateSigPack ] = useUpdateSigPackMutation()
  const [ isUpdating, setIsUpdating ] = useState(false)

  const doUpdate = () => {
    setIsUpdating(true)

    try{
      updateSigPack({ params: {}, payload: { action: 'UPDATE' } }).unwrap()
    } catch(error) {
      setIsUpdating(false)
    }
  }

  const showModal = () => {
    const modal = Modal.confirm({
      type: 'confirm',
      title: $t({ defaultMessage: 'Update Application policy?' }),
      className: 'modal-custom',
      content: <ConfirmContent
        changedAppsInfoMap={changedAppsInfoMap}
        confirmationType={props.confirmationType}
        onOk={() => {
          doUpdate()
          modal.destroy()
        }}
        onCancel={() => modal.destroy()}
      />,
      icon: <> </>
    })
    return modal
  }

  const canUpdateWithoutConfirmation = (): boolean => {
    return (Object.values(changedAppsInfoMap).reduce((acc, cur) => {
      return acc + cur.totalImpacted
    }, 0) === 0)
  }

  return <Button size='small'
    onClick={() => {
      if(canUpdateWithoutConfirmation()) {
        doUpdate()
      } else {
        showModal()
      }
    }}
    type='primary'
    disabled={isUpdating}
    style={isUpdating ? {} : {
      backgroundColor: 'var(--acx-accents-orange-50)',
      borderColor: 'var(--acx-accents-orange-50)'
    }}>
    {isUpdating ? $t({ defaultMessage: 'Updating...' }) : $t({ defaultMessage: 'Update' })}
  </Button>
}

function ConfirmContent (props: ConfirmContentProps) {
  const { changedAppsInfoMap, confirmationType, onOk, onCancel } = props
  const { $t } = getIntl()
  const [ okDisabled, setOkDisabled ] = useState(true)

  return (
    <>
      <UI.DialogContent>
        {$t(confirmationContentMap[confirmationType] as MessageDescriptor, {
          updatedCount: getUpdatedCount(changedAppsInfoMap),
          removedCount: getRemovedCount(changedAppsInfoMap)
        }) + ' ' + $t(cautionDescription)}
      </UI.DialogContent>
      <UI.TypeContent>
        {$t({ defaultMessage: 'Type the word "{text}" to confirm:' }, { text: confirmationText })}
        <Input
          onChange={(e) => {
            setOkDisabled(e.target.value.toLowerCase() !== confirmationText.toLowerCase())
          }}
          style={{ width: 80, marginLeft: 5 }}
        />
      </UI.TypeContent>
      <DialogFooter
        changedAppsInfoMap={changedAppsInfoMap}
        onOk={onOk}
        onCancel={onCancel}
        okDisabled={okDisabled}
      />
    </>
  )
}

function DialogFooter (props: DialogFooterProps) {
  const { onOk, onCancel, okDisabled } = props
  const { $t } = getIntl()
  const hasImpacedRules = true

  return (
    <UI.DialogFooter>
      {hasImpacedRules && <ImpactedRulesDetails changedAppsInfoMap={props.changedAppsInfoMap} />}
      <UI.DialogFooterButtons>
        <Button type='default'
          onClick={onCancel}>{$t({ defaultMessage: 'Cancel' })}</Button>
        <Button type='primary'
          disabled={okDisabled}
          onClick={onOk}>{$t({ defaultMessage: 'Update' })}</Button>
      </UI.DialogFooterButtons>
    </UI.DialogFooter>
  )
}

function ImpactedRulesDetails (props: ImpactedRulesDetailsProps) {
  const { $t } = getIntl()
  const { changedAppsInfoMap } = props

  return (
    <UI.Collapse
      ghost
      expandIconPosition='end'
      expandIcon={({ isActive }) => isActive ? <ExpandSquareUp /> : <ExpandSquareDown />}
    >
      <Collapse.Panel header={$t({ defaultMessage: 'Impacted rule details' })} key={'main'}>
        <UI.ImpactedRuleDetailsContainer>
          {Object.entries(changedAppsInfoMap).map(([appType, value]) => {
            if (value.totalImpacted <= 0) return null
            return <UI.ImpactedRuleDetailsItem key={appType}>
              <div>{$t(changedApplicationTypeTextMap[appType as ApplicationUpdateType])}:</div>
              <div>{$t({
                defaultMessage: '{count} {count, plural, one {rule} other {rules}}'
              }, { count: value.totalImpacted })}</div>
            </UI.ImpactedRuleDetailsItem>
          })}
        </UI.ImpactedRuleDetailsContainer>
      </Collapse.Panel>
    </UI.Collapse>
  )
}

function getUpdatedCount (changedAppsInfoMap: ChangedAppsInfoMap): number {
  let count = 0
  Object.entries(changedAppsInfoMap).forEach(([appType, info]) => {
    // eslint-disable-next-line max-len
    if (appType !== ApplicationUpdateType.APPLICATION_ADDED && appType !== ApplicationUpdateType.APPLICATION_REMOVED) {
      count += info.totalImpacted
    }
  })
  return count
}

function getRemovedCount (changedAppsInfoMap: ChangedAppsInfoMap): number {
  return changedAppsInfoMap[ApplicationUpdateType.APPLICATION_REMOVED]?.totalImpacted ?? 0
}
