# React GTM

A Google Tag Manager React library, with sane defaults, augmented with `dataLayer` management hooks.

This library supports :
- Sending `virtual-pageview` events on initial load and each route change.
- Providing `dataLayer` values via a `useDataLayer` hook.
- Pushing custom events to the `dataLayer`.
- Providing a `dataLayer` builder function, which is used to augment the `virtual-pageview` event before it's pushed.
- Multiple Tag Manager containers loading.


## Installation

Using yarn :
```
yarn add @tymate/react-gtm
```

### Dependencies

The package uses `react-helmet` to insert `<script />` tags in the page's `head`.
You should check it's presence in your project's dependencies, and just to be sure, run

```
yarn add react-helmet
```

## A Google Tag Manager primer

### Tags
Google Tag Manager provides an interface to define multiple ***tags*** in a web interface.

These tags are used to dispatch analytics to Google Analytics and other audience and conversions reporting tools. Predefined tags are available for common services, GTM also supports custom Javascript snippets to be used as tags. Each service can be used on multiple tags, in order to pass different parameters and report different types of events.

### Triggers

Tags are called by ***triggers*** which are also defined in Tag Manager's interface. Triggers can be defined by non-developers, with a WYSIWIG tool that can help people associating a button, a timeout or anything else with a tag to be called.

Tags defined in this way can tend to be messy, since it uses DOM elements classes or IDs which can be subject to change between releases.

It's hopefully possible to define ***custom events*** which can be called in the website's code by leveraging the ***dataLayer***.

### Variables

Variables are a way to integrate data coming from the website in the ***tags***, who will in turn send them to the underlying services.

Tag Manager's UI offers some common variables to be inserted in the tags (page location, referrer...) and allows them to be augmented with variables coming from the `dataLayer`.

### Container

A container is the combination of tags, triggers and variables, and is represented by a container ID in the form of `GTM-XXX`.

Each container has a `<script />` tag to be embedded in the target website, which will trigger GTM logic.

### DataLayer

`window.dataLayer` is a global variable that each container watches. It's basically an array of objects containing all variables and events pushed to it, in the following format :

```js
{
  "event": "myEvent",
  "var1": "A variable",
  "var2": "Another one"
  // Whenever Wherever Whatever
  // (a song by Maxwell)
  // (i still prefer it's "Embrya" album)
}
```

## Reference

### `<GtmProvider />`

`<GtmProvider />` is the component responsible for including container tags in the DOM,  sending the `vitual-pageview` events on location change and populating the dataLayer with data passed in children component's hooks.

It takes the following properties :
- `location` takes your current page's location as value.

  It's mandatory to pass it to the component, and allows it to be agnostic of whatever routing library you are using.

- `data` is an arbitrary property passed as first argument to your `useDataLayerBuilder()` callbacks.

  It allows the children components to compute some derived dataLayer entry that can be retrieved from the parent `<GtmProvider />`, which allows to ensure variables are set on
  the `virtual-pageview` event calls.

  Its most useful case is in Gatsby, where you can use it to pass your page's `data`, fetched from the GraphQL store.

- `gtmTags` is a list of Tag Manager Container Ids to be enabled.

- `initialDataLayer` is an object of variables which will always be merged to the `virtual-pageview` events.

- `hasDebugEnabled` is a boolean enabling the logging of all the dataLayer pushes the library makes.

```es6
import { GTMProvider } from '@tymate/react-gtm';
import { useLocation } from "@reach/router"

const location = useLocation();

<GTMProvider
  hasDebugEnabled
  data={{
    artist: {
      name: 'Kedr Livanskiy',
      tracks: [
        { name: 'Разрушительный круг' }
      ]
    }
  }}
  location={location}
  gtmTags={['GTM-XXX']}
  initialDataLayer={{
    language,
    isAuthenticated,
    customVendors,
  }}
>
  <MyComponent />
</GTMProvider>
```

### `useDataLayerBuilder()`

