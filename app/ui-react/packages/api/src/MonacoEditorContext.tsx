import * as React from 'react';

export interface IMonacoEditorContext {
  registerMessageListener: (listener: () => void) => void;
  unregisterMessageListener: (listener: () => void) => void;
}

export const MonacoEditorContextDefaultValue = {} as IMonacoEditorContext;

export const MonacoEditorContext = React.createContext<IMonacoEditorContext>(
  MonacoEditorContextDefaultValue
);
