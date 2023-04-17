import { useContext, useEffect, useReducer } from 'react'

import {
  Form,
  Tooltip,
  Input,
  Space
} from 'antd'
import { useIntl } from 'react-intl'

import { Button }                                    from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                from '@acx-ui/icons'
import { walledGardensRegExp, GuestNetworkTypeEnum } from '@acx-ui/rc/utils'

import NetworkFormContext from '../../../NetworkFormContext'

import { defaultWalledGarden } from './DefaultWalledGarden'


// TODO: remove this flag and use feature toggle
const toggleFlag = false

enum WallGardenAction {
  Clear,
  UseDefault,
  Customize,
  UseExist
}

interface WalledGardenProps {
  guestNetworkTypeEnum: GuestNetworkTypeEnum,
  enableDefaultWalledGarden: boolean
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

const exemptionList = [
  GuestNetworkTypeEnum.WISPr,
  GuestNetworkTypeEnum.Cloudpath
]

function isExemption (guestNetworkTypeEnum: GuestNetworkTypeEnum) : boolean {
  return exemptionList.includes(guestNetworkTypeEnum)
}



/* eslint-disable max-len */
export function WalledGardenTextArea (props: WalledGardenProps) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

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

  const { guestNetworkTypeEnum, enableDefaultWalledGarden } = props

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

  // eslint-disable-next-line no-unused-vars
  const [_, dispatch] = useReducer(actionRunnder, statesCollection.initialState)

  // Effect to control the textarea since it won't reset when user click back and change protal type
  useEffect(() => {
    if (editMode || cloneMode) {
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

  // if one condition is true, then go render it.
  const isRenderNeed = [toggleFlag, isExemption(guestNetworkTypeEnum)].some(Boolean)

  if (!isRenderNeed) {
    return null
  }

  return (<>
    <Form.Item
      name={['walledGardensString']}
      rules={[
        { validator: (_, value) => walledGardensRegExp(value.toString()) }
      ]}
      label={<>{$t({ defaultMessage: 'Walled Garden' })}
        <Tooltip title={
          `${$t({ defaultMessage: 'Unauthenticated users will be allowed to access these destinations(i.e., without redirection to captive portal).' })}
           ${$t({ defaultMessage: 'Each destination should be entered in a new line.' })}

           ${$t({ defaultMessage: 'Accepted formats for destinations are:' })}

           ${$t({ defaultMessage: '-IP address(e.g. 10.11.12.13)' })}

           ${$t({ defaultMessage: '-IP address range(e.g. 10.11.12.13-10.11.12.15)' })}

           ${$t({ defaultMessage: '-CIDR(e.g. 10.11.12.13/28)' })}

           ${$t({ defaultMessage: '-IP address and mask(e.g. 10.11.12.13 255.255.255.0)' })}

           ${$t({ defaultMessage: '-Website FQDN(e.g. www.ruckus.com)' })}

           ${$t({ defaultMessage: '-Website FQDN with a wildcard(e.g. *.amazon.com; *.com)' })}`
        }
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
            defaultMessage:
            'Enter permitted walled garden destinations and IP subnets, a new line for each entry. Hover over the question mark for help with this field.'
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