`useDataLayerBuilder()` is a hook taking a `(data) => {}` function as argument, which should return an object of variables to be included in the `virtual-pageview` events.

The function you define as argument will be passed with the `data` provided to `<GTMProvider />` and called on route change.

This is the main method to use for setting variables on pages, since it's mostly ensured to be called before the `virtual-pageview` is sent.

```es6
import { useDataLayerBuilder } from '@tymate/react-gtm';

useDataLayerBuilder(({ hotel }) => ({
  pageType: 'hotel',
  searchHotel: hotel.displayName,
  searchHotelId: hotel.originalId,
  hotelStars: hotel?.stars,
}));
```

### `useGTM()`

`useGTM()` is a hook that returns public properties of the underlying context used by the library.

- `pushDataLayer` is a method pushing what it takes as argument into the underlying tagManager `dataLayer`.
 
  It's the equivalent of doing a `window.dataLayer.push(data)` call, and mainly serves as a way to send events to the Google Tag Manager container.

  [Examples from Google's documentation](https://developers.google.com/tag-manager/devguide) can be integrated to your project via this method.

  > ⚠️ Use this only to push events and their associated data in the dataLayer.
  >
  > Pushing data to the `dataLayer` without an `event` key will delay the sending of the variables until the next event sent.

```es6
import { useGTM } from '@tymate/react-gtm';

const { pushDataLayer } = useGTM();

pushDataLayer({
  event: 'checkout',
  ecommerce: {
    checkout: {
      actionField: {
        step: 1,
      },
    },
  },
});
```

### `useDataLayer()`
`useDataLayer()` is a hook which takes an object to be pushed in the `dataLayer`.

You should only pass it dataLayer variables, and use the `pushDataLayer` returned by `useGTM()` instead to push events.

Behind the scene, it makes a call to `pushDataLayer` each time the object passed as parameter changes.

```es6
useDataLayer({
  ecommerce: {
    detail: {
      actionField: { list: 'Search' },
      products: [
        {
          id: hotel.originalId,
          name: hotel.displayName,
          brand: 'Feelingo',
          category: 'Hotel',
        },
      ],
    },
  },
});
```

> ⚠️🚨 ❗️ **Achtung**
>
> The main use case of this hook is to define variables to be sent to Tag Manager on the next dataLayer push containing an `event` key.
>
> It can come in handy in some situations, but each object pushed to the dataLayer should generally have an `event` key.

## Integrating with Gatsby

On Gatsby websites, you can integrate `react-gtm` by first placing the `<GTMProvider />` component in the `gatsby-browser.js` `wrapPageElement` method :

```es6
import { GTMProvider } from '@tymate/react-gtm';

export const wrapPageElement = ({
  element,
  props: { data, location },
}) => {
  return (
    <>
      <GTMProvider
        data={data}
        location={location}
        gtmTags={['GTM-XXX']}
      >
        {element}
      </GTMProvider>
    </>
  )
};
```

Then use the provided hooks in your pages and templates.

## References

There's some good amount of litterature on Google, third-party, and dubious SEO sites on Google Tag Manager integrations. It's worth checking out :

- [Google Tag Manager Developer Guide](https://developers.google.com/tag-manager/devguide) (especially the Flash/ActionScipt part !)
- [Google's Enhanced Ecommerce](https://developers.google.com/tag-manager/enhanced-ecommerce), if you have to integrate Google Analytics conversions and funnel analytics.
- [Santiano Tag Manager Containers](https://santiano.io/google-tag-manager-containers), a collection of premade tags/variables/triggers to be imported in Tag Manager, and the accompanying documentation explaining how you should integrate their events in your dataLayer. The marketing agency in charge of the website is probably already using it !

## Tooling
- [Google Tag Assistant](https://tagassistant.google.com/) enables you to see exactly how Tag Manager interprets your dataLayer pushes and which tags are called in reaction.
- [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) which allows you to see the end-of-chain Google Analytics and `gtag.js` calls.
