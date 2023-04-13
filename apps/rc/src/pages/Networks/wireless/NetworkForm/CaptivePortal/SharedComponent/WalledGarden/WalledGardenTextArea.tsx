import { useEffect, useReducer } from 'react'

import {
  Form,
  Tooltip,
  Input,
  Space
} from 'antd'
import { useIntl } from 'react-intl'

import { Button }                     from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { walledGardensRegExp }        from '@acx-ui/rc/utils'

import { defaultWalledGarden } from './DefaultWalledGarden'


enum WallGardenAction {
  Clear,
  UseDefault,
  Customize,
  UseExist
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
  // TODO: implement this logic, check if the database has walled garden
  useExistState: {
    action: WallGardenAction.UseExist,
    fieldsValue: {
      walledGardensString: defaultWalledGarden.join('\n'),
      guestPortal: {
        walledGardens: defaultWalledGarden
      }
    }
  }
}

/* eslint-disable max-len */
export function WalledGardenTextArea ({ enableDefaultWalledGarden }: { enableDefaultWalledGarden: Boolean }) {

  const { $t } = useIntl()
  const form = Form.useFormInstance()

  function actionRunnder (currentState: WalledGardenState, IncomingState: WalledGardenState) {
    switch (IncomingState.action) {
      case WallGardenAction.Clear:
        /* eslint-disable no-console */
        form.setFieldsValue(statesCollection.initialState.fieldsValue)
        return statesCollection.initialState
      case WallGardenAction.UseDefault:
        form.setFieldsValue(statesCollection.useDefaultState.fieldsValue)
        return statesCollection.useDefaultState
      case WallGardenAction.Customize:
        form.setFieldsValue(IncomingState.fieldsValue)
        return IncomingState
      case WallGardenAction.UseExist:
        form.setFieldsValue(statesCollection.useExistState.fieldsValue)
        return statesCollection.useExistState
      default:
        console.error(`Invalid action: ${IncomingState.action}`)
        return IncomingState
    }
  }

  const [wallGardenOption, dispatch] = useReducer(actionRunnder, statesCollection.initialState)

  // Effect to control the textarea since it won't reset when user click back and change protal type
  useEffect(() => {
    // TODO: implement this logic, check if the database has walled garden
    const isDatabaseHasWalledGarden = false
    if (isDatabaseHasWalledGarden) {
      dispatch(statesCollection.useExistState)
      return
    }
    if (enableDefaultWalledGarden) {
      dispatch(statesCollection.useDefaultState)
      return
    }
    else {
      dispatch(statesCollection.initialState)
      return
    }
  },[])

  return (<>
    <Form.Item
      name={['walledGardensString']}
      rules={[
        { validator: (_, value) => walledGardensRegExp(value.toString()) }
      ]}
      label={<>{$t({ defaultMessage: 'Walled Garden' })}
        <Tooltip title={$t({
          defaultMessage: 'Unauthenticated users will be allowed '
                    + 'to access these destinations(i.e., without redirection to captive ' +
                    'portal).'
        }) + '\n' +
                $t({ defaultMessage: 'Each destination should be entered in a new line.' }) + '\n' +
                $t({ defaultMessage: 'Accepted formats for destinations are:' }) + '\n\n' +
                $t({ defaultMessage: '-IP address(e.g. 10.11.12.13)' }) + '\n\n' +
                $t({ defaultMessage: '-IP address range(e.g. 10.11.12.13-10.11.12.15)' }) + '\n\n' +
                $t({ defaultMessage: '-CIDR(e.g. 10.11.12.13/28)' }) + '\n\n' +
                $t({ defaultMessage: '-IP address and mask(e.g. 10.11.12.13 255.255.255.0)' }) + '\n\n' +
                $t({ defaultMessage: '-Website FQDN(e.g. www.ruckus.com)' }) + '\n\n' +
                $t({ defaultMessage: '-Website FQDN with a wildcard(e.g. *.amazon.com; *.com)' }) + '\n'}
        placement='bottom'>
          <QuestionMarkCircleOutlined />
        </Tooltip>
        {enableDefaultWalledGarden &&
        <Button onClick={() => {
          dispatch(statesCollection.useDefaultState)
        }}
        style={{ marginLeft: 90, marginRight: 10 }}
        type='link'>
          {$t({ defaultMessage: 'Reset to default' })}
        </Button>
        }
        <Space />
        <Button onClick={() => {
          dispatch(statesCollection.initialState)
        }}
        style={enableDefaultWalledGarden? {} : { marginLeft: 90, marginRight: 10 }}
        type='link'>
          {$t({ defaultMessage: 'Clear' })}
        </Button>
      </>}
      children={
        <Input.TextArea rows={15}
          style={{ resize: 'none' }}
          onChange={(e)=>{
            const rawWalledGardenText = e.target.value
            dispatch(
              {
                action: WallGardenAction.Customize,
                fieldsValue: {
                  walledGardensString: rawWalledGardenText,
                  guestPortal: {
                    walledGardens: rawWalledGardenText.split('\n').map(text=>text.trim())
                  }
                }
              } as WalledGardenState)
          }
          }
          placeholder={$t({
            defaultMessage: 'Enter permitted walled ' +
                        'garden destinations and IP subnets, a new line for each ' +
                        'entry. Hover over the question mark for help with this field.'
          })}
        />
      }
    />
    <Form.Item
      hidden
      name={['guestPortal','walledGardens']}
    />
  </>)
}