import {
  CloseAction,
  createConnection,
  ErrorAction,
  MonacoLanguageClient,
  MonacoServices,
} from 'monaco-languageclient';
import * as React from 'react';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import { IFetchHeaders } from './callFetch';
 
export const LANGUAGE_SERVICE_CLIENT_CONNECTED = 'connected';

export interface IWithLanguageServiceClientProps {
  dvApiUri: string;
  headers: IFetchHeaders;
  children(props: IWithLanguageServiceClientChildrenProps): any;
}

export interface IWithLanguageServiceClientChildrenProps {
  installEditor: (theEditor: any) => void;
  registerLanguages: () => void;
}

const RECONNECT_TIME = 5000;
const LANGUAGE_ID = 'sql'; // 'teiid-ddl';

export class WithLanguageServiceClient extends React.Component<IWithLanguageServiceClientProps> {
  private starting = false;
  private started = false;
  private unmounting = false;
  private retries = 0;
  private eventSource: EventSource | undefined;
  private webSocket: WebSocket | undefined;

  public constructor(props: IWithLanguageServiceClientProps) {
    super(props);
  }

  public installEditor(theEditor: any) {
    // tslint:disable-next-line:no-console
    console.log(" >>> WithLanguageServiceClient.installEditor() theEditor = ", theEditor);
    MonacoServices.install(theEditor);
    this.startConnection();
  }

    /*
   * When the text editor has been rendered, we need to create the language server connection and wire
   * it up to a new code mirror adapter
   */
  public registerLanguages = () => {
    monaco.languages.register({
      extensions: ['.ddl'],
      id: LANGUAGE_ID,
    });
  };

  public async componentDidMount() {
    // tslint:disable-next-line:no-console
    console.log(" >>> WithLanguageServiceClient.componentDidMount() ");
  }

  public async componentWillUnmount() {
    this.unmounting = true;
    this.close();
  }

  public shouldComponentUpdate(
    nextProps: Readonly<IWithLanguageServiceClientProps>,
    nextState: Readonly<{}>,
    nextContext: any
  ): boolean {
    return false;
  }

  public render() {
    // tslint:disable-next-line:no-console
    console.log(" >>> WithLanguageServiceClient.render() ");
    return this.props.children({
      installEditor: this.installEditor,
      registerLanguages: this.registerLanguages,
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
    // tslint:disable-next-line:no-console
    console.log(" >>> WithLanguageServiceClient.connectWebSocket() url = ", url);
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
      this.onFailure(event);
    };
    return this.webSocket;
  }

  private createLanguageClient(connection: MessageConnection) {
    // tslint:disable-next-line:no-console
    console.log(" >>> WithLanguageServiceClient.createLanguageClient()");
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
