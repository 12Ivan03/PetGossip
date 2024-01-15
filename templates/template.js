function templateExample (username, confirmationCode) { 
    return `Hello <b>${username}</b></br></br> Please click here at below link to verify your account.
    <br>
    <form action="http://localhost:${process.env.PORT}/confirm/${confirmationCode}" method="GET">
        <button>Verify your account</button>
    <form>`;
}
  
  module.exports = {
    templateExample,
  }
  