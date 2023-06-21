import { useState } from 'react'

import { Input, Modal }                     from 'antd'
import { useIntl }                          from 'react-intl'
import { MessageDescriptor, defineMessage } from 'react-intl'

import { Button, Collapse }                              from '@acx-ui/components'
import { ExpandSquareDown, ExpandSquareUp }              from '@acx-ui/icons'
import { useUpdateSigPackMutation }                      from '@acx-ui/rc/services'
import { ApplicationConfirmType, ApplicationUpdateType } from '@acx-ui/rc/utils'
import { Provider }                                      from '@acx-ui/store'
import { getIntl }                                       from '@acx-ui/utils'

import * as UI                                   from './styledComponents'
import { ChangedAppsInfoMap, useSigPackDetails } from './useSigPackDetails'

import { changedApplicationTypeTextMap } from '.'

const contentMap: Record<ApplicationConfirmType, MessageDescriptor | undefined> = {
  // eslint-disable-next-line max-len
  [ApplicationConfirmType.UPDATED_APPS]: defineMessage({ defaultMessage: 'Please note that there will be updates to {updatedCount} application policies/rules in access control on this tenant.' }),
  // eslint-disable-next-line max-len
  [ApplicationConfirmType.UPDATED_REMOVED_APPS]: defineMessage({ defaultMessage: 'Please note that there will be updates to {updatedCount} application policies/rules and the removal of {removedCount} rule in access control on this tenant.' }),
  // eslint-disable-next-line max-len
  [ApplicationConfirmType.UPDATED_APP_ONLY]: defineMessage({ defaultMessage: 'Please note that there will be updates to {updatedCount} application policies/rules in access control on this tenant.' }),
  // eslint-disable-next-line max-len
  [ApplicationConfirmType.REMOVED_APP_ONLY]: defineMessage({ defaultMessage: 'Please note that {removedCount} impacted application rules in access control will be removed on this tenant' }),
  [ApplicationConfirmType.NEW_APP_ONLY]: undefined
}

// eslint-disable-next-line max-len
const cautionDescription = defineMessage({ defaultMessage: 'Are you sure you want to update the application under this tenant?' })
const confirmationText = 'Update'

export const UpdateConfirms = () => {
  const { $t } = useIntl()
  const [updateSigPack] = useUpdateSigPackMutation()
  const { changedAppsInfoMap } = useSigPackDetails()
  const [disabled, setDisabled]=useState(false)

  const doUpdate = () => {
    setDisabled(true)
    try{
      updateSigPack({ params: {}, payload: { action: 'UPDATE' } }).then(() => {
        setTimeout(() => setDisabled(false), 3500)
      }, () => {
        setDisabled(false)
      })
    } catch(error) {
      setDisabled(false)
    }
  }

  const showModal = () => {
    const modal = Modal.confirm({
      type: 'confirm',
      title: $t({ defaultMessage: 'Update Application policy?' }),
      className: 'modal-custom',
      content: <Provider><ConfirmContent
        onOk={doUpdate}
        onCancel={() => modal.destroy()}
      /></Provider>,
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
    disabled={disabled}
    style={!disabled ? {
      backgroundColor: 'var(--acx-accents-orange-50)',
      borderColor: 'var(--acx-accents-orange-50)'
    } : {}}>
    {$t({ defaultMessage: 'Update' })}
  </Button>
}

interface ConfirmContentProps {
  onOk: () => void
  onCancel: () => void
}

function ConfirmContent (props: ConfirmContentProps) {
  const { onOk, onCancel } = props
  const { $t } = getIntl()
  const [ okDisabled, setOkDisabled ] = useState(true)
  const { changedAppsInfoMap, confirmationType } = useSigPackDetails()

  return (
    <>
      <UI.DialogContent>
        {$t(contentMap[confirmationType] as MessageDescriptor, {
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
      <DialogFooter onOk={onOk} onCancel={onCancel} okDisabled={okDisabled} />
    </>
  )
}

interface DialogFooterProps {
  onOk: () => void
  onCancel: () => void
  okDisabled: boolean
}

function DialogFooter (props: DialogFooterProps) {
  const { onOk, onCancel, okDisabled } = props
  const { $t } = getIntl()
  const hasImpacedRules = true

  return (
    <UI.DialogFooter>
      {hasImpacedRules && <ImpactedRulesDetails />}
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

function ImpactedRulesDetails () {
  const { $t } = getIntl()
  const { changedAppsInfoMap } = useSigPackDetails()

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
                defaultMessage: '{count} {count, plural, one {rule} other {rules}} updated'
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
