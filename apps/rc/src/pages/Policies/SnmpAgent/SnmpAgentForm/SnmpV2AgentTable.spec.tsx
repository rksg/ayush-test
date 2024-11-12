import { useReducer } from 'react'

import userEvent from '@testing-library/user-event'

import { render, renderHook, screen, waitFor, within } from '@acx-ui/test-utils'

import { mockSnmpV2Agents, newEmptySnmpData } from './__tests__/fixtures'
import SnmpAgentFormContext, { mainReducer }  from './SnmpAgentFormContext'
import SnmpAgentV2Table                       from './SnmpV2AgentTable'

const renderInitState = (children: JSX.Element, initState=newEmptySnmpData) => {
  const { result } = renderHook(() => useReducer(mainReducer, initState ))
  const [state, dispatch] = result.current

  const renderElement = <SnmpAgentFormContext.Provider value={{ state, dispatch }}>
    {children}
  </SnmpAgentFormContext.Provider>

  return {
    state, dispatch, renderElement
  }
}

describe('SnmpV2AgentTable', () => {

  it('should Edit/ Delete SNMP V2 Agent successfully', async () => {
    const snmpData = { ...newEmptySnmpData, snmpV2Agents: mockSnmpV2Agents }
    const { renderElement } = renderInitState(
      <SnmpAgentV2Table />, snmpData
    )
    render(renderElement)

    let rows = await screen.findAllByRole('row', { name: /joe_cn/i })
    expect(rows.length).toBe(2)

    // Delete SNMPv2 Agent
    await userEvent.click(await screen.findByText('joe_cn1'))
    const delBtn = await screen.findByRole('button', { name: 'Delete' })
    expect(delBtn).toBeInTheDocument()
    await userEvent.click(delBtn)
    await waitFor(() => {
      expect(delBtn).not.toBeVisible()
    })

    // Edit SNMPv2 Agent
    const row = await screen.findByRole('row', { name: /joe_cn2/i })
    await userEvent.click(await within(row).findByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    await screen.findAllByText('Edit SNMPv2 Agent')

    await userEvent.type(
      await screen.findByRole('textbox', { name: /Community Name/i }), 'jj_cn2')

    const applyBtn = await screen.findByRole('button', { name: 'Apply' })
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(applyBtn).not.toBeInTheDocument()
    })
  })

  it('should Add SNMP V2 Agent successfully', async () => {
    const { renderElement } = renderInitState(
      <SnmpAgentV2Table />
    )
    render(renderElement)

    // Add SNMPv2 Agent
    await userEvent.click(await screen.findByRole('button', { name: 'Add SNMPv2 Agent' }))
    await userEvent.type(await screen.findByRole('textbox', { name: 'Community Name' }), 'cn1')
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    await screen.findByText('Please enable at least one privilege option.')

    await userEvent.click(await screen.findByRole('checkbox', { name: 'Read-only' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
    })
  })
})
