# Modulus Dropdown

Enhanced dropdown component in place of `<select>`, to be used with `@wide/modulus`.


## Install

```
npm install @wide/modulus-dropdown --save
```


## Usage

Register this component using `Modulus`:
```js
import modulus from '@wide/modulus'
import Dropdown from '@wide/modulus-dropdown'

modulus.component('dropdown', Dropdown)
```

Import base `scss` styles:
```css
@import '@wide/modulus-dropdown';
```

Add `[is="dropdown"]` attribute to any `<select>` you want to enhance:
```html
<select is="dropdown">
  <option value="plop">plop</option>
  <option value="foo">foo</option>
  <optgroup label="label">
    <option value="1">1</option>
    <option value="2">2</option>
  </optgroup>
  <option value="bar">bar</option>
</select>
```

## Libraries

This package uses :
- [`hotkeys-js`](https://github.com/jaywcjlove/hotkeys)


## Authors

- **Aymeric Assier** - [github.com/myeti](https://github.com/myeti)
- **Julien Martins Da Costa** - [github.com/jdacosta](https://github.com/jdacosta)


## License

This project is licensed under the MIT License - see the [licence](licence) file for details