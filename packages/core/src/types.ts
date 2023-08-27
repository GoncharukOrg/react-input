export interface CustomInputEvent<D = unknown> extends CustomEvent<D> {
  target: EventTarget & HTMLInputElement;
}

export type CustomInputEventHandler<E extends CustomInputEvent> = {
  bivarianceHack(event: E): void;
}['bivarianceHack'];

export type InputType = 'initial' | 'insert' | 'deleteBackward' | 'deleteForward';

export interface InputAttributes {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

interface InitParam {
  controlled: boolean;
  initialValue: string;
}

export type Init = (param: InitParam) => Pick<InputAttributes, 'value'>;

interface TrackingParam {
  inputType: InputType;
  value: string;
  addedValue: string;
  deletedValue: string;
  previousValue: string;
  changeStart: number;
  changeEnd: number;
  selectionStart: number;
  selectionEnd: number;
}

export type Tracking<D = unknown> = (param: TrackingParam) => InputAttributes & { __detail: D };

export interface ExtendedHTMLInputElement extends HTMLInputElement {
  _wrapperState?: {
    controlled?: boolean;
    initialValue?: string;
  };
  _valueTracker?: {
    getValue?: () => string;
    setValue?: (value: string) => void;
  };
}

export type InputComponentProps<C extends React.ComponentType | undefined = undefined> = {
  component?: C;
} & (C extends React.ComponentType<infer P> ? P : React.InputHTMLAttributes<HTMLInputElement>);

export type InputComponent<P extends object> = <C extends React.ComponentType | undefined = undefined>(
  props: P & InputComponentProps<C> & React.RefAttributes<HTMLInputElement>
) => JSX.Element;
