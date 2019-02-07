const {ApolloServer} = require('apollo-server');
const { createStore } = require('./utils');
const typeDefs=require('./schema');
const resolvers = require('./resolvers');
const isEmail=require('isemail');
const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');

const store = createStore();

const server=new ApolloServer({
    context : async ({req})=>{
        const auth = (req.headers && req.headers.authorization)|| '';
        const email = Buffer.from(auth,'base64').toString('ascii');
        //if the email is not validated return the user as null
        if(!isEmail.validate(email)) return {user : null};

        //adter veriication find the uer by it email
        const users=await store.users.findOrCreate({where : {email}});
        const user = users && users[0] ? users[0] : null;
        return {user : {...user.dataValues} };
    },
    typeDefs,
    resolvers,
    dataSources : ()=>({
        launchAPI : new LaunchAPI(),
        userAPI : new UserAPI({store}) 
    })
});

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });