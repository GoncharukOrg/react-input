# @react-input/number-format

✨ Apply locale-specific number, currency, and percentage formatting to input using a provided component or hook bound to the input element.

![npm](https://img.shields.io/npm/dt/@react-input/number-format?style=flat-square)
![npm](https://img.shields.io/npm/v/@react-input/number-format?style=flat-square)
![npm bundle size](https://img.shields.io/bundlephobia/min/@react-input/number-format?style=flat-square)

[![Donate to our collective](https://opencollective.com/react-input/donate/button.png)](https://opencollective.com/react-input/donate)

[![Edit @react-input/number-format](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/react-input-number-format-r234d9?file=%2Fsrc%2FInput.tsx)

## Installation

```bash
npm i @react-input/number-format
```

or using **yarn**:

```bash
yarn add @react-input/number-format
```

## Unique properties

| Name                    |                          Type                          |   Default   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------- | :----------------------------------------------------: | :---------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `component`             |                      `Component`                       |             | **Not used in the useNumberFormat hook**. Serves to enable the use of custom components, for example, if you want to use your own styled component with the ability to format the value (see «[Integration with custom components](https://github.com/GoncharukOrg/react-input/tree/main/packages/number-format#integration-with-custom-components)»).                                                                                                                                                                                                     |
| `locales`               |                 `string` \| `string[]`                 |             | The locale is specified as a string , or an array of such strings in order of preference. By default, the locale set in the environment (browser) is used. For the general form and interpretation of the locales argument, see [Locale identification and negotiation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locale_identification_and_negotiation).                                                                                                                                                      |
| `format`                | `"decimal"` \| `"currency"` \| `"percent"` \| `"unit"` | `"decimal"` | The formatting style to use.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `currency`              |                        `string`                        |             | The currency to use in currency formatting. Possible values are the ISO 4217 currency codes, such as `"USD"` for the US dollar, `"EUR"` for the euro, or `"CNY"` for the Chinese RMB — see the [Current currency & funds code list](https://www.six-group.com/en/products-services/financial-information/data-standards.html#scrollTo=currency-codes). If the `format` is `"currency"`, the `currency` property must be provided.                                                                                                                          |
| `currencyDisplay`       | `"symbol"` \| `"narrowSymbol"` \| `"code"` \| `"name"` | `"symbol"`  | How to display the currency in currency formatting.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `unit`                  |                        `string`                        |             | The unit to use in `unit` formatting, Possible values are core unit identifiers, defined in [UTS #35, Part 2, Section 6](https://unicode.org/reports/tr35/tr35-general.html#Unit_Elements). Pairs of simple units can be concatenated with `"-per-"` to make a compound unit. If the `format` is `"unit"`, the `unit` property must be provided.                                                                                                                                                                                                           |
| `unitDisplay`           |          `"short"` \| `"long"` \| `"narrow"`           |  `"short"`  | The unit formatting style to use in `unit` formatting.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `signDisplay`           | `"auto"` \| `"never"` \| `"always"` \| `"exceptZero"`  |  `"auto"`   | When to display the sign for the number.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `groupDisplay`          |                 `"auto"` \| `boolean`                  |  `"auto"`   | Whether to use grouping separators, such as thousands separators or thousand/lakh/crore separators.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `minimumIntegerDigits`  |                        `number`                        |     `1`     | The minimum number of integer digits to use. A value with a smaller number of integer digits than this number will be left-padded with zeros (to the specified length) when formatted.                                                                                                                                                                                                                                                                                                                                                                     |
| `maximumIntegerDigits`  |                        `number`                        |             | The maximum number of integer digits to use.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `minimumFractionDigits` |                        `number`                        |             | The minimum number of fraction digits to use. The default for plain number and percent formatting is `0`. The default for currency formatting is the number of minor unit digits provided by the [ISO 4217 currency code list](https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml) (`2` if the list doesn't provide that information).                                                                                                                                                              |
| `maximumFractionDigits` |                        `number`                        |             | The maximum number of fraction digits to use. The default for plain number formatting is the larger of `minimumFractionDigits` and `3`. The default for currency formatting is the larger of `minimumFractionDigits` and the number of minor unit digits provided by the [ISO 4217 currency code list](https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml) (`2` if the list doesn't provide that information). The default for percent formatting is the larger of `minimumFractionDigits` and `0`. |
| `onNumberFormat`        |                       `function`                       |             | Handler for the custom event `input-number-format`. Called asynchronously after the `change` event, accessing the `detail` property containing additional useful information about the value. (see «[Number format event](https://github.com/GoncharukOrg/react-input/tree/main/packages/number-format#format-event)»).                                                                                                                                                                                                                                    |

> Since the package is based on the `Intl.NumberFormat` constructor, it is important to consider that the functionality of both the package itself and its properties will depend on your browser versions. You can view support for browser versions [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat).
>
> If you are using TypeScript, the properties of the `InputNumberFormat` component will be typed based on your version of TypeScript, so make sure you are using the latest stable version of TypeScript in your project.
>
> You can also pass other properties available element `input` default or your own components, when integrated across the property `component`.

## Usage

The `@react-input/number-format` package provides two options for using formatting. The first is the `InputNumberFormat` component, which is a standard input element with additional logic to handle the input. The second is using the `useNumberFormat` hook, which needs to be linked to the `input` element through the `ref` property.

One of the key features of the `@react-input/number-format` package is that it can format numbers according to the desired language using the [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#parameters) constructor.

Let's see how we can easily implement formatting based on the given locale and the minimum number of decimal places using the `InputNumberFormat` component:

```tsx
import { InputNumberFormat } from '@react-input/number-format';

export default function App() {
  return <InputNumberFormat locales="en" maximumFractionDigits={2} />;
}
```

You can work with the `InputNumberFormat` component in the same way as with the `input` element, with the difference that the `InputNumberFormat` component uses additional logic to value formatting.

Now the same thing, but using the `useNumberFormat` hook:

```tsx
import { useNumberFormat } from '@react-input/number-format';

export default function App() {
  const inputRef = useNumberFormat({
    locales: 'en',
    maximumFractionDigits: 2,
  });

  return <input ref={inputRef} />;
}
```

The `useNumberFormat` hook takes the same properties as the `InputNumberFormat` component, except for the `component` properties. Both approaches are equivalent, but the use of the `InputNumberFormat` component provides additional capabilities, which will be discussed in the section «[Integration with custom components](https://github.com/GoncharukOrg/react-input/tree/main/packages/number-format#integration-with-custom-components)».

## Initializing the value

To support the concept of controlled input, `@react-input/number-format` does not change the value passed in the `value` or `defaultValue` properties of the `input` element, so set the initialized value to something that can match the formatted value at any point in the input. If you make a mistake, you will see a warning in the console about it.

In cases where the input value is unformatted, you should use the `format` utility described in the chapter "[Utils](https://github.com/GoncharukOrg/react-input/tree/main/packages/number-format#utils)" to substitute the correct value, for example:

```tsx
import { useNumberFormat, format } from '@react-input/number-format';

const locales = 'en';
const options = { maximumFractionDigits: 2 };

export default function App() {
  const inputRef = useNumberFormat({ locales, ...options });
  const defaultValue = format(123456789, { locales, ...options });

  return <input ref={inputRef} defaultValue={defaultValue} />;
}
```

For consistent and correct behavior, the `type` property of the `input` element or the `InputNumberFormat` component must be set to `"text"` (the default). If you use other values, the formatting will not be applied and you will see a warning in the console.

## Examples of using

The base use without specifying a locale returns a formatted string in the default locale and with default options:

```tsx
import { InputNumberFormat } from '@react-input/number-format';

export default function App() {
  // Entering 3500 will print '3,500' to the console if in US English locale
  return <InputNumberFormat onChange={(event) => console.log(event.target.value)} />;
}
```

The following example show some variations of localized number formats. To get the format of the language used in your application's user interface, be sure to specify that language (and possibly some fallback languages) with the `locales` argument:

```tsx
import { InputNumberFormat } from '@react-input/number-format';

// Entering 123456.789 will print:

export default function App() {
  return (
    <>
      {/* India uses thousands/lakh/crore separators */}
      <InputNumberFormat
        locales="en-IN"
        onChange={(event) => console.log(event.target.value)} // "1,23,456.789"
      />
      {/* When requesting a language that may not be supported, such as Balinese, include a fallback language, in this case Indonesian */}
      <InputNumberFormat
        locales={['ban', 'id']}
        onChange={(event) => console.log(event.target.value)} // "123.456,789"
      />
      {/* He nu extension key requests a numbering system, e.g. Chinese decimal */}
      <InputNumberFormat
        locales="zh-Hans-CN-u-nu-hanidec"
        onChange={(event) => console.log(event.target.value)} // "一二三,四五六.七八九"
      />
      {/* Arabic in most Arabic speaking countries uses real Arabic digits */}
      <InputNumberFormat
        locales="ar-EG"
        onChange={(event) => console.log(event.target.value)} // "١٢٣٤٥٦٫٧٨٩"
      />
      {/* German uses comma as decimal separator and period for thousands */}
      <InputNumberFormat
        locales="de-DE"
        format="currency"
        currency="EUR"
        onChange={(event) => console.log(event.target.value)} // "123.456,78 €"
      />
      {/* Formatting with units */}
      <InputNumberFormat
        locales="pt-PT"
        format="unit"
        unit="kilometer-per-hour"
        onChange={(event) => console.log(event.target.value)} // "123 456,789 km/h"
      />
    </>
  );
}
```

## Number format event

It can be useful to have additional data about the value at hand, for this you can use the `input-number-format` event.

The `input-number-format` event is fired asynchronously after the `change` event, in addition, the `input-number-format` event object has a `detail` property that contains additional useful information about the value:

| Name     |   Type   | Description                                     |
| -------- | :------: | ----------------------------------------------- |
| `value`  | `string` | Formatted value (same as `event.target.value`). |
| `number` | `number` | The number used for formatting.                 |

By itself, the `input-number-format` event can completely replace the `change` event, but you should not use it if it is not necessary, since the `input-number-format` event is called asynchronously after the `change` event has completed, which may lead to additional rendering of the component. Consider the `input-number-format` event as an optional feature, not a required feature.

> You can use both the `input-number-format` event and the `change` event to save the state, however, if you don't need additional parameters in the `detail` property, prefer the `change` event.

An example of using the `input-number-format` event:

```tsx
import { useState } from 'react';

import { InputNumberFormat, type NumberFormatEventDetail } from '@react-input/number-format';

export default function App() {
  const [detail, setDetail] = useState<NumberFormatEventDetail | null>(null);

  return <InputNumberFormat value={detail?.value ?? ''} onNumberFormat={(event) => setDetail(event.detail)} />;
}
```

## Integration with custom components

The `InputNumberFormat` component makes it easy to integrate with custom components allowing you to use your own styled components. To do this, you need to pass the custom component to the `forwardRef` method provided by React. `forwardRef` allows you automatically pass a `ref` value to a child element ([more on `forwardRef`](https://reactjs.org/docs/forwarding-refs.html)).

Then place your own component in the `component` property. The value for the `component` property can be either function components or class components.

With this approach, the `InputNumberFormat` component acts as a HOC, adding additional logic to the `input` element.

Here's how to do it:

```tsx
import { forwardRef } from 'react';

import { InputNumberFormat } from '@react-input/number-format';

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

// Component with InputNumberFormat
export default function App() {
  return <InputNumberFormat component={CustomInput} label="Label for custom component" />;
}
```

> The `InputNumberFormat` component will not forward properties available only to the `InputNumberFormat`, so as not to break the logic of your own component.

## Integration with Material UI

If you are using [Material UI](https://mui.com/), you need to create a component that returns a `InputNumberFormat` and pass it as a value to the `inputComponent` property of the Material UI component.

In this case, the Material UI component expects your component to be wrapped in a `forwardRef`, where you will need to pass the reference directly to the `ref` property of the `InputNumberFormat` component.

Here's how to do it using the `InputNumberFormat` component:

```tsx
import { forwardRef } from 'react';

import { InputNumberFormat, type InputNumberFormatProps } from '@react-input/number-format';
import { TextField } from '@mui/material';

// Component with InputNumberFormat
const ForwardedInputNumberFormat = forwardRef<HTMLInputElement, InputNumberFormatProps>((props, forwardedRef) => {
  return <InputNumberFormat ref={forwardedRef} locales="en" maximumFractionDigits={2} {...props} />;
});

// Component with Material UI
export default function App() {
  return (
    <TextField
      InputProps={{
        inputComponent: ForwardedInputNumberFormat,
      }}
    />
  );
}
```

or using the `useNumberFormat` hook:

```tsx
import { useNumberFormat } from '@react-input/number-format';
import { TextField } from '@mui/material';

export default function App() {
  const inputRef = useNumberFormat({ locales: 'en', maximumFractionDigits: 2 });

  return <TextField inputRef={inputRef} />;
}
```

> The examples correspond to Material UI version 5. If you are using a different version, please read the [Material UI documentation](https://mui.com/material-ui/).

## Usage with TypeScript

The `@react-input/number-format` package is written in [TypeScript](https://www.typescriptlang.org/), so you have full type support out of the box. In addition, you can import the types you need for your use:

```tsx
import { useState } from 'react';

import { InputNumberFormat } from '@react-input/number-format';

import type { NumberFormatEventDetail, NumberFormatEvent, NumberFormatEventHandler } from '@react-input/number-format';

export default function App() {
  const [detail, setDetail] = useState<NumberFormatEventDetail | null>(null);

  // Or `event: NumberFormatEvent`
  const handleNumberFormat: NumberFormatEventHandler = (event) => {
    setDetail(event.detail);
  };

  return <InputNumberFormat onNumberFormat={handleNumberFormat} />;
}
```

### Property type support

Since the `InputNumberFormat` component supports two use cases (as an `input` element and as an HOC for your own component), `InputNumberFormat` takes both use cases into account to support property types.

By default, the `InputNumberFormat` component is an `input` element and supports all the attributes supported by the `input` element. But if the `component` property was passed, the `InputNumberFormat` will additionally support the properties available to the integrated component. This approach allows you to integrate your own component as conveniently as possible, not forcing you to rewrite its logic, but using a formatting where necessary.

```tsx
import { InputNumberFormat, type InputNumberFormatProps, type NumberFormatProps } from '@react-input/number-format';

export default function App() {
  // Here, since no `component` property was passed,
  // `InputNumberFormat` returns an `input` element and takes the type:
  // `NumberFormatProps & React.InputHTMLAttributes<HTMLInputElement>` (the same as `InputNumberFormatProps`)
  return <InputNumberFormat />;
}
```

```tsx
import { InputNumberFormat, type InputNumberFormatProps, type NumberFormatProps } from '@react-input/number-format';

import { CustomInput, type CustomInputProps } from './CustomInput';

export default function App() {
  // Here, since the `component` property was passed,
  // `InputNumberFormat` returns the CustomInput component and takes the type:
  // `NumberFormatProps & CustomInputProps` (the same as `InputNumberFormatProps<typeof CustomInput>`)
  return <InputNumberFormat component={CustomInput} />;
}
```

You may run into a situation where you need to pass rest parameters (`...rest`) to the `InputNumberFormat` component. If the rest parameters is of type `any`, the `component` property will not be typed correctly, as well as the properties of the component being integrated. this is typical TypeScript behavior for dynamic type inference.

To fix this situation and help the `InputNumberFormat` correctly inject your component's properties, you can pass your component's type directly to the `InputNumberFormat` component.

```tsx
import { InputNumberFormat } from '@react-input/number-format';

import { CustomInput } from './CustomInput';

export default function Component(props: any) {
  return <InputNumberFormat<typeof CustomInput> component={CustomInput} {...props} />;
}
```

## Testing and development

To make it easier to work with the library, you will receive corresponding messages in the console when errors occur, which is good during development, but not needed in a production application. To avoid receiving error messages in a production application, make sure that the `NODE_ENV` variable is set to `"production"` when building the application.

Because each input performs the necessary calculations to set the formatting of the value, you need to set a delay between character inputs when testing the input in your application, otherwise the test may not succeed due to the necessary changes between inputs not taking effect.

The recommended delay time is 15 milliseconds, however, you may need to set a different time, which can be found experimentally.

## Utils

`@react-input/number-format` provides utilities to make things easier when processing a value. You can use them regardless of using the `InputNumberFormat` component or the `useNumberFormat` hook.

### `format`

Formats a value using the specified locales and options.

Takes three parameters, where the first is the number or string to format and the third is an object with options you use when formating.

The result is exactly the same as the value received from the input. Useful when you need to get the formatted value without raising the input event.

Since `InputNumberFormat` works exactly like the `input` element, `InputNumberFormat` will not change the value outside of the input event, so you may end up in a situation where the `input` element has a value that does not match the desired format, such as when initializing a value received from a backend.

```ts
format(123456.78, { locales: 'en-IN', format: 'currency', currency: 'USD' });
// returns: "$1,23,456.78"
```

### `unformat`

Unformats the value using the specified locales.

Takes two parameters, where the first is the value to format, and the second is the locale you are using when formatting. Specifying the locale is required to recognize digits, decimal separator, and minus signs, as they may differ across locales.

Returns a string as the numeric equivalent of the formatted value.

```ts
unformat('$1,23,456.78', 'en-IN');
// returns: "123456.78"
```

## Other packages from `@react-input`

- [`@react-input/mask`](https://www.npmjs.com/package/@react-input/mask) - apply any mask to the input using a provided component or a hook bound to the input element.

## Feedback

If you find a bug or want to make a suggestion for improving the package, [open the issues on GitHub](https://github.com/GoncharukOrg/react-input/issues) or email [goncharuk.bro@gmail.com](mailto:goncharuk.bro@gmail.com).

Support the project with a star ⭐ on [GitHub](https://github.com/GoncharukOrg/react-input).

You can also support the authors by donating 🪙 to [Open Collective](https://opencollective.com/react-input):

[![Donate to our collective](https://opencollective.com/react-input/donate/button.png)](https://opencollective.com/react-input/donate)

## License

[MIT](https://github.com/GoncharukOrg/react-input/blob/main/packages/number-format/LICENSE) © [Nikolay Goncharuk](https://github.com/GoncharukOrg)
