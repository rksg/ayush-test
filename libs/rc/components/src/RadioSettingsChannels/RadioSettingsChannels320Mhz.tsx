import { Space, Form, Checkbox } from 'antd'
import { Col, Row }              from 'antd'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'


import { Tooltip } from '@acx-ui/components'


import { CheckboxGroup, CheckboxGroupFor320Mhz } from './styledComponents'

interface RadioChannel {
  value: string;
  selected: boolean;
}

const ChannelGroup_320MHz = {
  31: [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61],
  63: [33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85, 89, 93],
  95: [65, 69, 73, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113, 117, 121, 125],
  127: [97, 101, 105, 109, 113, 117, 121, 125, 129, 133, 137, 141, 145, 149, 153, 157],
  159: [129, 133, 137, 141, 145, 149, 153, 157, 161, 165, 169, 173, 177, 181, 185, 189],
  191: [161, 165, 169, 173, 177, 181, 185, 189, 193, 197, 201, 205, 209, 213, 217, 221]
}

// const handleClickGroupChannels = (checkedValues: any) => {

// }


export function RadioSettingsChannels320Mhz (props: {
  formName: string[],
  // channelList: RadioChannel[],
  // displayBarSettings: string[],
  channelMethod?: string,
  disabled?: boolean,
  readonly?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // editContext: React.Context<any>
}) {


  return (
    <Form.Item
      name={props.formName}
      children={
        <CheckboxGroupFor320Mhz
          style={{ width: '100%' }}
          // disabled={disabled}
          // onChange={handleClickGroupChannels}
        >
          <div style={{ marginTop: '10px' }}>
            <Row style={
              { marginBottom: '10px',
                backgroundColor: '#FEF6ED',
                height: '50px',
                paddingTop: '10px' }}>
              <Col span={2}>
                <p style={{ lineHeight: '30px', margin: '0px' }}>320 MHz-1</p>
              </Col>
              <Col span={6}>
                <Checkbox value={31}>
                  <TooltipFor320Mhz
                    content={31}
                    availableChannel={ChannelGroup_320MHz[31]}
                    availability={true}
                  />
                </Checkbox>
              </Col>
              <Col span={6}>
                <Checkbox value={95}>
                  <TooltipFor320Mhz
                    content={95}
                    availableChannel={ChannelGroup_320MHz[95]}
                    availability={true}
                  />
                </Checkbox>
              </Col>
              <Col span={6}>
                <Checkbox value={159}>
                  <TooltipFor320Mhz
                    content={159}
                    availableChannel={ChannelGroup_320MHz[159]}
                    availability={true}
                  />
                </Checkbox>
              </Col>
            </Row>
            <Row style={
              { marginBottom: '10px',
                backgroundColor: '#FEF6ED',
                height: '50px',
                paddingTop: '10px' }}>
              <Col span={2}>
                <p style={{ lineHeight: '30px', margin: '0px' }}>320 MHz-2</p>
              </Col>
              <Col span={6} offset={3}>
                <Checkbox value={63}>
                  <TooltipFor320Mhz
                    content={63}
                    availableChannel={ChannelGroup_320MHz[63]}
                    availability={true}
                  />
                </Checkbox>
              </Col>
              <Col span={6}>
                <Checkbox value={127}>
                  <TooltipFor320Mhz
                    content={127}
                    availableChannel={ChannelGroup_320MHz[127]}
                    availability={true}
                  />
                </Checkbox>
              </Col>
              <Col span={6}>
                <Checkbox value={191}>
                  <TooltipFor320Mhz
                    content={191}
                    availableChannel={ChannelGroup_320MHz[191]}
                    availability={true}
                  /></Checkbox>
              </Col>
            </Row>
          </div>
        </CheckboxGroupFor320Mhz>
      }
    />
  )
}

function buildTooltipMessage (message: string , channels: number[]) {
  channels.forEach((element, index, it) => {

    // Start with a newline and left parenthesis
    if(index === 0) {
      message += '\n('
    }

    message += `#${element}`

    // End it with right parenthesis
    // Don't put it behind the comma,
    // otherwise there will be redundant comma.
    if (index === it.length - 1) {
      message += ')'
    }

    else {
      message += ', '
    }
    // Start newline when message fill with eighth channel
    if(index === 7) {
      message += '\n'
    }
  })
  return message
}

function TooltipFor320Mhz (props: {
  content: number,
  availableChannel: number[],
  availability: boolean
}) {

  const { $t } = useIntl()
  const { content, availableChannel, availability } = props

  const message = availability ?
    $t({ defaultMessage: 'Disable this channel' }) :
    $t({ defaultMessage: 'Disable this channel' })

  return (
    <Tooltip
      title={
        <div style={{ textAlign: 'center' }}>
          <p>{buildTooltipMessage(message, availableChannel)}</p>
        </div>
      }
    >
      {content}
    </Tooltip>
  )

}