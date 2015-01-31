
exports.buildResponse = function( success, message, package ) {
  var responseObject = {
    success: false,
    message: "",
    package: {}
  }
  
  if( success )
    responseObject.success = success;
  if( message )
    responseObject.message = message; 
  if( package )
    responseObject.package = package;
  
  return responseObject;
};
