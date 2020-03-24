import {
  CloseAction,
  createConnection,
  ErrorAction,
  MonacoLanguageClient,
} from 'monaco-languageclient';
import * as React from 'react';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import { IFetchHeaders } from './callFetch';
  
export const MONACO_EDITOR_CONNECTED = 'connected';

export interface IWithMonacoEditorProps {
  dvApiUri: string;
  headers: IFetchHeaders;
  children(props: IWithMonacoEditorChildrenProps): any;
}

export interface IWithMonacoEditorChildrenProps {
  registerMessageListener: (listener: () => void) => void;
  unregisterMessageListener: (listener: () => void) => void;
}

const RECONNECT_TIME = 5000;
const LANGUAGE_ID = 'sql'; // 'teiid-ddl';

export class WithMonacoEditor extends React.Component<IWithMonacoEditorProps> {
  private starting = false;
  private started = false;
  private unmounting = false;
  private retries = 0;
  private eventSource: EventSource | undefined;
  private webSocket: WebSocket | undefined;

  public constructor(props: IWithMonacoEditorProps) {
    super(props);
  }

  public registerMessageListener(listener: () => void) {
    // test
  }

  public unregisterMessageListener(listener: () => void) {
    // test
  }

  public async componentDidMount() {
    this.start();
  }

  public async componentWillUnmount() {
    this.unmounting = true;
    this.close();
  }

  public shouldComponentUpdate(
    nextProps: Readonly<IWithMonacoEditorProps>,
    nextState: Readonly<{}>,
    nextContext: any
  ): boolean {
    return false;
  }

  public render() {
    return this.props.children({
      registerMessageListener: this.registerMessageListener,
      unregisterMessageListener: this.unregisterMessageListener,
    });
  }

  private close() {
    this.started = false;
    this.starting = false;
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = undefined;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

  private start() {
    this.startConnection();
  }

  private onFailure(error: any) {
    this.close();
    if (this.unmounting) {
      return;
    }
    this.retries++;
    // Initialy retry very quickly.
    let reconnectIn = RECONNECT_TIME;
    if (this.retries < 3) {
      reconnectIn = 1;
    }
    setTimeout(() => {
      // console.log('Reconnecting');
      this.startConnection();
    }, reconnectIn);
  }

  private async startConnection() {
    if (this.starting || this.started || this.unmounting) {
      return;
    }
    this.starting = true;
    try {
      // create the web socket
      // Ecilpse launched test web service:  'ws://localhost:8025/teiid-ddl-language-server';
      // Target URL should look like this:  'wss://syndesis-syndesis.nip.io.192.168.42.99.nip.io/dv/teiid-ddl-language-server';
      const url = this.props.dvApiUri.replace(/^http/, 'ws').replace('/v1', '')+'teiid-ddl-language-server';

      this.starting = false;
      this.started = true;
      this.connectWebSocket(url);
    } catch (error) {
      this.onFailure(error);
    }
  }

  private connectWebSocket(url: string) {
    this.webSocket = new WebSocket(url, []);
    const webSocket = this.webSocket;
    // listen when the web socket is opened
    listen({
      webSocket,
      // tslint:disable-next-line:object-literal-sort-keys
      onConnection: connection => {
        // create and start the language client
        const languageClient = this.createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());
      },
    });

    this.webSocket.onmessage = event => {
      this.started = true;
      this.starting = false;
    };
    this.webSocket.onclose = event => {
      // console.log('ws.onclose: ', event);
      this.onFailure(event);
    };
    return this.webSocket;
  }

  private createLanguageClient(connection: MessageConnection) {
    return new MonacoLanguageClient({
      name: 'Sample Language Client',
      // tslint:disable-next-line:object-literal-sort-keys
      clientOptions: {
        // use a language id as a document selector
        documentSelector: [LANGUAGE_ID],
        // disable the default error handler
        errorHandler: {
          closed: () => CloseAction.DoNotRestart,
          error: () => ErrorAction.Continue,
        },
      },
      // create a language client connection from the JSON RPC connection on demand
      connectionProvider: {
        get: (errorHandler, closeHandler) => {
          return Promise.resolve(
            createConnection(connection, errorHandler, closeHandler)
          );
        },
      },
    });
  };

}
