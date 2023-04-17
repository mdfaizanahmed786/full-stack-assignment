const {errorStatusCodes} = require("../constants");

const errorHandler=(err, req, res, next)=>{
    const statusCode=res.statusCode ? res.statusCode : 500;

    switch(statusCode){
        case errorStatusCodes.UNAUTHORIZED:
            res.json({message:err.message, stackTrace:err.stack});
            break;
        case errorStatusCodes.BAD_REQUEST:
            res.json({message:err.message, stackTrace:err.stack});
            break;
        case errorStatusCodes.NOT_FOUND:
            res.json({message:err.message, stackTrace:err.stack});
            break;
        case errorStatusCodes.INTERNAL_SERVER_ERROR:
            res.json({message:err.message, stackTrace:err.stack});
            break;
        case errorStatusCodes.FORBIDDEN:
            res.json({message:err.message, stackTrace:err.stack});
            break;
        default:
            console.log("Error not handled");
            break;
    }



}

module.exports=errorHandler;