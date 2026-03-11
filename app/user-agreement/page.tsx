import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Пользовательское соглашение | Atlant Technology",
  description: "Пользовательское соглашение сайта Atlant Technology.",
}

export default function UserAgreementPage() {
  return (
    <main className="min-h-screen bg-background py-12 md:py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Пользовательское соглашение</h1>
        <p className="text-sm text-muted-foreground mb-8">Редакция от 08 февраля 2026 года</p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Общие положения</h2>
            <p>
              Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между
              Atlant Technology (далее — Администрация) и пользователем сайта Atlant Technology (далее — Пользователь)
              при использовании сайта и его функционала.
            </p>
            <p>
              Используя Сайт, Пользователь подтверждает, что ознакомился с условиями Соглашения, Политикой
              конфиденциальности и принимает их в полном объеме.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Предмет соглашения</h2>
            <p>
              Администрация предоставляет Пользователю доступ к информации о проектах, услугах, тарифах и форме
              обратной связи для направления запросов по сотрудничеству.
            </p>
            <p>
              Сайт носит информационный характер, если прямо не указано иное.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Права и обязанности пользователя</h2>
            <p>Пользователь обязуется:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>предоставлять достоверные данные при заполнении форм;</li>
              <li>не использовать Сайт для противоправных целей;</li>
              <li>не предпринимать действий, нарушающих работоспособность Сайта.</li>
            </ul>
            <p>Пользователь имеет право:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>получать информацию об услугах и проектах;</li>
              <li>обращаться к Администрации по контактам, указанным на Сайте;</li>
              <li>требовать защиты своих персональных данных в порядке, установленном законодательством РФ.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Права и обязанности администрации</h2>
            <p>Администрация вправе:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>изменять содержание Сайта, его функционал и условия настоящего Соглашения;</li>
              <li>ограничивать доступ к Сайту при нарушении Пользователем условий Соглашения;</li>
              <li>использовать обращения Пользователей для обратной связи и улучшения сервиса.</li>
            </ul>
            <p>
              Администрация обязуется обеспечивать функционирование Сайта и обрабатывать персональные данные
              в соответствии с применимым законодательством РФ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Интеллектуальная собственность</h2>
            <p>
              Все материалы Сайта, включая тексты, дизайн, логотипы, графику и программные элементы, являются
              объектами интеллектуальных прав и защищаются законодательством РФ.
            </p>
            <p>
              Использование материалов Сайта без предварительного письменного согласия Администрации не допускается,
              за исключением случаев, прямо предусмотренных законом.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Ограничение ответственности</h2>
            <p>
              Администрация не гарантирует абсолютную бесперебойность работы Сайта и не несет ответственности
              за временные технические сбои, действия третьих лиц и иные обстоятельства, находящиеся вне разумного
              контроля Администрации.
            </p>
            <p>
              Информация на Сайте предоставляется на условиях «как есть» и может обновляться без предварительного
              уведомления Пользователя.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Персональные данные</h2>
            <p>
              Обработка персональных данных Пользователя осуществляется в соответствии с Политикой
              конфиденциальности, размещенной на Сайте по адресу
              {" "}
              <a href="/privacy-policy" className="text-primary hover:underline">
                /privacy-policy
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Применимое право и споры</h2>
            <p>
              К настоящему Соглашению применяется право Российской Федерации.
            </p>
            <p>
              Споры и разногласия разрешаются путем переговоров. При недостижении согласия спор подлежит
              рассмотрению в суде в порядке, установленном действующим законодательством РФ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Контакты</h2>
            <p>
              По вопросам, связанным с работой Сайта и условиями настоящего Соглашения, Пользователь может
              обратиться:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                email:
                {" "}
                <a className="text-primary hover:underline" href="mailto:projecttwizz54@gmail.com">
                  projecttwizz54@gmail.com
                </a>
              </li>
              <li>
                Telegram:
                {" "}
                <a className="text-primary hover:underline" href="https://t.me/atlant_tech_bot" target="_blank" rel="noopener noreferrer">
                  @atlant_tech_bot
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
