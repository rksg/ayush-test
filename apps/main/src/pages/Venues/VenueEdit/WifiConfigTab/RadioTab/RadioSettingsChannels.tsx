import { useState } from 'react'


import { Space, Tooltip, Form }               from 'antd'
import { intersection, findIndex, map, uniq } from 'lodash'
import { useIntl }                            from 'react-intl'

import { Button5G, ButtonDFS, CheckboxGroup } from './styledComponents'

interface RadioChannel {
  value: string;
  selected: boolean;
}

interface channelGroupOption {
  channels: RadioChannel[],
  selected: boolean
}

export function RadioSettingsChannels (props: {
  groupSize: number,
  channelList: RadioChannel[],
  displayBarSettings: string[],
  checkedValues: string[],
  disabled?: boolean,
  readonly?: boolean,
  channelBars: {
    dfsChannels: string[],
    lower5GChannels: string[],
    upper5GChannels: string[]
  }
}) {
  const { $t } = useIntl()
  // const form = Form.useFormInstance()
  // TODO: rbacService
  const isAllowUpdate = true // rbacService.isRoleAllowed('updateVenueRadioCustomization') || rbacService.isRoleAllowed('UpdateApRadioButton')
  const disabled = props?.disabled || props?.readonly || !isAllowUpdate
  const showLowerUpper5GBar = props.displayBarSettings.includes('5G')
  const showDfsBar = props.displayBarSettings.includes('DFS')

  const { dfsChannels, lower5GChannels, upper5GChannels } = props.channelBars
  const channelValueList = props.channelList?.map((channelItem: RadioChannel) => channelItem.value)

  const dfsAvlBarChannels = getAvaliableBarChannels(dfsChannels, channelValueList)
  const lower5GAvlBarChannels = getAvaliableBarChannels(lower5GChannels, channelValueList)
  const upper5GAvlBarChannels = getAvaliableBarChannels(upper5GChannels, channelValueList)

  const dfsBarPosition = showDfsBar
    ? calcBarPosition(channelValueList, dfsChannels, dfsAvlBarChannels, 'DfsChannels') : null
  const lower5GBarPosition = calcBarPosition(
    channelValueList, lower5GChannels, lower5GAvlBarChannels, 'Lower5GChannels')
  const upper5GBarPosition = calcBarPosition(
    channelValueList, upper5GChannels, upper5GAvlBarChannels, 'Upper5GChannels')

  const channelGroupListArray = getChannelGroupListArray(props.channelList, props.groupSize)
  const channelGroupValueList = channelGroupListArray.map(g=>g?.flatMap(c => c.value)) as string[][]
  const [channelGroupList, setChannelGroupList]
    = useState(getChannelGroupList(channelGroupListArray as RadioChannel[][]))

  // TODO:
  const selectedValue = getSelectedValues(channelGroupValueList, props?.checkedValues) as string[]

  // TODO: can delete if not necessary
  const dfsChannelsGroupIdx = findBarChannelGroupIdx(dfsAvlBarChannels, channelGroupList)
  const lower5GChannelsGroupIdx = findBarChannelGroupIdx(lower5GAvlBarChannels, channelGroupList)
  const upper5GdfsChannelsGroupIdx = findBarChannelGroupIdx(upper5GAvlBarChannels, channelGroupList)

  // TODO:
  const handleSelectGroupButton = (barChannelsKey: string) => {
    // console.log('handleSelectGroupButton: ', barChannelsKey)
  }
  // TODO:
  const handleSelectGroupChannels = (checkedValues: any) => {
    const selectedValue = getSelectedValues(channelGroupValueList, checkedValues)
    // form.setFieldValue(['radioParams24G', 'allowedChannels'], selectedValue )
  }

  return (<>
    {showLowerUpper5GBar && <div>
      {lower5GAvlBarChannels.length > 0 && <Button5G
        disabled={disabled}
        onClick={() => handleSelectGroupButton('lower5GChannels')}
        style={{ width: lower5GBarPosition.width }}
      >
        {$t({ defaultMessage: 'Lower 5G' })}
      </Button5G>}
      {upper5GAvlBarChannels.length > 0 && <Button5G
        disabled={disabled}
        onClick={() => handleSelectGroupButton('upper5GChannels')}
        style={{ width: upper5GBarPosition.width }}
      >
        {$t({ defaultMessage: 'Upper 5G' })}
      </Button5G>}
    </div>}
    { showDfsBar && dfsAvlBarChannels.length > 0 && <ButtonDFS
      disabled={disabled}
      onClick={() => handleSelectGroupButton('dfsChannels')}
      style={{ width: dfsBarPosition?.width, left: dfsBarPosition?.left }}
    >
      {$t({ defaultMessage: 'DFS' })}
    </ButtonDFS> }
    <Space style={{ display: 'flex' }}>
      <CheckboxGroup
        className={props.groupSize ? `group-${props.groupSize}` : ''}
        disabled={disabled}
        onChange={handleSelectGroupChannels}
        options={channelGroupList?.map((group: channelGroupOption) => ({
          label: <Tooltip
            title={props.disabled
              ? ''
              : (group.selected
                ? $t({ defaultMessage: 'Disable this channel' })
                : $t({ defaultMessage: 'Enable this channel' }))
            }
            className='channels'
          >{
              group?.channels.map((item: RadioChannel) => <span>{ item.value }</span>)
            }</Tooltip>,
          value: group?.channels?.[0].value
        }))}
        // TODO:
        defaultValue={selectedValue}
      />
    </Space>
  </>)

  function splitArray (arr: RadioChannel[], groupSize: number) {
    return map(arr, (item, index) =>
      index % groupSize === 0 ? arr.slice(index, index + groupSize) : null
    ).filter(item => item)
  }

  function getAvaliableBarChannels (barChannels: string[], channelValueList: string[]) {
    return intersection(barChannels, channelValueList)
  }

  function calcBarPosition (
    channelValueList: string[],
    barChannels: string[],
    avaliableBarChannels: string[],
    barChannelsKey: string) {
    const channelLength = avaliableBarChannels.length
    const needAdjustChannels = ['DfsChannels', 'Upper5GChannels']

    let adjustLength = 0
    if (props.groupSize === 4 && barChannels.length > 0
      && needAdjustChannels.includes(barChannelsKey)) {
      // adjust bar length for 80MHz while has 132, 136 and no 140, 144
      if (channelValueList.includes('132') && channelValueList.includes('136')) {
        if (!avaliableBarChannels.includes('140')) adjustLength += 1
        if (!avaliableBarChannels.includes('144')) adjustLength += 1
      }
    }

    const index = findIndex(channelValueList, (channel) => channel === avaliableBarChannels[0])
    return channelLength
      ? { left: 30 * index, width: 30 * (channelLength + adjustLength) - 6 }
      : { left: 0, width: 0 }
  }

  function findBarChannelGroupIdx (
    avaliableBarChannels: string[],
    channelGroupList: channelGroupOption[]) {
    if (!avaliableBarChannels.length) {
      return []
    }

    let barChannelGroupIdx: number[] = []
    channelGroupList.forEach((channelGroup, idx) => {
      const barChannelGroup = channelGroup.channels.some((ch) => {
        return avaliableBarChannels.includes(ch.value)
      })

      if (barChannelGroup) {
        barChannelGroupIdx.push(idx)
      }
    })

    return barChannelGroupIdx
  }

  function getChannelGroupList (channelGroupListArray: RadioChannel[][]) {
    return channelGroupListArray.map((channelGroup: RadioChannel[]) => {
      let selected = false
      if (findIndex(channelGroup, ['selected', true]) > -1) {
        channelGroup.forEach((channel: RadioChannel) => {
          channel.selected = true
        })
        selected = true
      }
      return {
        channels: channelGroup,
        selected: selected
      }
    })
  }

  function getChannelGroupListArray (channelList: RadioChannel[], groupSize: number) {
    if (groupSize !== 4) {
      return splitArray(channelList, groupSize)
    } else { // channel width is 80MHz
      const result = []
      const len = channelList.length
      const channelValueList = channelList.map(channelItem =>
        parseInt(channelItem.value, 10)
      )
      for (let i = 0; i < len; i++) {
        if (i + 2 > len) {
          break
        }

        const c0 = channelValueList[i]
        const c1 = channelValueList[i + 1]
        const c2 = (len > i + 2) ? channelValueList[i + 2] : 0
        const c3 = (len > i + 3) ? channelValueList[i + 3] : 0

        if (c0 + 4 === c1 && c1 + 4 === c2 && c2 + 4 === c3) {
          result.push([channelList[i], channelList[i + 1], channelList[i + 2], channelList[i + 3]])
          i = i + 3
        } else if (c0 === 132 && c0 + 4 === c1) {
          result.push([channelList[i], channelList[i + 1]])
          i = i + 1
        }
      }
      return result
    }
  }

  function getSelectedValues (groupValueList: string[][], selectedValues: string[]) {
    const values = selectedValues.map((value:string) =>
      groupValueList.filter(list => list?.includes(value))
    ).flat().flat()
    return uniq(values)
  }
}