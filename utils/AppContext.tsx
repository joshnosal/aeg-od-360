'use client'
import React from 'react'
import type { NoticeType } from 'antd/es/message/interface';
import { message, ConfigProvider, theme, ThemeConfig } from 'antd';

export interface AppContextProps {
  message: (content: string, type: NoticeType) => void
}

export const AppContext = React.createContext<AppContextProps>({} as AppContextProps)

export default function AppContextProvider(props: { children: React.ReactNode}){
  const [ messageApi, contextHolder ] = message.useMessage()

  const appContext = React.useMemo<AppContextProps>(() => ({
    message: (content, type) => messageApi.open({content, type})
  }), [messageApi])

  return (
    <AppContext.Provider value={appContext}>
      {contextHolder}
      {props.children}
    </AppContext.Provider>
  )

}