import * as React from 'react';

export interface ILanguageServiceClientContext {
  installEditor: (theEditor: any) => void;
}

export const LanguageServiceClientContextDefaultValue = {} as ILanguageServiceClientContext;

export const LanguageServiceClientContext = React.createContext<ILanguageServiceClientContext>(
  LanguageServiceClientContextDefaultValue
);