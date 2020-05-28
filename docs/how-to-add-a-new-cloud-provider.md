# How to add a new cloud provider

The purpose of this documentation is the to describe the process of how to add a new cloud provider in the project.

## Adding the new provider to the hybro configuration

Configuration of the cloud providers is located in the file `app/assets/openstack-hosts.json`.
It's a map where the key is the _name_ of the provider.

Configuration is composed of the following properties :

| Property        | Type                              | Mandatory | Description                                                                                                                                                                                                              |
| --------------- | --------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| publicCloudURL  | URL                               | NO        | A link to the webpage of the provider that describes their cloud services.                                                                                                                                               |
| priceURL        | URL                               | NO        | A link to the webpage of the provider that describes their pricing policies.                                                                                                                                             |
| dataCenterURL   | URL                               | NO        | A link to the webpage of the provider that describes and list their cloud datacenter                                                                                                                                     |
| keystone        | Array<{URL:String, label:String}> | YES       | A list of links (with their _label_) that point to the openstack auth. endpoint (alias keystone) of the provider.                                                                                                        |
| image           | { name:String }                   | YES       | The _name_ of a `Debian 9` image, available in the catalog of the provider (@see https://docs.openstack.org/api-ref/image/v2/index.html?expanded=list-images-detail)                                                     |
| domainName      | STRING                            | YES       | It's an openstack variable provided by the cloud provider. Usually it's just `default` but it's not the case everytime                                                                                                   |
| projectRequired | BOOLEAN                           | NO        | Some provider need during the auth process, to specify the openstack project name.If it's `true` hybro will ask the user to fulfill the project name during the process                                                  |
| dataCenters     | Map<String,String>                | NO        | It's map for the transalation of the datacenter code to a human understandable name. So in hybro, we display the name of the datacenter instead of its code, if we have the translation. Otherwise, we display the code. |

## How to gather the needed information

### General OpenStack information

The majority of the cloud providers allow you to download the RC file of the openstack CLI.
In this file, you will find all the needed information.

This is an example of the content of a RC file (example from Vexxhost) :

```bash
#!/usr/bin/env bash
# To use an OpenStack cloud you need to authenticate against the Identity
# service named keystone, which returns a **Token** and **Service Catalog**.
# The catalog contains the endpoints for all services the user/tenant has
# access to - such as Compute, Image Service, Identity, Object Storage, Block
# Storage, and Networking (code-named nova, glance, keystone, swift,
# cinder, and neutron).
#
# *NOTE*: Using the 3 *Identity API* does not necessarily mean any other
# OpenStack API is version 3. For example, your cloud provider may implement
# Image API v1.1, Block Storage API v2, and Compute API v2.0. OS_AUTH_URL is
# only for the Identity API served through keystone.
export OS_AUTH_URL=https://auth.vexxhost.net
# With the addition of Keystone we have standardized on the term **project**
# as the entity that owns the resources.
export OS_PROJECT_ID=3a0070e6805a418d8cfe6115edfc0f6b
export OS_PROJECT_NAME="55428e4f-09fd-40c4-a79a-b1420fbe5f49"
export OS_USER_DOMAIN_NAME="Default"
if [ -z "$OS_USER_DOMAIN_NAME" ]; then unset OS_USER_DOMAIN_NAME; fi
export OS_PROJECT_DOMAIN_ID="default"
if [ -z "$OS_PROJECT_DOMAIN_ID" ]; then unset OS_PROJECT_DOMAIN_ID; fi
# unset v2.0 items in case set
unset OS_TENANT_ID
unset OS_TENANT_NAME
# In addition to the owning entity (tenant), OpenStack stores the entity
# performing the action as the **user**.
export OS_USERNAME="8c259f5a-45e2-4e30-8a56-f9f437e8708f"
# With Keystone you pass the keystone password.
echo "Please enter your OpenStack Password for project $OS_PROJECT_NAME as user $OS_USERNAME: "
read -sr OS_PASSWORD_INPUT
export OS_PASSWORD=$OS_PASSWORD_INPUT
# If your configuration has multiple regions, we set that information here.
# OS_REGION_NAME is optional and only valid in certain environments.
export OS_REGION_NAME="sjc1"
# Don't leave a blank variable, unset it if it was empty
if [ -z "$OS_REGION_NAME" ]; then unset OS_REGION_NAME; fi
export OS_INTERFACE=public
export OS_IDENTITY_API_VERSION=3
```

This is the mapping for our configuration :

| Variable name       | Hybro config |
| ------------------- | ------------ |
| OS_USER_DOMAIN_NAME | domainName   |
| OS_AUTH_URL         | keystone     |

### Datacenter list

To retrieve the datacenter list of a provider (ie. a _region_ in openstack), you can take a look a the tests of `hyphe_openstack_client`.

You can add a `console.log(result)` after this line : https://github.com/medialab/hyphe_openstack_client/blob/89fa0d3239a26f774cc275fbeeed9877913cfdb7/test/index.test.js#L41

### The image name

Same as above : https://github.com/medialab/hyphe_openstack_client/blob/89fa0d3239a26f774cc275fbeeed9877913cfdb7/test/index.test.js#L61

## How to test the deploy

Before to add a new provider, you should test the actual process is working for it.
For this, you can use the `paid test` of the `hyphe_openstack_client` as describe here : https://github.com/medialab/hyphe_openstack_client/tree/89fa0d3239a26f774cc275fbeeed9877913cfdb7#tests
