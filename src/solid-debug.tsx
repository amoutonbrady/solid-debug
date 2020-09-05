import {
  Component,
  createContext,
  createState,
  useContext,
  produce,
  For,
  createEffect,
} from 'solid-js';

const css = {
  wrapper: {
    position: 'fixed',
    bottom: '5px',
    right: '5px',
    'border-radius': '0.25rem',
    background: '#333',
    color: '#fff',
    padding: '1rem',
    'font-family': 'monospace',
    'overflow-y': 'auto',
    'max-height': '40vh',
    'max-width': '40vw',
  } as JSX.CSSProperties,
  title: (i: number) =>
    ({
      padding: '0 0 0.25rem',
      margin: 0,
      'text-transform': 'uppercase',
      'font-size': '0.9rem',
      'border-bottom': 'dashed 2px #ccc',
      'margin-top': i > 0 && '1rem',
    } as JSX.CSSProperties),
  code: (center: boolean) =>
    ({
      overflow: 'auto',
      margin: '0.25rem 0 0',
      padding: '0.2rem',
      display: 'block',
      background: '#444',
      'border-radius': '0.25rem',
      'text-align': center ? 'center' : 'left',
    } as JSX.CSSProperties),
  list: { 'list-style-type': 'none', padding: 0 } as JSX.CSSProperties,
};

function createContextStore() {
  const [state, setState] = createState<Record<string, any[]>>({});

  return [
    state,
    (value: any, context = 'global') => {
      setState(
        produce((s: Record<string, any[]>) => {
          if (s[context] && Array.isArray(s[context])) {
            s[context].push(value);
          } else s[context] = [value];
        }),
      );
    },
  ] as const;
}

const DebugContext = createContext<ReturnType<typeof createContextStore>>();

export const useDebugger = (ctx?: string) => {
  const [, fn] = useContext(DebugContext);

  return (v: any) => fn(v, ctx);
};

const Debugger: Component = () => {
  const [state] = useContext(DebugContext);

  const valuesToArray = () => Object.entries(state);

  createEffect(() => console.table(state));

  return (
    <div style={css.wrapper}>
      <For each={valuesToArray()}>
        {([ctx, values]: any, i) => (
          <>
            <p style={css.title(i())}>{ctx}</p>
            <ul style={css.list}>
              <li>
                <For each={values}>
                  {(v) => (
                    <pre style={css.code(typeof v === 'function')}>
                      <code>{JSON.stringify(typeof v === 'function' ? v() : v, null, 4)}</code>
                    </pre>
                  )}
                </For>
              </li>
            </ul>
          </>
        )}
      </For>
    </div>
  );
};

export const DebugProvider: Component = (props) => {
  const store = createContextStore();

  return (
    <DebugContext.Provider value={store}>
      {props.children}
      <Debugger />
    </DebugContext.Provider>
  );
};
