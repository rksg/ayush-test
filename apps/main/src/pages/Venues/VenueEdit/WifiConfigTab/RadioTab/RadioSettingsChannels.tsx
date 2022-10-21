import { useEffect, useState } from 'react'

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

enum ChannelTypeEnum {
  dfs = 'dfs',
  lower5G = 'lower5G',
  upper5G = 'upper5G',
}

export function RadioSettingsChannels (props: {
  formName: string[],
  groupSize: number,
  channelList: RadioChannel[],
  displayBarSettings: string[],
  disabled?: boolean,
  readonly?: boolean,
  channelBars: {
    dfsChannels: string[],
    lower5GChannels: string[],
    upper5GChannels: string[]
  }
}) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  // TODO: rbacService
  const isAllowUpdate = true // rbacService.isRoleAllowed('updateVenueRadioCustomization') || rbacService.isRoleAllowed('UpdateApRadioButton')
  const disabled = props?.disabled || props?.readonly || !isAllowUpdate
  const showLowerUpper5GBar = props.displayBarSettings.includes('5G')
  const showDfsBar = props.displayBarSettings.includes('DFS')

  const { dfsChannels, lower5GChannels, upper5GChannels } = props.channelBars
  const [channelValueList, setChannelValueList] =
  useState<string[]>(props.channelList?.map((channelItem: RadioChannel) => channelItem.value))

  const avaliableBarChannels = {
    dfs: getAvaliableBarChannels(dfsChannels, channelValueList),
    lower5G: getAvaliableBarChannels(lower5GChannels, channelValueList),
    upper5G: getAvaliableBarChannels(upper5GChannels, channelValueList)
  }

  const dfsBarPosition = showDfsBar
    ? calcBarPosition(channelValueList, dfsChannels, avaliableBarChannels.dfs, 'DfsChannels') : null
  const lower5GBarPosition = calcBarPosition(
    channelValueList, lower5GChannels, avaliableBarChannels.lower5G, 'Lower5GChannels')
  const upper5GBarPosition = calcBarPosition(
    channelValueList, upper5GChannels, avaliableBarChannels.upper5G, 'Upper5GChannels')

  const channelGroupListArray = getChannelGroupListArray(props.channelList, props.groupSize)
  const channelGroupValueList = channelGroupListArray.map(g=>g?.flatMap(c => c.value)) as string[][]
  const [channelGroupList, setChannelGroupList]
    = useState(getChannelGroupList(channelGroupListArray as RadioChannel[][]))

  const handleClickBarButton = (barType: ChannelTypeEnum) => {
    const oldSelected = (form.getFieldValue(props.formName) ?? []) as string[]
    const hasAnySelected = intersection(avaliableBarChannels[barType], oldSelected).length > 0
    const newSelected = hasAnySelected
      ? oldSelected.filter(item => !avaliableBarChannels[barType].includes(item))
      : oldSelected.concat(avaliableBarChannels[barType])
    form.setFieldValue(props.formName, uniq(newSelected))
    updateChannelGroupList(uniq(newSelected))
  }

  const handleClickGroupChannels = async (checkedValues: any) => {
    const selectedValue = await getSelectedValues(channelGroupValueList, checkedValues)
    form.setFieldValue(props.formName, selectedValue)
    updateChannelGroupList(selectedValue)
  }

  useEffect(() => {
    if(props.channelList && props.groupSize){
      const channelGroupListArray = getChannelGroupListArray(props.channelList, props.groupSize)
      setChannelValueList(props.channelList.map((channelItem: RadioChannel) => channelItem.value))
      setChannelGroupList(getChannelGroupList(channelGroupListArray as RadioChannel[][]))
    }
  }, [props.channelList, props.groupSize])

  return (<>
    {showLowerUpper5GBar && <div>
      {avaliableBarChannels.lower5G?.length > 0 && <Button5G
        disabled={disabled}
        onClick={() => handleClickBarButton(ChannelTypeEnum.lower5G)}
        style={{ width: lower5GBarPosition.width }}
      >
        {$t({ defaultMessage: 'Lower 5G' })}
      </Button5G>}
      {avaliableBarChannels.upper5G?.length > 0 && <Button5G
        disabled={disabled}
        onClick={() => handleClickBarButton(ChannelTypeEnum.upper5G)}
        style={{ width: upper5GBarPosition.width }}
      >
        {$t({ defaultMessage: 'Upper 5G' })}
      </Button5G>}
    </div>}
    { showDfsBar && avaliableBarChannels.dfs?.length > 0 && <ButtonDFS
      disabled={disabled}
      onClick={() => handleClickBarButton(ChannelTypeEnum.dfs)}
      style={{ width: dfsBarPosition?.width, left: dfsBarPosition?.left }}
    >
      {$t({ defaultMessage: 'DFS' })}
    </ButtonDFS> }
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
          />
        }
        style={{ width: '100vw', height: '50px' }}
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
      ? { left: 30 * index, width: 30 * (channelLength + adjustLength) - 6 }
      : { left: 0, width: 0 }
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

  function updateChannelGroupList (selectedValues: string[]) {
    setChannelGroupList(channelGroupList.map(group => ({
      ...group,
      selected: selectedValues.includes(group.channels.map(c => c.value)[0])
    })))
  }

  async function getSelectedValues (groupValueList: string[][], selectedValues: string[]) {
    const values = selectedValues.map((value:string) =>
      groupValueList.filter(list => list?.includes(value))
    ).flat().flat()
    return uniq(values)
  }
}