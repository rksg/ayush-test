import React, { useReducer, useRef, useState } from 'react'

import { FormattedList, useIntl } from 'react-intl'

import { Button, Modal, ModalType, showToast, StepsForm, StepsFormInstance }        from '@acx-ui/components'
import { useAddRoguePolicyMutation }                                                from '@acx-ui/rc/services'
import { CatchErrorResponse, RogueAPDetectionContextType, RogueAPRule, RogueVenue } from '@acx-ui/rc/utils'
import { useParams }                                                                from '@acx-ui/react-router-dom'

import RogueAPDetectionContext, { mainReducer } from './RogueAPDetectionContext'
import RogueAPDetectionSettingForm              from './RogueAPDetectionForm/RogueAPDetectionSettingForm'
import RogueAPDetectionScopeForm                from './RogueAPDetectionScope/RogueAPDetectionScopeForm'
import RogueAPDetectionSummaryForm              from './RogueAPDetectionSummary/RogueAPDetectionSummaryForm'

const RogueApModal = () => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const params = useParams()

  const formRef = useRef<StepsFormInstance<RogueAPDetectionContextType>>()
  const [state, dispatch] = useReducer(mainReducer, {
    policyName: '',
    tags: [] as string[],
    description: '',
    rules: [] as RogueAPRule[],
    venues: [] as RogueVenue[]
  })

  const [ createRoguePolicy ] = useAddRoguePolicyMutation()

  const transformPayload = (state: RogueAPDetectionContextType) => {
    return {
      id: '',
      name: state.policyName,
      description: state.description,
      rules: state.rules,
      venues: state.venues
    }
  }

  const addRogueAPDetectionPolicy = async () => {
    try {
      await createRoguePolicy({
        params,
        payload: transformPayload(state)
      }).unwrap()
      setVisible(false)
    } catch(error) {
      const errorResponse = error as CatchErrorResponse
      showToast({
        type: 'error',
        content: (<div>
          <p style={{ textAlign: 'left' }}>{$t({ defaultMessage: 'An error occurred' })}</p>
          <FormattedList value={errorResponse.data.errors.map(error => error.message)} />
        </div>)
      })
    }
  }

  return <>
    <Button
      type='link'
      onClick={() => setVisible(true)}
    >
      {$t({ defaultMessage: 'Add Profile' })}
    </Button>
    {/* It's a workaround to avoid Modal element popping up again then disappear after closing this Modal element. */}
    {visible && <Modal
      title={$t({ defaultMessage: 'Add Rogue AP Detection Policy' })}
      visible={visible}
      type={ModalType.ModalStepsForm}
    >
      <RogueAPDetectionContext.Provider value={{ state, dispatch }}>
        <StepsForm<RogueAPDetectionContextType>
          formRef={formRef}
          editMode={false}
          onCancel={() => setVisible(false)}
          onFinish={() => addRogueAPDetectionPolicy()}
        >
          <StepsForm.StepForm<RogueAPDetectionContextType>
            name='settings'
            title={$t({ defaultMessage: 'Settings' })}
          >
            <RogueAPDetectionSettingForm edit={false} formRef={formRef}/>
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='scope'
            title={$t({ defaultMessage: 'Scope' })}
          >
            <RogueAPDetectionScopeForm />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='summary'
            title={$t({ defaultMessage: 'Summary' })}
          >
            <RogueAPDetectionSummaryForm />
          </StepsForm.StepForm>
        </StepsForm>
      </RogueAPDetectionContext.Provider>
    </Modal>}
  </>
}

export default RogueApModal
