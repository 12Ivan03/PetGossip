
function getVerificationLink(confirmationCode) {
  if (process.env.NODE_ENV === 'prod') {
    return `https://petgossips.onrender.com/confirm/${confirmationCode}`;
  } else {
    return `http://127.0.0.1:${process.env.PORT}/confirm/${confirmationCode}`;
  }
}

function templateAccountVerification(username, confirmationCode) {
  return `Hi <b>${username}</b></br></br> Thank you for signing up for PetGosspis. Click on the link below to verify your email.<br><br><br>
    <br>`+ getVerificationLink(confirmationCode)+
      `<br><br>
    Best,
    <br>
    <br>
    PetGossips Team`;
}

function templateCustomerIssues(reqBody) {
  return `<b>Hello Pet Gossips Support!, <br><br><h3 style="color:green;">There is a message from one of Pet Gossips User.</h3><br><br>
      <b>User Name:</b>${reqBody.userName}<br>
      <b>User Email:</b>${reqBody.userEmail}<br>
      <b>Message:</b>${reqBody.customerNote}<br><br><br>
      Best,
      <br>
      <br>
      PetGossips App.<br><br>  
      <p>Disclaimer! - This is an auto generated email generated from Pet Gossips App. Please do not reply to this.<p>
  `;
}

module.exports = {
  templateAccountVerification, templateCustomerIssues
}
