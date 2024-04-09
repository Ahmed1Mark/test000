const { 
    Client, 
    GatewayIntentBits, 
    Intents,
    MessageAttachment,
    SlashCommandBuilder,
    MessageSelectMenu,
    MessageActionRow, 
    EmbedBuilder,
    ActionRowBuilder, 
    SelectMenuBuilder,
    PermissionsBitField 
} = require('discord.js');
const config = require('./config');
const { resolveImage, Canvas} = require("canvas-constructor/cairo")
const Keyv = require('keyv');
const { inviteTracker } = require("discord-inviter");
const rules = require('./rules.json');
const fs = require('fs');
const { startServer } = require("./alive.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const db = new Keyv('sqlite://./storage/database.sqlite');
db.on('error', err => console.log('Connection Error', err)); 
const prefix = 's!';


let canvax = require('canvas')
canvax.registerFont("./storage/Uni Sans Heavy.otf", { family: 'Discord' })
canvax.registerFont("./storage/DejaVuSansCondensed-Bold.ttf", { family: 'Discordx' })

const commands = [
    new SlashCommandBuilder()
        .setName('role')
        .setDescription('لارسال لوحة التحكم الخاصة بالرتب!')
        .toJSON(),
];

const rest = new REST({ version: '9' }).setToken(config.token);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

client.once('ready', async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error refreshing commands:', error);
    }

    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Code by Wick Studio`);
    console.log(`discord.gg/wicks`);
});

let tracker = "10";

client.on('ready', () => {
  console.log(``);
  console.log(`</> Logged in as : ${client.user.tag}!`);
  console.log(`</> Servers : ${client.guilds.cache.size}`);
  console.log(`</> Users : ${client.users.cache.size}`);
  console.log(`</> channels : ${client.channels.cache.size}`);
  console.log(`</> Name : ${client.user.username}`);
  client.user.setStatus('idle');///dnd/online/idle
  let status = [`By : Ahmed Clipper`];
  setInterval(()=>{
  client.user.setActivity(status[Math.floor(Math.random()*status.length)]);
  },5000)
})

///////////////////////////////////
client.on('messageCreate', async message => {
  if (message.content === '!rulee') {
    if (message.member.permissions.has("ADMINISTRATOR")) {
      const row = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('select')
            .setPlaceholder('List of Laws')
            .addOptions(rules.map(rule => ({
              label: rule.title,
              description: rule.id,
              value: rule.id,
            }))),
        );
      const guild = message.guild;
      const embed = new EmbedBuilder()
        .setColor('#2c2c34')
        .setThumbnail(guild.iconURL())
        .setTitle('<a:3_:1089615585232556204> Server Rules <a:12:1150947511146664017>')
        .setDescription(' <a:11:1150943009442107523> to read the laws, choose from the list below \n  <a:11:1150943009442107523> please do not violate server rules \n\n <:921703781027184660:1089615608154431579> **__Developer BOT__** <@803873969168973855> <:911751899324239902:1089615602471141416>')
        .setImage('https://cdn.discordapp.com/attachments/1223781002997141534/1223783415892021289/standard.gif?ex=6624569f&is=6611e19f&hm=bcc85adb107911bb05e6c03dc69b486426abc581373b97919c0625e5e6c1ea50&')

      const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });
      await message.delete();
    } else {
      await message.reply({ content: "You need to be an administrator to use this command.", ephemeral: true });
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isSelectMenu()) {
    const rule = rules.find(r => r.id === interaction.values[0]);
    const text = fs.readFileSync(rule.description, 'utf-8');
    const ruleEmbed = new EmbedBuilder()
      .setColor('#2c2c34')
      .setTitle(rule.title)
      .setDescription(text)

    await interaction.reply({ embeds: [ruleEmbed], ephemeral: true });
  }
});
  
//////////////////////////////////
  /* Client when detects a message 
  then execute the code */
  client.on("messageCreate", async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if(command === "help") {
        message.reply({
          embeds: [ new EmbedBuilder()
            .setDescription(`> **__All  Commands__** 
\n **!add** \n **!ping** \n **!channel** \n **!background** \n **!setchannel** \n **!setbackground**`)
            .setColor("#2F3136")
          ]
        })
    }
    if(command === "ping02") {
      message.reply(`> \`-\` **My Ping Is :** \`${client.ws.ping}\``)
    }
    if(command === "add") {
     client.emit("guildMemberAdd", message.member)
    }
    if(command === "setchannel") {
      if(!message.member.permissions.has("MANAGE_GUILD")) return message.reply(":x: | Missing permissions, require `MANAGE_GUILD`")
      let channel = message.mentions.channels.first()
      if(!channel) return message.reply(`:x: | Missing arguments, required \`<channel>\`\n __Example__: ${prefix}setchannel ${message.channel}`)
      await db.set(`${message.guild.id}`, channel.id)
      message.reply({
        embeds: [ new EmbedBuilder()
          .setDescription(`👍 | Successfully set the welcome channel to ${channel}`)
          .setColor("#2F3136")
          .setTimestamp()
        ]
      })
    }
    if(command === "channel") {
      let channel = await db.get(`${message.guild.id}`)
      if(channel) {
        message.reply({
          embeds: [ new EmbedBuilder()
            .setDescription(`📝 | The welcome channel is set to ${message.guild.channels.cache.get(channel)}`)
            .setColor("#2F3136")
            .setTimestamp()
          ]
        })
      }
    }
    if(command === "setbackground"){
      if(!message.member.permissions.has("MANAGE_GUILD")) return message.reply(":x: | Missing permissions, require `MANAGE_GUILD`")
      if(args[0] && !args[0].startsWith("http")) return message.reply("Please provide a valid URL for an image **or** upload an image to set as background.")
      let background = message.attachments.first() ? message.attachments.first().url : args[0]
      if(!background) return message.reply(`:x: | Missing arguments, required \`<background>\`\n __Example__: ${prefix}setbackground <attachment> [ Can be URL or an uploaded image ]`)
      await db.set(`bg_${message.guild.id}`, background)
      message.reply({
        embeds: [ new EmbedBuilder()
          .setDescription(`👍 | Successfully set the background to [this image](${background})`)
          .setImage(background)
          .setColor("#2F3136")
          .setTimestamp()
        ]
      })
    }
    if(command === "background") {
    let background = await db.get(`bg_${message.guild.id}`)
    if(background) {
      message.reply({
        embeds: [ new EmbedBuilder()
          .setDescription(`📝 | The background is set to [this image](${background})`)
          .setImage(background)
          .setColor("#2F3136")
          .setTimestamp()
        ]
      })
    }
  }
