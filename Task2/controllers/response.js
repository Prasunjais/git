class response {
    badValues(res){
        // console.log('badValues');
        // console.log('Response End');
        return res.status(400).json({message:"Bad Values"});
    }
    success(res,data,message){
        // console.log('success');
        // console.log({data:data})
        // console.log('Response End');
        if(!message){
            return res.json({message:"Operation Successful",data:data})
        }else{
            return res.json({message:message,data:data});
        }
    }
    message(res,status,message){
        // console.log(message);
        // console.log('Response End');
        return res.status(status).json({message:message});
    }
    notAuthorized(res,message){
        if(!message){
            return res.status(405).json({message:"You're not authorized"})
        }else{
            return res.status(405).json({message:message});
        }
    }
}
response = new response();
module.exports = response;