import { useContext, useEffect, useReducer } from 'react'

import {
  Form,
  Tooltip,
  Input,
  Space
} from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button }                     from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { walledGardensRegExp }        from '@acx-ui/rc/utils'

import NetworkFormContext from '../../../NetworkFormContext'

import { defaultWalledGarden } from './DefaultWalledGarden'

enum WallGardenAction {
  Clear,
  UseDefault,
  Customize,
  UseExist
}

export interface WalledGardenProps {
  enableDefaultWalledGarden: boolean
  required?: boolean
}

interface WalledGardenFieldsValue {
  walledGardensString: string,
  guestPortal: {
    walledGardens: string[]
  }
}

interface WalledGardenState {
  action: WallGardenAction,
  fieldsValue: WalledGardenFieldsValue
}

/* eslint-disable max-len */
export function WalledGardenTextArea (props: WalledGardenProps) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { enableDefaultWalledGarden, required = false } = props

  /**
   * the reanson why we set condition isExemption() is because
   * Walled Garden setting was existed before this requirement.
   * But only existed in WISPr and Cloudpath.
   * So we have make sure that in WISPr and Cloudpath,
   * walled garden setting is shown even Feature toggle is disabled
   */

  const {
    data: networkFromContextData,
    editMode,
    cloneMode
  } = useContext(NetworkFormContext)

  const existWalledGarden : string[] | undefined = networkFromContextData?.guestPortal?.walledGardens

  const statesCollection = {
    initialState: {
      action: WallGardenAction.Clear,
      fieldsValue: {
        walledGardensString: '',
        guestPortal: {
          walledGardens: []
        }
      }
    },
    useDefaultState: {
      action: WallGardenAction.UseDefault,
      fieldsValue: {
        walledGardensString: defaultWalledGarden.join('\n'),
        guestPortal: {
          walledGardens: defaultWalledGarden
        }
      }
    },
    useExistState: {
      action: WallGardenAction.UseExist,
      fieldsValue: {
        walledGardensString: existWalledGarden ? existWalledGarden.join('\n') : '',
        guestPortal: {
          walledGardens: existWalledGarden ? existWalledGarden : []
        }
      }
    }
  }

  /**
   * Reducer for WalledGardenTextArea state management.
   * This reducer only returns the new state based on the dispatched action.
   * It does NOT perform any side effects (such as setting form values),
   * ensuring that React's render phase is pure and free from state updates.
   */
  function actionRunner (currentState: WalledGardenState, IncomingState: WalledGardenState) {
    switch (IncomingState.action) {
      case WallGardenAction.Clear:
        // Reset to initial empty state
        return statesCollection.initialState
      case WallGardenAction.UseDefault:
        // Use the default walled garden list
        return statesCollection.useDefaultState
      case WallGardenAction.Customize:
        // Use the customized value from user input
        return IncomingState
      case WallGardenAction.UseExist:
        // Use the existing walled garden list from context (edit/clone mode)
        return statesCollection.useExistState
      default:
        // Should not happen, but log for debugging
        /* eslint-disable no-console */
        console.error(`Invalid action: ${IncomingState.action}`)
        return IncomingState
    }
  }

  const [state, dispatch] = useReducer(actionRunner, statesCollection.initialState)

  /**
   * Initialize the component state based on the current mode and props.
   * - If in edit or clone mode, use the existing walled garden list from context.
   * - If default walled garden is enabled, use the default list.
   * - Otherwise, reset to initial empty state.
   *
   * This effect will re-run if editMode, cloneMode, or enableDefaultWalledGarden changes.
   */
  useEffect(() => {
    if (editMode || cloneMode) {
      dispatch(statesCollection.useExistState)
      return
    }
    if (enableDefaultWalledGarden) {
      dispatch(statesCollection.useDefaultState)
      return
    }
    dispatch(statesCollection.initialState)
  }, [editMode, cloneMode, enableDefaultWalledGarden])

  /**
   * Whenever the local state changes, update the form values accordingly.
   * This ensures the form fields always reflect the current state,
   * and avoids any direct setFieldsValue calls inside the reducer or render phase.
   */
  useEffect(() => {
    form.setFieldsValue(state.fieldsValue)
  }, [state, form])

  /**
   * The reason why here we have to Form.item is because
   * I want to try stay the same as the old code.
   * So that we only extract the old code to a new component
   * and no sigcanificant change to the submit/validate logic in NetworkForm.tsx
   * The walledGardensString attribute will be deleted before submit
   */
  return (<>
    <Form.Item
      data-testid='walled-garden-fullblock'
      name={['walledGardensString']}
      rules={[
        { required, message: $t({ defaultMessage: 'Walled Garden is required' }) },
        { validator: (_, value) => walledGardensRegExp(value) }
      ]}
      label={<>
        {$t({ defaultMessage: 'Walled Garden' })}
        <Tooltip title={
          <FormattedMessage
            values={{ br: () => <br /> }}
            defaultMessage={`
              Unauthenticated users will be allowed to access these destinations(i.e., without redirection to captive portal).<br></br><br></br>
              Each destination should be entered in a new line. Accepted formats for destinations are:<br></br><br></br>
              - IP address(e.g. 10.11.12.13)<br></br>
              - IP address range(e.g. 10.11.12.13-10.11.12.15)<br></br>
              - CIDR(e.g. 10.11.12.13/28)<br></br>
              - IP address and mask(e.g. 10.11.12.13 255.255.255.0)<br></br>
              - Website FQDN(e.g. www.ruckus.com)<br></br>
              - Website FQDN with a wildcard(e.g. *.amazon.com; *.com)
            `}
          />
        }
        placement='bottom'>
          <QuestionMarkCircleOutlined />
        </Tooltip>
        {enableDefaultWalledGarden &&
        <Button onClick={() => dispatch(statesCollection.useDefaultState)}
          data-testid='walled-garden-default-button'
          style={{
            marginLeft: 90,
            ...(required && { order: enableDefaultWalledGarden ? -2 : -1 })
          }}
          type='link'>
          {$t({ defaultMessage: 'Reset to default' })}
        </Button>
        }
        <Space />
        <Button onClick={() => dispatch(statesCollection.initialState)}
          style={{
            marginLeft: enableDefaultWalledGarden ? 10 : 90,
            ...(required && { order: enableDefaultWalledGarden ? -3 : -2 })
          }}
          data-testid='walled-garden-clear-button'
          type='link'>
          {$t({ defaultMessage: 'Clear' })}
        </Button>
      </>}
      children={
        <Input.TextArea rows={15}
          data-testid='walled-garden-showed-textarea'
          style={{ resize: 'none' }}
          onChange={(e)=>{
            const rawWalledGardenText = e.target.value
            dispatch(
              {
                action: WallGardenAction.Customize,
                fieldsValue: {
                  walledGardensString: rawWalledGardenText,
                  guestPortal: {
                    walledGardens: rawWalledGardenText.split('\n').map(text=>text.trim()).filter(text=>text.length!==0)
                  }
                }
              } as WalledGardenState)
          }
          }
          placeholder={$t({
            defaultMessage:
            'Enter permitted walled garden destinations and IP subnets, a new line for each entry. Hover over the question mark for help with this field.'
          })}
        />
      }
    />
    <Form.Item
      hidden
      data-testid='walled-garden-hidden-item'
      name={['guestPortal','walledGardens']}
      children={
        <Input.TextArea data-testid='walled-garden-hidden-textarea'/>
      }
    />
  </>)
}
