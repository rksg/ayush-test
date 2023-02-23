import { useContext, useEffect, useState } from 'react'

import { Space, Form }                        from 'antd'
import { intersection, findIndex, map, uniq } from 'lodash'
import { useIntl }                            from 'react-intl'

import { Tooltip } from '@acx-ui/components'

import { BarButton5G, BarButtonDFS, CheckboxGroup } from './styledComponents'

interface RadioChannel {
  value: string;
  selected: boolean;
}

interface channelGroupOption {
  channels: RadioChannel[],
  selected: boolean
}

enum ChannelBarTypeEnum {
  dfs = 'dfs',
  lower5G = 'lower5G',
  upper5G = 'upper5G',
}

export function RadioSettingsChannels (props: {
  formName: string[],
  groupSize: number,
  channelList: RadioChannel[],
  displayBarSettings: string[],
  channelMethod?: string,
  disabled?: boolean,
  readonly?: boolean,
  channelBars: {
    dfsChannels: string[],
    lower5GChannels: string[],
    upper5GChannels: string[]
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editContext: React.Context<any>
}) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const {
    editContextData,
    setEditContextData
  } = useContext(props.editContext)

  const {
    disabled: customDisable = false, readonly = false,
    displayBarSettings, channelBars,
    channelList, groupSize
  } = props || {}

  const disabled = customDisable || readonly

  const { dfsChannels, lower5GChannels, upper5GChannels } = channelBars
  const showLowerUpper5GBar = displayBarSettings.includes('5G')
  const showDfsBar = displayBarSettings.includes('DFS')

  const [channelValueList, setChannelValueList] =
    useState<string[]>(channelList?.map((channelItem: RadioChannel) => channelItem.value))

  const avaliableBarsChannels = {
    dfs: getAvaliableBarChannels(dfsChannels, channelValueList),
    lower5G: getAvaliableBarChannels(lower5GChannels, channelValueList),
    upper5G: getAvaliableBarChannels(upper5GChannels, channelValueList)
  }

  const { dfsBarPosition, lower5GBarPosition, upper5GBarPosition } = calcBarsPosition()

  const channelGroupListArray = getChannelGroupListArray(channelList, groupSize)
  const channelGroupValueList = channelGroupListArray.map(g=>g?.flatMap(c => c.value)) as string[][]
  const [channelGroupList, setChannelGroupList]
    = useState(getChannelGroupList(channelGroupListArray as RadioChannel[][]))

  const handleClickBarButton = (barType: ChannelBarTypeEnum) => {
    const barChannelGroupIdx = findBarChannelGroupIdx(channelGroupList, barType)
    const hasBarChannelsGroupIdx = barChannelGroupIdx?.length > 0
    if (!hasBarChannelsGroupIdx) {
      return
    }

    const hasAnySelected = barChannelGroupIdx.some(idx => {
      return channelGroupList[idx].selected === true
    })

    barChannelGroupIdx.forEach(index => {
      const channelGroup = channelGroupList[index]
      channelGroup.selected = !hasAnySelected
      channelGroup.channels.forEach((channel) => {
        channel.selected = !hasAnySelected
      })
    })

    const selectedChannels = getSelectedValuesFormGropList(channelGroupList)
    form.setFieldValue(props.formName, selectedChannels)
    setChannelGroupList(channelGroupList)

    // notify data is changed
    setEditContextData({
      ...editContextData,
      isDirty: true
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClickGroupChannels = async (checkedValues: any) => {
    form.validateFields([props.formName])
    const selectedValues = await getSelectedValues(channelGroupValueList, checkedValues)
    form.setFieldValue(props.formName, selectedValues)

    channelGroupList.forEach(group => {
      const hasSelected = selectedValues.includes(group.channels.map(c => c.value)[0])
      group.selected = hasSelected
      group.channels.forEach(c => c.selected = hasSelected)
    })

    setChannelGroupList(channelGroupList)
  }

  useEffect(() => {
    if(channelList?.length > 0 && groupSize){
      const chVlaueList = channelList.map((channelItem: RadioChannel) => channelItem.value)
      let chList = [ ...channelList ]
      if (form) {
        const selectedCh = form.getFieldValue(props.formName)
        if (selectedCh) {
          chList = channelList.map((channelItem: RadioChannel) => {
            return {
              value: channelItem.value,
              selected: selectedCh.includes(channelItem.value)
            }
          })
        } else {
          form.setFieldValue(props.formName, chVlaueList)
          chList = channelList.map((channelItem: RadioChannel) => {
            return {
              value: channelItem.value,
              selected: true
            }
          })
        }
      }
      const channelGroupListArray = getChannelGroupListArray(chList, groupSize)
      setChannelValueList(chVlaueList)
      const chGroupList = getChannelGroupList(channelGroupListArray as RadioChannel[][])
      setChannelGroupList(chGroupList)

    }
  }, [channelList, groupSize])

  return (<>
    {showLowerUpper5GBar && <div>
      {avaliableBarsChannels.lower5G?.length > 0 && <BarButton5G
        disabled={disabled}
        onClick={() => handleClickBarButton(ChannelBarTypeEnum.lower5G)}
        style={{ width: lower5GBarPosition.width }}
      >
        {$t({ defaultMessage: 'Lower 5G' })}
      </BarButton5G>}
      {avaliableBarsChannels.upper5G?.length > 0 && <BarButton5G
        disabled={disabled}
        onClick={() => handleClickBarButton(ChannelBarTypeEnum.upper5G)}
        style={{ width: upper5GBarPosition.width }}
      >
        {$t({ defaultMessage: 'Upper 5G' })}
      </BarButton5G>}
    </div>}
    { showDfsBar && avaliableBarsChannels.dfs?.length > 0 && <BarButtonDFS
      disabled={disabled}
      onClick={() => handleClickBarButton(ChannelBarTypeEnum.dfs)}
      style={{ width: dfsBarPosition?.width, left: dfsBarPosition?.left }}
    >
      {$t({ defaultMessage: 'DFS' })}
    </BarButtonDFS> }
    <Space style={{ display: 'flex' }}>
      <Form.Item
        name={props.formName}
        children={
          <CheckboxGroup
            className={props.groupSize ? `group-${props.groupSize}` : ''}
            disabled={disabled}
            onChange={handleClickGroupChannels}
            options={channelGroupList?.map((group: channelGroupOption) => ({
              label: <Tooltip
                key={group?.channels?.[0].value}
                title={disabled
                  ? ''
                  : (group.selected
                    ? $t({ defaultMessage: 'Disable this channel' })
                    : $t({ defaultMessage: 'Enable this channel' }))
                }
                className='channels'
              >{
                  group?.channels.map((item: RadioChannel) =>
                    <span key={item.value}>{ item.value }</span>)
                }</Tooltip>,
              value: group?.channels?.[0].value
            }))}
          />
        }
      />
    </Space>
  </>)

  function transformGroupArray (arr: RadioChannel[], groupSize: number) {
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
      ? { left: 32 * index, width: 32 * (channelLength + adjustLength) - 6 }
      : { left: 0, width: 0 }
  }

  function calcBarsPosition () {
    const { dfs, lower5G, upper5G } = avaliableBarsChannels

    const dfsBarPosition = calcBarPosition(
      channelValueList, dfsChannels, dfs, 'DfsChannels')

    const lower5GBarPosition = calcBarPosition(
      channelValueList, lower5GChannels, lower5G, 'Lower5GChannels')

    const upper5GBarPosition = calcBarPosition(
      channelValueList, upper5GChannels, upper5G, 'Upper5GChannels')

    return { dfsBarPosition, lower5GBarPosition, upper5GBarPosition }
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
      return transformGroupArray(channelList, groupSize)
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

  async function getSelectedValues (groupValueList: string[][], selectedValues: string[]) {
    const values = selectedValues.map((value:string) =>
      groupValueList.filter(list => list?.includes(value))
    ).flat().flat()
    return uniq(values)
  }

  function findBarChannelGroupIdx (chGroupList: channelGroupOption[], barType: ChannelBarTypeEnum) {
    const barChannelGroupIdx: number[] = []
    const barChannels = avaliableBarsChannels[barType]

    if (!barChannels || barChannels.length === 0) {
      return barChannelGroupIdx
    }

    // find channel groups which include bar's channels
    chGroupList.forEach((channelGroup, idx) => {
      const barChannelGroup = channelGroup.channels.some(ch => {
        return barChannels.includes(ch.value)
      })

      if (barChannelGroup) {
        barChannelGroupIdx.push(idx)
      }
    })

    return barChannelGroupIdx
  }

  function getSelectedValuesFormGropList (channelGroupList: channelGroupOption[]) {
    const selectedChannels: string[] = []
    channelGroupList.filter((channeGroup) => channeGroup.selected).forEach((channelGroup) => {
      channelGroup.channels.forEach((channel) => {
        selectedChannels.push(channel.value)
      })
    })

    return selectedChannels
  }
}
