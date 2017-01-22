# dao2koa

Automatic generated APIs are great. I am a big fan of projects like JSON-server and sails.js.
The intend for this project is to set the koa development first. People learn how to use Koa,
structure there app using koa-mount and koa-route.

On the other hand I strongly believe in dao modules. Modules that access each a single collection
on a database and provides standard methods to retrieve data from a resource.

In first place this project is designed to use daos prepared by tmysqlpromisedao. A librarie to 
provide dao-modules to access the mysqldatabase.

- **get** functions to load entries by given values
- **save** *insert* *remove* methods to manipulate the entries in that table.
- **fetch** methods to load data from related collections and extending the given entries.

Utilising these conventions dao2koa can provide a RESTful API not just for mysql but also for any
other data resource that can be accessed through a dao.

## Usage
1. Install the *dao2koa* module to your koa application.
2. Prepare your dao, following the conventions.
3. generate a router using the only function exposed by this module and mount it to your app
    ```js
    var app = new Koa();
    var apiRouter = dao2koa.daoToRestRouter(dao,{/*options*/});
    app.use(mount('/endpoint/',apiRouter));
    ```
4. start the app and access the endpoint.

## exposed API
The generated API provides the following endpoints
- **GET /** - list all using the dao's getAll methods
    - queryParams:
    - q=[word] for fulltext search (only using tmysqlpromisedao)
    - _order=[fieldName] sort the result by the given field name
    - _direction=[asc|desc] to order forward and backward
    - _fetch=[fieldnames] commaseparated names, naming related data to extend the loaded
                            Items using the dao's fetch methods
    - _page=[number] the page of the resultset you want to receive
    - _pagesize=[number] how many items to receive
    - [propname]=[modifier][value]
        - propname the name of the field
        - value the value to compare with
        - modifier:
            - no modifier: the value need to be equal to the given
            - < the value need to be lower
            - > the value need to be higher (alphabetic, numbers, dates)

- **GET /:id** - retrieve a single item by Id using the daos getById method.

- **POST /** or **GET /create** to create a new entry in the collection.<br>
    uses the daos insert method to add a new item to the table.<br>
    the items properties can be send using post or the URLs querystring<br>

- **PUT /:id/** or **GET /update/:id** - to update an item<br>
    uses the daos save method to update an entry of the table.<br>
    the properties can be send using post or querystring<br>

- **DELETE /:id** or **GET /delete/:id** to remove an item from the collection.

## Options
provinging an API which is that powerfull is very risky, but this API generator is meaned to be used
in production. So there are serveral ways to implement authentication validation and trigger further
methods like logging clearing related data, adding statistics and/or handle denormalization.

Using dao2koa, you have two ways to change the generated API. One way is the direct way, as you would
do it with any koa middleware. Handle the route before the API is utilized. Add logging and general 
authentication, if fact anything you could imagine. Or implement yourself.

The second is for convinienve. By passing an options object as second parameter to the **daoToRestRouter** -
method. The options are:
- **inputFilter** a function that takes (koaContext, newObjectprops, oldObject).
    - The context is always there. 
    - newObjectprops is there if the entry should get **update**d or is **new**.
    - oldObject is the object before **update** or befor **delete**.<br>
    if this function return false, the optiation will not happen.
- **outputFilter** is a function to manipulate readed object before delivering it to the client.
    - context the koa context
    - object the object the user has requested.
    return what ever the user should get.
- **maxPageSize** the maximum resultsize that the client can request. (int) default 100
- **defaultPageSize** if the client is not providing a pagesize, in the query, he will get this one.
- **allowChangesOnGet** allow to use the changes using just get requests. defaut true.
    set this to false, to disable **/create**, **/delete/:id**, **/update/:id**  for get request
- **searchableFields** array of fields that can be used for filters
- **fulltextFields** array of fields that are used for fulltext search using the **q** parameter
- **fetchableFields** array of related data that can be queried by the client. by the **_fetch** option.
- **defaultOrder** the default order in search

To have be most clear in your code and avoid looking to much for documentation copy the following
object as options to **daoToRestRouter**.
```js
{
    inputFilter: async function(ctx,newObject, oldObject){return newObject;},
    outputFilter: async function(ctx, object){return object;},
    defaultOrder: undefined,// let database decide.
    fetchableFields: [],
    fulltextFields: [],
    searchableFields: [],
    defaultPageSize: 10,
    maxPageSize: 100,
    allowChangesOnGet: true
}
```
## Transactions
As you see the intputFilter and outputFilter are async functions. Means you can read permissions,
read other tables to validate the changes to make. You might want to use transactions.

Use the second method provided by this module: **transactionMiddleware**
    - takes the db from tmysqlpromisedao.
    add a transaction connection to ctx.connection.

Any transaction connection added to ctx.connection is used by the generated API. Such a middleware
is a good way to implement a standard way of initializing a transaction in your entire project.

## Call To Action
Now it is time to implement some cool application using 
    - Koa2 to use modern Javascript with async await.
    - tmysqlpromisedao to implement a standard way for data access in your application.
    - and now dao2koa to get your API up and running as fast as you can and focus.

# Developer
Tobias Nickel german software engineer located in Shanghai.

![alt text](https://avatars1.githubusercontent.com/u/4189801?s=150)
