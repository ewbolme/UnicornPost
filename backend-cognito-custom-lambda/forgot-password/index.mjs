export const handler = async (event) => {
  
  console.log("event", event)
  console.log("event", event.triggerSource)
  const generate_email_body = (emailBody) => `
    <html>
        <body>
            <table cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td bgcolor="#ffffff"><p style="margin: 0;"><p>Please click on this link within the next 24 hours, to get your password reset <a href="${emailBody}">here.</a></p></td>
            </tr>
            </table>
        </body>
    </html>
`

const forgot_password = async(event) => {
    
    console.log("event", event)
    
    let userAttributes = event.request.userAttributes;
    let email = userAttributes.email
    let code = event.request.codeParameter;
    let clientMetadata = event.request.clientMetadata;
    let count = clientMetadata['ResetPasswordCount']
    let link = `${process.env.RESET_PASSWORD_BASE_URL}?email=${email}&code=${code}&resetPasswordCount=${count}&is_reset=true`
    
    event.response = {
        emailSubject: "Unicorn Post Password Assistance",
        emailMessage: generate_email_body(link)
    }
    return event
}

console.log("Custom Lambda for forgot-password Invoked.")

switch (event.triggerSource) {
    case "CustomMessage_ForgotPassword":
        console.log("CustomMessage_ForgotPassword event triggered.") //Forgot password request initiated by user
        return forgot_password(event)
    default:
        return event
}
};

