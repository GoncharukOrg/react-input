# @react-input/mask

✨ Apply any mask to the input using a provided component or a hook bound to the input element.

![npm](https://img.shields.io/npm/dt/@react-input/mask?style=flat-square)
![npm](https://img.shields.io/npm/v/@react-input/mask?style=flat-square)
![npm bundle size](https://img.shields.io/bundlephobia/min/@react-input/mask?style=flat-square)

[![Donate to our collective](https://opencollective.com/react-input/donate/button.png)](https://opencollective.com/react-input/donate)

[![Edit @react-input/mask](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/react-input-mask-r5jmmm?file=%2Fsrc%2FInput.tsx)

## What's new?

Usage via CDN is available (see «[Usage with CDN](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#usage-with-cdn)»).

The `input-mask` event and `onMask` method are no longer available in newer versions, focusing work on only using React's own events and methods such as `onChange`, since the `input-mask` event and `onMask` method cannot be explicitly coordinated with React's events and methods, making such usage and event firing order non-obvious.

To use the useful data from the `detail` property of the `input-mask` (`onMask`) event object, you can also use the utilities described in the «[Utils](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#utils)» section.

## Installation

```bash
npm i @react-input/mask
```

or using **yarn**:

```bash
yarn add @react-input/mask
```

or using **CDN** (for more information, see [UNPKG](https://unpkg.com/)):

```html
<script src="https://unpkg.com/@react-input/mask/cdn"></script>
```

## Unique properties

| Name          |         Type         | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------- | :------------------: | :-----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `component`   |     `Component`      |         | **Not used in the useMask hook**. Serves to enable the use of custom components, for example, if you want to use your own styled component with the ability to mask the value (see «[Integration with custom components](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#integration-with-custom-components)»).                                                                                               |
| `mask`        |       `string`       |  `""`   | Input mask, `replacement` is used to replace characters.                                                                                                                                                                                                                                                                                                                                                                          |
| `replacement` | `string` \| `object` |  `{}`   | Sets the characters replaced in the mask, where "key" is the replaced character, "value" is the regular expression to which the input character must match (see «[Replacement](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#replacement)»). It is possible to pass the replacement character as a string, then `replacement="_"` will default to `replacement={{ _: /./ }}`. Keys are ignored as you type. |
| `showMask`    |      `boolean`       | `false` | Controls the display of the mask, for example, `+0 (123) ___-__-__` instead of `+0 (123`.                                                                                                                                                                                                                                                                                                                                         |
| `separate`    |      `boolean`       | `false` | Stores the position of the entered characters. By default, input characters are non-breaking, which means that if you remove characters in the middle of the value, the characters are shifted to the left, forming a non-breaking value, which is the behavior of `input`. For example, with `true`, the possible value is `+0 (123) ___-45-__`, with `false` - `+0 (123) 45_-__-__`.                                            |
| `track`       |      `function`      |         | The `track` function is run before masking, allowing the entered value to be conditionally changed (see «[Track](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#track)»).                                                                                                                                                                                                                                    |
| `modify`      |      `function`      |         | Function triggered before masking. Allows you conditionally change the properties of the component that affect masking. Valid values ​​for modification are `mask`, `replacement`, `showMask` and `separate`. This is useful when you need conditionally tweak the displayed value to improve UX (see «[Modify](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#modify)»).                                    |

> You can also pass other properties available element `input` default or your own components, when integrated across the property `component`.

## Usage with React

The `@react-input/mask` package provides two options for using a mask. The first is the `InputMask` component, which is a standard input element with additional logic to handle the input. The second is using the `useMask` hook, which needs to be linked to the `input` element through the `ref` property.

One of the key features of the `@react-input/mask` package is that it only relies on user-supplied characters, so you can safely include any character in the mask without fear of the «unexpected behavior».

Let's see how you can easily implement a mask for entering a phone number using the `InputMask` component:

```tsx
import { InputMask } from '@react-input/mask';

export default function App() {
  return <InputMask mask="+0 (___) ___-__-__" replacement={{ _: /\d/ }} />;
}
```

You can work with the `InputMask` component in the same way as with the `input` element, with the difference that the `InputMask` component uses additional logic to process the value.

Now the same thing, but using the `useMask` hook:

```tsx
import { useMask } from '@react-input/mask';

export default function App() {
  const inputRef = useMask({
    mask: '+0 (___) ___-__-__',
    replacement: { _: /\d/ },
  });

  return <input ref={inputRef} />;
}
```

The `useMask` hook takes the same properties as the `InputMask` component, except for the `component` properties. Both approaches are equivalent, but the use of the `InputMask` component provides additional capabilities, which will be discussed in the section «[Integration with custom components](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#integration-with-custom-components)».

## Usage with CDN

To use the library's capabilities, you can also load it via CDN.

When loading, you get the global class `ReactInput.Mask`, calling it with the specified mask parameters will create a new object with two methods, where the first is `register`, which applies masking when inputting to the specified element, the second is `unregister`, which cancels the previous action. The following example illustrates this use:

```js
const mask = new ReactInput.Mask({
  mask: '+0 (___) ___-__-__',
  replacement: { _: /\d/ },
});

const elements = document.getElementsByName('phone');

elements.forEach((element) => {
  mask.register(element);
});

// If necessary, you can disable masking as you type.
// elements.forEach((element) => {
//   mask.unregister(element);
// });
```

Please note that in this way you can register multiple elements to which the mask will be applied.

To use the utilities described in the «[Utils](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#utils)» section, access them via the `ReactInput.Mask` class, for example `ReactInput.Mask.format(...`.

> Although you can use a class to mask input, using a hook or component in the React environment is preferable due to the optimizations applied, where you do not have to think about when to call `register` and `unregister` for input masking to work.

## Initializing the value

To support the concept of controlled input, `@react-input/mask` does not change the value passed in the `value` or `defaultValue` properties of the `input` element, so set the initialized value to something that can match the masked value at any point in the input. If you make a mistake, you'll see a warning in the console about it.

In cases where the input contains an unmasked value, you should use the `format` utility described in the chapter «[Utils](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#utils)» to substitute the correct value, for example:

```tsx
import { useMask, format } from '@react-input/mask';

const options = {
  mask: '+0 (___) ___-__-__',
  replacement: { _: /\d/ },
};

export default function App() {
  const inputRef = useMask(options);
  const defaultValue = format('1234567890', options);

  return <input ref={inputRef} defaultValue={defaultValue} />;
}
```

For consistent and correct behavior, the `type` property of the `input` element or the `InputMask` component must be set to `"text"` (the default), `"email"`, `"tel"`, `"search"`, or `"url"`. If you use other values, the mask will not be applied and you will see a warning in the console.

## Replacement

The `replacement` property sets the characters to be replaced in the mask, where "key" is the replaced character, "value" is the regular expression to which the input character must match. You can set one or more replaceable characters with different regexps,

like this:

```tsx
import { InputMask } from '@react-input/mask';

export default function App() {
  return <InputMask mask="dd.mm.yyyy" replacement={{ d: /\d/, m: /\d/, y: /\d/ }} showMask separate />;
}
```

It is possible to pass the replacement character as a string, then any characters will be allowed. For example, `replacement="_"` is the same as `replacement={{ _: /./ }}`.

> Do not use entered characters as `replacement` keys. For example, if you only allow numbers to be entered, given that the user can enter "9", then you should not set `replacement` to `{ 9: /\d/ }`, because keys are ignored when typing. Thus, the input of any numbers except "9" will be allowed.

## Track

The `track` function is run before masking, allowing the entered value to be conditionally changed.

You can intercept input to change the entered value every time the value in the input element changes. This is useful in cases where you need to provide a uniform data format, but at the same time you do not want to limit the user to the set of valid characters for input.

The `track` function takes the following parameters:

| Name             |                      Type                       | Description                                                                                                                                                                                                                                                                             |
| ---------------- | :---------------------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inputType`      | `insert` \| `deleteBackward` \| `deleteForward` | Input type, where `insert` is any event that affects the input of new characters, `deleteBackward` is deleting characters to the left of the cursor, `deleteForward` is deleting characters to the right of the cursor.                                                                 |
| `value`          |                    `string`                     | Corresponds to the value before modification, that is, the value before the character input or character removal events were raised.                                                                                                                                                    |
| `data`           |               `string` \| `null`                | In the case of input - the entered characters, in the case of deletion - `null`.                                                                                                                                                                                                        |
| `selectionStart` |                    `number`                     | The index of the beginning of the range of change in the value, in the case of input corresponds to the initial position of the cursor in `value` at the time the input event is called, in the case of deletion it corresponds to the index of the first deleted character.            |
| `selectionEnd`   |                    `number`                     | The index of the end of the range of change in the value, in the case of input corresponds to the final position of the cursor in `value` at the time the input event is called, in the case of deletion it corresponds to the index of the character after the last deleted character. |

The `track` function expects to return a string corresponding to the new or current input value, allowing you to change the user's input value. This can be done both when entering and when deleting characters. You can also return `false`, which will allow you to stop the input process and not cause the value and cursor offset to change. `null` will correspond to returning an empty string. `true` or `undefined` will cause the input value to not be changed.

Let's look at a simple example where we need to automatically substitute the country code when entering a phone number:

```tsx
import { InputMask, type Track } from '@react-input/mask';

export default function App() {
  const track: Track = ({ inputType, value, data, selectionStart, selectionEnd }) => {
    if (inputType === 'insert' && !/^\D*1/.test(data) && selectionStart <= 1) {
      return `1${data}`;
    }

    if (inputType !== 'insert' && selectionStart <= 1 && selectionEnd < value.length) {
      if (selectionEnd > 2) {
        return '1';
      }
      if (selectionEnd === 2) {
        return false;
      }
    }

    return data;
  };

  return <InputMask mask="+_ (___)-___-__-__" replacement={{ _: /\d/ }} track={track} />;
}
```

You can insert this example into your project and look at the result!

You don't need to think about creating a separate state, controlling cursor behavior or registering new events, you just need to specify what value will be used for input, and everything else will happen synchronously.

> Of course, this behavior requires you to write a little code yourself, this is because `@react-input/mask` is not intended to provide declarative solutions for a narrow circle of users, instead it allows all users to implement any idea using a simple api.

## Modify

The `modify` function is triggered before masking and allows you conditionally change the properties of the component that affect the masking.

The `modify` function expects to return an object containing the data to modify, optionally including `mask`, `replacement`, `showMask` and `separate`, or to return `undefined`. Changes will be only applied to those properties that were returned, so you can change any property as you like, or not change any property by passing `undefined`.

The `modify` function takes a value without mask characters that is valid at the time of input. For example, if the `mask` property has the value `+0 (___) ___-__-__` and the previous value is `+0 (123) ___-__-__` and the user entered the character "4" at the ninth index of the value, then `modify` will take the value "1234". Note that there are no mask characters including "7" as well. Using this value you can modify the properties with the expected result.

Let's consider a possible situation when we need to change the mask depending on the phone city code:

```tsx
import { InputMask } from '@react-input/mask';

export default function App() {
  const modify = (input: string) => {
    return { mask: input[0] === '0' ? '+_ (___) ___-__-__' : undefined };
  };

  return <InputMask mask="+_ __________" replacement={{ _: /\d/ }} modify={modify} />;
}
```

The advantage of this approach is that you do not need to store the state of the component to change its properties, the modification happens in the already running masking process.

## Integration with custom components

The `InputMask` component makes it easy to integrate with custom components allowing you to use your own styled components. To do this, you need to pass the custom component to the `forwardRef` method provided by React. `forwardRef` allows you automatically pass a `ref` value to a child element ([more on `forwardRef`](https://reactjs.org/docs/forwarding-refs.html)).

Then place your own component in the `component` property. The value for the `component` property can be either function components or class components.

With this approach, the `InputMask` component acts as a HOC, adding additional logic to the `input` element.

Here's how to do it:

```tsx
import { forwardRef } from 'react';

import { InputMask } from '@react-input/mask';

interface CustomInputProps {
  label: string;
}

// Custom input component
const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({ label }, forwardedRef) => {
  return (
    <>
      <label htmlFor="custom-input">{label}</label>
      <input ref={forwardedRef} id="custom-input" />
    </>
  );
});

// Component with InputMask
export default function App() {
  return <InputMask component={CustomInput} mask="___-___" replacement="_" label="Label for custom component" />;
}
```

> The `InputMask` component will not forward properties available only to the `InputMask`, so as not to break the logic of your own component.

## Integration with Material UI

If you are using [Material UI](https://mui.com/), you need to create a component that returns a `InputMask` and pass it as a value to the `inputComponent` property of the Material UI component.

In this case, the Material UI component expects your component to be wrapped in a `forwardRef`, where you will need to pass the reference directly to the `ref` property of the `InputMask` component.

Here's how to do it using the `InputMask` component:

```tsx
import { forwardRef } from 'react';

import { InputMask, type InputMaskProps } from '@react-input/mask';
import { TextField } from '@mui/material';

// Component with InputMask
const ForwardedInputMask = forwardRef<HTMLInputElement, InputMaskProps>((props, forwardedRef) => {
  return <InputMask ref={forwardedRef} mask="___-___" replacement="_" {...props} />;
});

// Component with Material UI
export default function App() {
  return (
    <TextField
      InputProps={{
        inputComponent: ForwardedInputMask,
      }}
    />
  );
}
```

or using the `useMask` hook:

```tsx
import { useMask } from '@react-input/mask';
import { TextField } from '@mui/material';

export default function App() {
  const inputRef = useMask({ mask: '___-___', replacement: '_' });

  return <TextField inputRef={inputRef} />;
}
```

> The examples correspond to Material UI version 5. If you are using a different version, please read the [Material UI documentation](https://mui.com/material-ui/).

## Usage with TypeScript

The `@react-input/mask` package is written in [TypeScript](https://www.typescriptlang.org/), so you have full type support out of the box. Additionally, you can import the types you need via `@react-input/mask` or `@react-input/mask/types`.

### Property type support

Since the `InputMask` component supports two use cases (as an `input` element and as an HOC for your own component), `InputMask` takes both use cases into account to support property types.

By default, the `InputMask` component is an `input` element and supports all the attributes supported by the `input` element. But if the `component` property was passed, the `InputMask` will additionally support the properties available to the integrated component. This approach allows you to integrate your own component as conveniently as possible, not forcing you to rewrite its logic, but using a mask where necessary.

```tsx
import { InputMask, type InputMaskProps, type MaskOptions } from '@react-input/mask';

export default function App() {
  // Here, since no `component` property was passed,
  // `InputMask` returns an `input` element and takes the type:
  // `MaskOptions & React.InputHTMLAttributes<HTMLInputElement>` (the same as `InputMaskProps`)
  return <InputMask mask="___-___" replacement="_" />;
}
```

```tsx
import { InputMask, type InputMaskProps, type MaskOptions } from '@react-input/mask';

import { CustomInput, type CustomInputProps } from './CustomInput';

export default function App() {
  // Here, since the `component` property was passed,
  // `InputMask` returns the `CustomInput` component and takes the type:
  // `MaskOptions & CustomInputProps` (the same as `InputMaskProps<typeof CustomInput>`)
  return <InputMask component={CustomInput} mask="___-___" replacement="_" />;
}
```

You may run into a situation where you need to pass rest parameters (`...rest`) to the `InputMask` component. If the rest parameters is of type `any`, the `component` property will not be typed correctly, as well as the properties of the component being integrated. this is typical TypeScript behavior for dynamic type inference.

To fix this situation and help the `InputMask` correctly inject your component's properties, you can pass your component's type directly to the `InputMask` component.

```tsx
import { InputMask } from '@react-input/mask';

import { CustomInput } from './CustomInput';

export default function Component(props: any) {
  return <InputMask<typeof CustomInput> component={CustomInput} mask="___-___" replacement="_" {...props} />;
}
```

## Testing and development

To make it easier to work with the library, you will receive corresponding messages in the console when errors occur, which is good during development, but not needed in a production application. To avoid receiving error messages in a production application, make sure that the `NODE_ENV` variable is set to `"production"` when building the application.

When testing a component with `showMask`, make sure that you set the initial cursor position (`selectionStart`). Value entry in testing tools starts from the end of the value, and without specifying `selectionStart` the entry will be made from a position equal to the length of the mask, since the `showMask` property actually inserts the value into the input element.

## Utils

`@react-input/mask` provides utilities to make things easier when processing a value. You can use them regardless of using the `InputMask` component or the `useMask` hook.

### `format`

Masks a value using the specified mask.

Takes two parameters, where the first is the unmasked value, the second is an object with the `mask` and `replacement` properties, the values of which you use when masking.

The result fully corresponds to the value obtained when entering. Useful when you need to get a masked value without calling an input event.

Since the principle of operation of `InputMask` is fully consistent with the operation of the `input` element, `InputMask` will not change the value outside the input event, so you may find yourself in a situation where the `input` element will have a value that does not correspond to the mask, for example when initializing the value of the received from the backend (see «[Initializing the value](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#initializing-the-value)» for more details).

```ts
format('1', { mask: '+__', replacement: { _: /\d/ } });
// returns: "+1"
```

### `unformat`

Unmasks the value using the specified mask.

Takes two parameters, where the first is the masked value, the second is an object with the `mask` and `replacement` properties, the values of which you use when masking.

Returns all characters entered by the user. Essentially does the opposite of the `format` utility. It is important to note that characters that do not match the replacement characters will also be deleted.

```ts
unformat('+1_', { mask: '+__', replacement: { _: /\d/ } });
// returns: "1"
```

### `formatToParts`

Specifies the parts of the masked value.

Takes two parameters, where the first is the unmasked value, the second is an object with the `mask` and `replacement` properties, the values of which you use when masking.

The masked value parts are an array of objects, where each object contains the necessary information about each character of the value. Parts of the masked value are used to manipulate a character or group of characters in a point-by-point manner.

Parts of the masked value, where each object contains the character type:

- `replacement` - the replacement character;
- `mask` - the mask character;
- `input` - the character entered by the user.

```ts
formatToParts('1', { mask: '+__', replacement: { _: /\d/ } });
// returns: [
//   { index: 0, value: '+', type: 'mask' },
//   { index: 1, value: '1', type: 'input' },
//   { index: 2, value: '_', type: 'replacement' },
// ]
```

### `generatePattern`

Generates a regular expression to match a masked value.

Takes two parameters, where the first is an object with the `mask` and `replacement` properties, the values of which you use when masking, the second is a flag (`boolean`), indicating to the utility exactly how you want to generate the regular expression.

If the second parameter is `true`, then the regular expression search will not take into account the `replacement` parameter key, that is, the character at the index of the replacement character in the value can be any character corresponding to the `replacement` value except the `replacement` key itself.

So, if `mask: '_'` and `replacement: { _: /\D/ }` then:

if the second parameter is omitted or `false`, the regular expression (pattern) will match `/^(\D)$/` and `RegExp(pattern).test(mask)` will return `true`:

```ts
const pattern = generatePattern({ mask, replacement }); // "^(\\D)$"
RegExp(pattern).test('_'); // true
```

if the second parameter is `true`, the regular expression (pattern) will match `/^(?!_)(\D)$/` and `RegExp(pattern).test(mask)` will return `false`, but any a valid character, in addition to the replacement character, will contribute to the return of `true`:

```ts
const pattern = generatePattern({ mask, replacement }, true); // "^(?!_)(\\D)$"
RegExp(pattern).test('_'); // false
RegExp(pattern).test('a'); // true
```

## Other packages from `@react-input`

- [`@react-input/number-format`](https://www.npmjs.com/package/@react-input/number-format) - apply locale-specific number, currency, and percentage formatting to input using a provided component or hook bound to the input element.

## Feedback

If you find a bug or want to make a suggestion for improving the package, [open the issues on GitHub](https://github.com/GoncharukOrg/react-input/issues) or email [goncharuk.bro@gmail.com](mailto:goncharuk.bro@gmail.com).

Support the project with a star ⭐ on [GitHub](https://github.com/GoncharukOrg/react-input).

You can also support the authors by donating 🪙 to [Open Collective](https://opencollective.com/react-input):

[![Donate to our collective](https://opencollective.com/react-input/donate/button.png)](https://opencollective.com/react-input/donate)

## License

[MIT](https://github.com/GoncharukOrg/react-input/blob/main/packages/mask/LICENSE) © [Nikolay Goncharuk](https://github.com/GoncharukOrg)
