import emailjs from '@emailjs/browser'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendContactForm(data: ContactFormData) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  console.log('EmailJS Config:', { serviceId, templateId, publicKey: publicKey ? 'SET' : 'NOT SET' })

  if (!serviceId || !templateId || !publicKey) {
    console.log("Contact form submission:", data)
    console.log("Missing EmailJS config - check environment variables")
    return { success: false, message: "EmailJS не настроен. Проверьте переменные окружения." }
  }

  try {
    const result = await emailjs.send(
      serviceId,
      templateId,
      {
        user_name: data.name,
        user_email: data.email,
        subject: data.subject,
        message: data.message,
      },
      publicKey
    )

    if (result.status === 200) {
      return { success: true, message: "Сообщение успешно отправлено!" }
    } else {
      console.error("EmailJS error:", result)
      return { success: false, message: "Ошибка при отправке сообщения" }
    }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, message: "Ошибка при отправке сообщения" }
  }
}