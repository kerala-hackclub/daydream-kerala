const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, 
  port: process.env.EMAIL_PORT, 
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

let mailOptions = {
  from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
  to: '', 
  subject: 'Invitation for Kerala’s First 24-Hr High School Game Jam',
  html: `
      <p>Namaste ${school.name},</p>

      <p>We, a group of teenagers, are organizing Kerala’s first in-person 24hr gamejam for high-schoolers - Daydream Kerala. </p>

      <p>This event is part of the larger umbrella of Daydream events organized by Hackclub. Hackclub is a non-profit organization empowering the largest community of high-school makers around the world to explore their creativity, build projects, and learn by doing. Hackclub is also backed by large groups and organizations like the Musk Foundation (led by Elon Musk) and Github Education (owned by Microsoft).</p> 

      <p>This is a unique opportunity for high school students across Kerala to come together, be creative and dive into the world of game development.</p>

      <p>The challenge is simple - build a fully-functional game from scratch in the span of a day. Each participant can team up with up to 2 other participants (3 people per team) to design, develop and ship a project. Each participant is forced to use every facet of their skills - be it game design, art, SFX, music or storytelling! We provide an environment for highschoolers to potentially develop their first project in a creative, high-energy environment.</p>

      <p>The event will take place at TinkerHub, Kochi. To give equal opportunities to all students across Kerala, we are planning transportation routes from North and South Kerala. In addition, Hack Club provides a gas fund to pay for gas in case parents decide to drop their wards off themselves.</p>

      <p>For more information, you can visit our website (daydream.hackclub.com/kerala) or look at our brochure here. You can also join our WhatsApp or Discord groups to ask further questions. Finally, register for the event using this form.</p>

      <p>We look forward to seeing your students coming to this groundbreaking event!</p>

      <p>
      <strong>Arun George Saji</strong><br>
      Member of the Daydream Kerala Organizing Team<br>
      </p>
  `
};

transporter.sendMail(mailOptions, function(error, info) {
  if (error) {
    console.log('Error occurred:');
    console.log(error.message);
  } else {
    console.log('Email sent successfully!');
    console.log('Message ID: ', info.messageId);
  }
});
