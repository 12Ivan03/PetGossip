function templateAccountVerification (username, confirmationCode) { 
    return `Hello <b>${username}</b></br></br> Please click here at below link to verify your account.
    <br> http://localhost:${process.env.PORT}/confirm/${confirmationCode}`;
}

function templateCustomerIssues (reqBody) { 
  return `<b>Hello Pet Gossips Support!, <br><br><h3 style="color:green;">There is a message from one of Pet Gossips User.</h3><br><br>
      <b>User Name:</b>${reqBody.userName}<br>
      <b>User Email:</b>${reqBody.userEmail}<br>
      <b>Message:</b>${reqBody.customerNote}<br><br><br>
      Regards,<br>
      Pet Gossips App.<br><br>  
      <p>Disclaimer - This is an automatic email generated from Pet Gossips Application. Please do not reply to this.<p>
  `;
}
  
  module.exports = {
    templateAccountVerification,templateCustomerIssues
  }
  