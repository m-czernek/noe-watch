# What is Noe Watch

Noe Watch is a web app used for long-term tracking of failing tests in a CI/CD environment.

## Stack

Noe Watch is built on top of:

* NodeJS Javascript runtime
* MongoDB backend database
* Handlebars templating engine
* Sassy CSS
* Red Hat's Patternfly CSS framework

It is intended to run on Red Hat's Kubernetes distribution (_Openshift_), but can be run
separately as well, provided you supply a MongoDB connection URL.

## Usage

There are three endpoints avaiable for usage:

__GET /readinessProbe__: Returns __200 OK__. This is to check whether the NodeJS server is working, regardless of the database connection
__GET /__: If there is a successful DB connection, this renders the number of failures for each platform.
__POST /api/post/parsexml__: Use this endpoint for uploading the results of your tests.

Noe Watch expects a JUnit XML to be uploaded as a payload in a POST request. For example:

```
curl -i -H  "Content-Type: text/xml" -X POST -d @result.xml localhost:3000/api/post/parsexml?platform=solaris
```

Where:

*  __result.xml__ is a JUnit report
* __localhost:3000__ is a hostname and port of your application
* __platform__ is a parameter specifying for which platform are you uploading the results

The __platform__ query parameter is required. There are three possible platform parameters:

* Windows
* Solaris
* RHEL

You may tweak the plaforms in the [constants.js](lib/constants.js) file.

## Running Noe Watch

### Prerequisites

To run Noe Watch, you need:

* `npm`
* `node`
* `oc` if you deploy on OpenShift. Note you can get a free [OpenShift account](https://openshift.io/).

Check that you have them installed by issuing:

```
$ npm -v
6.4.1
$ node -v
v10.12.0
$ oc version
oc v3.9.0
kubernetes v1.9.1+cbc5b49
features: Basic-Auth GSSAPI Kerberos SPNEGO
...
```

### Local Execution

To run Noe Watch locally:

1. Compile SCSS into CSS: `npm run build-scss`
1. Install dependencies: `npm install`
1. Run Noe: `npm start`

This will execute dev setup, where NodeJS is automatically restarted after each change to the
js files. To automatically compile SCSS into CSS, execute `npm run watch-scss` in a separate window.

If you're executing Noe Watch locally, you are responsible for starting a MongoDB database. We 
recommend using Red Hat's [MongoDB container](https://github.com/sclorg/mongodb-container),
because that is used in OpenShift during deploy.

To view which environment properties you have to supply, see the [constants.js](lib/constants.js) file.

### OpenShift Deployment

An OpenShift template has been provided in the _openshift/noe-watch.json_ file. As such, the 
deployment of Noe Watch on OpenShift is simplified. To do so:

1. Ensure you're logged in: `oc whoami` should return a username.
1. Create a new project: `oc new project noe-watch` 
1. Upload the template: `oc create -f openshift/noe-watch.js`

At this point, you can either: 

* Log into the web console and search for Noe Watch (see [documentation](https://docs.openshift.com/container-platform/3.11/dev_guide/application_lifecycle/new_app.html#using-the-web-console-na))
* Deploy the app from the command line:

```
$ oc new-app noe-watch-template \
    -e STORAGE_CLASS_NAME=nfs4
    -e APPLICATION_HOSTNAME=www.noe-watch.com
```

### Troubleshooting

Be aware of the following:

**MongoDB has difficulties with NFSv3 storage.** As a consequence, in our OpenShift template, we provide
the __STORAGE_CLASS_NAME__ parameter for your Persistent Volume configuration. If you do not use NFSv3,
and do not want to specify storage class name, you can safely delete the following from the OpenShift
template:

```
// Do not forget to delete the comma before this property
"storageClassName": "${STORAGE_CLASS_NAME}"
```