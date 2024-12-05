export type InputType = 'insert' | 'deleteBackward' | 'deleteForward';

export type InitFunction<T> = (param: { initialValue: string; controlled: boolean }) => {
  value: string;
  options: T;
};

export type TrackingFunction<T> = (param: {
  inputType: InputType;
  previousValue: string;
  previousOptions: T;
  value: string;
  addedValue: string;
  changeStart: number;
  changeEnd: number;
  selectionStart: number;
  selectionEnd: number;
}) => {
  value: string;
  selectionStart: number;
  selectionEnd: number;
  options: T;
};

export interface InputOptions<T = unknown> {
  init: InitFunction<T>;
  tracking: TrackingFunction<T>;
}

export type InputComponentProps<C extends React.ComponentType | undefined = undefined> = {
  /** **Not used in the hook**. Serves to enable the use of custom components, for example, if you want to use your own styled component with the ability to format the value. */
  component?: C;
} & (C extends React.ComponentType<infer P> ? P : React.InputHTMLAttributes<HTMLInputElement>);

// https://github.com/GoncharukOrg/react-input/issues/15
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InputComponent<P extends object> = <C extends React.ComponentType<any> | undefined = undefined>(
  props: P & InputComponentProps<C> & React.RefAttributes<HTMLInputElement>,
) => React.JSX.Element;
