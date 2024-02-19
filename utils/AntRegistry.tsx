'use client';

import React from 'react';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import type Entity from '@ant-design/cssinjs/es/Cache';
import { useServerInsertedHTML } from 'next/navigation';
import { ConfigProvider, theme } from 'antd';
import AppContextProvider from './AppContext';

const StyledComponentsRegistry = ({ children }: React.PropsWithChildren) => {
  const cache = React.useMemo<Entity>(() => createCache(), []);
  const isServerInserted = React.useRef<boolean>(false)
  useServerInsertedHTML(() => {
    if(isServerInserted.current) {
      return
    }
    isServerInserted.current = true
    return (
      <style id="antd" dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }} />
    )
  });

  return (
    <StyleProvider cache={cache}>
      <ConfigProvider>
        <AppContextProvider>
          {children}
        </AppContextProvider>
      </ConfigProvider>
    </StyleProvider>
  )
};

export default StyledComponentsRegistry;