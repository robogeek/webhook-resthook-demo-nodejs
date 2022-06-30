# Example of WebHooks and REST Hooks, in Node.js using ExpressJS and TypeScript.

The focus is on these technology patterns:

* _WebHooks_ are a REST-based call between web servers.  One web server has an event, and data, that it distributes to client servers.
* _REST Hooks_ is a pattern promoted by Zapier, and is an API for distributing WebHooks, while allowing a client server to selectively subscribe/unsubscribe to events using an API

In both WebHooks and REST Hooks, a web service has an event and data, and is distributing the event to other web services which subscribe to the event.  For example, a payment processing platform would notify an eCommerce site about sales via a WebHook or REST Hook.  Another example is GitHub, which has several WebHooks it can invoke to notify certain lifecycle events in a GitHub repository.

The difference is how the client service subscribes to the events.

## Web Hooks

In the WebHook scenario, an event subscribtion is made manually.  The human making the subscription will use some kind of Web UI, such as the administrative area of a web service, to select an event, and configure the subscription to the event.  Part of that configuration is a URL that is to be invoked to handle the event.

## REST Hooks

Documentation:  http://resthooks.org/

This is a pattern suggested by Zapier to improve on the WebHooks model.

The client service has five API's it can call:

* `GET /path/to/endpoint` - Retrieve the events that can be subscribed, and the current subscriptions
* `POST /path/to/endpoint` - Subscribe to an event described in JSON in the body
* `GET /path/to/endpoint/:id` - Retrieve data about a specific subscription
* `PUT /path/to/endpoint/:id` - Modify a subscription
* `DELETE /path/to/endpoint/:id` - Delete a subscription

## Example implementation of WebHooks and REST Hooks

This repository contains two web services written in TypeScript, and running on top of ExpressJS on Node.js.

The `client` directory contains a client service that handles some WebHook and REST Hook subscriptions.

The `service` directory contains a service that distributes events with both the WebHook and REST Hook model.

In both:

* `npm install` -- Install dependencies
* `npm run build` -- Build the TypeScript into JavaScript
* `npm run watch` -- Dynamically watch source code, automatically rebuilding TypeScript into JavaScript
* `npm run monitor` -- Dynamically watch built code, keep the server running, restarting the server when code is rebuilt
