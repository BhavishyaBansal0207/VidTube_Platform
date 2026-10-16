// when we will try to make some http request thenn can be chances that we get errors so to handle that we have to make use of try catch block in every request and wrting try catch for every request is not suitable 
// so instead of this we can make use of asynchadler that we are creating to handle the requests error gracefully 

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
            .resolve(requestHandler(req, res, next))
            .catch((err) => next(err))
    }
}

export {asyncHandler}