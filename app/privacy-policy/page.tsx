import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Политика конфиденциальности | Atlant Technology",
  description: "Политика обработки персональных данных и конфиденциальности Atlant Technology.",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background py-12 md:py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Политика конфиденциальности</h1>
        <p className="text-sm text-muted-foreground mb-8">Редакция от 08 февраля 2026 года</p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных
              пользователей сайта Atlant Technology (далее — Сайт) и составлена в соответствии с Федеральным законом
              № 152-ФЗ «О персональных данных», Федеральным законом № 149-ФЗ «Об информации, информационных
              технологиях и о защите информации» и иными нормативными актами Российской Федерации.
            </p>
            <p>
              Оператор персональных данных: команда Atlant Technology (далее — Оператор).
            </p>
            <p>
              Контактный email Оператора: atlant.technology@yandex.com.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Какие данные мы обрабатываем</h2>
            <p>Оператор может обрабатывать следующие персональные данные, предоставленные пользователем:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>имя;</li>
              <li>адрес электронной почты;</li>
              <li>тема обращения и текст сообщения в форме обратной связи;</li>
              <li>технические данные о посещении Сайта (cookie, IP-адрес, данные браузера и устройства, действия на Сайте).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Цели обработки персональных данных</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>обратная связь с пользователем и обработка запросов;</li>
              <li>предоставление информации об услугах и условиях сотрудничества;</li>
              <li>улучшение работы Сайта, анализ посещаемости и пользовательского опыта;</li>
              <li>исполнение требований законодательства Российской Федерации.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Правовые основания обработки</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>согласие субъекта персональных данных;</li>
              <li>необходимость обработки для исполнения договора или заключения договора по инициативе пользователя;</li>
              <li>исполнение обязанностей, возложенных на Оператора законодательством РФ.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Порядок и условия обработки</h2>
            <p>
              Обработка персональных данных осуществляется с использованием средств автоматизации и без
              использования таких средств. Оператор принимает необходимые правовые, организационные и технические
              меры для защиты персональных данных от неправомерного или случайного доступа, уничтожения, изменения,
              блокирования, копирования, предоставления, распространения.
            </p>
            <p>
              Срок хранения персональных данных определяется достижением целей обработки, если иной срок не
              установлен законодательством РФ или соглашением с пользователем.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Передача данных третьим лицам</h2>
            <p>Для функционирования Сайта и обработки обращений могут использоваться сторонние сервисы:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>EmailJS — для отправки сообщений из формы обратной связи;</li>
              <li>Google Analytics — для аналитики посещаемости Сайта.</li>
            </ul>
            <p>
              Использование указанных сервисов может включать передачу технических данных в адрес их
              операторов в объеме, необходимом для работы соответствующих функций.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Права пользователя</h2>
            <p>Пользователь имеет право:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>получать информацию об обработке его персональных данных;</li>
              <li>требовать уточнения, блокирования или уничтожения персональных данных;</li>
              <li>отозвать согласие на обработку персональных данных;</li>
              <li>обжаловать действия Оператора в уполномоченный орган или в судебном порядке.</li>
            </ul>
            <p>
              Для реализации указанных прав пользователь может направить запрос на email:
              {" "}
              <a className="text-primary hover:underline" href="mailto:atlant.technology@yandex.com">
                atlant.technology@yandex.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Cookie и аналитика</h2>
            <p>
              Сайт использует cookie-файлы и аналитические инструменты для корректной работы и улучшения
              пользовательского опыта. Продолжая использование Сайта, пользователь подтверждает согласие на
              использование cookie в соответствии с настоящей Политикой.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Заключительные положения</h2>
            <p>
              Оператор вправе вносить изменения в настоящую Политику. Актуальная версия Политики всегда
              доступна на данной странице.
            </p>
            <p>
              По вопросам обработки персональных данных можно связаться с Оператором:
              {" "}
              <a className="text-primary hover:underline" href="mailto:atlant.technology@yandex.com">
                atlant.technology@yandex.com
              </a>
              {" "}или{" "}
              <a className="text-primary hover:underline" href="https://t.me/atlant_tech_bot" target="_blank" rel="noopener noreferrer">
                @atlant_tech_bot
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
