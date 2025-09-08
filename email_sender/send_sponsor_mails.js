const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_FROM_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendEmailToSponsor(email) {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email, 
      subject: 'Sponsor Invitation for Kerala’s First 24-Hr High School Game Jam',
      html: `
          <p>Namaste,</p>

          <p>We, a group of teenagers, are organizing Kerala's first in-person 24hr gamejam for high-schoolers - Daydream Kerala. </p>

          <p>This event is part of the larger umbrella of <strong>Daydream</strong> events organized by <strong><a href="https://hackclub.com/">Hack Club</a></strong>. Hackclub is a non-profit organization empowering the largest community of high-school makers around the world to explore their creativity, build projects, and learn by doing. Hackclub is also backed by large groups and organizations like the <strong>Musk Foundation</strong> (led by Elon Musk) and <strong>Github Education</strong> (owned by Microsoft).</p> 

          <p>This is a unique opportunity for sponsorship and supporting young talent in Kerala. We're reaching out to see if you'd be interested in supporting this groundbreaking event.</p>

          <p>The challenge is simple - students build a fully-functional game from scratch in the span of a day. Each participant can team up with up to 2 other participants (3 people per team) to design, develop and ship a project.</p>

          <p>The event will take place at TinkerHub, Kochi. To give equal opportunities to all students across Kerala, we are planning transportation routes from North and South Kerala.</p>

          <p>For more information, view our detailed prospectus, you can also explore our official website:
          <br><strong>Prospectus:</strong> <a href="https://kerala.hackclub.com/daydream/prospectus/">View Prospectus</a>
          <br><strong>Website:</strong> <a href="https://daydream.hackclub.com/kerala">daydream.hackclub.com/kerala</a>
          </p>

          <p>We would be happy to discuss more on the sponsorship opportunities and benefits. Please let us know if you'd be interested in supporting this initiative for young creators.</p>

          <p>We look forward to hearing from you!</p>

          <p>
          <strong>Arun George Saji</strong><br>
          Member of the Daydream Kerala Organizing Team<br>
          </p>
      `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email}`);
        console.log(`Message ID: ${info.messageId}`);
        return { success: true, email: email, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error.message);
        return { success: false, email: email, error: error.message };
    }
}

async function processSponsorsTXT(txtFilePath, delayMs = 1000) {
    const emails = [];
    const results = [];

    try {
        const data = fs.readFileSync(txtFilePath, 'utf8');
        
        const lines = data.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && line.includes('@')); 

        console.log(`📧 Found ${lines.length} sponsor emails to contact`);
        console.log('Starting email sending process...\n');

        for (let i = 0; i < lines.length; i++) {
            const email = lines[i];
            console.log(`Sending email ${i + 1}/${lines.length} to ${email}...`);
            
            const result = await sendEmailToSponsor(email);
            results.push(result);
            
            if (i < lines.length - 1) {
                console.log(`Waiting ${delayMs}ms before next email...\n`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log('\n📊 EMAIL SENDING SUMMARY:');
        console.log(`✅ Successful: ${successful}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📧 Total: ${results.length}`);

        if (failed > 0) {
            console.log('\n❌ Failed emails:');
            results.filter(r => !r.success).forEach(r => {
                console.log(`  - ${r.email}: ${r.error}`);
            });
        }

        return results;
        
    } catch (error) {
        console.error('Error reading text file:', error);
        throw error;
    }
}

async function main() {
    const txtFilePath = './sponsors.txt'; 
    const delayBetweenEmails = 2000; 
    
    try {
        if (!fs.existsSync(txtFilePath)) {
            console.error(`❌ Text file not found: ${txtFilePath}`);
            console.log('Please make sure the file exists and the path is correct.');
            return;
        }

        const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_PASSWORD', 'EMAIL_FROM_NAME', 'EMAIL_FROM_ADDRESS'];
        const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingEnvVars.length > 0) {
            console.error('❌ Missing environment variables:', missingEnvVars.join(', '));
            return;
        }

        console.log('🚀 Starting bulk email sending process to sponsors...');
        await processSponsorsTXT(txtFilePath, delayBetweenEmails);
        console.log('🎉 Bulk email sending to sponsors completed!');
        
    } catch (error) {
        console.error('❌ Error in main process:', error);
    }
}

if (require.main === module) {
    main();
}