if(command === "setrules"){
  if(!message.member.permissions.has("MANAGE_GUILD")) return message.reply(":x: | Missing permissions, require `MANAGE_GUILD`")
  if(!args[0]) return message.reply("Please provide a description to set.")

  let description = args.join(" ")
  
  // Save the description text instead of the image URL
  await db.set(`description_${message.guild.id}`, description)
  
  message.reply({
    embeds: [ new EmbedBuilder()
      .setDescription(`👍 | Successfully set the description to: **${description}**`)
      .setColor("#2F3136")
      .setTimestamp()
    ]
  })
}

if(command === "rules") {
  let description = await db.get(`description_${message.guild.id}`)
  if(description) {
    message.reply({
      embeds: [ new EmbedBuilder()
        .setDescription(`📝 | The description is set to: **${description}**`)
        .setColor("#2F3136")
        .setTimestamp()
      ]
    })
  }
}

}

);
/* Client when detects 
a new member join */
  tracker = new inviteTracker(client);
// "guildMemberAdd"  event to get full invite data
tracker.on('guildMemberAdd', async (member, inviter, invite, error) => {
  let channelwelc = await db.get(`${member.guild.id}`)
  if(error) return console.error(error);
  if(!channelwelc) return;
  let channel = member.guild.channels.cache.get(channelwelc)
   let buffer_attach =  await generateCanvas(member)
   const attachment = new MessageAttachment(buffer_attach, 'welcome.png')
   const memberCount = member.guild.memberCount;


   // Fetch the description from the database
   let description = await db.get(`description_${member.guild.id}`);

   let embed = new EmbedBuilder()
      .setTitle(`> <:TAG:1226019707522383932> Welcome to ${member.guild.name} Community`)
      .addFields(
        { name: '<:WELCOME:1226013126408015942> Welcome', value: `${member.user}`, inline: true },
        { name: '<:INVITED:1226013134276530206> Invited By', value: `<@!${inviter.id}>`, inline: true },
        { name: '<:READ:1226013136977526876> Rules', value: `${description}`, inline: true }, // Using the fetched description here
        { name: '<:USER_ID:1226013131382456453> User ID', value: `**__${member.user.id}__**`, inline: true },
        { name: '<:NUMPER:1226014852649320468> Member Count', value: `**__${memberCount}__**`, inline: true },
        { name: '<:LINK2:1226039636913295401> Invite Number', value: `**__${invite.count}__**`, inline: true },
        { name: '<:TIME:1226034289963958415> Message Since', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
        { name: '<:JOINED:1226013128739786834> Joined Discord', value: `<t:${Math.floor(member.user.createdAt / 1000)}:R>`, inline: true },
        { name: '<:SHARDS:1226039084829511791> Member User', value: `**${member.user.username}**`, inline: true },
        { name: '<:API:1226286011009597541> Node.js Version', value: `**__v21.7.2__**`, inline: true },
        { name: '<:PING:1226286013379514368> PING BOT', value: `**__${client.ws.ping}__ms**`, inline: true },
        { name: '<:DEVELOPER:1226013123916599437> Developer BOT ', value: `<@803873969168973855>`, inline: true },
        { name: '<:SUPPORT:1226013120674136144> Server Support ', value: `**[Click Here](https://dsc.gg/kn-server)**`, inline: true },
        { name: '<:LINK:1226015186436100178> Instagram ', value: `**[Click Here](https://www.instagram.com/ahm.depression)**`, inline: true },
        { name: '<:LINK2:1226039636913295401> Twitter', value: `**[Click Here](https://twitter.com/ahm_depression)**`, inline: true }
      )
    .setColor('#2F3136')
    .setImage("attachment://welcome.png")
    member.send(`Welcome to the server, ${member}!`);

    channel.send({ content: `||${member.user}||`, embeds: [embed], files: [attachment] })
})


client.on('guildMemberAdd', member => {
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Welcome to the server!')
        .setDescription(`We are happy to have you, ${member}! Welcome to our community.`)
        .setThumbnail(member.user.displayAvatarURL());

    member.send({ embeds: [embed] });
});


const { CanvasRenderService } = require('chartjs-node-canvas');
const { createCanvas, loadImage } = require('canvas');
const { weirdToNormalChars } = require('weird-to-normal-chars');

async function generateCanvas(member) {
    const avatar = await loadImage(member.user.displayAvatarURL({ size: 2048, format: "png" }));
    const background = await loadImage(await db.get(`bg_${member.guild.id}`)) ?? await loadImage("https://cdn.discordapp.com/attachments/910400703862833192/910426253947994112/121177.png");
    const name = weirdToNormalChars(member.user.username);

    const canvas = createCanvas(1024, 450);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(background, 0, 0, 1024, 450);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(512, 155, 120, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.clip();
    ctx.drawImage(avatar, 512 - 115, 155 - 115, 230, 230);

    ctx.textAlign = 'center';
    ctx.font = '70px Discord';
    ctx.fillText(`Welcome`, 512, 355);
    
    ctx.font = '45px Discordx';
    ctx.fillText(`${name}`, 512, 395);
    
    ctx.font = '30px Discord';
    ctx.fillText(`To ${member.guild.name}`, 512, 430);
    
    ctx.textAlign = 'left';
    ctx.font = 'bold 15px Arial';
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText('</> Developer BOT Ahmed Clipper', 160, 25);

    ctx.textAlign = 'left';
    ctx.font = 'bold 15px Arial';
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText('</> instagram : ahm.depression', 150, 60);

    return canvas.toBuffer();
}
/////////////////////////////////

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'role') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({ content: 'ليس لديك الصلاحية لاستخدام هذا الامر.', ephemeral: true });
            return;
        }

        try {
            await interaction.reply({ content: 'Done', ephemeral: true });

            const embed = new EmbedBuilder()
                .setColor('#2c2c34')
                .setThumbnail(config.thumbnail)
                .setTitle('**> <a:3_:1089615585232556204> Choose Your Roles <a:12:1150947511146664017>**')
                .setDescription('\n **<a:11:1150943009442107523> Select Roles From The List Of Options** \n **<a:11:1150943009442107523> BOT Developer [ <@803873969168973855> ]**')
                .setImage(config.image)
                .setFooter({ text: 'Wick Studio Team', iconURL: config.footer });

            const rows = [];

            Object.keys(config.roles).forEach((sectionKey, index) => {
                const section = config.roles[sectionKey];
                const options = section.roles.map(role => ({
                    label: role.label,
                    value: role.value,
                    description: role.label,
                }));

                const selectMenu = new SelectMenuBuilder()
                    .setCustomId(`select_${sectionKey}`)
                    .setPlaceholder(section.label)
                    .addOptions(options);

                rows.push(new ActionRowBuilder().addComponents(selectMenu));
            });

            await interaction.channel.send({ embeds: [embed], components: rows });
        } catch (error) {
            console.error('Error handling /role command:', error);
            await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;

    const roleId = interaction.values[0];
    const role = interaction.guild.roles.cache.get(roleId);

    try {
        if (role) {
            if (interaction.member.roles.cache.has(roleId)) {
                await interaction.member.roles.remove(role);
                await interaction.reply({ content: `تم ازالة رتبة ${role.name} منك بنجاح`, ephemeral: true });
            } else {
                await interaction.member.roles.add(role);
                await interaction.reply({ content: `تم اعطائك رتبة ${role.name} بنجاح`, ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'لم يتم العثور على رتبة.', ephemeral: true });
        }
    } catch (error) {
        console.error('Error handling role selection:', error);
        if (!interaction.replied) {
            await interaction.reply({ content: 'There was an error updating your role. Please try again later.', ephemeral: true });
        } else {
            await interaction.followUp({ content: 'There was an error updating your role. Please try again later.', ephemeral: true });
        }
    }
});

client.login(config.token);


process.on('unhandledRejection', (reason, p) => {
    console.log(' [antiCrash] :: Unhandled Rejection/Catch');
    console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
    console.log(' [antiCrash] :: Uncaught Exception/Catch');
    console.log(err, origin);
});
process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)');
    console.log(err, origin);
});
