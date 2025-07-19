const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendBudgetAlertEmail = async (userEmail, budgetName, currentAmount, budgetLimit) => {
  const percentage = (currentAmount / budgetLimit * 100).toFixed(2);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Budget Alert: ${budgetName} reached ${percentage}%`,
    html: `
      <h2>Budget Alert</h2>
      <p>Your ${budgetName} budget has reached ${percentage}% of its limit.</p>
      <p>Current spending: $${currentAmount}</p>
      <p>Budget limit: $${budgetLimit}</p>
      <p>Please review your expenses.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Budget alert email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendBudgetAlertEmail };