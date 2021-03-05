const fs = require('fs')
const handlebars = require('handlebars')

const { mailgunConfig } = require('../../config/config.json')
const { emailSubject } = require('../../config/enum.json')
const mailgun = require('mailgun-js')(mailgunConfig)

const emailConfig = {
  [emailSubject.SOLICIT_OBJECT]: {
    path: './src/template/solicit-object.html',
    subject: 'Solicitação de devolução de objeto'
  },
  [emailSubject.PASS_RECOVERY]: {
    path: './src/template/pass-recovery.html',
    subject: 'Recuperação de Senha'
  },
  [emailSubject.NOTIFICATION]: {
    path: './src/template/notification.html',
    subject: 'Objeto Encontrado'
  },
  [emailSubject.AUTOMATIC_SOLICIT_OBJECT]: {
    path: './src/template/automatic-solicitation.html',
    subject: 'Solicitação automática de devolução de objeto'
  }
}

/**
 * Send email
 * @param {string} subjectType Subject type
 * @param {object} data Email's data according to type:
 *                      Type solicit object: { name, devolutionCode }
 *                      Type pass recovery: { name, url }
 *                      Type notification: { category, type }
 */
const sendEmail = (subjectType, data) => {
  const { path, subject } = emailConfig[subjectType]

  fs.readFile(path, 'utf8', (_error, file) => {
    const html = handlebars.compile(file)

    const emailInfo = {
      from: '<example@samples.mailgun.org>',
      to: data.email,
      subject,
      html: html(data.templateVariable)
    }

    mailgun.messages().send(emailInfo)
  })
}

module.exports = {
  sendEmail
}
