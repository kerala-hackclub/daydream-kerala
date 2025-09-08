const nodemailer = require('nodemailer');
const fs = require('fs');
const csv = require('csv-parser');
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

async function sendEmailToSchool(school) {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: school.email, 
      subject: 'Invitation for Kerala’s First 24-Hr High School Game Jam',
      html: `
          <p>Namaste ${school.name},</p>

          <p>We, a group of teenagers, are organizing Kerala’s first in-person 24hr gamejam for high-schoolers - Daydream Kerala. </p>

          <p>This event is part of the larger umbrella of <strong>Daydream</strong> events organized by <strong><a href="https://hackclub.com/">Hack Club</a></strong>. Hackclub is a non-profit organization empowering the largest community of high-school makers around the world to explore their creativity, build projects, and learn by doing. Hackclub is also backed by large groups and organizations like the <strong>Musk Foundation</strong> (led by Elon Musk) and <strong>Github Education</strong> (owned by Microsoft).</p> 

          <p>This is a unique opportunity for the talented students at ${school.name} to join others from across Kerala, come together, be creative, and dive into the world of game development.</p>

          <p>The challenge is simple - build a fully-functional game from scratch in the span of a day. Each participant can team up with up to 2 other participants (3 people per team) to design, develop and ship a project. Each participant is forced to use every facet of their skills - be it game design, art, SFX, music or storytelling! We provide an environment for highschoolers to potentially develop their first project in a creative, high-energy environment.</p>

          <p>The event will take place at TinkerHub, Kochi. To give equal opportunities to all students across Kerala, we are planning transportation routes from North and South Kerala. In addition, Hack Club provides a gas fund to pay for gas in case parents decide to drop their wards off themselves.</p>

          <p>For more information, please explore our official website or view our detailed brochure:
          <br><strong>Website:</strong> <a href="https://daydream.hackclub.com/kerala">daydream.hackclub.com/kerala</a>
          <br><strong>Brochure:</strong> <a href="https://drive.google.com/file/d/1N5V7MylvQwXvcGcWpzu2aKKUA_g8629n/view?usp=sharing">View Brochure</a>
          </p>

          <p>Students can also join our <a href="https://chat.whatsapp.com/JXBkr5MHbdD3PYATUo9vLP">WhatsApp group</a> or <a href="https://discord.gg/A7pXeVUtK5">Discord server</a> to ask questions. Registrations are now open via our official form.</p>

          <p>We look forward to seeing your students coming to this groundbreaking event!</p>

          <p>
          <strong>Arun George Saji</strong><br>
          Member of the Daydream Kerala Organizing Team<br>
          </p>
      `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${school.name} (${school.email})`);
        console.log(`Message ID: ${info.messageId}`);
        return { success: true, school: school.name, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send email to ${school.name} (${school.email}):`, error.message);
        return { success: false, school: school.name, error: error.message };
    }
}

async function processSchoolsCSV(csvFilePath, delayMs = 1000) {
    const schools = [];
    const results = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csv({
                skipEmptyLines: true,
                mapHeaders: ({ header }) => header.trim().toLowerCase()
            }))
            .on('data', (row) => {
                const school = {
                    name: row.name ? row.name.replace(/"/g, '').trim() : '',
                    email: row.email ? row.email.replace(/"/g, '').trim() : ''
                };
                
                if (school.name && school.email) {
                    schools.push(school);
                } else {
                    console.warn(`⚠️  Skipping invalid row:`, row);
                }
            })
            .on('end', async () => {
                console.log(`📧 Found ${schools.length} schools to email`);
                console.log('Starting email sending process...\n');

                for (let i = 0; i < schools.length; i++) {
                    const school = schools[i];
                    console.log(`Sending email ${i + 1}/${schools.length} to ${school.name}...`);
                    
                    const result = await sendEmailToSchool(school);
                    results.push(result);
                    
                    if (i < schools.length - 1) {
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
                        console.log(`  - ${r.school}: ${r.error}`);
                    });
                }

                resolve(results);
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                reject(error);
            });
    });
}

async function main() {
    const csvFilePath = './schools_batch.csv'; 
    const delayBetweenEmails = 2000; 
    
    try {
        if (!fs.existsSync(csvFilePath)) {
            console.error(`❌ CSV file not found: ${csvFilePath}`);
            console.log('Please make sure the file exists and the path is correct.');
            return;
        }

        const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_PASSWORD', 'EMAIL_FROM_NAME', 'EMAIL_FROM_ADDRESS'];
        const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingEnvVars.length > 0) {
            console.error('❌ Missing environment variables:', missingEnvVars.join(', '));
            return;
        }

        console.log('🚀 Starting bulk email sending process...');
        await processSchoolsCSV(csvFilePath, delayBetweenEmails);
        console.log('🎉 Bulk email sending completed!');
        
    } catch (error) {
        console.error('❌ Error in main process:', error);
    }
}

if (require.main === module) {
    main();
}
