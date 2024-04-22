import { useReducer } from 'react'

import userEvent from '@testing-library/user-event'

import { render, renderHook, screen, waitFor, within } from '@acx-ui/test-utils'

import { mockSnmpV3Agents, newEmptySnmpData } from './__tests__/fixtures'
import SnmpAgentFormContext, { mainReducer }  from './SnmpAgentFormContext'
import SnmpAgentV3Table                       from './SnmpV3AgentTable'

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

describe('SnmpV3AgentTable', () => {

  it('should Edit/Delete SNMP V3 Agent successfully', async () => {
    const snmpData = { ...newEmptySnmpData, snmpV3Agents: mockSnmpV3Agents }
    const { renderElement } = renderInitState(
      <SnmpAgentV3Table />, snmpData
    )
    render(renderElement)

    let v3Rows = await screen.findAllByRole('row', { name: /joe_un/i })
    expect(v3Rows.length).toBe(2)

    // Delete SNMPv3 Agent
    await userEvent.click(await screen.findByText('joe_un1'))
    const delBtn = await screen.findByRole('button', { name: 'Delete' })
    expect(delBtn).toBeInTheDocument()
    await userEvent.click(delBtn)
    await waitFor(() => {
      expect(delBtn).not.toBeVisible()
    })

    // Edit SNMPv3 Agent
    expect(within(v3Rows[1]).getByRole('cell', { name: /joe_un2/i })).toBeVisible()
    await userEvent.click(await within(v3Rows[1]).findByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    await screen.findByText('Edit SNMPv3 Agent')

    await userEvent.type(
      await screen.findByRole('textbox', { name: /User Name/i }), 'jj_un2')

    const applyBtn = await screen.findByRole('button', { name: 'Apply' })
    await userEvent.click(applyBtn)

    await waitFor(() => {
      expect(applyBtn).not.toBeInTheDocument()
    })
  })

  it('should Add SNMP V3 Agent successfully', async () => {
    const { renderElement } = renderInitState(
      <SnmpAgentV3Table />
    )
    render(renderElement)

    // Add SNMPv3 Agent
    await userEvent.click(await screen.findByRole('button', { name: 'Add SNMPv3 Agent' }))
    await userEvent.type(
      await screen.findByRole('textbox', { name: /User Name/i }), 'jj_un1')

    await userEvent.type(
      await screen.findByLabelText(/Authentication Password/i), '88888888')

    const addBtn = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addBtn)

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
    })

  })
})
