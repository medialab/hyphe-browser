# User manual - cloud deployment

## Vexxhost

### Account creation

before to deploy a hyphe server on vexxhost, you need to create an account.

Go to https://secure.vexxhost.com/billing/register.php and fulfill the form

![Vexxhost registration](./assets/user-manual/vexxhost-registration.png)

Then check your mailbox, you will receive an email to validate your account creation.

When it's done, you need to register a billing method.

![Vexxhost billing information](./assets/user-manual/vexxhost-billing-info.png)

### Public cloud dashboard

In your Vexxhost account, inside `Public cloud` page, you will find the connexion information for the public cloud :

![Vexxhost public cloud info](./assets/user-manual/vexxhost-billing-info.png)

So just go on the page https://dashboard.vexxhost.net/ and use the login / password found in your account.

![Vexxhost dashboard](./assets/user-manual/vexxhost-dashboard.png)

#### Find the project name

During the deploy process in hyphe browser, you will be asked to fufill the project name.
To retreive it, you need to got on `Identity > project` in the dashboard.

![Vexxhost dashboard - project](./assets/user-manual/vexxhost-dashboard-project.png)

Like in the screenshot, you should just have one line in the table. You should save somewhere the name (not the ID) of the project.

// TODO : VEXXHOST SPECIFIC PRE-PROCESS DOC /!\

### Hyphe browser

Now that you Vexxhost is created and working, you can open your hyphe browser.

1. Choose to deploy a new cloud server

![Hyphe browser - home](./assets/user-manual/hybro-step1.png)

2. On this page, a text explain to you the process. You can click on the button to go to the next step.

![Hyphe browser - process description](./assets/user-manual/hybro-step2.png)

3. You need to fulfill the needed information for the authentication

![Hyphe browser - process description](./assets/user-manual/hybro-step3.png)

4. Make the configuration of your hyphe

![Hyphe browser - configuration](./assets/user-manual/hybro-step4.png)

You can also check the box at the top, to see the full configuration

![Hyphe browser - configuration](./assets/user-manual/hybro-step4-full.png)

5. On the next screen, you will be asked to choose the cloud server you want

![Hyphe browser - server](./assets/user-manual/hybro-step5.png)

You have to select :

- the data-center where you want to deploy the server
- the sizing of the serveur based a pre-defined list from the provider. You can filter the list with the form belloew the select box
- the hard driver size, if you have selected a server sizing without a disk

6. Before to launch the deployment process, the application is asking you to confirm.

![Hyphe browser - deployment validation](./assets/user-manual/hybro-step6.png)

7. Now the deployment process is running

![Hyphe browser - deployment process](./assets/user-manual/hybro-step7.png)

Once the server is created & online, you can follow the hyphe installation by checking the logs

![Hyphe browser - deployment log](./assets/user-manual/hybro-step7-with-log.png)

At this step, your hyphe server is up and running, and you can use it in your hyphe browser.

// TODO /!\ VEXXHOST SPECIFIC POST-PROCESS DOC /!\
