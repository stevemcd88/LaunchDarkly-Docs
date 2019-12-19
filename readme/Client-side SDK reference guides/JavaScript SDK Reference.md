---
title: "JavaScript SDK Reference"
excerpt: ""
---
This reference guide documents all of the methods available in our client-side JavaScript SDK, and explains in detail how these methods work. If you want to dig even deeper, our SDKs are open source-- head to our [JavaScript SDK GitHub repository](https://github.com/launchdarkly/js-client-sdk) to look under the hood. The online [API docs](https://launchdarkly.github.io/js-client-sdk/) contain the programmatic definitions of every type and method. Additionally you can clone and run a [sample application](https://github.com/launchdarkly/hello-js) using this SDK.
[block:callout]
{
  "type": "warning",
  "body": "Our JavaScript SDK is intended for client-side (browser) feature flags **only**.\n\nIf you have a Node.js application and are looking to set up LaunchDarkly on the server-side, head to our [Node.js SDK Reference](doc:node-sdk-reference).",
  "title": "For client-side JavaScript only"
}
[/block]
This SDK does two things:
* Makes feature flags available to your client-side (front-end) JavaScript code.
* Sends click, pageview, and custom events from your front-end for A/B tests and analytics.
[block:api-header]
{
  "type": "basic",
  "title": "Browser support"
}
[/block]
The LaunchDarkly client-side JavaScript SDK can be used in all major browsers. However, not all browsers have built-in support for the standard APIs that it uses. Those APIs are Promise, EventSource, and querySelectorAll; Promise is always required, the other two are optional depending on which SDK features you use.

The standard solution for ensuring that you will get the same functionality even in browsers that do not have native support for these features is to use [polyfills](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill). For a detailed description, and links to information about which browsers may require this, see [JS SDK requirements and polyfills](doc:js-sdk-requirements-and-polyfills).
[block:api-header]
{
  "type": "basic",
  "title": "Getting started"
}
[/block]
Building on top of our [Quickstart](doc:getting-started) guide, the following steps will get you started with using the LaunchDarkly SDK in your JavaScript code.

The first step is to install the LaunchDarkly SDK as a dependency. There are two ways to install our JavaScript SDK-- as an `npm`, `yarn` or `bower` module, or as a JavaScript snippet served from LaunchDarkly's CDN.

In most cases, it should be as simple as running one of the following in your project:
[block:code]
{
  "codes": [
    {
      "code": "npm install --save launchdarkly-js-client-sdk",
      "language": "shell",
      "name": "Installing with npm"
    },
    {
      "code": "yarn add launchdarkly-js-client-sdk",
      "language": "shell",
      "name": "Installing with yarn"
    },
    {
      "code": "# LaunchDarkly's minified JS snippet is served from unpkg\nbower install https://unpkg.com/launchdarkly-js-client-sdk@2\n# To restrict to a specific minor version include it in the url version\nbower install https://unpkg.com/launchdarkly-js-client-sdk@2.10\n# For more see https://unpkg.com/",
      "language": "shell",
      "name": "Installing with bower"
    }
  ]
}
[/block]
If you are using a package manager, and then combining dependencies with your code using a tool such as Webpack, there are various ways to import the LaunchDarkly SDK into your code. Here are two examples in commonly used frameworks:
[block:code]
{
  "codes": [
    {
      "code": "// using require()\nconst LDClient = require('launchdarkly-js-client-sdk');\n\n// using ES2015 imports\nimport * as LDClient from \"launchdarkly-js-client-sdk\";",
      "language": "javascript"
    }
  ]
}
[/block]
Note that in earlier versions of the SDK, the package was named `ldclient-js` instead of `launchdarkly-js-client-sdk`.

###  Script Tag

To load our JavaScript SDK as a script tag, include the following in the `<head>` tag of your site on any pages where you need feature flags or want to track A/B testing goals:
[block:callout]
{
  "type": "info",
  "title": "Unpkg and versions",
  "body": "Integrating with the LaunchDarkly JavaScript SDK as a script tag is only intended for development environments and getting started with using LaunchDarkly. It is not intended to be used in production environments as this introduces a critical dependency on a third-party service, [unpkg](https://unpkg.com/).\n\nPreviously it was suggested to use the JS SDK hosted on LaunchDarkly's servers in script tags. This URL would point to the most recently released SDK version. To give more control over SDK updates unpkg is now suggested, and the version hosted at \"https://app.launchdarkly.com/snippet/ldclient.min.js\" is frozen at release 2.10.1."
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "<!-- The snippet shown here will automatically update to the \n     newest release that has a major version of 2. A minor \n     version can be specified by including it in the url. -->\n<script crossorigin=\"anonymous\" src=\"https://unpkg.com/launchdarkly-js-client-sdk@2\"></script>\n",
      "language": "html",
      "name": "Loading as a snippet"
    }
  ]
}
[/block]

[block:api-header]
{
  "title": "Initializing the Client"
}
[/block]
Once the dependency is installed, you'll want to initialize the LaunchDarkly client. To create a client instance, you need your environment's client-side ID (available on your [account settings page](https://app.launchdarkly.com/settings#/projects)). Client-side IDs are not secret-- they can be safely exposed in your client-side code.

In practice, you will probably want to templatize your client-side ID, so that you can use the same initialization code when you switch between development, QA, and production environments.

Feature flag targeting and rollouts are all determined by the *user* viewing the page. You must pass a user context to the SDK during initialization before requesting any feature flags with `variation`.  Failure to pass a valid user context to the SDK during initialization will result in a 400 error.

##Code Sample

Here's a basic example showing how to initialize the client:
[block:code]
{
  "codes": [
    {
      "code": "var user = {\n  \"key\": \"aa0ceb\"\n};\nvar ldclient = LDClient.initialize('YOUR_CLIENT_SIDE_ID', user);",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "Out of the box, initializing the client will make a remote request to LaunchDarkly, so it may take 100 milliseconds or more before the ready event is emitted. If you require feature flag values before rendering the page, we recommend bootstrapping the client (see the Bootstrapping section). If the client is bootstrapped, it will emit the ready event immediately.",
  "title": "Initialization delay"
}
[/block]
The client will emit a `ready` event when it has been initialized. Once it has been initialized, you can safely call `variation` to access your feature flags:
[block:code]
{
  "codes": [
    {
      "code": "ldclient.on('ready', function() {\n  console.log(\"It's now safe to request feature flags\");\n  var showFeature = ldclient.variation(\"YOUR_FEATURE_KEY\", false);\n\n  if (showFeature) {\n   \t...\n  } else {\n    ...\n  }\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "info",
  "title": "Streaming Updates",
  "body": "The SDK does not subscribe to streaming real-time updates automatically when it is initialized. As a side effect, subscribing to the SDK's **change** event by calling **.on('change')** will cause the SDK to open a streaming connection to LaunchDarkly. This is the only way to receive realtime updates."
}
[/block]

[block:callout]
{
  "type": "warning",
  "title": "Making feature flags available to the client-side SDK",
  "body": "Feature flags must be marked available to the client-side SDK (see your feature flag's settings page) before they can be used in `variation` calls on the front-end. If you request a feature flag that is not available, you'll receive the default value for that flag.\n\nIf you always want flags marked as available to the client-side SDK by default, you can check the \"Make new flags available to the client-side (JavaScript) SDK by default\" in your [project settings](https://app.launchdarkly.com/settings#/projects)."
}
[/block]

[block:api-header]
{
  "title": "Customizing your client"
}
[/block]
You can pass custom parameters to the client by creating a custom configuration object:
[block:code]
{
  "codes": [
    {
      "code": "var ldclient = LDClient.initialize('YOUR_CLIENT_SIDE_ID', user, options = {\n  allAttributesPrivate: true\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:parameters]
{
  "data": {
    "1-0": "`bootstrap`",
    "1-1": "See [Bootstrapping](https://docs.launchdarkly.com/v2.0/docs/js-sdk-reference#section-bootstrapping)",
    "0-1": "See [Secure Mode\n](https://docs.launchdarkly.com/v2.0/docs/js-sdk-reference#section-secure-mode)",
    "0-0": "`hash`",
    "2-1": "If true, the client will maintain a streaming connection to LaunchDarkly to receive feature flag changes as they happen. (default: false)",
    "2-0": "`streaming`",
    "3-1": "If true, flag settings will be fetched with a REPORT request including a JSON entity body with the user object. Otherwise, a GET request will be issued with the user passed as a base64 URL-encoded path parameter. (default: false)",
    "3-0": "`useReport`",
    "4-1": "If true, LaunchDarkly will provide additional information about feature flag values that can be accessed with the `variationDetail()` method. (default: false)",
    "4-0": "`evaluationReasons`",
    "5-0": "`allAttributesPrivate`, `privateAttributeNames`",
    "5-1": "See \"Private user attributes\" below.",
    "6-0": "`flushInterval`",
    "6-1": "How long (in milliseconds) to collect analytics events before sending them in a batch to LaunchDarkly. (default: 2000)",
    "h-0": "Parameter",
    "h-1": "Description",
    "7-0": "-------------------------------------------------------",
    "8-0": "",
    "10-0": "`baseUrl`, `eventsUrl`, `streamUrl`",
    "10-1": "The URLs of the LaunchDarkly services. You would only change these if you are using a dedicated instance rather than the main service.",
    "11-0": "`sendEvents`",
    "11-1": "If true, the client will send analytics events to LaunchDarkly to keep track of feature flag evaluations and user properties. (default: true)",
    "12-1": "If true, the client will make an additional request to LaunchDarkly to get information that makes click/pageview events and A/B testing possible. (default: true)",
    "12-0": "`fetchGoals`",
    "13-0": "`sendLDHeaders`",
    "13-1": "If true, the client will send the SDK version to LaunchDarkly in an HTTP header for diagnostic purposes. (default: true)",
    "14-0": "`allowFrequentDuplicateEvents`",
    "14-1": "If true, the client will send an analytics event for every flag evaluation rather than throttling them. (default: false)",
    "15-0": "`sendEventsOnlyForVariation`",
    "15-1": "If true, the client will send analytics events for individual flag evaluations, but not when the client simply receives a new flag value. (default: false)",
    "8-1": "Rarely-used options:",
    "7-1": "-------------------------------------------------------",
    "9-0": "-------------------------------------------------------",
    "9-1": "-------------------------------------------------------",
    "16-0": "`streamReconnectDelay`",
    "16-1": "How long (in milliseconds) to wait before attempting to re-establish the streaming connection when a connection failure is detected. (default: 1000)"
  },
  "cols": 2,
  "rows": 17
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Users"
}
[/block]

[block:callout]
{
  "type": "warning",
  "title": "Personally-identifying user keys",
  "body": "If the `key` attribute you rely on in your user JSON contains personally identifiable information, you should enable the `useReport` option by [customizing your client](https://docs.launchdarkly.com/docs/js-sdk-reference#section-customizing-your-client) .\n\nBy default, flag settings are fetched by sending the user JSON as a JSON base64 URL-encoded path parameter. When `useReport` is enabled, flag settings will be fetched by sending the user JSON in the body of a REPORT request instead, thereby hiding that information from request logs."
}
[/block]
Let's walk through the user JSON in more detail. The most important attribute is the user key-- in this case we've used the hash `"aa0ceb"`. **The user key is the only mandatory user attribute**. The key should also uniquely identify each user. You can use a primary key, an e-mail address, or a hash, as long as the same user always has the same key. We recommend using a hash if possible.

Here's a more complete example of a user:
[block:code]
{
  "codes": [
    {
      "code": "var user = {\n  \"key\": \"aa0ceb\",\n  \"firstName\": \"Ernestina\",\n  \"lastName\": \"Evans\",\n  \"email\": \"ernestina@example.com\",\n  \"custom\": {\n    \"groups\": [\"Google\", \"Microsoft\"]\n  }\n};",
      "language": "javascript"
    }
  ]
}
[/block]
All of the other attributes (like `firstName`, `email`, and the `custom` attributes) are optional. The attributes you specify will automatically appear on our dashboard, meaning that you can start segmenting and targeting users with these attributes. 

Besides the `key`, LaunchDarkly supports the following attributes at the "top level". Remember, all of these are optional:

* `ip`: Must be an IP address.
* `firstName`: Must be a string. If you provide a first name, you can search for users on the Users page by name.
* `lastName`: Must be a string. If you provide a last name, you can search for users on the Users page by name.
* `country`: Must be a string representing the country associated with the user. 
* `email`: Must be a string representing the user's e-mail address. If an `avatar` URL is not provided, we'll use [Gravatar](http://en.gravatar.com/) to try to display an avatar for the user on the Users page.
* `avatar`: Must be an absolute URL to an avatar image for the user. 
* `name`: Must be a string. You can search for users on the User page by name
* `anonymous`: Must be a boolean. See the section below on anonymous users for more details.


In addition to built-in attributes, you can pass us any of your own user data by passing `custom` attributes, like the `groups` attribute in the example above. 
[block:callout]
{
  "type": "info",
  "title": "A note on types",
  "body": "Most of our built-in attributes (like names and e-mail addresses) expect string values. Custom attribute values can be strings, booleans (like true or false), numbers, or lists of strings, booleans or numbers. \n\nIf you enter a custom value on our dashboard that looks like a number or a boolean, it'll be interpreted that way."
}
[/block]
Custom attributes are one of the most powerful features of LaunchDarkly. They let you target users according to any data that you want to send to us-- organizations, groups, account plans-- anything you pass to us becomes available instantly on our dashboard.
[block:api-header]
{
  "title": "Private user attributes"
}
[/block]
You can optionally configure the JavaScript SDK to treat all user attributes as [private user attributes](https://docs.launchdarkly.com/v2.0/docs/private-user-attributes). Private user attributes can be used for targeting purposes, but are removed from the user data sent back to LaunchDarkly.

To mark all user attributes (except the key) as private in the JavaScript SDK, you can use the  `allAttributesPrivate` option:
[block:code]
{
  "codes": [
    {
      "code": "var user = {\n  \"key\": \"aa0ceb\",\n  \"name\": \"Grace Hopper\",\n  \"email\": \"gracehopper@example.com\"\n};\n\nvar ldclient = LDClient.initialize('YOUR_CLIENT_SIDE_ID', user, options = {\n  allAttributesPrivate: true\n});",
      "language": "javascript"
    }
  ]
}
[/block]
In the above example, the `name` and `email` attributes will be removed.

You can also specify an array of which attributes should be private with the `privateAttributeNames` option. This option can also be configured on a per-user basis by specifying which attributes should be private in your user object.

In the example below, this option is configured in both the user object and the configuration object to demonstrate what this looks like:
[block:code]
{
  "codes": [
    {
      "code": "var user = {\n  \"key\": \"aa0ceb\",\n  \"name\": \"Grace Hopper\",\n  \"email\": \"gracehopper@example.com\"\n  \"privateAttributeNames\": [\"email\"]\n};\n\nvar ldclient = LDClient.initialize('YOUR_CLIENT_SIDE_ID', user, options = {\n  privateAttributeNames: [\"email\"]\n});",
      "language": "javascript"
    }
  ]
}
[/block]
In the example above, only the user's key and their name will be sent back to LaunchDarkly.
[block:callout]
{
  "type": "warning",
  "title": "Parameters for JS SDK < 2.0",
  "body": "SDK versions earlier than 2.0 use snake case rather than camel case in the options object. `private_attribute_names` and `all_attributes_private` are the parameter names that should be used. `privateAttributeNames` is still valid when specified in the user object."
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Anonymous users"
}
[/block]
You can also distinguish logged-in users from anonymous users in the SDK, as follows:
[block:code]
{
  "codes": [
    {
      "code": "// Starting with version 2.10.0 of the JavaScript SDK, to create \n// an anonymous user you can specify the \"anonymous\" property and \n// omit the \"key\" property. In doing so, the LaunchDarkly client \n// will auto-generate a unique identifier for this user, and the \n// identifier will remain constant across browser sessions.\nvar user = {\"anonymous\": true};\n\n// If you are using earlier SDK versions, you will need to specify \n// the \"key\" property as earlier versions do not auto-generate the \n// property.\n//\n// Here you will need to generate a unique key for anonymous \n// users -- the session ID or a UUID should work. \n//\n// We suggest storing the user's key in a cookie, otherwise you\n// run the risk of creating a new user for each page request.\nvar user2 = {\"key\":\"aa0ceb\", \"anonymous\": true};",
      "language": "javascript",
      "name": ""
    }
  ]
}
[/block]
Anonymous users work just like regular users, except that they won't appear on your Users page in LaunchDarkly. You also can't search for anonymous users on your Features page, and you can't search or autocomplete by anonymous user keys. This is actually a good thing-- it keeps anonymous users from polluting your Users page!
[block:api-header]
{
  "type": "basic",
  "title": "Variation"
}
[/block]
The `variation` method determines which variation of a feature flag a user receives.

[block:code]
{
  "codes": [
    {
      "code": "ldclient.variation(\"your.feature.key\", false);",
      "language": "javascript"
    }
  ]
}
[/block]
`variation` calls take the feature flag key and a default value. 

The default value will only be returned if an error is encountered—for example, if the feature flag key doesn't exist or the user doesn't have a key specified. 
[block:api-header]
{
  "type": "basic",
  "title": "Analytics events"
}
[/block]
Evaluating flags, either with `variation()` or with `allFlags()`, produces analytics events which you can observe on your LaunchDarkly Debugger page. Specifying a user with `identify()` (and also the initial user specified in the client constructor) also produces an analytics event, which is how LaunchDarkly receives your user data.

You can also explicitly send an event with any data you like using the `track` function. The second argument is optional.
[block:code]
{
  "codes": [
    {
      "code": "ldclient.track(\"your-event-name\", { customProperty: someValue });",
      "language": "javascript"
    }
  ]
}
[/block]
If you've defined [click or pageview goals](doc:running-ab-tests) in LaunchDarkly, they'll be sent automatically once the client has been initialized. You do not have to do anything else with the client to send click or pageview goals. The SDK will generate pageview events correctly regardless of how the URL is changed (via the HTML5 history API, by changing the URL hash fragment, etc.).

You can completely disable event sending by setting `sendEvents` to `false` in the client options, but be aware that this means you will not have user data on your LaunchDarkly dashboard.
[block:callout]
{
  "type": "warning",
  "title": "A note on Do Not Track and ad blocking software",
  "body": "The JavaScript SDK respects the [Do Not Track](https://www.eff.org/issues/do-not-track) header. If an end-user has Do Not Track enabled in their browser, the SDK will not send analytics events for flag evaluations or goals to events.launchdarkly.com. In addition, ad blocking software may block analytics events from being sent. This will not impact feature flag evaluations."
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Subscribing to feature flag changes"
}
[/block]
The client uses an event emitter pattern to allow you to subscribe to feature flag changes in real time. To subscribe to all feature flag changes, listen for the change event:
[block:code]
{
  "codes": [
    {
      "code": "ldclient.on('change', function(settings) {\n  console.log('flags changed:', settings);\n});",
      "language": "javascript"
    }
  ]
}
[/block]
The `settings` object will contain a map of updated feature flag keys and values. The map will only contain the keys to flags that have changed. You can also subscribe to specific flags:
[block:code]
{
  "codes": [
    {
      "code": "ldclient.on('change:YOUR_FLAG_KEY', function(value, previous) {\n  console.log('YOUR_FLAG_KEY changed:', value, '(' + previous + ')');\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "title": "All flags"
}
[/block]

[block:callout]
{
  "type": "warning",
  "title": "Creating users",
  "body": "Note that the allFlags method in the JavaScript SDK functions differently than our other SDKs.\n\n**This method will send analytics events to LaunchDarkly as if you'd called variation for every feature flag.**\n\nYou can disable this behavior by initializing the SDK with `sendEventsOnlyForVariation` set to `true`"
}
[/block]
The `allFlags` method will return a key / value map of all your feature flags. 

The map will contain null values for any flags that would return the fallback value (the second argument that you normally pass to variation). 
[block:api-header]
{
  "type": "basic",
  "title": "Bootstrapping"
}
[/block]
Bootstrapping refers to providing the LaunchDarkly client object with an initial, immediately available set of feature flag values so that on page load `variation` can be called with no delay.

The preferred approach to bootstrapping is to populate the bootstrap values (a map of feature flag keys to flag values) from your backend. LaunchDarkly's server-side SDKs have a function called `all_flags_state`-- this function provides the initial set of bootstrap values. (In earlier versions of the SDKs, this function was called `all_flags`).You can then provide these values to your front-end as a template. Depending on your templating language and the language you are using on the back end (this example is for Ruby), this might look something like this:
[block:code]
{
  "codes": [
    {
      "code": "var ldclient = LDClient.initialize(\n  'YOUR_CLIENT_SIDE_ID',\n  user,\n  options = {\n    bootstrap: {{ # this is a ruby template directive\n      ldclient.all_flags_state(user, {client_side_only: true})\n    }} // this is a ruby template directive\n  }\n);\n",
      "language": "javascript"
    }
  ]
}
[/block]
If you bootstrap from the server-side, feature flags will be ready immediately, and clients will always receive the latest feature flag values. An demonstration of server-side bootstrapping can be found in [this github repo](https://github.com/launchdarkly/hello-bootstrap).

Alternatively, you can bootstrap feature flags from local storage:
[block:code]
{
  "codes": [
    {
      "code": "var ldclient = LDClient.initialize('YOUR_CLIENT_SIDE_ID', user, options = {\n  bootstrap: 'localStorage'\n});\n",
      "language": "javascript"
    }
  ]
}
[/block]
When using local storage, the client will store the latest flag settings in local storage. On page load, the previous settings will be used and the 'ready' event will be emitted immediately. This means that on page load, the user may see cached flag values until the next page load.

You can still subscribe to flag changes if you're using local storage.
[block:api-header]
{
  "type": "basic",
  "title": "Secure mode"
}
[/block]
Secure mode ensures that feature flag settings for a user are kept private, and that one user cannot inspect the settings for another user. Secure mode works by having you include a server-generated HMAC SHA256 hash of your user key, signed with the SDK key for your environment.

You can enable secure mode for each environment on your [account settings](https://app.launchdarkly.com/settings#/projects) page.
[block:image]
{
  "images": [
    {
      "image": [],
      "caption": "Enabling secure mode for an environment"
    }
  ]
}
[/block]
You should send the computed hash for your user in the options array during client initialization:
[block:code]
{
  "codes": [
    {
      "code": "var ldclient = LDClient.initialize('YOUR_CLIENT_SIDE_ID', user, options = {\n  hash: \"SERVER_GENERATED_HASH\"\n});",
      "language": "javascript"
    }
  ]
}
[/block]
Each of our server-side SDKs includes a method to compute the secure mode hash for a user. You can pass this to your front-end code in a template. For example:
[block:code]
{
  "codes": [
    {
      "code": "var ldclient = LDClient.initialize('YOUR_CLIENT_SIDE_ID', user, options = {\n  hash: {{ ldclient.secure_mode_hash(user) }} // this is a template directive, and the ldclient instance here is your server-side SDK client\n});\n\n",
      "language": "javascript"
    }
  ]
}
[/block]
To compute the hash yourself, locate the SDK key for your environment on your account settings page. Then, compute an HMAC SHA256 hash of your user key, using your SDK key as a secret. Here's what this would look like in Node.js:
[block:code]
{
  "codes": [
    {
      "code": "var crypto = require('crypto');\nvar hmac = crypto.createHmac('sha256', 'YOUR_SDK_KEY');\nhmac.update('YOUR_USER_KEY');\nhash = hmac.digest('hex');",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Changing the user context"
}
[/block]
You may wish to change the user context dynamically and receive the new set of feature flags for that user or generate events for the new user. For example, on a sign-in page in a single-page app, you might initialize the client with an anonymous user. When the user logs in, you'd want the feature flag settings for the authenticated user. To do this, you can call the `identify` function:
[block:code]
{
  "codes": [
    {
      "code": "ldclient.identify(newUser, hash, function() {\n  console.log(\"New user's flags available\");\n});",
      "language": "javascript"
    }
  ]
}
[/block]
The hash parameter is the hash for the new user, assuming that the user's key has changed. It is only required in secure mode-- if secure mode is not enabled, you can pass in `null` for the hash.

If you provide a callback function, it will be called (with a map of flag keys and values) once the flag values for the new user are available; after that point, `variation()` will be using the new values. You can also use a Promise for the same purpose.

Note that the SDK always has _one_ current user. The client-side SDKs are not designed for evaluating flags for different users at the same time.
[block:api-header]
{
  "type": "basic",
  "title": "Tracking click and pageview events"
}
[/block]
If you've defined click or pageview goals (see [Running A/B tests](doc:running-ab-tests)) in LaunchDarkly, they'll be sent automatically once the client has been initialized. You do not have to do anything else with the client to send click or pageview goals.
[block:callout]
{
  "type": "info",
  "title": "Single-page apps",
  "body": "The SDK automatically handles URL changes (made via the HTML5 history API or by changing the URL hash fragment), and will trigger pageview and click events correctly."
}
[/block]

[block:api-header]
{
  "title": "Flush"
}
[/block]
Internally, the LaunchDarkly SDK keeps an analytics event buffer. These events are flushed periodically (asynchronously). In some situations, you may want to manually call `flush` to process events immediately.

Note that this method is asynchronous. You may pass a callback or wait for the returned `Promise`  to determine when all events have been flushed.
[block:code]
{
  "codes": [
    {
      "code": "ldclient.flush();",
      "language": "javascript"
    }
  ]
}
[/block]